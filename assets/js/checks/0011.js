/* Section checks for lesson 0011 — The Claude Agent SDK, part 2 (hooks, permissions,
   tools, reliability). Covers the scenes that carry no decision point of their own. */
window.CCAF_CHECKS = {
  lesson: "0011-claude-agent-sdk-hooks-and-reliability",
  items: {
    scene0: {
      q: "Why won't few-shot examples take the 12% skipped-verification rate to zero?",
      options: [
        "Because the model ignores examples placed in a system prompt",
        "Because a prompt is a request — instructions are probabilistic and carry a non-zero failure rate, while code that runs is deterministic",
        "Because few-shot examples only work for extraction tasks",
        "Because the examples would exceed the context window"
      ],
      correct: 1,
      explain: "Programmatic enforcement guarantees compliance; prompt guidance only shifts the odds. The governing question is whether this is something you want Claude to do, or something Claude must not be able to skip."
    },
    scene2: {
      q: "You register a hook with HookMatcher and leave `timeout` unset. How long does it get?",
      options: [
        "30 seconds for every event",
        "600 seconds for most events, but 30 seconds for UserPromptSubmit",
        "600 seconds for every event, with no exceptions",
        "There is no default; the hook runs until it returns"
      ],
      correct: 1,
      explain: "UserPromptSubmit sits in front of a waiting human, so it gets the short leash. Also worth holding: omitting `matcher` matches every tool, and patterns like \"Write|Edit\" match a set."
    },
    scene8: {
      q: "Of isError, errorCategory, and isRetryable, which is an actual MCP protocol field?",
      options: [
        "All three are MCP fields",
        "Only isError — the other two are conventions you put in your own error payload",
        "Only isRetryable, which the SDK reads to decide whether to retry",
        "Only errorCategory, which MCP uses to route failures"
      ],
      correct: 1,
      explain: "isError is how MCP signals a failed tool call. errorCategory and isRetryable are design conventions the exam names as vocabulary — learn them as terms, but don't go hunting for them in the SDK types. isRetryable: false on a business error means don't retry, explain the rule."
    },
    scene10: {
      q: "An agent hits 55% first-contact resolution against an 80% target, escalating easy cases and pushing on ones it should hand off. What actually fixes it?",
      options: [
        "A PreToolUse hook gating escalate_to_human",
        "Explicit escalation criteria in the system prompt with few-shot examples demonstrating them",
        "Raising maxTurns so it has more room to work",
        "Switching the escalation decision to a larger model"
      ],
      correct: 1,
      explain: "This is the one place in the lesson where few-shot examples are the right answer, because the failure is genuinely a judgment call rather than a rule. A hook can enforce a threshold; it cannot teach taste. Also remember to distrust the aggregate — 97% overall can hide a category that fails nearly always."
    }
  }
};
