/* Learning graph — scheduler, task runner, and views.

   Section-agnostic: everything specific to a section (its topics, its name, and the
   localStorage key its progress lives under) arrives in graph-data.js, so the same
   file drives Section 8 at learning-graph/ and Section 3 at learning-graph/section-03/.

   The graph itself is generated data (graph-data.js, built from a section's data/*.json).
   This file is the part that behaves: it decides what you should do next, teaches it,
   records the result, and propagates repetition credit through the encompassing edges.

   Mechanics follow The Math Academy Way:
     knowledge frontier  — a topic opens only when its hard prerequisites are mastered
     mastery learning    — knowledge points cleared in order, all questions right
     targeted remediation— two failures on the same knowledge point queue its key prerequisites
     FIRe                — reviewing an advanced topic pays discounted credit to what it encompasses
     compression         — due topics covered by another due topic are dropped from the queue
     spaced repetition   — 1, 3, 7, 16, 35, 75, 160 days
*/
(function () {
  "use strict";

  var G = window.CCAF_GRAPH;
  if (!G) return;

  var STORAGE_KEY = G.storageKey || "ccaf_learning_graph_v1";
  var SECTION = G.sectionShort || "Section 8";
  var DAY = 86400000;
  var INTERVALS = [1, 3, 7, 16, 35, 75, 160];
  var DAILY_GOAL = 100;
  var MAX_DIAGNOSTIC = 14;

  /* ---------- indexes ---------- */

  var topicById = {};
  G.topics.forEach(function (t) { topicById[t.id] = t; });

  var clusterById = {};
  G.clusters.forEach(function (c) { clusterById[c.id] = c; });

  var hardPrereqs = {}, allPrereqs = {}, dependents = {}, hardDependents = {};
  G.topics.forEach(function (t) {
    hardPrereqs[t.id] = []; allPrereqs[t.id] = []; dependents[t.id] = []; hardDependents[t.id] = [];
  });
  G.dependencies.forEach(function (d) {
    allPrereqs[d.topicId].push(d);
    dependents[d.prerequisiteId].push(d);
    if (d.strength === "hard") {
      hardPrereqs[d.topicId].push(d.prerequisiteId);
      hardDependents[d.prerequisiteId].push(d.topicId);
    }
  });

  var encFrom = {}, encTo = {};
  G.topics.forEach(function (t) { encFrom[t.id] = []; encTo[t.id] = []; });
  G.encompassings.forEach(function (e) {
    encFrom[e.topicId].push(e);
    encTo[e.encompassedId].push(e);
  });

  function transitive(map, id) {
    var seen = {}, stack = (map[id] || []).slice();
    while (stack.length) {
      var next = stack.pop();
      if (seen[next]) continue;
      seen[next] = true;
      stack = stack.concat(map[next] || []);
    }
    return Object.keys(seen);
  }

  /* ---------- state ---------- */

  var state = null;
  var sync = null;

  function freshState() {
    return { version: 1, updatedAt: 0, xpByDay: {}, topics: {}, remedials: [], placed: false, log: [] };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      state = (parsed && parsed.topics) ? parsed : freshState();
    } catch (e) { state = freshState(); }
    if (!state.xpByDay) state.xpByDay = {};
    if (!state.remedials) state.remedials = [];
    if (!state.log) state.log = [];
  }

  function save() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    if (sync) sync.schedulePush();
  }

  function ts(id) {
    if (!state.topics[id]) {
      state.topics[id] = {
        status: "unseen", kpIndex: 0, kpFails: {}, reps: 0, credit: 0,
        due: null, lastAt: 0, right: 0, wrong: 0
      };
    }
    var s = state.topics[id];
    if (!s.kpFails) s.kpFails = {};
    return s;
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function xpToday() { return state.xpByDay[today()] || 0; }
  function totalXp() {
    return Object.keys(state.xpByDay).reduce(function (n, k) { return n + state.xpByDay[k]; }, 0);
  }
  function awardXp(n) {
    state.xpByDay[today()] = xpToday() + n;
  }

  /* ---------- frontier & scheduling ---------- */

  function isMastered(id) { return ts(id).status === "mastered"; }

  function isReady(id) {
    if (isMastered(id)) return false;
    return hardPrereqs[id].every(isMastered);
  }

  function isLocked(id) { return !isMastered(id) && !isReady(id); }

  function intervalMs(reps) {
    return INTERVALS[Math.min(reps, INTERVALS.length) - 1] * DAY;
  }

  function isDue(id) {
    var s = ts(id);
    return s.status === "mastered" && s.due && s.due <= Date.now();
  }

  function dueTopics() {
    return G.topics.filter(function (t) { return isDue(t.id); }).map(function (t) { return t.id; });
  }

  /* Spaced Repetition Compression: if an advanced due topic substantially encompasses
     another due topic, reviewing the advanced one pays the simpler one implicitly, so
     the simpler one never needs to appear in the queue. */
  function compressReviews(ids) {
    var dueSet = {};
    ids.forEach(function (id) { dueSet[id] = true; });
    var covered = {};
    ids.slice().sort(function (a, b) {
      return topicById[b].centrality - topicById[a].centrality;
    }).forEach(function (id) {
      if (covered[id]) return;
      encFrom[id].forEach(function (e) {
        if (dueSet[e.encompassedId] && e.coverage >= 0.5) covered[e.encompassedId] = true;
      });
    });
    return ids.filter(function (id) { return !covered[id]; });
  }

  /* Core topics first, then the ones the most other topics are waiting on, then the
     shallowest — so foundations get more total practice by the end. */
  function frontierTopics() {
    return G.topics.filter(function (t) { return isReady(t.id); }).sort(function (a, b) {
      if (!!b.core !== !!a.core) return b.core ? 1 : -1;
      if (b.centrality !== a.centrality) return b.centrality - a.centrality;
      return a.layer - b.layer;
    });
  }

  function buildQueue() {
    var tasks = [];

    state.remedials.forEach(function (r) {
      tasks.push({ type: "remediate", topicId: r.topicId, note: r.reason });
    });

    var reviews = compressReviews(dueTopics()).sort(function (a, b) {
      return ts(a).due - ts(b).due;
    }).map(function (id) { return { type: "review", topicId: id }; });

    var learns = frontierTopics().map(function (t) {
      return { type: "learn", topicId: t.id };
    });

    // Interleave so a review backlog never blocks new material, and vice versa.
    var i = 0, j = 0;
    while (i < reviews.length || j < learns.length) {
      if (i < reviews.length) tasks.push(reviews[i++]);
      if (j < learns.length) tasks.push(learns[j++]);
    }

    if (!tasks.length) {
      var masteredIds = G.topics.filter(function (t) { return isMastered(t.id); });
      if (masteredIds.length >= 4) tasks.push({ type: "quiz" });
    }
    return tasks;
  }

  /* ---------- Fractional Implicit Repetition ---------- */

  function scheduleNext(id) {
    var s = ts(id);
    s.lastAt = Date.now();
    s.due = Date.now() + intervalMs(s.reps);
  }

  function earlinessDiscount(id) {
    var s = ts(id);
    if (!s.due || !s.lastAt || s.due <= s.lastAt) return 1;
    var frac = (Date.now() - s.lastAt) / (s.due - s.lastAt);
    return Math.max(0.25, Math.min(1, frac));
  }

  /* A repetition on `id` trickles down through encompassings, discounted by coverage,
     by answer quality, and by how early the implicit review lands. Credit accumulates;
     a full unit of credit advances the simpler topic's schedule without an explicit review. */
  function propagateCredit(id, quality, factor, depth, touched) {
    if (depth >= 3 || factor < 0.08) return;
    encFrom[id].forEach(function (e) {
      var s = ts(e.encompassedId);
      if (s.status !== "mastered") return;
      var credit = e.coverage * factor * quality * earlinessDiscount(e.encompassedId);
      s.credit = (s.credit || 0) + credit;
      touched.push({ id: e.encompassedId, credit: credit });
      if (s.credit >= 1) {
        s.credit -= 1;
        s.reps += 1;
        scheduleNext(e.encompassedId);
      } else if (s.due && s.due <= Date.now()) {
        // A due topic that just got implicit practice should not still be sitting in
        // the queue: defer it by the fraction of a repetition it actually received.
        // This is what makes the compression promise honest — the review you skipped
        // really was paid, just not in full.
        s.due = Date.now() + Math.round(credit * intervalMs(s.reps));
      }
      propagateCredit(e.encompassedId, quality, factor * e.coverage, depth + 1, touched);
    });
  }

  function recordRepetition(id, quality) {
    var s = ts(id);
    s.reps += 1;
    s.credit = 0;
    scheduleNext(id);
    var touched = [];
    propagateCredit(id, quality, 1, 0, touched);
    return touched;
  }

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function accentFor(id) {
    var c = clusterById[topicById[id].cluster];
    return document.documentElement.getAttribute("data-theme") === "dark" ? c.colorDark : c.color;
  }

  function statusChip(id) {
    var s = ts(id);
    if (isDue(id)) return { cls: "chip-due", label: "Due for review" };
    if (s.status === "mastered") return { cls: "chip-mastered", label: "Mastered" };
    if (s.status === "learning") return { cls: "chip-learning", label: "In progress" };
    if (isReady(id)) return { cls: "chip-ready", label: "Ready" };
    return { cls: "chip-locked", label: "Locked" };
  }

  function relativeDue(id) {
    var s = ts(id);
    if (!s.due) return "—";
    var d = s.due - Date.now();
    if (d <= 0) return "now";
    var days = Math.round(d / DAY);
    if (days < 1) return "today";
    return "in " + days + " day" + (days === 1 ? "" : "s");
  }

  function counts() {
    var c = { mastered: 0, learning: 0, ready: 0, locked: 0, due: 0 };
    G.topics.forEach(function (t) {
      if (isDue(t.id)) c.due += 1;
      if (isMastered(t.id)) c.mastered += 1;
      else if (ts(t.id).status === "learning") c.learning += 1;
      else if (isReady(t.id)) c.ready += 1;
      else c.locked += 1;
    });
    return c;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- task runner ---------- */

  var runner = null;   // active session, or null

  function startTask(task) {
    var t = task.topicId ? topicById[task.topicId] : null;
    if (task.type === "learn") {
      var s = ts(t.id);
      s.status = "learning";
      runner = {
        type: "learn", topic: t, kpIndex: s.kpIndex || 0,
        qIndex: 0, wrongThisKp: false, kpFirstTry: true, order: null
      };
    } else if (task.type === "review") {
      runner = { type: "review", topic: t, items: reviewItems(t), idx: 0, right: 0 };
    } else if (task.type === "remediate") {
      runner = { type: "remediate", topic: t, note: task.note, items: reviewItems(t).slice(0, 1), idx: 0, right: 0, shownTeach: false };
    } else if (task.type === "quiz") {
      runner = { type: "quiz", items: quizItems(), idx: 0, right: 0 };
    }
    save();
    renderToday();
  }

  /* A review draws on the questions held back from the lesson, then falls back to
     lesson questions so a topic with a long history does not repeat one item forever. */
  function reviewItems(t) {
    var pool = (t.reviewQuestions || []).slice();
    t.knowledgePoints.forEach(function (kp) { pool = pool.concat(kp.questions); });
    return shuffle(pool).slice(0, 2).map(function (q) { return { q: q, topicId: t.id }; });
  }

  function quizItems() {
    var pool = [];
    G.topics.forEach(function (t) {
      if (!isMastered(t.id)) return;
      (t.reviewQuestions || []).forEach(function (q) { pool.push({ q: q, topicId: t.id }); });
    });
    return shuffle(pool).slice(0, 5);
  }

  function queueRemedial(topicId, reason) {
    if (state.remedials.some(function (r) { return r.topicId === topicId; })) return;
    state.remedials.push({ topicId: topicId, reason: reason, addedAt: Date.now() });
  }

  function endTask(summaryNode) {
    runner = null;
    save();
    renderToday(summaryNode);
  }

  /* ---------- rendering: today ---------- */

  var panels = {
    today: document.getElementById("panel-today"),
    graph: document.getElementById("panel-graph"),
    topics: document.getElementById("panel-topics"),
    stats: document.getElementById("panel-stats")
  };

  function renderToday(summaryNode) {
    var root = panels.today;
    root.innerHTML = "";

    if (runner) { renderRunner(root); return; }

    if (summaryNode) root.appendChild(summaryNode);

    // Rendering the graph materialises a record for every topic, so "have they started?"
    // has to be asked of the placement flag rather than of the state object's size.
    if (!state.placed) root.appendChild(placementOffer());

    // headline numbers
    var c = counts();
    var head = el("div", "xp-head");
    [
      [xpToday() + " / " + DAILY_GOAL, "XP today"],
      [totalXp(), "XP total"],
      [c.mastered + " / " + G.topics.length, "Topics mastered"],
      [c.due, "Due now"]
    ].forEach(function (pair) {
      var box = el("div", "stat");
      box.appendChild(el("b", null, String(pair[0])));
      box.appendChild(el("span", null, pair[1]));
      head.appendChild(box);
    });
    root.appendChild(head);

    var bar = el("div", "bar");
    var fill = el("i");
    fill.style.width = Math.min(100, Math.round((xpToday() / DAILY_GOAL) * 100)) + "%";
    bar.appendChild(fill);
    root.appendChild(bar);

    var queue = buildQueue();

    if (!queue.length) {
      var doneCard = el("div", "card");
      doneCard.appendChild(el("span", "kicker", "Nothing due"));
      doneCard.appendChild(el("p", null,
        c.mastered === G.topics.length
          ? "Every topic in " + SECTION + " is mastered and nothing is due for review yet. Come back when the schedule brings something round."
          : "Nothing is due and no topic is unlocked right now — finish the lesson you have in progress from the Topics tab."));
      root.appendChild(doneCard);
      return;
    }

    var next = queue[0];
    var card = el("div", "card");
    card.style.setProperty("--accent", next.topicId ? accentFor(next.topicId) : "var(--rust)");
    card.appendChild(el("span", "kicker", taskLabel(next)));
    if (next.topicId) {
      card.appendChild(el("h3", null, topicById[next.topicId].name));
      card.appendChild(el("p", "small muted", topicById[next.topicId].description));
    } else {
      card.appendChild(el("h3", null, "Mixed review"));
      card.appendChild(el("p", "small muted",
        "Five questions drawn from across everything you have mastered — interleaved on purpose, because practice that mixes topics retains better than practice that blocks them."));
    }
    if (next.note) {
      card.appendChild(el("p", "small muted", "Queued because: " + next.note));
    }

    var row = el("div", "row");
    var go = el("button", "btn", startLabel(next));
    go.addEventListener("click", function () { startTask(next); });
    row.appendChild(go);
    if (next.topicId) {
      var est = topicById[next.topicId].estMinutes;
      row.appendChild(el("span", "small muted", "about " + est + " min"));
    }
    card.appendChild(row);
    root.appendChild(card);

    if (queue.length > 1) {
      root.appendChild(el("h2", null, "After that"));
      var ul = el("ul", "queue");
      queue.slice(1, 7).forEach(function (task) {
        var li = el("li");
        var type = el("span", "qtype qtype-" + task.type, task.type);
        li.appendChild(type);
        li.appendChild(el("span", null, task.topicId ? topicById[task.topicId].name : "Mixed review"));
        ul.appendChild(li);
      });
      root.appendChild(ul);
      if (queue.length > 7) {
        root.appendChild(el("p", "small muted", "…and " + (queue.length - 7) + " more in the queue."));
      }
    }

    var fr = el("p", "small muted");
    fr.textContent = c.ready + " topic" + (c.ready === 1 ? "" : "s") + " on your frontier · " +
      c.learning + " in progress · " + c.locked + " still locked behind prerequisites.";
    root.appendChild(fr);
  }

  function taskLabel(task) {
    if (task.type === "learn") return "New lesson · on your frontier";
    if (task.type === "review") return "Spaced review · due now";
    if (task.type === "remediate") return "Targeted remediation";
    return "Interleaved practice";
  }

  function startLabel(task) {
    if (task.type === "learn") return "Start the lesson →";
    if (task.type === "review") return "Review it →";
    if (task.type === "remediate") return "Shore it up →";
    return "Start the mixed set →";
  }

  /* ---------- rendering: the runner ---------- */

  function renderRunner(root) {
    if (runner.type === "learn") return renderLearn(root);
    return renderQuestionRun(root);
  }

  function renderLearn(root) {
    var t = runner.topic;
    var kps = t.knowledgePoints;
    var kp = kps[runner.kpIndex];

    var card = el("div", "card runner");
    card.style.setProperty("--accent", accentFor(t.id));
    card.appendChild(el("span", "kicker", "Lesson · " + clusterById[t.cluster].name));
    card.appendChild(el("h3", null, t.name));

    var dots = el("div", "kp-progress");
    kps.forEach(function (_, i) {
      dots.appendChild(el("span", "kp-dot " + (i < runner.kpIndex ? "done" : i === runner.kpIndex ? "now" : "")));
    });
    card.appendChild(dots);
    card.appendChild(el("p", "small muted",
      "Knowledge point " + (runner.kpIndex + 1) + " of " + kps.length + " · " + kp.name));

    var teach = el("div", "teach");
    teach.innerHTML = kp.teach;
    card.appendChild(teach);

    if (!runner.order) {
      runner.order = shuffle(kp.questions.map(function (_, i) { return i; }));
      runner.qIndex = 0;
    }
    var q = kp.questions[runner.order[runner.qIndex]];
    card.appendChild(questionBlock(q, function (correct) {
      var s = ts(t.id);
      if (correct) { s.right += 1; } else { s.wrong += 1; }

      if (!correct) {
        runner.wrongThisKp = true;
        var fails = (s.kpFails[kp.id] || 0) + 1;
        s.kpFails[kp.id] = fails;
        s.kpIndex = runner.kpIndex;
        save();

        if (fails >= 2) {
          // Two failures on the same knowledge point: stop the lesson and shore up
          // the specific prerequisites this point leans on.
          var keys = (kp.keyPrerequisites || []).filter(isMastered);
          if (!keys.length) keys = hardPrereqs[t.id].filter(isMastered);
          keys.forEach(function (p) {
            queueRemedial(p, "you stalled twice on “" + kp.name + "” in " + t.name);
          });
          var box = el("div", "card");
          box.appendChild(el("span", "kicker", "Lesson paused"));
          box.appendChild(el("p", null,
            keys.length
              ? "That is the second stall on this knowledge point, so the lesson stops here rather than letting you scrape through. " +
                "A remedial review has been queued on " + keys.map(function (k) { return topicById[k].name; }).join(" and ") +
                " — the earlier ground this point stands on. The lesson will pick up from here afterwards."
              : "That is the second stall on this knowledge point. The lesson stops here and will pick up from this point next time."));
          endTask(box);
          return;
        }
        // First failure: retry the same knowledge point with the other question.
        runner.qIndex = (runner.qIndex + 1) % runner.order.length;
        runner.kpFirstTry = false;
        renderToday();
        return;
      }

      // Correct — clear this knowledge point.
      awardXp(runner.kpFirstTry && !runner.wrongThisKp ? 10 : 5);
      runner.kpIndex += 1;
      runner.qIndex = 0;
      runner.order = null;
      runner.wrongThisKp = false;
      runner.kpFirstTry = true;
      s.kpIndex = runner.kpIndex;

      if (runner.kpIndex >= kps.length) {
        var wasNew = s.status !== "mastered";
        s.status = "mastered";
        s.kpIndex = 0;
        s.kpFails = {};
        if (wasNew) { awardXp(15); s.reps = 0; }
        recordRepetition(t.id, 1);
        var unlocked = hardDependents[t.id].filter(isReady);
        var done = el("div", "card");
        done.style.setProperty("--accent", accentFor(t.id));
        done.appendChild(el("span", "kicker", "Topic mastered"));
        done.appendChild(el("p", null,
          t.name + " is mastered. First review " + relativeDue(t.id) + "." +
          (unlocked.length
            ? " That opens " + unlocked.map(function (u) { return topicById[u].name; }).join(", ") + " on your frontier."
            : "")));
        endTask(done);
        return;
      }
      save();
      renderToday();
    }));

    var quit = el("button", "btn btn-ghost small", "Save and stop");
    quit.style.marginTop = "14px";
    quit.addEventListener("click", function () {
      ts(t.id).kpIndex = runner.kpIndex;
      endTask(null);
    });
    card.appendChild(quit);
    root.appendChild(card);
  }

  function renderQuestionRun(root) {
    var isQuiz = runner.type === "quiz";
    var t = runner.topic;
    var item = runner.items[runner.idx];

    var card = el("div", "card runner");
    if (t) card.style.setProperty("--accent", accentFor(t.id));
    card.appendChild(el("span", "kicker",
      runner.type === "review" ? "Spaced review" : runner.type === "remediate" ? "Targeted remediation" : "Interleaved practice"));
    card.appendChild(el("h3", null, t ? t.name : "Mixed review"));

    if (runner.type === "remediate" && !runner.shownTeach) {
      card.appendChild(el("p", "small muted", runner.note ? "Queued because " + runner.note + "." : ""));
      var teach = el("div", "teach");
      teach.innerHTML = t.knowledgePoints[0].teach;
      card.appendChild(teach);
      var go = el("button", "btn", "Got it — check me →");
      go.addEventListener("click", function () { runner.shownTeach = true; renderToday(); });
      card.appendChild(go);
      root.appendChild(card);
      return;
    }

    if (isQuiz) {
      card.appendChild(el("p", "small muted",
        "Question " + (runner.idx + 1) + " of " + runner.items.length + " · " + topicById[item.topicId].name));
    } else {
      card.appendChild(el("p", "small muted", "Question " + (runner.idx + 1) + " of " + runner.items.length));
    }

    card.appendChild(questionBlock(item.q, function (correct) {
      var s = ts(item.topicId);
      if (correct) { s.right += 1; runner.right += 1; } else { s.wrong += 1; }
      runner.idx += 1;

      if (runner.idx < runner.items.length) { save(); renderToday(); return; }

      var quality = runner.right / runner.items.length;
      var summary = el("div", "card");

      if (runner.type === "review") {
        if (quality >= 0.5) {
          var touched = recordRepetition(t.id, quality);
          summary.appendChild(el("span", "kicker", "Review recorded"));
          var line = "Repetition " + ts(t.id).reps + " on " + t.name + ". Next review " + relativeDue(t.id) + ".";
          var rolled = touched.filter(function (x) { return x.credit >= 0.15; });
          if (rolled.length) {
            var names = {};
            rolled.forEach(function (x) { names[x.id] = true; });
            line += " Implicit credit went to " +
              Object.keys(names).map(function (id) { return topicById[id].name; }).slice(0, 4).join(", ") +
              " through the encompassing edges — you will see them in the queue less often for it.";
          }
          summary.appendChild(el("p", null, line));
        } else {
          // A failed review resets the ladder rather than advancing it.
          var st = ts(t.id);
          st.reps = Math.max(1, st.reps - 1);
          st.credit = 0;
          scheduleNext(t.id);
          summary.appendChild(el("span", "kicker", "Review missed"));
          summary.appendChild(el("p", null,
            "That one has slipped, so its schedule steps back rather than forward — it returns " + relativeDue(t.id) + "."));
        }
        awardXp(quality === 1 ? 8 : 3);
      } else if (runner.type === "remediate") {
        state.remedials = state.remedials.filter(function (r) { return r.topicId !== t.id; });
        awardXp(6);
        if (quality === 1) recordRepetition(t.id, 1);
        summary.appendChild(el("span", "kicker", "Remediation cleared"));
        summary.appendChild(el("p", null,
          "Foundations shored up on " + t.name + ". The lesson that stalled is back at the top of your queue."));
      } else {
        awardXp(2 * runner.right);
        summary.appendChild(el("span", "kicker", "Mixed set complete"));
        summary.appendChild(el("p", null, runner.right + " of " + runner.items.length + " correct."));
      }
      endTask(summary);
    }));

    root.appendChild(card);
  }

  /* One multiple-choice question, with the answer revealed before you move on. */
  function questionBlock(q, done) {
    var wrap = el("div");
    wrap.appendChild(el("p", null, q.q));
    var list = el("div", "opts");
    var answered = false;

    q.options.forEach(function (text, i) {
      var b = el("button", "opt", text);
      b.type = "button";
      b.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var correct = i === q.correct;
        Array.prototype.forEach.call(list.children, function (child, j) {
          child.disabled = true;
          if (j === q.correct) child.classList.add("right");
          else if (j === i) child.classList.add("wrong");
        });
        var ex = el("div", "explain " + (correct ? "right" : "wrong"));
        ex.appendChild(el("strong", null, correct ? "Correct. " : "Not quite. "));
        ex.appendChild(document.createTextNode(q.explain));
        wrap.appendChild(ex);
        var next = el("button", "btn", "Continue →");
        next.style.marginTop = "12px";
        next.addEventListener("click", function () { done(correct); });
        wrap.appendChild(next);
        next.focus();
      });
      list.appendChild(b);
    });
    wrap.appendChild(list);
    return wrap;
  }

  /* ---------- placement diagnostic ---------- */

  function placementOffer() {
    var card = el("div", "card");
    card.appendChild(el("span", "kicker", "Start here"));
    card.appendChild(el("h3", null, "Placement check"));
    card.appendChild(el("p", null,
      "Up to " + MAX_DIAGNOSTIC + " questions that find your knowledge frontier without walking the whole graph. " +
      "Each answer settles more than the topic it asks about: get one right and its prerequisites are inferred known, " +
      "get one wrong and everything downstream is known to be out of reach."));
    var row = el("div", "row");
    var go = el("button", "btn", "Take the placement check →");
    go.addEventListener("click", startDiagnostic);
    var skip = el("button", "btn btn-ghost", "Skip — start from the beginning");
    skip.addEventListener("click", function () { state.placed = true; save(); renderToday(); });
    row.appendChild(go); row.appendChild(skip);
    card.appendChild(row);
    return card;
  }

  var diag = null;

  function startDiagnostic() {
    diag = { verdicts: {}, askedIds: {}, asked: 0, current: null };
    renderDiagnostic();
  }

  /* Ask the topic whose answer splits the remaining uncertainty most evenly —
     the graph equivalent of a binary search, which is what keeps this to ~14 questions
     instead of 44. */
  function pickDiagnosticTopic() {
    var unknown = G.topics.filter(function (t) { return diag.verdicts[t.id] === undefined; });
    if (!unknown.length) return null;
    var best = null, bestScore = -1;
    unknown.forEach(function (t) {
      var up = transitive(hardPrereqs, t.id).filter(function (id) { return diag.verdicts[id] === undefined; }).length;
      var down = transitive(hardDependents, t.id).filter(function (id) { return diag.verdicts[id] === undefined; }).length;
      var score = Math.min(up, down) * 2 + t.centrality;
      if (score > bestScore) { bestScore = score; best = t; }
    });
    return best;
  }

  function applyVerdict(topicId, known, asked) {
    diag.verdicts[topicId] = known;
    if (asked) diag.askedIds[topicId] = true;
    if (known) {
      transitive(hardPrereqs, topicId).forEach(function (id) {
        if (diag.verdicts[id] === undefined) diag.verdicts[id] = true;
      });
    } else {
      transitive(hardDependents, topicId).forEach(function (id) {
        if (diag.verdicts[id] === undefined) diag.verdicts[id] = false;
      });
    }
  }

  function finishDiagnostic() {
    G.topics.forEach(function (t) {
      if (diag.verdicts[t.id] !== true) return;
      var s = ts(t.id);
      var verified = !!diag.askedIds[t.id];
      s.status = "mastered";
      s.inferred = !verified;
      s.reps = 1;
      s.lastAt = Date.now();
      // Conditional completion: a pass that was inferred rather than demonstrated comes
      // back the next day, so a wrong inference is caught instead of compounding.
      s.due = Date.now() + (verified ? 3 * DAY : DAY);
    });
    state.placed = true;
    var known = Object.keys(diag.verdicts).filter(function (k) { return diag.verdicts[k]; }).length;
    diag = null;
    save();

    var box = el("div", "card");
    box.appendChild(el("span", "kicker", "Placement complete"));
    box.appendChild(el("p", null, known === 0
      ? "Nothing placed as already known, so you start at the entry point of the graph and work outwards. That is the normal result if " + SECTION + " is new to you."
      : known + " of " + G.topics.length + " topics placed as already known — most of them inferred from the graph rather than asked about directly. " +
        "Inferred topics are scheduled for an early review, so a wrong inference surfaces fast instead of quietly sitting there."));
    renderToday(box);
  }

  function renderDiagnostic() {
    var root = panels.today;
    root.innerHTML = "";

    if (diag.asked >= MAX_DIAGNOSTIC) return finishDiagnostic();
    var t = pickDiagnosticTopic();
    if (!t) return finishDiagnostic();

    var card = el("div", "card");
    card.style.setProperty("--accent", accentFor(t.id));
    card.appendChild(el("span", "kicker", "Placement check · " + (diag.asked + 1) + " of at most " + MAX_DIAGNOSTIC));
    card.appendChild(el("h3", null, t.name));
    var q = t.reviewQuestions[0];
    card.appendChild(questionBlock(q, function (correct) {
      applyVerdict(t.id, correct, true);
      diag.asked += 1;
      renderDiagnostic();
    }));

    var idk = el("button", "btn btn-ghost small", "I don't know this one");
    idk.style.marginTop = "12px";
    idk.addEventListener("click", function () {
      applyVerdict(t.id, false, true);
      diag.asked += 1;
      renderDiagnostic();
    });
    card.appendChild(idk);
    root.appendChild(card);
  }

  /* ---------- rendering: graph ---------- */

  var NS = "http://www.w3.org/2000/svg";
  var NODE_W = 172, NODE_H = 46;
  var showSoft = true, showEnc = false, selected = null;

  function svgEl(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function wrapLabel(name) {
    var words = name.split(/\s+/);
    var lines = [], line = "";
    words.forEach(function (w) {
      var candidate = line ? line + " " + w : w;
      if (candidate.length > 24 && line) { lines.push(line); line = w; }
      else line = candidate;
    });
    if (line) lines.push(line);
    if (lines.length > 3) { lines = lines.slice(0, 3); lines[2] = lines[2].slice(0, 21) + "…"; }
    return lines;
  }

  function renderGraph() {
    var root = panels.graph;
    root.innerHTML = "";

    var toggles = el("div", "toggles");
    toggles.appendChild(checkbox("Soft prerequisites", showSoft, function (v) { showSoft = v; renderGraph(); }));
    toggles.appendChild(checkbox("Encompassings", showEnc, function (v) { showEnc = v; renderGraph(); }));
    root.appendChild(toggles);

    var wrap = el("div", "graph-wrap");
    var scroll = el("div", "graph-scroll");
    var svg = svgEl("svg", {
      width: G.layout.width, height: G.layout.height,
      viewBox: "0 0 " + G.layout.width + " " + G.layout.height,
      role: "img", "aria-label": "Prerequisite graph of " + SECTION + " topics"
    });

    var hot = {};
    if (selected) {
      hot[selected] = true;
      hardPrereqs[selected].forEach(function (p) { hot[p] = true; });
      hardDependents[selected].forEach(function (d) { hot[d] = true; });
    }

    var edges = svgEl("g", {});
    if (showEnc) {
      G.encompassings.forEach(function (e) {
        edges.appendChild(edgePath(topicById[e.topicId], topicById[e.encompassedId], "gedge enc"));
      });
    }
    G.dependencies.forEach(function (d) {
      if (d.strength === "soft" && !showSoft) return;
      var cls = "gedge" + (d.strength === "soft" ? " soft" : "");
      if (selected && (d.topicId === selected || d.prerequisiteId === selected)) cls += " hot";
      edges.appendChild(edgePath(topicById[d.prerequisiteId], topicById[d.topicId], cls));
    });
    svg.appendChild(edges);

    G.topics.forEach(function (t) {
      var g = svgEl("g", { class: "gnode" + (selected === t.id ? " sel" : ""), tabindex: "0", role: "button" });
      g.setAttribute("aria-label", t.name + " — " + statusChip(t.id).label);

      var mastered = isMastered(t.id);
      var learning = ts(t.id).status === "learning";
      var ready = isReady(t.id);
      var accent = accentFor(t.id);

      var rect = svgEl("rect", {
        x: t.x - NODE_W / 2, y: t.y - NODE_H / 2, width: NODE_W, height: NODE_H, rx: 4,
        fill: mastered ? accent : learning ? "var(--paper-deep)" : "var(--white)",
        stroke: (mastered || ready || learning) ? accent : "var(--locked)",
        "stroke-dasharray": ready && !learning ? "5 3" : "none",
        opacity: (!mastered && !ready && !learning) ? 0.45 : 1
      });
      g.appendChild(rect);

      if (isDue(t.id)) {
        g.appendChild(svgEl("circle", {
          cx: t.x + NODE_W / 2 - 9, cy: t.y - NODE_H / 2 + 9, r: 4.5,
          fill: "var(--bad)", stroke: "var(--white)", "stroke-width": 1.5
        }));
      }

      var lines = wrapLabel(t.name);
      var startY = t.y - (lines.length - 1) * 5.5;
      lines.forEach(function (line, i) {
        var text = svgEl("text", {
          x: t.x, y: startY + i * 11.5, "text-anchor": "middle", "dominant-baseline": "middle"
        });
        if (mastered) text.setAttribute("fill", "#fffdfa");
        text.textContent = line;
        g.appendChild(text);
      });

      function open() { selected = t.id; renderGraph(); }
      g.addEventListener("click", open);
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      svg.appendChild(g);
    });

    scroll.appendChild(svg);
    wrap.appendChild(scroll);
    root.appendChild(wrap);

    var legend = el("div", "legend");
    [["Mastered", "fill"], ["Ready — on your frontier", "dash"], ["In progress", "half"], ["Locked", "dim"]]
      .forEach(function (pair) {
        var s = el("span");
        var sw = el("span", "swatch");
        if (pair[1] === "fill") { sw.style.background = "var(--rust)"; sw.style.borderColor = "var(--rust)"; }
        if (pair[1] === "dash") { sw.style.borderStyle = "dashed"; sw.style.borderColor = "var(--rust)"; }
        if (pair[1] === "half") { sw.style.background = "var(--paper-deep)"; sw.style.borderColor = "var(--rust)"; }
        if (pair[1] === "dim") { sw.style.borderColor = "var(--locked)"; sw.style.opacity = ".55"; }
        s.appendChild(sw); s.appendChild(document.createTextNode(pair[0]));
        legend.appendChild(s);
      });
    G.clusters.forEach(function (c) {
      var s = el("span");
      var sw = el("span", "swatch");
      var col = document.documentElement.getAttribute("data-theme") === "dark" ? c.colorDark : c.color;
      sw.style.background = col; sw.style.borderColor = col;
      s.appendChild(sw); s.appendChild(document.createTextNode(c.name));
      legend.appendChild(s);
    });
    root.appendChild(legend);
    root.appendChild(el("p", "small muted",
      "Columns are prerequisite depth: everything in a column depends only on things to its left. Scroll sideways to follow the graph out."));

    if (selected) root.appendChild(topicDetail(selected));
  }

  function edgePath(from, to, cls) {
    var x1 = from.x + NODE_W / 2, y1 = from.y;
    var x2 = to.x - NODE_W / 2, y2 = to.y;
    if (to.x <= from.x) { x1 = from.x; y1 = from.y + NODE_H / 2; x2 = to.x; y2 = to.y - NODE_H / 2; }
    var mid = (x1 + x2) / 2;
    return svgEl("path", { class: cls, d: "M" + x1 + "," + y1 + " C" + mid + "," + y1 + " " + mid + "," + y2 + " " + x2 + "," + y2 });
  }

  function checkbox(label, checked, onChange) {
    var wrap = el("label");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.addEventListener("change", function () { onChange(input.checked); });
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(label));
    return wrap;
  }

  /* ---------- topic detail ---------- */

  function topicDetail(id) {
    var t = topicById[id];
    var s = ts(id);
    var card = el("div", "card detail");
    card.style.setProperty("--accent", accentFor(id));

    card.appendChild(el("span", "kicker", clusterById[t.cluster].name + " · layer " + t.layer));
    card.appendChild(el("h3", null, t.name));

    var chipRow = el("div", "row");
    var chip = statusChip(id);
    chipRow.appendChild(el("span", "chip " + chip.cls, chip.label));
    chipRow.appendChild(el("span", "chip", t.type.toLowerCase()));
    if (t.core) chipRow.appendChild(el("span", "chip", "core topic"));
    if (s.inferred && s.status === "mastered") chipRow.appendChild(el("span", "chip", "inferred at placement"));
    card.appendChild(chipRow);

    card.appendChild(el("p", null, t.description));

    var dl = el("dl");
    function row(term, node) {
      dl.appendChild(el("dt", null, term));
      var dd = el("dd");
      if (typeof node === "string") dd.textContent = node; else dd.appendChild(node);
      dl.appendChild(dd);
    }

    var ev = el("ul");
    t.evidence.forEach(function (e) { ev.appendChild(el("li", null, e)); });
    row("Mastery means", ev);

    if (hardPrereqs[id].length) {
      row("Requires", linkList(hardPrereqs[id]));
    } else {
      row("Requires", "nothing — this is the entry point of the graph");
    }
    var softs = allPrereqs[id].filter(function (d) { return d.strength === "soft"; }).map(function (d) { return d.prerequisiteId; });
    if (softs.length) row("Helps to know", linkList(softs));
    if (hardDependents[id].length) row("Opens", linkList(hardDependents[id]));
    if (encFrom[id].length) {
      row("Practises implicitly", linkList(encFrom[id].map(function (e) { return e.encompassedId; })));
    }
    if (encTo[id].length) {
      row("Kept fresh by", linkList(encTo[id].map(function (e) { return e.topicId; })));
    }
    if (t.standards && t.standards.length) {
      row("Exam alignment", t.standards.map(function (sid) {
        var st = G.standards.filter(function (x) { return x.id === sid; })[0];
        return st ? st.code + " " + st.name : sid;
      }).join(" · "));
    }
    if (s.status === "mastered") {
      row("Schedule", "repetition " + s.reps + " · next review " + relativeDue(id) +
        (s.credit > 0.05 ? " · " + Math.round(s.credit * 100) + "% implicit credit banked" : ""));
    }
    if (s.right + s.wrong > 0) row("Your record", s.right + " right · " + s.wrong + " wrong");
    if (t.sources && t.sources.length) {
      var srcs = el("span");
      t.sources.forEach(function (src, i) {
        if (i) srcs.appendChild(document.createTextNode(" · "));
        var a = el("a", null, src.label);
        a.href = src.href;
        srcs.appendChild(a);
      });
      row("Read more", srcs);
    }
    card.appendChild(dl);

    var actions = el("div", "row");
    actions.style.marginTop = "14px";
    if (isReady(id) || s.status === "learning") {
      var learn = el("button", "btn", s.status === "learning" ? "Resume this lesson →" : "Learn this now →");
      learn.addEventListener("click", function () { showTab("today"); startTask({ type: "learn", topicId: id }); });
      actions.appendChild(learn);
    } else if (s.status === "mastered") {
      var rev = el("button", "btn btn-ghost", "Review this now →");
      rev.addEventListener("click", function () { showTab("today"); startTask({ type: "review", topicId: id }); });
      actions.appendChild(rev);
    } else {
      var blockers = hardPrereqs[id].filter(function (p) { return !isMastered(p); });
      actions.appendChild(el("span", "small muted",
        "Locked until you master " + blockers.map(function (b) { return topicById[b].name; }).join(" and ") + "."));
    }
    card.appendChild(actions);
    return card;
  }

  function linkList(ids) {
    var span = el("span");
    ids.forEach(function (id, i) {
      if (i) span.appendChild(document.createTextNode(" · "));
      var b = el("button", "btn-ghost", topicById[id].name);
      b.style.cssText = "border:0;background:none;padding:0;font:inherit;color:var(--rust-dark);cursor:pointer;text-decoration:underline;";
      b.addEventListener("click", function () { selected = id; showTab("graph"); renderGraph(); });
      span.appendChild(b);
    });
    return span;
  }

  /* ---------- rendering: topics list ---------- */

  function renderTopics() {
    var root = panels.topics;
    root.innerHTML = "";
    var c = counts();
    root.appendChild(el("p", "small muted",
      c.mastered + " mastered · " + c.learning + " in progress · " + c.ready + " ready · " + c.locked + " locked · " + c.due + " due"));

    G.clusters.forEach(function (cluster) {
      var list = G.topics.filter(function (t) { return t.cluster === cluster.id; });
      if (!list.length) return;
      root.appendChild(el("h2", null, cluster.name));
      root.appendChild(el("p", "small muted", cluster.summary));
      var ul = el("ul", "tlist");
      list.sort(function (a, b) { return a.layer - b.layer || a.name.localeCompare(b.name); }).forEach(function (t) {
        var li = el("li");
        var b = el("button");
        b.appendChild(el("span", "tname", t.name));
        var chip = statusChip(t.id);
        b.appendChild(el("span", "chip " + chip.cls, chip.label));
        b.addEventListener("click", function () { selected = t.id; showTab("graph"); renderGraph(); });
        li.appendChild(b);
        ul.appendChild(li);
      });
      root.appendChild(ul);
    });
  }

  /* ---------- rendering: stats ---------- */

  function renderStats() {
    var root = panels.stats;
    root.innerHTML = "";

    var c = counts();
    var head = el("div", "xp-head");
    [
      [totalXp(), "XP total"],
      [Math.round((c.mastered / G.topics.length) * 100) + "%", "Section mastered"],
      [c.due, "Due now"],
      [state.remedials.length, "Remedials queued"]
    ].forEach(function (pair) {
      var box = el("div", "stat");
      box.appendChild(el("b", null, String(pair[0])));
      box.appendChild(el("span", null, pair[1]));
      head.appendChild(box);
    });
    root.appendChild(head);

    root.appendChild(el("h2", null, "By cluster"));
    G.clusters.forEach(function (cluster) {
      var list = G.topics.filter(function (t) { return t.cluster === cluster.id; });
      var done = list.filter(function (t) { return isMastered(t.id); }).length;
      var box = el("div", "cluster-stat");
      var row = el("div", "row");
      row.appendChild(el("span", null, cluster.name));
      row.appendChild(el("span", "muted small", done + " / " + list.length));
      box.appendChild(row);
      var bar = el("div", "bar");
      var fill = el("i");
      fill.style.width = Math.round((done / list.length) * 100) + "%";
      fill.style.background = document.documentElement.getAttribute("data-theme") === "dark" ? cluster.colorDark : cluster.color;
      bar.appendChild(fill);
      box.appendChild(bar);
      root.appendChild(box);
    });

    root.appendChild(el("h2", null, "By exam domain"));
    G.standards.filter(function (s) { return s.family === "ccaf"; }).forEach(function (std) {
      var list = G.topics.filter(function (t) { return (t.standards || []).indexOf(std.id) !== -1; });
      if (!list.length) return;
      var done = list.filter(function (t) { return isMastered(t.id); }).length;
      var box = el("div", "cluster-stat");
      var row = el("div", "row");
      row.appendChild(el("span", null, std.name + " · " + Math.round(std.weight * 100) + "% of the exam"));
      row.appendChild(el("span", "muted small", done + " / " + list.length));
      box.appendChild(row);
      var bar = el("div", "bar");
      var fill = el("i");
      fill.style.width = Math.round((done / list.length) * 100) + "%";
      bar.appendChild(fill);
      box.appendChild(bar);
      root.appendChild(box);
    });

    var answered = G.topics.reduce(function (n, t) { return n + ts(t.id).right + ts(t.id).wrong; }, 0);
    var right = G.topics.reduce(function (n, t) { return n + ts(t.id).right; }, 0);
    root.appendChild(el("h2", null, "Accuracy"));
    root.appendChild(el("p", null, answered
      ? right + " of " + answered + " questions answered correctly (" + Math.round((right / answered) * 100) + "%)."
      : "No questions answered yet."));

    var upcoming = G.topics.filter(function (t) { return ts(t.id).due; })
      .sort(function (a, b) { return ts(a.id).due - ts(b.id).due; }).slice(0, 8);
    if (upcoming.length) {
      root.appendChild(el("h2", null, "Review schedule"));
      var ul = el("ul", "queue");
      upcoming.forEach(function (t) {
        var li = el("li");
        li.appendChild(el("span", "qtype", "rep " + ts(t.id).reps));
        li.appendChild(el("span", null, t.name));
        li.appendChild(el("span", "muted small", relativeDue(t.id)));
        ul.appendChild(li);
      });
      root.appendChild(ul);
      root.appendChild(el("p", "small muted",
        "Topics missing from this list are being kept alive implicitly — advanced topics that encompass them are paying their repetitions."));
    }
  }

  /* ---------- tabs ---------- */

  var TABS = ["today", "graph", "topics", "stats", "method"];

  function showTab(name) {
    TABS.forEach(function (t) {
      var btn = document.getElementById("tab-" + t);
      var panel = document.getElementById("panel-" + t);
      btn.setAttribute("aria-selected", String(t === name));
      panel.hidden = t !== name;
    });
    if (name === "today") renderToday();
    if (name === "graph") renderGraph();
    if (name === "topics") renderTopics();
    if (name === "stats") renderStats();
    try { history.replaceState(null, "", "#" + name); } catch (e) {}
  }

  /* ---------- sync ---------- */

  function setupSync() {
    if (!window.GistSync) return;
    sync = window.GistSync.create(STORAGE_KEY, {
      getState: function () { return state; },
      setState: function (next, updatedAt) {
        if (!next || typeof next !== "object" || !next.topics) return;
        state = next;
        state.updatedAt = updatedAt || next.updatedAt || Date.now();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        renderToday();
      },
      getUpdatedAt: function () { return state.updatedAt || 0; }
    });
    sync.syncOnLoad();
  }

  /* ---------- init ---------- */

  loadState();

  TABS.forEach(function (t) {
    document.getElementById("tab-" + t).addEventListener("click", function () { showTab(t); });
  });

  document.querySelectorAll("[data-goto]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); showTab(a.getAttribute("data-goto")); });
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    if (!confirm("Erase all learning-graph progress in this browser?")) return;
    state = freshState();
    selected = null;
    save();
    showTab("today");
  });

  var initial = (location.hash || "").replace("#", "");
  showTab(TABS.indexOf(initial) !== -1 ? initial : "today");
  setupSync();
})();
