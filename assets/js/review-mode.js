/* Review mode — a condensed second pass through a lesson.

   Cycles Read → Review → Missed only. "Review" drops the narrative prose and keeps
   the headings, takeaway boxes, tables, notes, code and every question. "Missed
   only" additionally hides the sections you already answered correctly first time,
   so a lesson you mostly know collapses to just the parts that beat you.

   Entering review mode re-locks answered "Check yourself" cards so they can be
   re-attempted. That only clears the DOM — first-attempt scores are never touched.

   Load LAST, after section-check.js, because it manipulates the cards that mounts. */
(function () {
  "use strict";

  var STORAGE_KEY = "ccaf_review_mode_v1";
  var MODES = ["read", "review", "missed"];
  var LABELS = { read: "Read", review: "Review", missed: "Missed" };
  var HINTS = {
    read: "Reading the full lesson — switch to a condensed review pass",
    review: "Condensed review — switch to showing only what you missed",
    missed: "Showing only what you missed — switch back to the full lesson"
  };

  var mode = "read";
  var toggleBtn = null;
  var emptyNote = null;

  function loadMode() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (MODES.indexOf(raw) !== -1) mode = raw;
    } catch (e) { /* unavailable storage — stay in read mode */ }
  }

  function saveMode() {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "review-mode-styles";
    style.textContent =
      ".rv-toggle{flex:none;border:1px solid var(--line);border-radius:999px;background:none;" +
      "color:var(--muted);padding:5px 11px;font:700 11px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.08em;text-transform:uppercase;cursor:pointer;white-space:nowrap;}" +
      ".rv-toggle:hover,.rv-toggle:focus-visible{background:var(--paper-deep);" +
      "color:var(--ink);border-color:var(--line);outline:none;}" +
      ".rv-toggle[data-mode=\"review\"],.rv-toggle[data-mode=\"missed\"]{" +
      "background:var(--rust);border-color:var(--rust);color:#fff;}" +
      ".rv-toggle[data-mode=\"review\"]:hover,.rv-toggle[data-mode=\"missed\"]:hover," +
      ".rv-toggle[data-mode=\"review\"]:focus-visible,.rv-toggle[data-mode=\"missed\"]:focus-visible{" +
      "background:var(--rust-dark);border-color:var(--rust-dark);color:#fff;}" +

      /* Condensed pass: drop the narrative, keep every structured element.
         Only direct children are hidden, so prose inside .lesson / .blue-note /
         .prompt / .sc-card survives untouched. */
      "body.rv-mode main section.scene > p:not(.choice):not(.rv-keep){display:none;}" +
      "body.rv-mode main section.scene > .voice{display:none;}" +
      "body.rv-mode main section.scene > .ask-claude-row{display:none;}" +
      "body.rv-mode main section.scene{margin-top:18px;padding-top:20px;padding-bottom:22px;}" +
      "body.rv-mode main section.scene > h2{margin-bottom:10px;font-size:1.35rem;}" +
      "body.rv-mode main .dek,body.rv-mode .lp-resume{display:none;}" +

      /* Status flags, so a condensed scroll shows the gaps at a glance. */
      "body.rv-mode main section.scene.rv-wrong{border-left-color:var(--rust);}" +
      "body.rv-mode main section.scene.rv-wrong::before{background:var(--rust);}" +
      "body.rv-mode main section.scene.rv-new::before{background:var(--line);}" +
      ".rv-flag{display:none;}" +
      "body.rv-mode .rv-flag-wrong,body.rv-mode .rv-flag-new{display:inline-block;" +
      "margin:0 0 9px;padding:3px 8px;border-radius:999px;" +
      "font:700 10px/1.4 system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;}" +
      "body.rv-mode .rv-flag-wrong{background:#fdf0ea;color:var(--rust-dark);}" +
      "body.rv-mode .rv-flag-new{background:var(--paper-deep);color:var(--muted);}" +

      "body.rv-missed main section.scene.rv-right{display:none;}" +
      "body.rv-missed main .rule{display:none;}" +

      ".rv-empty{margin:34px 0 0;padding:22px 24px;border:1px solid var(--line);" +
      "border-radius:3px;background:var(--paper-deep);color:var(--muted);" +
      "font:15px/1.6 system-ui,sans-serif;text-align:center;}" +
      ".rv-empty[hidden]{display:none;}" +

      ":root[data-theme=\"dark\"] body.rv-mode .rv-flag-wrong{background:#2c1a14;color:#e08b6d;}" +

      "@media (hover:none) and (pointer:coarse){.rv-toggle{min-height:40px;padding:5px 13px;}}";
    document.head.appendChild(style);
  }

  /* 27 of the 153 scenes have no .lesson takeaway box and would collapse to a bare
     heading. Keep their first paragraph so every scene retains something to read. */
  function markKeepers() {
    var sections = document.querySelectorAll("main section.scene");
    Array.prototype.forEach.call(sections, function (section) {
      if (section.querySelector(".lesson")) return;
      var first = section.querySelector(":scope > p:not(.time):not(.choice)");
      if (first) first.classList.add("rv-keep");
    });
  }

  function mountFlags() {
    var sections = document.querySelectorAll("main section.scene");
    Array.prototype.forEach.call(sections, function (section) {
      var flag = document.createElement("span");
      flag.className = "rv-flag";
      var h2 = section.querySelector("h2");
      if (h2) section.insertBefore(flag, h2);
      else section.insertBefore(flag, section.firstChild);
    });
  }

  function refreshFlags() {
    var progress = window.CCAF_LessonProgress;
    var sections = document.querySelectorAll("main section.scene");
    var visible = 0;

    Array.prototype.forEach.call(sections, function (section) {
      section.classList.remove("rv-right", "rv-wrong", "rv-new");
      var flag = section.querySelector(".rv-flag");
      if (flag) flag.className = "rv-flag";

      if (!progress || !progress.isTracked(section.id)) return;
      var status = progress.sceneStatus(section.id);
      if (status === "right") {
        section.classList.add("rv-right");
        return;
      }
      visible += 1;
      if (status === "wrong") {
        section.classList.add("rv-wrong");
        if (flag) { flag.className = "rv-flag rv-flag-wrong"; flag.textContent = "Missed"; }
      } else {
        section.classList.add("rv-new");
        if (flag) { flag.className = "rv-flag rv-flag-new"; flag.textContent = "Not answered"; }
      }
    });

    if (emptyNote) emptyNote.hidden = !(mode === "missed" && visible === 0);
  }

  function mountEmptyNote() {
    var end = document.querySelector("main section.end");
    if (!end) return;
    emptyNote = document.createElement("p");
    emptyNote.className = "rv-empty";
    emptyNote.hidden = true;
    emptyNote.textContent =
      "Nothing missed in this lesson — every section was answered correctly first time.";
    end.parentNode.insertBefore(emptyNote, end);
  }

  function apply(previous) {
    document.body.classList.toggle("rv-mode", mode !== "read");
    document.body.classList.toggle("rv-missed", mode === "missed");

    if (toggleBtn) {
      toggleBtn.textContent = LABELS[mode];
      toggleBtn.setAttribute("data-mode", mode);
      toggleBtn.setAttribute("aria-label", HINTS[mode]);
      toggleBtn.title = HINTS[mode];
    }

    var checks = window.CCAF_SectionChecks;
    if (checks) {
      // Re-lock on the way into review so questions can be re-attempted; restore the
      // recorded answers on the way back out. Neither touches stored scores.
      if (mode !== "read" && previous === "read") checks.clearAll();
      else if (mode === "read" && previous !== "read") checks.restoreAll();
    }

    refreshFlags();
  }

  function cycle() {
    var previous = mode;
    mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    saveMode();
    apply(previous);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function mountToggle() {
    var masthead = document.querySelector(".masthead");
    if (!masthead) return;
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "rv-toggle";
    toggleBtn.addEventListener("click", cycle);

    var controls = masthead.querySelector(".lp-controls");
    if (controls) controls.insertBefore(toggleBtn, controls.firstChild);
    else masthead.appendChild(toggleBtn);
  }

  function init() {
    if (!document.querySelector("main section.scene")) return;
    loadMode();
    markKeepers();
    mountFlags();
    mountEmptyNote();
    mountToggle();
    apply("read");

    // Answering inside review mode should update the flags immediately.
    document.addEventListener("click", function (e) {
      if (mode === "read") return;
      var el = e.target;
      if (!el || !el.closest) return;
      if (el.closest(".sc-opt") || el.closest(".choices button")) {
        setTimeout(refreshFlags, 0);
      }
    });

    window.CCAF_ReviewMode = {
      get: function () { return mode; },
      refresh: refreshFlags
    };
  }

  injectStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
