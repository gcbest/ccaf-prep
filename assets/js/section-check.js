/* Adds a four-option "Check yourself" question to lesson sections that have no
   story decision point of their own. Questions come from assets/js/checks/000N.js
   (window.CCAF_CHECKS); answers persist in localStorage and ride along on the same
   private gist the quizzes use.

   Load this LAST — after ask-claude.js and lesson-search.js — so the question and
   answer text never reaches the Ask Claude prompt or the in-lesson search index.
   The check is still inserted above the Ask Claude row. */
(function () {
  "use strict";

  var STORAGE_KEY = "ccaf_section_checks_v1";
  var LETTERS = ["A", "B", "C", "D", "E", "F"];

  var state = { lessons: {}, updatedAt: 0 };
  var cards = [];
  var tallyEl = null;
  var sync = null;

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

  function answersFor(lesson) {
    if (!state.lessons[lesson]) state.lessons[lesson] = {};
    return state.lessons[lesson];
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "section-check-styles";
    style.textContent =
      ".sc-card{margin:25px 0 0;padding:17px 18px;border:1px solid var(--line);" +
      "border-left:3px solid var(--rust);border-radius:3px;background:var(--paper-deep);}" +
      ".sc-label{margin:0 0 6px;color:var(--muted);font:700 12px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.08em;text-transform:uppercase;}" +
      ".sc-q{margin:0 0 12px;font-weight:700;}" +
      ".sc-options{display:grid;gap:7px;margin:0;}" +
      ".sc-opt{display:flex;gap:9px;align-items:baseline;width:100%;text-align:left;" +
      "border:1px solid var(--line);border-radius:3px;background:var(--white);" +
      "color:var(--ink);padding:9px 12px;font:400 15px/1.45 system-ui,sans-serif;cursor:pointer;}" +
      ".sc-opt:hover:not(:disabled),.sc-opt:focus-visible:not(:disabled){border-color:var(--rust);" +
      "background:var(--white);color:var(--ink);outline:none;}" +
      ".sc-opt:focus-visible{box-shadow:0 0 0 3px rgba(168,78,49,.22);}" +
      ".sc-opt:disabled{cursor:default;opacity:1;}" +
      ".sc-key{flex:none;color:var(--muted);font-weight:700;font-size:12px;letter-spacing:.06em;}" +
      ".sc-opt.is-correct{border-color:#5c8a5c;background:#f1f6ef;}" +
      ".sc-opt.is-correct .sc-key{color:#3f6b3f;}" +
      ".sc-opt.is-wrong{border-color:var(--rust);background:#fdf0ea;}" +
      ".sc-opt.is-wrong .sc-key{color:var(--rust-dark);}" +
      ".sc-result{display:none;margin-top:12px;padding:12px 14px;border-left:3px solid var(--sage);" +
      "background:var(--white);font-size:.97rem;}" +
      ".sc-result.visible{display:block;}" +
      ".sc-result.wrong{border-left-color:var(--rust);}" +
      ".sc-verdict{color:var(--rust-dark);font-weight:700;}" +
      ".sc-retry{margin-top:9px;padding:0;border:0;background:none;color:var(--rust-dark);" +
      "font:600 12px/1.2 system-ui,sans-serif;text-decoration:underline;cursor:pointer;}" +
      ".sc-retry:hover,.sc-retry:focus-visible{background:none;color:var(--rust);outline:none;}" +
      ".sc-tally{flex:none;color:var(--muted);font:700 11px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.1em;white-space:nowrap;}" +
      ".sc-sync-note{margin-top:10px;}" +
      ".sc-sync-warn{margin:32px 0 0;padding:15px 17px;border:1px solid var(--line);" +
      "border-left:3px solid var(--rust);border-radius:3px;background:var(--paper-deep);" +
      "font:14px/1.6 system-ui,sans-serif;color:var(--muted);}" +
      ".sc-sync-warn strong{color:var(--ink);}" +
      ":root[data-theme=\"dark\"] .sc-opt.is-correct{background:#1b2716;border-color:#5c8a5c;}" +
      ":root[data-theme=\"dark\"] .sc-opt.is-correct .sc-key{color:#8fbc8f;}" +
      ":root[data-theme=\"dark\"] .sc-opt.is-wrong{background:#2c1a14;}" +
      "@media (max-width:560px){.sc-card{padding:15px 15px;}}";
    document.head.appendChild(style);
  }

  function makeCard(item, sectionId, lesson) {
    var card = document.createElement("div");
    card.className = "sc-card";

    var label = document.createElement("p");
    label.className = "sc-label";
    label.textContent = "Check yourself";

    var question = document.createElement("p");
    question.className = "sc-q";
    question.id = "sc-q-" + sectionId;
    question.textContent = item.q;

    var options = document.createElement("div");
    options.className = "sc-options";
    options.setAttribute("role", "group");
    options.setAttribute("aria-labelledby", question.id);

    var result = document.createElement("div");
    result.className = "sc-result";
    result.setAttribute("aria-live", "polite");

    var verdict = document.createElement("span");
    verdict.className = "sc-verdict";
    var explain = document.createElement("span");
    result.appendChild(verdict);
    result.appendChild(document.createTextNode(" "));
    result.appendChild(explain);

    var retry = document.createElement("button");
    retry.type = "button";
    retry.className = "sc-retry";
    retry.textContent = "Try again";
    retry.hidden = true;

    var buttons = item.options.map(function (text, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sc-opt";

      var key = document.createElement("span");
      key.className = "sc-key";
      key.textContent = LETTERS[i] + ".";
      btn.appendChild(key);
      btn.appendChild(document.createTextNode(text));

      btn.addEventListener("click", function () {
        var record = answersFor(lesson)[sectionId];
        // The first attempt is the one that counts; a retry only re-reveals.
        if (!record) {
          answersFor(lesson)[sectionId] = { choice: i, correct: i === item.correct, at: Date.now() };
          saveState();
          renderTally();
          // lesson-progress.js owns the progress bar and the combined tally.
          if (window.CCAF_LessonProgress) window.CCAF_LessonProgress.report(sectionId, i === item.correct);
        }
        reveal(i);
      });

      return btn;
    });

    buttons.forEach(function (btn) { options.appendChild(btn); });

    function clear() {
      buttons.forEach(function (btn) {
        btn.disabled = false;
        btn.classList.remove("is-correct", "is-wrong");
      });
      result.classList.remove("visible", "wrong");
      retry.hidden = true;
    }

    function reveal(choice) {
      buttons.forEach(function (btn, i) {
        btn.disabled = true;
        if (i === item.correct) btn.classList.add("is-correct");
        else if (i === choice) btn.classList.add("is-wrong");
      });
      var right = choice === item.correct;
      verdict.textContent = right ? "Correct." : "Not quite.";
      explain.textContent = item.explain;
      result.classList.add("visible");
      result.classList.toggle("wrong", !right);
      retry.hidden = false;
    }

    retry.addEventListener("click", function () {
      clear();
      buttons[0].focus();
    });

    card.appendChild(label);
    card.appendChild(question);
    card.appendChild(options);
    card.appendChild(result);
    card.appendChild(retry);

    return {
      el: card,
      sectionId: sectionId,
      // Re-locks the question without touching the recorded score, so review mode
      // can re-test you on something you have already answered once.
      clear: clear,
      restore: function () {
        var record = answersFor(lesson)[sectionId];
        clear();
        if (record) reveal(record.choice);
      }
    };
  }

  function renderTally() {
    if (!tallyEl) return;
    var answers = answersFor(window.CCAF_CHECKS.lesson);
    var correct = 0;
    cards.forEach(function (card) {
      var record = answers[card.sectionId];
      if (record && record.correct) correct += 1;
    });
    tallyEl.textContent = "✓ " + correct + "/" + cards.length;
    tallyEl.setAttribute("aria-label", correct + " of " + cards.length + " checks answered correctly");
  }

  function mountTally() {
    // lesson-progress.js renders a combined tally over every section — decision
    // points included — so a checks-only counter beside it would just be confusing.
    if (window.CCAF_LessonProgress) return;
    var masthead = document.querySelector(".masthead");
    if (!masthead) return;
    tallyEl = document.createElement("span");
    tallyEl.className = "sc-tally";
    var anchor = masthead.querySelector(".ls-toggle") || document.getElementById("themeToggle");
    if (anchor) masthead.insertBefore(tallyEl, anchor);
    else masthead.appendChild(tallyEl);
  }

  function hasProgress() {
    var answers = answersFor(window.CCAF_CHECKS.lesson);
    return Object.keys(answers).length > 0;
  }

  function mountSyncNote() {
    var connected = false;
    try { connected = !!localStorage.getItem("ccaf_gist_token"); } catch (e) {}

    var footer = document.querySelector("main footer");
    if (footer) {
      var note = document.createElement("p");
      note.className = "sc-sync-note";
      if (connected) {
        note.textContent = "Check answers sync across your devices.";
      } else {
        note.appendChild(document.createTextNode("Check answers are saved on this device. "));
        var link = document.createElement("a");
        link.href = "../quizzes/index.html";
        link.textContent = "Connect sync from any quiz page";
        note.appendChild(link);
        note.appendChild(document.createTextNode(" to carry them between devices."));
      }
      footer.appendChild(note);
    }

    // Local storage is not durable on mobile Safari — it is cleared after about a
    // week without a visit, and answers vanish with it. Once there is progress worth
    // losing, say so somewhere the reader will actually see it.
    if (connected || !hasProgress()) return;
    var end = document.querySelector("main section.end");
    if (!end) return;

    var warn = document.createElement("div");
    warn.className = "sc-sync-warn";
    var strong = document.createElement("strong");
    strong.textContent = "Your progress only lives in this browser.";
    warn.appendChild(strong);
    warn.appendChild(document.createTextNode(
      " Mobile Safari clears it after about a week without a visit. "));
    var a = document.createElement("a");
    a.href = "../quizzes/index.html";
    a.textContent = "Connect sync";
    warn.appendChild(a);
    warn.appendChild(document.createTextNode(" to keep it across devices and reinstalls."));
    end.parentNode.insertBefore(warn, end);
  }

  function setupSync() {
    if (!window.GistSync) return;
    sync = window.GistSync.create(STORAGE_KEY, {
      getState: function () { return state; },
      setState: function (next, updatedAt) {
        if (!next || typeof next !== "object" || !next.lessons) return;
        state = next;
        state.updatedAt = updatedAt || next.updatedAt || Date.now();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        cards.forEach(function (card) { card.restore(); });
        renderTally();
        if (window.CCAF_LessonProgress) window.CCAF_LessonProgress.refresh();
      },
      getUpdatedAt: function () { return state.updatedAt || 0; }
    });
    sync.syncOnLoad();
  }

  function init() {
    var data = window.CCAF_CHECKS;
    if (!data || !data.items || !data.lesson) return;

    var sections = document.querySelectorAll("main section.scene");
    if (!sections.length) return;

    loadState();

    Array.prototype.forEach.call(sections, function (section) {
      var item = data.items[section.id];
      if (!item || !item.options || !item.options.length) return;
      var card = makeCard(item, section.id, data.lesson);
      // Sits above the "Ask Claude about this" row if that script already ran.
      var askRow = section.querySelector(".ask-claude-row");
      if (askRow) section.insertBefore(card.el, askRow);
      else section.appendChild(card.el);
      card.restore();
      cards.push(card);
    });

    if (!cards.length) return;

    mountTally();
    renderTally();
    mountSyncNote();
    setupSync();

    window.CCAF_SectionChecks = {
      cards: cards,
      recordFor: function (sectionId) { return answersFor(window.CCAF_CHECKS.lesson)[sectionId] || null; },
      clearAll: function () { cards.forEach(function (card) { card.clear(); }); },
      restoreAll: function () { cards.forEach(function (card) { card.restore(); }); }
    };
  }

  injectStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
