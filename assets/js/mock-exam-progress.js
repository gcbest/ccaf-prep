/* Shared completion tracking for the six CCA-F mock exam batches.
   One storage key for all six batches (plus the index page) so they share a single
   gist-sync section — see assets/js/gist-sync.js. */
(function (global) {
  "use strict";

  var STORAGE_KEY = "ccaf_mock_exams_v1";
  var MAX_ATTEMPTS_PER_BATCH = 20;

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (!parsed.batches) parsed.batches = {};
        return parsed;
      }
    } catch (e) {}
    return { batches: {} };
  }

  function saveState(state) {
    state._updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function recordAttempt(batchId, attempt) {
    var state = loadState();
    if (!state.batches[batchId]) state.batches[batchId] = { attempts: [], best: null };
    var b = state.batches[batchId];
    b.attempts.unshift(attempt);
    if (b.attempts.length > MAX_ATTEMPTS_PER_BATCH) b.attempts.length = MAX_ATTEMPTS_PER_BATCH;
    if (!b.best || attempt.correct > b.best.correct) b.best = attempt;
    return saveState(state);
  }

  global.MockExamProgress = {
    STORAGE_KEY: STORAGE_KEY,
    loadState: loadState,
    saveState: saveState,
    recordAttempt: recordAttempt
  };
})(window);
