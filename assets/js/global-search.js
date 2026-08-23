/* Homepage-only search across every lesson and every notes/reference page.
   Lazily fetches each page on first open, indexes it (lessons the same way
   lesson-search.js indexes a single lesson; notes pages via structure-specific
   extractors below), and jumps to the matching section on the target page. */
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

  function cleanText(root) {
    if (!root) return "";
    var clone = root.cloneNode(true);
    clone.querySelectorAll("script, style, .theme-toggle, .home-link, .csb-trigger, .csb-menu").forEach(function (el) {
      el.remove();
    });
    return collapse(clone.textContent);
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
        kind: "lesson",
        href: link.getAttribute("href"),
        title: titleEl ? collapse(titleEl.textContent) : collapse(link.textContent),
        section: sectionEl ? collapse(sectionEl.textContent) : ""
      });
    });
    return lessons;
  }

  function getNotes() {
    var links = document.querySelectorAll("#reference-section .companions a[href]");
    var notes = [];
    links.forEach(function (a) {
      var titleEl = a.querySelector(".title");
      var href = a.getAttribute("href");
      notes.push({
        kind: "note",
        href: href,
        title: titleEl ? collapse(titleEl.textContent) : collapse(a.textContent),
        absoluteUrl: new URL(href, document.baseURI).href
      });
    });
    return notes;
  }

  // The full per-topic course notes (sections 3–7) aren't linked from the homepage
  // directly — only study-companion's curated takeaway bullets point into them — so
  // getNotes() above never finds them. Index the full prose here instead, so a
  // question can match text that didn't make it into a takeaway bullet.
  var ANTHROPIC_NOTES_PAGES = [
    { href: "03-building-with-the-claude-api/anthropic-notes.html", title: "Building with the Claude API — Notes" },
    { href: "04-claude-with-amazon-bedrock/anthropic-notes.html", title: "Claude with Amazon Bedrock — Notes" },
    { href: "05-claude-on-google-cloud/anthropic-notes.html", title: "Claude on Google Cloud — Notes" },
    { href: "06-introduction-to-mcp/anthropic-notes.html", title: "Introduction to MCP — Notes" },
    { href: "07-claude-code-in-action/anthropic-notes.html", title: "Claude Code in Action — Notes" }
  ];

  function getAnthropicNotesPages() {
    return ANTHROPIC_NOTES_PAGES.map(function (p) {
      return {
        kind: "note",
        href: p.href,
        title: p.title,
        absoluteUrl: new URL(p.href, document.baseURI).href
      };
    });
  }

  function indexLessonDoc(doc, lesson) {
    var sections = doc.querySelectorAll("main section.scene, main section.end");
    var entries = [];
    sections.forEach(function (section, i) {
      var id = section.id || "search-jump-" + i;
      var time = section.querySelector(".time");
      entries.push({
        sourceHref: lesson.href + "#" + id,
        sourceTitle: lesson.title,
        sourceGroup: lesson.section,
        heading: sectionHeading(section),
        eyebrow: time ? collapse(time.textContent) : "",
        body: collapse(section.textContent)
      });
    });
    return entries;
  }

  // study-companion/index.html: takeaways grouped under section.sec-block > .topic,
  // each .topic's own heading links out to the anchor that actually has a stable id
  // (the full course notes page) — so results jump straight there.
  function indexTakeawaysDoc(doc, note) {
    var entries = [];
    doc.querySelectorAll("section.sec-block").forEach(function (sec) {
      var courseTitle = sec.querySelector("h2");
      courseTitle = courseTitle ? collapse(courseTitle.textContent) : note.title;
      sec.querySelectorAll(".topic").forEach(function (topic) {
        var link = topic.querySelector("h4 a[href]");
        var takeaways = topic.querySelector("ul.takeaways");
        entries.push({
          sourceHref: link ? new URL(link.getAttribute("href"), note.absoluteUrl).href : note.absoluteUrl + "#" + (sec.id || ""),
          sourceTitle: note.title,
          sourceGroup: courseTitle,
          heading: link ? collapse(link.textContent) : courseTitle,
          body: takeaways ? collapse(takeaways.textContent) : cleanText(topic)
        });
      });
    });
    return entries;
  }

  // companion/evals-to-agents.html: lessons grouped under section.section[id] > article.lesson.
  // Only the enclosing section carries a stable id, so results jump to that section.
  function indexGuideDoc(doc, note) {
    var entries = [];
    doc.querySelectorAll("section.section[id]").forEach(function (sec) {
      var groupTitle = sec.getAttribute("data-title");
      if (!groupTitle) {
        var h2 = sec.querySelector("h2");
        groupTitle = h2 ? collapse(h2.textContent) : note.title;
      }
      sec.querySelectorAll("article.lesson").forEach(function (art) {
        var h3 = art.querySelector("h3");
        entries.push({
          sourceHref: note.absoluteUrl + "#" + sec.id,
          sourceTitle: note.title,
          sourceGroup: groupTitle,
          heading: h3 ? collapse(h3.textContent) : groupTitle,
          body: cleanText(art)
        });
      });
    });
    return entries;
  }

  // Fallback for any other notes/reference page: index it as a single entry.
  function indexGenericDoc(doc, note) {
    var main = doc.querySelector("main") || doc.body;
    return [{
      sourceHref: note.absoluteUrl,
      sourceTitle: note.title,
      sourceGroup: "",
      heading: note.title,
      body: cleanText(main)
    }];
  }

  // */anthropic-notes.html: full per-topic course notes, one <article class="note" id="slug">
  // per topic inside <section class="group-section"><h2>. The ids are the same citation
  // anchors study-companion's takeaway links already use, so results jump straight there.
  function indexAnthropicNotesDoc(doc, note) {
    var entries = [];
    doc.querySelectorAll("article.note[id]").forEach(function (art) {
      var h3 = art.querySelector("h3");
      var heading = note.title;
      if (h3) {
        var h3Clone = h3.cloneNode(true);
        var anchor = h3Clone.querySelector(".anchor");
        if (anchor) anchor.remove();
        heading = collapse(h3Clone.textContent);
      }
      var group = art.closest("section.group-section");
      var groupHeading = group ? group.querySelector(".group-head h2, h2") : null;
      entries.push({
        sourceHref: note.absoluteUrl + "#" + art.id,
        sourceTitle: note.title,
        sourceGroup: groupHeading ? collapse(groupHeading.textContent) : note.title,
        heading: heading,
        body: cleanText(art)
      });
    });
    return entries;
  }

  function indexNoteDoc(doc, note) {
    if (doc.querySelector("article.note[id]")) {
      return indexAnthropicNotesDoc(doc, note);
    }
    if (doc.querySelector("section.sec-block") && doc.querySelector(".topic")) {
      return indexTakeawaysDoc(doc, note);
    }
    if (doc.querySelector("section.section[data-num]") && doc.querySelector("article.lesson")) {
      return indexGuideDoc(doc, note);
    }
    return indexGenericDoc(doc, note);
  }

  function buildGlobalIndex(sources) {
    var parser = new DOMParser();
    return Promise.all(
      sources.map(function (source) {
        return fetch(source.href)
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.text();
          })
          .then(function (html) {
            var doc = parser.parseFromString(html, "text/html");
            return source.kind === "note" ? indexNoteDoc(doc, source) : indexLessonDoc(doc, source);
          })
          .catch(function () {
            return null;
          });
      })
    ).then(function (perSource) {
      var ok = perSource.filter(Boolean);
      var flat = [];
      ok.forEach(function (entries) { flat.push.apply(flat, entries); });
      return { entries: flat, failed: perSource.length - ok.length, total: perSource.length };
    });
  }

  function snippetAroundIndex(text, idx) {
    var start = Math.max(0, idx - SNIPPET_RADIUS);
    var end = Math.min(text.length, idx + SNIPPET_RADIUS);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  function highlightTokens(text, tokens) {
    var escaped = tokens.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
    var re = new RegExp("(" + escaped.join("|") + ")", "ig");
    var out = "";
    var last = 0;
    var m;
    while ((m = re.exec(text))) {
      out += escapeHtml(text.slice(last, m.index)) + "<mark>" + escapeHtml(m[0]) + "</mark>";
      last = m.index + m[0].length;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    out += escapeHtml(text.slice(last));
    return out;
  }

  function tokenize(s) {
    return s.toLowerCase().split(/[^a-z0-9]+/).filter(function (t) { return t.length > 1; });
  }

  // Picks the body position whose surrounding window covers the most distinct
  // query tokens, so a multi-word question lands on the sentence that answers
  // it rather than just the first place any single word happens to appear.
  function bestWindowIndex(bodyLower, tokens) {
    var positions = [];
    tokens.forEach(function (t) {
      var idx = bodyLower.indexOf(t);
      while (idx !== -1) {
        positions.push({ token: t, idx: idx });
        idx = bodyLower.indexOf(t, idx + 1);
      }
    });
    if (!positions.length) return 0;
    var best = positions[0].idx;
    var bestCount = -1;
    positions.forEach(function (p) {
      var winEnd = p.idx + SNIPPET_RADIUS * 2;
      var seen = {};
      positions.forEach(function (q) {
        if (q.idx >= p.idx && q.idx < winEnd) seen[q.token] = true;
      });
      var count = Object.keys(seen).length;
      if (count > bestCount) {
        bestCount = count;
        best = p.idx;
      }
    });
    return best;
  }

  // Ranked, tokenized matching (not just literal substring): a natural-language
  // question is split into words, every entry is scored by how many of those
  // words appear (heading hits weighted above body hits, an exact phrase hit
  // weighted above either), and results are sorted by score so the single best
  // match reads like an answer rather than just the first thing found.
  function search(index, rawQuery) {
    var phrase = collapse(rawQuery).toLowerCase();
    if (!phrase) return [];
    var tokens = tokenize(phrase);
    if (!tokens.length) return [];
    var results = [];
    index.forEach(function (entry) {
      var headingLower = entry.heading.toLowerCase();
      var bodyLower = entry.body.toLowerCase();
      var score = 0;
      var headingHit = false;
      if (phrase.length > 2 && headingLower.indexOf(phrase) !== -1) {
        score += 20;
        headingHit = true;
      }
      if (phrase.length > 2 && bodyLower.indexOf(phrase) !== -1) score += 8;
      tokens.forEach(function (t) {
        if (headingLower.indexOf(t) !== -1) {
          score += 5;
          headingHit = true;
        }
        if (bodyLower.indexOf(t) !== -1) score += 1;
      });
      if (score <= 0) return;
      var snippetHtml = headingHit
        ? highlightTokens(entry.heading, tokens)
        : highlightTokens(snippetAroundIndex(entry.body, bestWindowIndex(bodyLower, tokens)), tokens);
      results.push({ entry: entry, score: score, headingMatch: headingHit, snippetHtml: snippetHtml });
    });
    results.sort(function (a, b) { return b.score - a.score; });
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
      // dvh, not vh: on mobile Safari vh resolves against the large viewport, so with
      // the toolbar showing the bottom of the panel sits underneath it.
      ".gs-panel{width:min(600px,100%);max-height:70vh;max-height:70dvh;" +
      "display:flex;flex-direction:column;" +
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
      ".gs-result .gs-source{display:block;color:var(--rust-dark);font:700 10px/1.2 system-ui,sans-serif;" +
      "letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;}" +
      ".gs-result .gs-best{display:inline-block;margin-right:6px;padding:1px 6px;border-radius:999px;" +
      "background:var(--rust);color:#fff;font:700 9px/1.5 system-ui,sans-serif;letter-spacing:.05em;" +
      "text-transform:uppercase;}" +
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
    var notes = getNotes().concat(getAnthropicNotesPages());
    var sources = lessons.concat(notes);
    if (!sources.length) return;

    var masthead = document.querySelector(".masthead");
    var themeToggle = document.getElementById("themeToggle");

    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "gs-toggle";
    toggleBtn.setAttribute("aria-label", "Ask a question or search all lessons and notes (press /)");
    toggleBtn.textContent = "🔍";
    if (masthead) {
      if (themeToggle) masthead.insertBefore(toggleBtn, themeToggle);
      else masthead.appendChild(toggleBtn);
    }

    var overlay = document.createElement("div");
    overlay.className = "gs-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Ask a question or search all lessons and notes");
    overlay.innerHTML =
      '<div class="gs-panel">' +
      '<div class="gs-input-row">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="10.8" y1="11" x2="14.5" y2="14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      "</svg>" +
      '<input type="text" class="gs-input" placeholder="Ask a question or search ' + lessons.length + ' lessons and ' + notes.length + ' notes…" ' +
      'aria-label="Ask a question or search all lessons and notes" autocomplete="off" spellcheck="false">' +
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
        indexPromise = buildGlobalIndex(sources).then(function (result) {
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
        resultsEl.innerHTML = '<div class="gs-hint">Ask a question in plain words — the closest matching note comes back first, with a link straight to that spot. Enter jumps to it.</div>';
        return;
      }
      if (!results.length) {
        resultsEl.innerHTML = '<div class="gs-empty">No matches across the lessons or notes.</div>';
        return;
      }
      resultsEl.innerHTML = "";
      results.forEach(function (r, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gs-result" + (i === 0 ? " active" : "");
        var badge = i === 0 ? '<span class="gs-best">Best match</span>' : "";
        btn.innerHTML =
          '<span class="gs-source">' + badge + escapeHtml(r.entry.sourceGroup || r.entry.sourceTitle) + "</span>" +
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
      window.location.href = entry.sourceHref;
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
        resultsEl.innerHTML = '<div class="gs-hint">Indexing lessons and notes…</div>';
        ensureIndex().then(function () {
          if (!overlay.classList.contains("visible")) return;
          if (!globalIndex.length) {
            resultsEl.innerHTML = '<div class="gs-empty">Couldn’t load content to search. Try this over the published site (http/https) rather than a local file.</div>';
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
