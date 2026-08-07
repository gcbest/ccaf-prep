/* Shared lesson progress.

   Records the story decision points (which the per-lesson inline choose() used to
   throw away), derives the progress bar and the masthead tally from real answers,
   offers a resume point, and adds a "Next" control — plus desktop keyboard
   shortcuts — for moving between scenes.

   This file replaces the choose() function that every lesson used to define inline.
   The lesson markup is untouched: the onclick="choose('one','Chat', 14)" attributes
   are parsed once at init and swapped for real listeners, and the hardcoded third
   argument is ignored in favour of a derived percentage.

   Load AFTER ask-claude.js and lesson-search.js — both snapshot section text at
   their own init, and nothing this file injects should reach the Ask Claude prompt
   or the in-lesson search index — and BEFORE checks/000N.js + section-check.js.

   The same file runs in "index mode" on index.html and lessons/index.html, where it
   renders a per-lesson progress pill and a resume link from the same stored state. */
(function () {
  "use strict";

  var STORAGE_KEY = "ccaf_lesson_progress_v1";
  var CHECKS_KEY = "ccaf_section_checks_v1";
  var LESSON_HREF = /(\d{4}-[a-z0-9-]+)\.html/i;

  var state = { lessons: {}, updatedAt: 0 };
  var checksState = null;
  var lesson = "";
  var scenes = [];
  var trackable = [];
  var groups = {};
  var tallyEl = null;
  var progressBar = null;
  var controlsRow = null;
  var sync = null;

  /* ---------- state ---------- */

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.lessons) state = parsed;
    } catch (e) { /* corrupt or unavailable storage — start fresh */ }
  }

  function saveState() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    if (sync) sync.schedulePush();
  }

  function lessonState(slug) {
    var key = slug || lesson;
    if (!state.lessons[key]) state.lessons[key] = { decisions: {} };
    if (!state.lessons[key].decisions) state.lessons[key].decisions = {};
    return state.lessons[key];
  }

  function decisions() {
    return lessonState().decisions;
  }

  /* Section-check answers live in their own store, written by section-check.js.
     Read them rather than reaching into that module, so load order can't bite. */
  function readChecks() {
    try {
      var raw = localStorage.getItem(CHECKS_KEY);
      checksState = raw ? JSON.parse(raw) : null;
    } catch (e) { checksState = null; }
    return checksState;
  }

  function checkRecord(sectionId) {
    if (!checksState || !checksState.lessons) return null;
    var byScene = checksState.lessons[lesson];
    return (byScene && byScene[sectionId]) || null;
  }

  /* ---------- styles ---------- */

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "lesson-progress-styles";
    style.textContent =
      /* Hash jumps and scrollIntoView must clear the sticky masthead. The offset is
         measured at runtime because the masthead stacks taller on narrow screens. */
      "section.scene,section.end{scroll-margin-top:var(--lp-header-offset,72px);}" +

      ".lp-controls{flex:none;display:flex;align-items:center;gap:6px;}" +

      ".lp-tally{flex:none;color:var(--muted);font:700 11px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.1em;white-space:nowrap;}" +

      ".lp-resume{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 30px;" +
      "padding:13px 16px;border:1px solid var(--line);border-left:3px solid var(--rust);" +
      "border-radius:3px;background:var(--paper-deep);}" +
      ".lp-resume-text{flex:1;min-width:180px;margin:0;color:var(--muted);" +
      "font:600 13px/1.4 system-ui,sans-serif;}" +
      ".lp-resume-text b{color:var(--ink);font-weight:700;}" +
      ".lp-resume-go{flex:none;border:1px solid var(--rust);border-radius:3px;" +
      "background:var(--rust);color:#fff;padding:9px 14px;" +
      "font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.05em;cursor:pointer;}" +
      ".lp-resume-go:hover,.lp-resume-go:focus-visible{background:var(--rust-dark);" +
      "border-color:var(--rust-dark);color:#fff;outline:none;}" +
      ".lp-resume-dismiss{flex:none;padding:6px 8px;border:0;background:none;color:var(--muted);" +
      "font:600 12px/1.2 system-ui,sans-serif;text-decoration:underline;cursor:pointer;}" +
      ".lp-resume-dismiss:hover,.lp-resume-dismiss:focus-visible{background:none;" +
      "color:var(--rust-dark);outline:none;}" +

      /* Chosen decision button stays marked after a reload, so a returning reader
         can see what they answered without clicking again. */
      ".choices button.lp-picked{position:relative;}" +
      ".choices button.lp-right{border-color:#5c8a5c;background:#f1f6ef;color:var(--ink);}" +
      ".choices button.lp-wrong{border-color:var(--rust);background:#fdf0ea;color:var(--ink);}" +
      ".choices button.lp-picked::after{margin-left:7px;font-size:11px;font-weight:700;}" +
      ".choices button.lp-right::after{content:'✓';color:#3f6b3f;}" +
      ".choices button.lp-wrong::after{content:'✕';color:var(--rust-dark);}" +

      ".lp-next{display:none;width:100%;margin-top:18px;border:1px solid var(--line);" +
      "border-radius:3px;background:var(--paper-deep);color:var(--rust-dark);" +
      "padding:12px 14px;font:700 13px/1.2 system-ui,sans-serif;letter-spacing:.04em;" +
      "text-align:center;cursor:pointer;}" +
      ".lp-next.visible{display:block;}" +
      ".lp-next:hover,.lp-next:focus-visible{background:var(--rust);border-color:var(--rust);" +
      "color:#fff;outline:none;}" +

      ".lp-help{position:fixed;right:18px;bottom:18px;z-index:1090;max-width:280px;" +
      "padding:14px 16px;border:1px solid var(--line);border-radius:5px;background:var(--white);" +
      "box-shadow:0 14px 40px rgba(0,0,0,.24);font:13px/1.6 system-ui,sans-serif;color:var(--ink);}" +
      ".lp-help[hidden]{display:none;}" +
      ".lp-help h3{margin:0 0 8px;font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.08em;" +
      "text-transform:uppercase;color:var(--muted);}" +
      ".lp-help dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:0;}" +
      ".lp-help dt{font-weight:700;color:var(--rust-dark);}" +
      ".lp-help dd{margin:0;color:var(--muted);}" +

      /* Index pages: a progress pill beside each lesson link. */
      ".lp-pill{flex:none;display:inline-flex;align-items:center;gap:7px;margin:0 4px;" +
      "color:var(--muted);font:700 11px/1.2 system-ui,sans-serif;letter-spacing:.06em;" +
      "white-space:nowrap;text-decoration:none;}" +
      "a.lp-pill:hover,a.lp-pill:focus-visible{color:var(--rust-dark);outline:none;}" +
      ".lp-pill-bar{display:block;width:44px;height:4px;border-radius:999px;" +
      "background:var(--paper-deep);overflow:hidden;}" +
      ".lp-pill-bar i{display:block;height:100%;background:var(--rust);}" +
      ".card .lp-pill{display:flex;margin:0 0 12px;padding:0 2px;}" +

      ":root[data-theme=\"dark\"] .choices button.lp-right{background:#1b2716;border-color:#5c8a5c;}" +
      ":root[data-theme=\"dark\"] .choices button.lp-right::after{color:#8fbc8f;}" +
      ":root[data-theme=\"dark\"] .choices button.lp-wrong{background:#2c1a14;}" +

      /* Touch: the stacked masthead keeps its controls on one row, and every
         control clears the ~44px minimum tap target. */
      "@media (hover:none) and (pointer:coarse){" +
      ".masthead .lp-controls{display:flex;margin-top:8px;}" +
      ".lp-controls .ls-toggle,.lp-controls .theme-toggle{width:40px;height:40px;}" +
      ".lp-next,.lp-resume-go{min-height:44px;}" +
      ".lp-resume-dismiss{min-height:44px;}" +
      ".choices button{min-height:44px;}" +
      ".sc-opt{padding:12px 13px;min-height:44px;}" +
      ".sc-retry{min-height:44px;padding:10px 0;}" +
      /* Keyboard hints are noise without a keyboard. */
      ".lp-help{display:none;}" +
      "}";
    document.head.appendChild(style);
  }

  function measureHeader() {
    var masthead = document.querySelector(".masthead");
    var h = masthead ? masthead.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty("--lp-header-offset", Math.round(h + 16) + "px");
  }

  /* ---------- decision points ---------- */

  function revealGroup(group, answer) {
    var all = document.querySelectorAll('[id^="' + group + '-"]');
    Array.prototype.forEach.call(all, function (el) { el.classList.remove("visible"); });
    var selected = document.getElementById(group + "-" + answer);
    if (selected) selected.classList.add("visible");
  }

  function markGroup(group, answer) {
    var g = groups[group];
    if (!g) return;
    g.buttons.forEach(function (b) {
      b.el.classList.remove("lp-picked", "lp-right", "lp-wrong");
      if (b.answer !== answer) return;
      b.el.classList.add("lp-picked", b.correct ? "lp-right" : "lp-wrong");
    });
  }

  function pick(group, answer) {
    revealGroup(group, answer);
    var g = groups[group];
    if (!g) return;

    // The first attempt is the one that counts; re-clicking only re-reveals.
    if (!decisions()[group]) {
      var chosen = null;
      g.buttons.forEach(function (b) { if (b.answer === answer) chosen = b; });
      decisions()[group] = {
        choice: answer,
        correct: !!(chosen && chosen.correct),
        at: Date.now()
      };
      saveState();
    }
    markGroup(group, answer);
    render();
  }

  function parseChoices() {
    var buttons = document.querySelectorAll(".choices button");
    var unparsed = [];
    Array.prototype.forEach.call(buttons, function (btn) {
      var raw = btn.getAttribute("onclick") || "";
      var m = /choose\(\s*'([^']*)'\s*,\s*'([^']*)'/.exec(raw);
      if (!m) { unparsed.push(btn); return; }
      var group = m[1];
      var answer = m[2];
      btn.removeAttribute("onclick");
      btn.setAttribute("data-lp-group", group);

      if (!groups[group]) groups[group] = { buttons: [] };
      groups[group].buttons.push({
        el: btn,
        answer: answer,
        correct: btn.hasAttribute("data-correct")
      });

      btn.addEventListener("click", function () { pick(group, answer); });
    });

    if (unparsed.length) {
      console.warn("lesson-progress: " + unparsed.length +
        " choice button(s) had no parseable choose() call and will not be scored", unparsed);
    }

    Object.keys(groups).forEach(function (name) {
      var hasKey = groups[name].buttons.some(function (b) { return b.correct; });
      if (!hasKey) console.warn('lesson-progress: choice group "' + name + '" has no data-correct button');
    });
  }

  /* ---------- scenes ---------- */

  function buildScenes() {
    var items = (window.CCAF_CHECKS && window.CCAF_CHECKS.items) || {};
    var els = document.querySelectorAll("main section.scene");
    Array.prototype.forEach.call(els, function (el, i) {
      var names = [];
      var btns = el.querySelectorAll(".choices button[data-lp-group]");
      Array.prototype.forEach.call(btns, function (b) {
        var g = b.getAttribute("data-lp-group");
        if (names.indexOf(g) === -1) names.push(g);
      });
      var item = items[el.id];
      var scene = {
        el: el,
        id: el.id,
        index: i,
        groups: names,
        hasCheck: !!(item && item.options && item.options.length)
      };
      names.forEach(function (n) { groups[n].sceneId = el.id; });
      scenes.push(scene);
      if (names.length || scene.hasCheck) trackable.push(scene);
    });
  }

  function sceneAnswered(scene) {
    var d = decisions();
    for (var i = 0; i < scene.groups.length; i++) {
      if (!d[scene.groups[i]]) return false;
    }
    if (scene.hasCheck && !checkRecord(scene.id)) return false;
    return true;
  }

  function sceneCorrect(scene) {
    var d = decisions();
    for (var i = 0; i < scene.groups.length; i++) {
      var rec = d[scene.groups[i]];
      if (!rec || !rec.correct) return false;
    }
    if (scene.hasCheck) {
      var chk = checkRecord(scene.id);
      if (!chk || !chk.correct) return false;
    }
    return true;
  }

  function sceneStatus(scene) {
    if (!sceneAnswered(scene)) return "new";
    return sceneCorrect(scene) ? "right" : "wrong";
  }

  /* ---------- rendering ---------- */

  function render() {
    readChecks();

    var answered = 0;
    trackable.forEach(function (scene) {
      var done = sceneAnswered(scene);
      if (done) answered += 1;
      var next = scene.el.querySelector(".lp-next");
      if (next) next.classList.toggle("visible", done);
    });

    var total = trackable.length;
    if (progressBar && total) {
      progressBar.style.width = Math.round((answered / total) * 100) + "%";
    }
    if (tallyEl) {
      tallyEl.textContent = "✓ " + answered + "/" + total;
      tallyEl.setAttribute("aria-label", answered + " of " + total + " sections answered");
    }

    // The index pages read these derived figures straight out of storage, so they
    // have to be persisted here rather than only when an answer is recorded.
    var ls = lessonState();
    var resumeScene = firstUnanswered();
    var resumeId = resumeScene ? resumeScene.id : "end";
    if (ls.answered !== answered || ls.total !== total || ls.lastSceneId !== resumeId) {
      ls.answered = answered;
      ls.total = total;
      ls.lastSceneId = resumeId;
      saveState();
    }
  }

  function firstUnanswered() {
    for (var i = 0; i < trackable.length; i++) {
      if (!sceneAnswered(trackable[i])) return trackable[i];
    }
    return null;
  }

  function headingFor(scene) {
    var h2 = scene.el.querySelector("h2");
    return h2 ? h2.textContent.replace(/\s+/g, " ").trim() : scene.id;
  }

  function scrollToScene(scene) {
    if (!scene) return;
    scene.el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function mountNextButtons() {
    trackable.forEach(function (scene, i) {
      var isLast = i === trackable.length - 1;
      var target = isLast
        ? document.querySelector("main section.end")
        : trackable[i + 1].el;
      if (!target) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lp-next";
      btn.textContent = isLast ? "Finish →" : "Next →";
      btn.addEventListener("click", function () {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      scene.el.appendChild(btn);
    });
  }

  function mountControls() {
    var masthead = document.querySelector(".masthead");
    if (!masthead) return;

    controlsRow = document.createElement("div");
    controlsRow.className = "lp-controls";

    var searchToggle = masthead.querySelector(".ls-toggle");
    var themeToggle = document.getElementById("themeToggle");

    tallyEl = document.createElement("span");
    tallyEl.className = "lp-tally";

    controlsRow.appendChild(tallyEl);
    if (searchToggle) controlsRow.appendChild(searchToggle);
    if (themeToggle && themeToggle.parentNode === masthead) controlsRow.appendChild(themeToggle);

    masthead.appendChild(controlsRow);
  }

  function mountResume() {
    var scene = firstUnanswered();
    if (!scene || scene.index === 0) return;

    var dek = document.querySelector("main .dek");
    if (!dek) return;

    var bar = document.createElement("div");
    bar.className = "lp-resume";

    var text = document.createElement("p");
    text.className = "lp-resume-text";
    text.appendChild(document.createTextNode("You left off before "));
    var strong = document.createElement("b");
    strong.textContent = headingFor(scene);
    text.appendChild(strong);

    var go = document.createElement("button");
    go.type = "button";
    go.className = "lp-resume-go";
    go.textContent = "Resume →";
    go.addEventListener("click", function () { scrollToScene(scene); });

    var dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "lp-resume-dismiss";
    dismiss.textContent = "Start over";
    dismiss.addEventListener("click", function () { bar.remove(); });

    bar.appendChild(text);
    bar.appendChild(go);
    bar.appendChild(dismiss);
    dek.parentNode.insertBefore(bar, dek.nextSibling);
  }

  /* ---------- keyboard (desktop accelerator) ---------- */

  function overlayOpen() {
    return !!document.querySelector(".ls-overlay.visible, .gs-overlay.visible");
  }

  function typing() {
    var el = document.activeElement;
    if (!el) return false;
    var tag = el.tagName || "";
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }

  function currentScene() {
    var offset = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--lp-header-offset"), 10
    ) || 72;
    var found = trackable[0] || scenes[0];
    trackable.forEach(function (scene) {
      if (scene.el.getBoundingClientRect().top <= offset + 8) found = scene;
    });
    return found;
  }

  function step(delta) {
    var scene = currentScene();
    if (!scene) return;
    var i = trackable.indexOf(scene) + delta;
    if (i < 0 || i >= trackable.length) return;
    scrollToScene(trackable[i]);
  }

  function answerByNumber(n) {
    var scene = currentScene();
    if (!scene) return;

    var d = decisions();
    for (var i = 0; i < scene.groups.length; i++) {
      var name = scene.groups[i];
      if (d[name]) continue;
      var b = groups[name].buttons[n];
      if (b) b.el.click();
      return;
    }
    var opts = scene.el.querySelectorAll(".sc-opt:not(:disabled)");
    if (opts[n]) opts[n].click();
  }

  function mountHelp() {
    var panel = document.createElement("div");
    panel.className = "lp-help";
    panel.hidden = true;
    panel.innerHTML =
      "<h3>Keyboard</h3><dl>" +
      "<dt>j / k</dt><dd>next / previous section</dd>" +
      "<dt>1 – 6</dt><dd>answer this section</dd>" +
      "<dt>Enter</dt><dd>go to the next section</dd>" +
      "<dt>/</dt><dd>search this lesson</dd>" +
      "<dt>?</dt><dd>toggle this panel</dd>" +
      "</dl>";
    document.body.appendChild(panel);
    return panel;
  }

  function bindKeys() {
    var help = mountHelp();

    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (overlayOpen() || typing()) return;

      if (e.key === "?") {
        e.preventDefault();
        help.hidden = !help.hidden;
        return;
      }
      if (e.key === "Escape" && !help.hidden) {
        help.hidden = true;
        return;
      }
      if (e.key === "j") { e.preventDefault(); step(1); return; }
      if (e.key === "k") { e.preventDefault(); step(-1); return; }
      if (e.key === "Enter") {
        var scene = currentScene();
        var next = scene && scene.el.querySelector(".lp-next.visible");
        if (next) { e.preventDefault(); next.click(); }
        return;
      }
      if (/^[1-6]$/.test(e.key)) {
        e.preventDefault();
        answerByNumber(parseInt(e.key, 10) - 1);
      }
    });
  }

  /* ---------- sync ---------- */

  function setupSync() {
    if (!window.GistSync) return;
    sync = window.GistSync.create(STORAGE_KEY, {
      getState: function () { return state; },
      setState: function (next, updatedAt) {
        if (!next || typeof next !== "object" || !next.lessons) return;
        state = next;
        state.updatedAt = updatedAt || next.updatedAt || Date.now();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        restoreDecisions();
        render();
      },
      getUpdatedAt: function () { return state.updatedAt || 0; }
    });
    sync.syncOnLoad();
  }

  function restoreDecisions() {
    var d = decisions();
    Object.keys(groups).forEach(function (name) {
      var rec = d[name];
      if (!rec) return;
      revealGroup(name, rec.choice);
      markGroup(name, rec.choice);
    });
  }

  /* ---------- index mode ---------- */

  function initIndex() {
    var links = document.querySelectorAll("a[href]");
    var seen = false;

    Array.prototype.forEach.call(links, function (link) {
      var m = LESSON_HREF.exec(link.getAttribute("href") || "");
      if (!m) return;
      if (link.querySelector(".lp-pill") || (link.parentNode && link.parentNode.querySelector(".lp-pill"))) return;

      var ls = state.lessons[m[1]];
      if (!ls || !ls.total || !ls.answered) return;
      seen = true;

      var pct = Math.round((ls.answered / ls.total) * 100);
      var done = ls.answered >= ls.total;

      var pill = document.createElement("a");
      pill.className = "lp-pill";
      pill.href = link.getAttribute("href") + (done ? "" : "#" + (ls.lastSceneId || "scene0"));
      pill.setAttribute("aria-label",
        ls.answered + " of " + ls.total + " sections answered" + (done ? "" : " — resume"));

      var bar = document.createElement("span");
      bar.className = "lp-pill-bar";
      var fill = document.createElement("i");
      fill.style.width = pct + "%";
      bar.appendChild(fill);

      var label = document.createElement("span");
      label.textContent = done ? "Done" : ls.answered + "/" + ls.total + " · Resume →";

      pill.appendChild(bar);
      pill.appendChild(label);
      link.parentNode.insertBefore(pill, link.nextSibling);
    });

    return seen;
  }

  /* ---------- init ---------- */

  function init() {
    loadState();
    readChecks();

    var sections = document.querySelectorAll("main section.scene");
    if (!sections.length) {
      initIndex();
      return;
    }

    lesson = (window.CCAF_CHECKS && window.CCAF_CHECKS.lesson) ||
      (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    if (!lesson) return;

    progressBar = document.getElementById("progressBar");

    parseChoices();
    buildScenes();
    restoreDecisions();
    mountNextButtons();
    mountControls();
    mountResume();
    render();
    bindKeys();
    setupSync();

    measureHeader();
    window.addEventListener("resize", measureHeader, { passive: true });

    window.CCAF_LessonProgress = {
      // section-check.js calls this after it records an answer.
      report: function () { render(); },
      refresh: function () { render(); },
      sceneStatus: function (sectionId) {
        for (var i = 0; i < scenes.length; i++) {
          if (scenes[i].id === sectionId) return sceneStatus(scenes[i]);
        }
        return null;
      },
      isTracked: function (sectionId) {
        for (var i = 0; i < trackable.length; i++) {
          if (trackable[i].id === sectionId) return true;
        }
        return false;
      },
      controls: controlsRow
    };
  }

  // Anything the onclick parser missed still reveals its outcome, just unscored.
  window.choose = function (group, answer) { pick(group, answer); };

  injectStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
