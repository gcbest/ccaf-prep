/* Lets a reader flag any scene as "come back to this later" — a bookmark that is
   independent of the right/wrong tracking in lesson-progress.js. A flagged scene
   stays visible in review-mode's "Missed" filter even after it has been answered
   correctly, since "I got it right" and "I still want to revisit this" are
   different signals.

   Answers persist in localStorage and ride along on the same private gist the
   quizzes use, keyed by its own storage section so it never collides with
   decisions or check answers. Each flag carries a small heading/eyebrow snapshot
   so lessons/bookmarks.html can list every flagged scene across all lessons
   without fetching each lesson page.

   Load AFTER gist-sync.js and lesson-progress.js (reuses the masthead controls
   row that lesson-progress.js builds) and BEFORE review-mode.js — not because
   review-mode reaches into this module, but because the CSS override that keeps
   a flagged section visible in "Missed" only needs to exist in the document by
   the time that filter is toggled, and loading in reading order keeps the file
   list easy to follow. */
(function () {
  "use strict";

  var STORAGE_KEY = "ccaf_scene_flags_v1";

  var state = { lessons: {}, updatedAt: 0 };
  var lesson = "";
  var sync = null;
  var tallyEl = null;
  var toggles = {};

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

  function flagsFor(slug) {
    var key = slug || lesson;
    if (!state.lessons[key]) state.lessons[key] = {};
    return state.lessons[key];
  }

  function isFlagged(sceneId) {
    return !!flagsFor()[sceneId];
  }

  /* ---------- styles ---------- */

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "scene-flag-styles";
    style.textContent =
      ":root{--sf-flag:#b8792b;--sf-flag-dark:#8f5c1f;}" +
      ":root[data-theme=\"dark\"]{--sf-flag:#dba54a;--sf-flag-dark:#c98f38;}" +

      /* Floated so it sits in the corner and the .time line wraps around it —
         no absolute positioning, so it never overlaps text regardless of length.
         h2 always clears it, so a short .time string never leaves the heading
         indented under a stray icon. */
      ".sf-toggle{float:right;margin:0 0 6px 10px;width:26px;height:26px;padding:0;" +
      "border:1px solid var(--line);border-radius:999px;background:none;color:var(--muted);" +
      "font-size:13px;line-height:1;display:inline-flex;align-items:center;justify-content:center;" +
      "cursor:pointer;}" +
      ".sf-toggle:hover,.sf-toggle:focus-visible{background:var(--paper-deep);outline:none;}" +
      ".sf-toggle:focus-visible{box-shadow:0 0 0 3px rgba(168,78,49,.22);}" +
      ".sf-toggle.sf-on{background:var(--sf-flag);border-color:var(--sf-flag);color:#fff;}" +
      ".sf-toggle.sf-on:hover,.sf-toggle.sf-on:focus-visible{background:var(--sf-flag-dark);" +
      "border-color:var(--sf-flag-dark);}" +
      "main section.scene>h2{clear:right;}" +

      /* A flagged scene keeps its accent bar, just recolored, so it reads at a
         glance while scrolling past — in both read mode and review mode. */
      ".scene.sf-flagged::before{background:var(--sf-flag);}" +

      /* "Missed" normally hides anything already answered correctly. A flag means
         "I still want this one," so it overrides that hide — this selector has one
         more class than the rule it beats, so it wins regardless of load order. */
      "body.rv-missed main section.scene.rv-right.sf-flagged{display:block;}" +

      ".sf-tally{flex:none;color:var(--sf-flag);font:700 11px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.1em;white-space:nowrap;text-decoration:none;}" +
      ".sf-tally:hover,.sf-tally:focus-visible{color:var(--sf-flag-dark);outline:none;" +
      "text-decoration:underline;}" +

      "@media (hover:none) and (pointer:coarse){.sf-toggle{width:38px;height:38px;font-size:15px;}}";
    document.head.appendChild(style);
  }

  /* ---------- toggles ---------- */

  function updateToggle(sceneId) {
    var btn = toggles[sceneId];
    if (!btn) return;
    var on = isFlagged(sceneId);
    btn.classList.toggle("sf-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    var label = on ? "Flagged for later — click to unflag" : "Flag this section for later";
    btn.setAttribute("aria-label", label);
    btn.title = label;
    var section = document.getElementById(sceneId);
    if (section) section.classList.toggle("sf-flagged", on);
  }

  // A snapshot of the heading/eyebrow text rides along with each flag so the
  // bookmarks page can list it without fetching every lesson page to look it up.
  function snapshot(sceneId) {
    var section = document.getElementById(sceneId);
    var h2 = section && section.querySelector("h2");
    var time = section && section.querySelector(".time");
    return {
      at: Date.now(),
      heading: h2 ? h2.textContent.replace(/\s+/g, " ").trim() : sceneId,
      eyebrow: time ? time.textContent.replace(/\s+/g, " ").trim() : ""
    };
  }

  function toggleFlag(sceneId) {
    var flags = flagsFor();
    if (flags[sceneId]) delete flags[sceneId];
    else flags[sceneId] = snapshot(sceneId);
    saveState();
    updateToggle(sceneId);
    renderTally();
    if (window.CCAF_ReviewMode) window.CCAF_ReviewMode.refresh();
  }

  function mountToggles() {
    var sections = document.querySelectorAll("main section.scene");
    Array.prototype.forEach.call(sections, function (section) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sf-toggle";
      btn.textContent = "🔖"; // bookmark emoji; state is shown by color, not glyph
      btn.addEventListener("click", function () { toggleFlag(section.id); });
      section.insertBefore(btn, section.firstChild);
      toggles[section.id] = btn;
      updateToggle(section.id);
    });
  }

  /* ---------- tally ---------- */

  function renderTally() {
    if (!tallyEl) return;
    var n = Object.keys(flagsFor()).length;
    // Always visible — it's the only way to reach the bookmarks page from a
    // lesson, so it can't hide itself away just because nothing is flagged yet.
    tallyEl.textContent = n ? "🔖 " + n : "🔖";
    tallyEl.setAttribute("aria-label",
      n ? n + " section" + (n === 1 ? "" : "s") + " flagged for later — view bookmarks"
        : "View bookmarks (none flagged yet)");
  }

  function mountTally() {
    var masthead = document.querySelector(".masthead");
    if (!masthead) return;
    var controls = masthead.querySelector(".lp-controls");
    tallyEl = document.createElement("a");
    tallyEl.className = "sf-tally";
    tallyEl.href = "bookmarks.html";
    if (controls) controls.appendChild(tallyEl);
    else masthead.appendChild(tallyEl);
    renderTally();
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
        Object.keys(toggles).forEach(updateToggle);
        renderTally();
        if (window.CCAF_ReviewMode) window.CCAF_ReviewMode.refresh();
      },
      getUpdatedAt: function () { return state.updatedAt || 0; }
    });
    sync.syncOnLoad();
  }

  /* ---------- init ---------- */

  function init() {
    var sections = document.querySelectorAll("main section.scene");
    if (!sections.length) return;

    loadState();
    lesson = (window.CCAF_CHECKS && window.CCAF_CHECKS.lesson) ||
      (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    if (!lesson) return;

    mountToggles();
    mountTally();
    setupSync();

    window.CCAF_SceneFlags = {
      isFlagged: isFlagged,
      toggle: toggleFlag
    };
  }

  injectStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
