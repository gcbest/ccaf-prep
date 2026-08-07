/* Homepage-only search across every lesson.
   Lazily fetches each lesson page on first open, indexes it the same way
   lesson-search.js indexes a single lesson, and jumps to the matching
   section on the target page (which flashes it on arrival via its own hash
   handling in lesson-search.js). */
(function () {
  "use strict";

  var MAX_RESULTS = 10;
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

  function getLessons() {
    var items = document.querySelectorAll("ol.lessons li");
    var lessons = [];
    items.forEach(function (li) {
      var link = li.querySelector("a.lesson-link");
      if (!link) return;
      var titleEl = link.querySelector(".title");
      var sectionEl = link.querySelector(".section");
      lessons.push({
        href: link.getAttribute("href"),
        title: titleEl ? collapse(titleEl.textContent) : collapse(link.textContent),
        section: sectionEl ? collapse(sectionEl.textContent) : ""
      });
    });
    return lessons;
  }

  function indexDoc(doc, lesson) {
    var sections = doc.querySelectorAll("main section.scene, main section.end");
    var entries = [];
    sections.forEach(function (section, i) {
      var id = section.id || "search-jump-" + i;
      var time = section.querySelector(".time");
      entries.push({
        lessonHref: lesson.href,
        lessonTitle: lesson.title,
        lessonSection: lesson.section,
        id: id,
        heading: sectionHeading(section),
        eyebrow: time ? collapse(time.textContent) : "",
        body: collapse(section.textContent)
      });
    });
    return entries;
  }

  function buildGlobalIndex(lessons) {
    var parser = new DOMParser();
    return Promise.all(
      lessons.map(function (lesson) {
        return fetch(lesson.href)
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.text();
          })
          .then(function (html) {
            var doc = parser.parseFromString(html, "text/html");
            return indexDoc(doc, lesson);
          })
          .catch(function () {
            return null;
          });
      })
    ).then(function (perLesson) {
      var ok = perLesson.filter(Boolean);
      var flat = [];
      ok.forEach(function (entries) { flat.push.apply(flat, entries); });
      return { entries: flat, failed: perLesson.length - ok.length, total: perLesson.length };
    });
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
    style.id = "global-search-styles";
    style.textContent =
      ".gs-toggle{flex:none;width:28px;height:28px;padding:0;margin:0 4px 0 0;border-radius:999px;" +
      "border:1px solid var(--line);background:none;color:var(--muted);font-size:13px;line-height:1;" +
      "cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}" +
      ".gs-toggle:hover,.gs-toggle:focus-visible{background:var(--paper-deep);outline:none;}" +
      ".gs-overlay{position:fixed;inset:0;background:rgba(20,17,12,.45);display:flex;" +
      "align-items:flex-start;justify-content:center;padding:10vh 16px 16px;z-index:1100;" +
      "opacity:0;pointer-events:none;transition:opacity .15s ease;}" +
      ".gs-overlay.visible{opacity:1;pointer-events:auto;}" +
      ".gs-panel{width:min(600px,100%);max-height:70vh;display:flex;flex-direction:column;" +
      "background:var(--white);border:1px solid var(--line);border-radius:7px;overflow:hidden;" +
      "box-shadow:0 18px 50px rgba(0,0,0,.32);}" +
      ".gs-input-row{display:flex;align-items:center;gap:9px;padding:12px 14px;" +
      "border-bottom:1px solid var(--line);}" +
      ".gs-input-row svg{flex:none;color:var(--muted);}" +
      ".gs-input{flex:1;min-width:0;border:none;outline:none;background:none;color:var(--ink);" +
      "font:16px/1.3 system-ui,sans-serif;}" +
      ".gs-input::placeholder{color:var(--muted);}" +
      ".gs-esc{flex:none;color:var(--muted);font:600 10px/1 system-ui,sans-serif;" +
      "letter-spacing:.05em;text-transform:uppercase;border:1px solid var(--line);" +
      "border-radius:3px;padding:3px 6px;}" +
      ".gs-results{overflow-y:auto;padding:6px;}" +
      ".gs-result{display:block;width:100%;text-align:left;border:none;background:none;" +
      "padding:9px 11px;border-radius:5px;cursor:pointer;color:var(--ink);}" +
      ".gs-result:hover,.gs-result.active{background:var(--paper-deep);}" +
      ".gs-result .gs-lesson{display:block;color:var(--rust-dark);font:700 10px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;}" +
      ".gs-result .gs-heading{display:block;font:700 14.5px/1.3 Georgia,serif;color:var(--ink);}" +
      ".gs-result .gs-snippet{display:block;margin-top:3px;font:13px/1.4 system-ui,sans-serif;" +
      "color:var(--muted);}" +
      ".gs-result mark{background:var(--rust);color:#fff;border-radius:2px;padding:0 2px;}" +
      ".gs-empty,.gs-hint{padding:18px 14px;color:var(--muted);font:13px/1.5 system-ui,sans-serif;" +
      "text-align:center;}";
    document.head.appendChild(style);
  }

  function init() {
    var lessons = getLessons();
    if (!lessons.length) return;

    var masthead = document.querySelector(".masthead");
    var themeToggle = document.getElementById("themeToggle");

    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "gs-toggle";
    toggleBtn.setAttribute("aria-label", "Search all lessons (press /)");
    toggleBtn.textContent = "🔍";
    if (masthead) {
      if (themeToggle) masthead.insertBefore(toggleBtn, themeToggle);
      else masthead.appendChild(toggleBtn);
    }

    var overlay = document.createElement("div");
    overlay.className = "gs-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Search all lessons");
    overlay.innerHTML =
      '<div class="gs-panel">' +
      '<div class="gs-input-row">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="10.8" y1="11" x2="14.5" y2="14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      "</svg>" +
      '<input type="text" class="gs-input" placeholder="Search all 9 lessons…" ' +
      'aria-label="Search all lessons" autocomplete="off" spellcheck="false">' +
      '<span class="gs-esc">Esc</span>' +
      "</div>" +
      '<div class="gs-results"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    var panel = overlay.querySelector(".gs-panel");
    var input = overlay.querySelector(".gs-input");
    var resultsEl = overlay.querySelector(".gs-results");
    var lastFocused = null;
    var activeIndex = -1;
    var currentResults = [];

    var globalIndex = null;
    var indexPromise = null;
    var failedCount = 0;

    function ensureIndex() {
      if (!indexPromise) {
        indexPromise = buildGlobalIndex(lessons).then(function (result) {
          globalIndex = result.entries;
          failedCount = result.failed;
          return globalIndex;
        });
      }
      return indexPromise;
    }

    function renderResults(results) {
      currentResults = results;
      activeIndex = results.length ? 0 : -1;
      if (!input.value.trim()) {
        resultsEl.innerHTML = '<div class="gs-hint">Type to search headings and section text across every lesson — Enter jumps to the top match.</div>';
        return;
      }
      if (!results.length) {
        resultsEl.innerHTML = '<div class="gs-empty">No matches across the lessons.</div>';
        return;
      }
      resultsEl.innerHTML = "";
      results.forEach(function (r, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gs-result" + (i === 0 ? " active" : "");
        btn.innerHTML =
          '<span class="gs-lesson">' + escapeHtml(r.entry.lessonSection || r.entry.lessonTitle) + "</span>" +
          '<span class="gs-heading">' + (r.headingMatch ? r.snippetHtml : escapeHtml(r.entry.heading)) + "</span>" +
          '<span class="gs-snippet">' + (r.headingMatch ? "" : r.snippetHtml) + "</span>";
        btn.addEventListener("click", function () { jumpTo(r.entry); });
        resultsEl.appendChild(btn);
      });
    }

    function updateActive() {
      var items = resultsEl.querySelectorAll(".gs-result");
      items.forEach(function (el, i) { el.classList.toggle("active", i === activeIndex); });
      if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function jumpTo(entry) {
      window.location.href = entry.lessonHref + "#" + entry.id;
    }

    function runSearch() {
      if (!globalIndex) return;
      renderResults(search(globalIndex, input.value));
    }

    function open() {
      lastFocused = document.activeElement;
      overlay.classList.add("visible");
      input.value = "";
      setTimeout(function () { input.focus(); }, 10);

      if (globalIndex) {
        renderResults([]);
      } else {
        resultsEl.innerHTML = '<div class="gs-hint">Indexing lessons…</div>';
        ensureIndex().then(function () {
          if (!overlay.classList.contains("visible")) return;
          if (!globalIndex.length) {
            resultsEl.innerHTML = '<div class="gs-empty">Couldn’t load lesson content to search. Try this over the published site (http/https) rather than a local file.</div>';
            return;
          }
          runSearch();
        });
      }
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
      if (globalIndex) runSearch();
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
