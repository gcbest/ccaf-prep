/* Section checks for lesson 0009 — Claude Code in action. */
window.CCAF_CHECKS = {
  lesson: "0009-claude-code-in-action",
  items: {
    scene0: {
      q: "Why is Claude Code described as agentic rather than as a chat window with file access?",
      options: [
        "Because it runs without permissions once installed",
        "Because the context window is finite, so it strategically hunts for the information it needs instead of loading the whole repository",
        "Because it can call MCP servers and subagents",
        "Because it verifies its own output against a test suite by default"
      ],
      correct: 1,
      explain: "The loop is prompt in → gather context → take an action → verify against the original intent → stop or retry. And giving an agent hands is a permissions decision before it is a productivity decision."
    },
    scene1: {
      q: "In Explore → Plan → Code → Commit, why is Plan called the best place to course-correct?",
      options: [
        "It is the only step where Claude will accept corrections",
        "Reviewing and revising a plan is far cheaper than reviewing and undoing code that already exists",
        "The plan is what gets committed to CLAUDE.md for future sessions",
        "Success criteria can only be defined before exploration finishes"
      ],
      correct: 1,
      explain: "Which is also why you should actually read the plan rather than skim it. At the other end, run a subagent code review before committing — a fresh context without the same-session bias of having just written the code."
    },
    scene4: {
      q: "Claude Code's auto mode lets a change with an obvious bug straight through. Is the classifier broken?",
      options: [
        "Yes — blocking broken code is exactly what the block list is for",
        "No — it judges whether an action escalates beyond what you asked for, never whether code is correct",
        "Yes, but only because the classifier's lists are still evolving",
        "No — correctness checks run at commit time instead"
      ],
      correct: 1,
      explain: "Broken code is not dangerous, so it sails through. Airport security asks whether the package is dangerous, not whether the book inside is spelled correctly. “Is this code right?” is a hook, a test suite, and a diff — after the fact."
    },
    scene5: {
      q: "A convention must apply to test files scattered across many directories. What does the exam guide point to?",
      options: [
        "A CLAUDE.md in each directory containing tests",
        "A file in .claude/rules/ whose YAML frontmatter carries glob paths",
        "An @import line at the bottom of the project CLAUDE.md",
        "A PreToolUse hook matching the test file pattern"
      ],
      correct: 1,
      explain: "Also worth holding: imports are expanded inline at launch, so they help organization, not context size — the moving truck still carries every page."
    },
    scene7: {
      q: "Kenji wants a rule that Claude cannot end its turn without running the test suite. Which hook event does that?",
      options: [
        "PreToolUse",
        "PostToolUse",
        "Stop",
        "SessionStart"
      ],
      correct: 2,
      explain: "Stop fires when Claude wants to end its turn, and you can refuse. PreToolUse is the enforcement primitive before a tool call; PostToolUse is where auto-format and auto-lint go."
    },
    scene12: {
      q: "Which mechanism does the three-way core assign to a repeated multi-step procedure tied to a kind of task, like releases or migrations?",
      options: [
        "CLAUDE.md",
        "A skill",
        "A hook",
        "A subagent"
      ],
      correct: 1,
      explain: "Conventions that apply all the time → CLAUDE.md. Procedures tied to a kind of task → a skill. Rules Claude must not be able to skip → a hook. Everything else on the table is a delivery or capability question."
    }
  }
};
