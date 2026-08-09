/* Adds an "Ask Claude about this" button to every lesson section.
   Copies a CCAF-coaching prompt built from the section's own content to the
   clipboard and opens a new claude.ai tab, since claude.ai/new no longer
   supports prefilling the composer via URL. */
(function () {
  "use strict";

  var CLAUDE_URL = "https://claude.ai/new";
  var TOAST_MS = 3200;
  var toastEl = null;
  var toastTimer = null;

  // Maps each lesson file to the real CCA-F exam domain(s) it covers, per
  // EXAM-DOMAINS.md. Lessons use a fictional "Northstar" case-study narrative
  // as a teaching device; the coaching prompt should ground the student in
  // the actual exam structure instead of that story framing.
  var LESSON_DOMAINS = {
    "0001-claude-101-choose-the-right-surface.html":
      "Prompt Engineering & Structured Output (20%) — course folder 02-claude-101",
    "0002-ai-fluency-the-four-d-framework.html":
      "Prompt Engineering & Structured Output (20%) — course folder 01-ai-fluency-framework-foundations",
    "0003-claude-api-the-first-integration.html":
      "Prompt Engineering & Structured Output (20%) — course folder 03-building-with-the-claude-api",
    "0004-claude-api-tools-retrieval-and-context.html":
      "Tool Design & MCP Integration (18%) and Context Management & Reliability (15%) — course folder 03-building-with-the-claude-api",
    "0005-claude-api-agentic-orchestration.html":
      "Agentic Architecture & Orchestration (27%) — course folder 03-building-with-the-claude-api",
    "0006-claude-with-amazon-bedrock.html":
      "Deployment options (Bedrock access/auth layer, cuts across all domains) — course folder 04-claude-with-amazon-bedrock",
    "0007-claude-on-google-cloud.html":
      "Deployment options (Vertex/Google Cloud access/auth layer, cuts across all domains) — course folder 05-claude-on-google-cloud",
    "0008-model-context-protocol.html":
      "Tool Design & MCP Integration (18%) — course folder 06-introduction-to-mcp",
    "0009-claude-code-in-action.html":
      "Claude Code Configuration & Workflows (20%) and Context Management & Reliability (15%) — course folder 07-claude-code-in-action"
  };

  function collapse(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function sectionLabel(section) {
    var h2 = section.querySelector("h2");
    if (h2) return collapse(h2.textContent);
    return section.classList.contains("end") ? "The architect's pocket card" : "This section";
  }

  function currentLessonFile() {
    var parts = (location.pathname || "").split("/");
    return parts[parts.length - 1];
  }

  function buildPrompt(label, bodyText) {
    var domain = LESSON_DOMAINS[currentLessonFile()];
    var domainLine = domain
      ? "Exam domain focus: " + domain + "\n"
      : "";

    return (
      "You are a coach for the Claude Certified Architect (Foundations) exam.\n" +
      domainLine +
      "Current topic: \"" + label + "\"\n\n" +
      "The section content below uses a fictional case-study narrative (a\n" +
      "company called \"Northstar\" and invented characters) purely as a\n" +
      "teaching device on the lesson page. Ignore that framing entirely —\n" +
      "do not refer to Northstar, its characters, or the story. Coach using\n" +
      "the real CCAF exam domain(s) and terminology named above.\n\n" +
      "Your role is to guide the student through understanding this topic: help\n" +
      "them understand it, quiz them on it with a couple of follow-up questions,\n" +
      "and flag anything they should watch for on the CCAF exam.\n\n" +
      "Section content:\n---\n" + bodyText + "\n---"
    );
  }

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement("div");
    toastEl.className = "ask-claude-toast";
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(message) {
    var el = ensureToast();
    el.textContent = message;
    el.classList.add("visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("visible"); }, TOAST_MS);
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "ask-claude-styles";
    style.textContent =
      ".ask-claude-row{margin-top:14px;padding-top:10px;border-top:1px dashed var(--line);" +
      "display:flex;align-items:center;flex-wrap:wrap;gap:10px;font-size:12px;}" +
      ".ask-claude-btn{border:1px solid var(--line);border-radius:3px;background:none;" +
      "color:var(--muted);padding:5px 10px;font:600 11px/1 system-ui,sans-serif;" +
      "letter-spacing:.04em;cursor:pointer;}" +
      ".ask-claude-btn:hover,.ask-claude-btn:focus-visible{background:var(--rust);" +
      "border-color:var(--rust);color:#fff;outline:none;}" +
      ".ask-claude-hint{color:var(--muted);}" +
      ".ask-claude-fallback{display:none;width:100%;min-height:70px;margin-top:6px;" +
      "padding:8px;border:1px solid var(--line);border-radius:3px;" +
      "background:var(--paper-deep);color:var(--ink);font:12px/1.4 ui-monospace,monospace;}" +
      ".ask-claude-fallback.visible{display:block;}" +
      ".ask-claude-toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,8px);" +
      "background:var(--rust-dark);color:#fff8f1;padding:9px 16px;border-radius:4px;" +
      "font:600 12px/1.3 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);" +
      "opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;z-index:1000;" +
      "max-width:88vw;text-align:center;}" +
      ".ask-claude-toast.visible{opacity:1;transform:translate(-50%,0);}" +
      ".end .ask-claude-row{border-top-color:rgba(255,255,255,.3);}" +
      ".end .ask-claude-btn,.end .ask-claude-hint{color:#f6dfd1;}" +
      ".end .ask-claude-btn{border-color:rgba(255,255,255,.4);}" +
      ".end .ask-claude-btn:hover,.end .ask-claude-btn:focus-visible{background:#fff;" +
      "color:var(--rust-dark);border-color:#fff;}" +
      ".end .ask-claude-fallback{background:rgba(0,0,0,.2);color:#fff8f1;border-color:rgba(255,255,255,.35);}";
    document.head.appendChild(style);
  }

  function makeRow(promptText) {
    var row = document.createElement("div");
    row.className = "ask-claude-row";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ask-claude-btn";
    btn.textContent = "Ask Claude about this ↗";

    var hint = document.createElement("span");
    hint.className = "ask-claude-hint";
    hint.hidden = true;

    var fallback = document.createElement("textarea");
    fallback.className = "ask-claude-fallback";
    fallback.readOnly = true;
    fallback.setAttribute("aria-label", "Prompt to copy manually");

    btn.addEventListener("click", function () {
      var clipboardPromise;
      try {
        clipboardPromise = navigator.clipboard && navigator.clipboard.writeText
          ? navigator.clipboard.writeText(promptText)
          : Promise.reject(new Error("Clipboard API unavailable"));
      } catch (e) {
        clipboardPromise = Promise.reject(e);
      }

      // Fired synchronously, right next to the clipboard call, with no await
      // in between — Safari revokes the click's user-activation otherwise,
      // silently blocking the popup and/or the clipboard write.
      window.open(CLAUDE_URL, "_blank", "noopener");

      clipboardPromise.then(
        function () {
          showToast("Copied — paste it into the new Claude tab (Cmd/Ctrl+V).");
          fallback.classList.remove("visible");
          hint.hidden = true;
        },
        function () {
          fallback.value = promptText;
          fallback.classList.add("visible");
          hint.hidden = false;
          hint.textContent = "Couldn't copy automatically — select the text below and copy it.";
          fallback.focus();
          fallback.select();
        }
      );
    });

    row.appendChild(btn);
    row.appendChild(hint);
    row.appendChild(fallback);
    return row;
  }

  function init() {
    var sections = document.querySelectorAll("main section.scene, main section.end");
    if (!sections.length) return;

    var prompts = [];
    sections.forEach(function (section) {
      prompts.push(buildPrompt(sectionLabel(section), collapse(section.innerText)));
    });

    sections.forEach(function (section, i) {
      section.appendChild(makeRow(prompts[i]));
    });
  }

  injectStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
