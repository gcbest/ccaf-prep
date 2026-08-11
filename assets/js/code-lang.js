/* Python / TypeScript toggle for lessons that show the same Agent SDK pattern in
   both languages. Every `.codeswap` block on the page holds one `<pre data-lang>`
   per language plus a small tab strip; choosing a language hides the other `<pre>`
   in every block at once and remembers the choice in localStorage, so a reader who
   picks TypeScript in part 1 gets TypeScript in part 2.

   This is deliberately independent of lesson-progress.js. The toggle buttons live
   outside `.choices`, which is the only selector that file's onclick parser looks
   at, so they are never mistaken for a scored decision.

   Load BEFORE the other lesson scripts: it only touches `.codeswap` subtrees, and
   running first means the correct language is already visible by the time
   lesson-search.js builds its index and review-mode.js starts hiding sections. */
(function () {
  "use strict";

  var STORAGE_KEY = "ccaf-code-lang";
  var DEFAULT_LANG = "py";
  var VALID = { py: true, ts: true };

  function stored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return VALID[v] ? v : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function apply(lang) {
    if (!VALID[lang]) lang = DEFAULT_LANG;

    var blocks = document.querySelectorAll(".codeswap, .langbar");
    Array.prototype.forEach.call(blocks, function (block) {
      var pres = block.querySelectorAll("pre[data-lang]");
      Array.prototype.forEach.call(pres, function (pre) {
        pre.hidden = pre.getAttribute("data-lang") !== lang;
      });

      var tabs = block.querySelectorAll(".codeswap-tabs button[data-lang]");
      Array.prototype.forEach.call(tabs, function (btn) {
        btn.setAttribute(
          "aria-pressed",
          btn.getAttribute("data-lang") === lang ? "true" : "false"
        );
      });
    });
  }

  // Called from the inline onclick handlers in the lesson markup.
  window.setCodeLang = function (lang) {
    if (!VALID[lang]) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
    apply(lang);
  };

  function init() { apply(stored()); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
