/* Adds a "jump to a topic" search to every lesson.
   Indexes each section.scene / section.end by its heading and body text,
   then lets the reader filter as they type and jump straight to a match. */
(function () {
  "use strict";

  var MAX_RESULTS = 8;
  var SNIPPET_RADIUS = 46;

  function collapse(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function sectionHeading(section) {
    var h2 = section.querySelector("h2");
    if (h2) return collapse(h2.textContent);
    return section.classList.contains("end") ? "The architect's pocket card" : "Section";
  }

  function buildIndex() {
    var sections = document.querySelectorAll("main section.scene, main section.end");
    var index = [];
    sections.forEach(function (section, i) {
      if (!section.id) section.id = "search-jump-" + i;
      var time = section.querySelector(".time");
      index.push({
        el: section,
        heading: sectionHeading(section),
        eyebrow: time ? collapse(time.textContent) : "",
        body: collapse(section.textContent)
      });
    });
    return index;
  }

  function snippetAround(text, query) {
    var lower = text.toLowerCase();
    var qi = lower.indexOf(query.toLowerCase());
    if (qi === -1) return text.slice(0, SNIPPET_RADIUS * 2);
    var start = Math.max(0, qi - SNIPPET_RADIUS);
    var end = Math.min(text.length, qi + query.length + SNIPPET_RADIUS);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  function highlightHtml(text, query) {
    var idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    return (
      escapeHtml(text.slice(0, idx)) +
      "<mark>" + escapeHtml(text.slice(idx, idx + query.length)) + "</mark>" +
      escapeHtml(text.slice(idx + query.length))
    );
  }

  function search(index, rawQuery) {
    var query = rawQuery.trim();
    if (!query) return [];
    var q = query.toLowerCase();
    var results = [];
    index.forEach(function (entry) {
      var headingIdx = entry.heading.toLowerCase().indexOf(q);
      var bodyIdx = headingIdx === -1 ? entry.body.toLowerCase().indexOf(q) : -1;
      if (headingIdx === -1 && bodyIdx === -1) return;
      results.push({
        entry: entry,
        headingMatch: headingIdx !== -1,
        snippetHtml: headingIdx !== -1
          ? highlightHtml(entry.heading, query)
          : highlightHtml(snippetAround(entry.body, query), query)
      });
    });
    results.sort(function (a, b) {
      if (a.headingMatch !== b.headingMatch) return a.headingMatch ? -1 : 1;
      return 0;
    });
    return results.slice(0, MAX_RESULTS);
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "lesson-search-styles";
    style.textContent =
      ".ls-toggle{flex:none;width:28px;height:28px;padding:0;margin:0 4px 0 0;border-radius:999px;" +
      "border:1px solid var(--line);background:none;color:var(--muted);font-size:13px;line-height:1;" +
      "cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}" +
      ".ls-toggle:hover,.ls-toggle:focus-visible{background:var(--paper-deep);outline:none;}" +
      ".ls-overlay{position:fixed;inset:0;background:rgba(20,17,12,.45);display:flex;" +
      "align-items:flex-start;justify-content:center;padding:10vh 16px 16px;z-index:1100;" +
      "opacity:0;pointer-events:none;transition:opacity .15s ease;}" +
      ".ls-overlay.visible{opacity:1;pointer-events:auto;}" +
      ".ls-panel{width:min(560px,100%);max-height:70vh;display:flex;flex-direction:column;" +
      "background:var(--white);border:1px solid var(--line);border-radius:7px;overflow:hidden;" +
      "box-shadow:0 18px 50px rgba(0,0,0,.32);}" +
      ".ls-input-row{display:flex;align-items:center;gap:9px;padding:12px 14px;" +
      "border-bottom:1px solid var(--line);}" +
      ".ls-input-row svg{flex:none;color:var(--muted);}" +
      ".ls-input{flex:1;min-width:0;border:none;outline:none;background:none;color:var(--ink);" +
      "font:16px/1.3 system-ui,sans-serif;}" +
      ".ls-input::placeholder{color:var(--muted);}" +
      ".ls-esc{flex:none;color:var(--muted);font:600 10px/1 system-ui,sans-serif;" +
      "letter-spacing:.05em;text-transform:uppercase;border:1px solid var(--line);" +
      "border-radius:3px;padding:3px 6px;}" +
      ".ls-results{overflow-y:auto;padding:6px;}" +
      ".ls-result{display:block;width:100%;text-align:left;border:none;background:none;" +
      "padding:9px 11px;border-radius:5px;cursor:pointer;color:var(--ink);}" +
      ".ls-result:hover,.ls-result.active{background:var(--paper-deep);}" +
      ".ls-result .ls-eyebrow{display:block;color:var(--muted);font:600 10px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;}" +
      ".ls-result .ls-heading{display:block;font:700 14.5px/1.3 Georgia,serif;color:var(--rust-dark);}" +
      ".ls-result .ls-snippet{display:block;margin-top:3px;font:13px/1.4 system-ui,sans-serif;" +
      "color:var(--muted);}" +
      ".ls-result mark{background:var(--rust);color:#fff;border-radius:2px;padding:0 2px;}" +
      ".ls-empty,.ls-hint{padding:18px 14px;color:var(--muted);font:13px/1.5 system-ui,sans-serif;" +
      "text-align:center;}" +
      "@keyframes lsFlash{from{box-shadow:0 0 0 3px var(--rust);}to{box-shadow:0 0 0 0 rgba(0,0,0,0);}}" +
      ".ls-flash{animation:lsFlash 1.5s ease-out;border-radius:3px;}";
    document.head.appendChild(style);
  }

  function init() {
    var index = buildIndex();
    if (!index.length) return;

    var masthead = document.querySelector(".masthead");
    var themeToggle = document.getElementById("themeToggle");

    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "ls-toggle";
    toggleBtn.setAttribute("aria-label", "Search this lesson (press /)");
    toggleBtn.textContent = "🔍";
    if (masthead) {
      if (themeToggle) masthead.insertBefore(toggleBtn, themeToggle);
      else masthead.appendChild(toggleBtn);
    }

    var overlay = document.createElement("div");
    overlay.className = "ls-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Search this lesson");
    overlay.innerHTML =
      '<div class="ls-panel">' +
      '<div class="ls-input-row">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="10.8" y1="11" x2="14.5" y2="14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      "</svg>" +
      '<input type="text" class="ls-input" placeholder="Search this lesson…" ' +
      'aria-label="Search this lesson" autocomplete="off" spellcheck="false">' +
      '<span class="ls-esc">Esc</span>' +
      "</div>" +
      '<div class="ls-results"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    var panel = overlay.querySelector(".ls-panel");
    var input = overlay.querySelector(".ls-input");
    var resultsEl = overlay.querySelector(".ls-results");
    var lastFocused = null;
    var activeIndex = -1;
    var currentResults = [];

    function renderResults(results) {
      currentResults = results;
      activeIndex = results.length ? 0 : -1;
      if (!input.value.trim()) {
        resultsEl.innerHTML = '<div class="ls-hint">Type to search headings and section text — Enter jumps to the top match.</div>';
        return;
      }
      if (!results.length) {
        resultsEl.innerHTML = '<div class="ls-empty">No matches in this lesson.</div>';
        return;
      }
      resultsEl.innerHTML = "";
      results.forEach(function (r, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ls-result" + (i === 0 ? " active" : "");
        btn.innerHTML =
          (r.entry.eyebrow ? '<span class="ls-eyebrow">' + escapeHtml(r.entry.eyebrow) + "</span>" : "") +
          '<span class="ls-heading">' + (r.headingMatch ? r.snippetHtml : escapeHtml(r.entry.heading)) + "</span>" +
          '<span class="ls-snippet">' + (r.headingMatch ? "" : r.snippetHtml) + "</span>";
        btn.addEventListener("click", function () { jumpTo(r.entry); });
        resultsEl.appendChild(btn);
      });
    }

    function updateActive() {
      var items = resultsEl.querySelectorAll(".ls-result");
      items.forEach(function (el, i) { el.classList.toggle("active", i === activeIndex); });
      if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function jumpTo(entry) {
      close();
      entry.el.setAttribute("tabindex", "-1");
      entry.el.scrollIntoView({ behavior: "smooth", block: "start" });
      entry.el.classList.add("ls-flash");
      try { entry.el.focus({ preventScroll: true }); } catch (e) {}
      entry.el.addEventListener("blur", function onBlur() {
        entry.el.removeAttribute("tabindex");
        entry.el.removeEventListener("blur", onBlur);
      }, { once: true });
      setTimeout(function () { entry.el.classList.remove("ls-flash"); }, 1600);
    }

    function open() {
      lastFocused = document.activeElement;
      overlay.classList.add("visible");
      input.value = "";
      renderResults([]);
      setTimeout(function () { input.focus(); }, 10);
    }

    function close() {
      overlay.classList.remove("visible");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    toggleBtn.addEventListener("click", function () {
      if (overlay.classList.contains("visible")) close(); else open();
    });

    overlay.addEventListener("mousedown", function (e) {
      if (!panel.contains(e.target)) close();
    });

    input.addEventListener("input", function () {
      renderResults(search(index, input.value));
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentResults.length) {
          activeIndex = (activeIndex + 1) % currentResults.length;
          updateActive();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentResults.length) {
          activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
          updateActive();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentResults[activeIndex]) jumpTo(currentResults[activeIndex].entry);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || overlay.classList.contains("visible")) return;
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable)) return;
      e.preventDefault();
      open();
    });
  }

  injectStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
