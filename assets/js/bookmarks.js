/* Renders every flagged ("come back to this later") scene across all lessons,
   grouped by lesson in story order, so a reader can work through their backlog
   without hunting through each lesson individually.

   Reads directly from the same localStorage key scene-flag.js writes
   (ccaf_scene_flags_v1) — no fetching of other pages, so this works offline
   and even over file://. */
(function () {
  "use strict";

  var STORAGE_KEY = "ccaf_scene_flags_v1";

  // Same slugs, order, and titles as the cards on lessons/index.html.
  var LESSONS = [
    { slug: "0002-ai-fluency-the-four-d-framework", kicker: "Section 1 · AI Fluency", title: "The week Northstar decided how to work" },
    { slug: "0001-claude-101-choose-the-right-surface", kicker: "Section 2 · Claude 101", title: "The Northstar launch" },
    { slug: "0003-claude-api-the-first-integration", kicker: "Section 3 · Part 1 of 3", title: "The first integration" },
    { slug: "0004-claude-api-tools-retrieval-and-context", kicker: "Section 3 · Part 2 of 3", title: "The day Northstar grew hands" },
    { slug: "0005-claude-api-agentic-orchestration", kicker: "Section 3 · Part 3 of 3", title: "The shape of the system" },
    { slug: "0006-claude-with-amazon-bedrock", kicker: "Section 4 · Amazon Bedrock", title: "The Cascade Mutual migration" },
    { slug: "0007-claude-on-google-cloud", kicker: "Section 5 · Google Cloud", title: "The Meridian port" },
    { slug: "0008-model-context-protocol", kicker: "Section 6 · MCP", title: "The Northstar adapter" },
    { slug: "0009-claude-code-in-action", kicker: "Section 7 · Claude Code", title: "The keys to the repo" }
  ];

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw && JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.lessons) return parsed;
    } catch (e) { /* corrupt or unavailable storage */ }
    return { lessons: {}, updatedAt: 0 };
  }

  function saveState(state) {
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // Scene ids are "sceneN" — sort numerically so scene10 doesn't land before scene2.
  function sceneIndex(id) {
    var m = /(\d+)$/.exec(id);
    return m ? parseInt(m[1], 10) : 0;
  }

  function render() {
    var state = loadState();
    var list = document.getElementById("bmList");
    var empty = document.getElementById("bmEmpty");
    var count = document.getElementById("bmCount");
    list.innerHTML = "";

    var total = 0;
    var groups = [];

    LESSONS.forEach(function (meta) {
      var flags = state.lessons[meta.slug];
      if (!flags) return;
      var ids = Object.keys(flags);
      if (!ids.length) return;
      ids.sort(function (a, b) { return sceneIndex(a) - sceneIndex(b); });
      total += ids.length;
      groups.push({ meta: meta, ids: ids, flags: flags });
    });

    count.textContent = total ? total + " flagged section" + (total === 1 ? "" : "s") : "";
    empty.hidden = total > 0;
    if (!total) return;

    groups.forEach(function (group) {
      var section = document.createElement("section");
      section.className = "bm-group";

      var kicker = document.createElement("p");
      kicker.className = "bm-kicker";
      kicker.textContent = group.meta.kicker;

      var h2 = document.createElement("h2");
      h2.textContent = group.meta.title;

      section.appendChild(kicker);
      section.appendChild(h2);

      group.ids.forEach(function (sceneId) {
        var rec = group.flags[sceneId] || {};
        var card = document.createElement("div");
        card.className = "card bm-card";

        var link = document.createElement("a");
        link.className = "card-link";
        link.href = group.meta.slug + ".html#" + sceneId;

        var eyebrow = document.createElement("span");
        eyebrow.className = "kicker";
        eyebrow.textContent = rec.eyebrow || "";

        var title = document.createElement("span");
        title.className = "title";
        title.textContent = rec.heading || sceneId;

        link.appendChild(eyebrow);
        link.appendChild(title);
        card.appendChild(link);

        var unflag = document.createElement("button");
        unflag.type = "button";
        unflag.className = "bm-unflag";
        unflag.textContent = "Unflag";
        unflag.addEventListener("click", function () {
          var fresh = loadState();
          var f = fresh.lessons[group.meta.slug];
          if (f) { delete f[sceneId]; saveState(fresh); }
          render();
        });
        card.appendChild(unflag);

        section.appendChild(card);
      });

      list.appendChild(section);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
