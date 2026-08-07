/* Section checks for lesson 0005 — Claude API: agentic orchestration. */
window.CCAF_CHECKS = {
  lesson: "0005-claude-api-agentic-orchestration",
  items: {
    scene0: {
      q: "Rosa wants everything agentic, Callum wants everything deterministic. How does this section frame the choice Toby has to draw?",
      options: [
        "Orchestration is a bigger prompt — the model decides the control flow either way",
        "Orchestration is a decision about how much of the control flow you write and how much you delegate",
        "Orchestration is choosing between the Messages API and managed agents",
        "Orchestration is which tools you expose, since tools determine autonomy"
      ],
      correct: 1,
      explain: "Two shapes are available — a workflow and an agent — plus four named patterns for building the first one. The architecture wraps around the agent loop; it does not replace it."
    },
    scene10: {
      q: "Which is the correct order of the four managed-agent primitives?",
      options: [
        "Session, Agent, Environment, Events",
        "Environment, Agent, Session, Events",
        "Agent, Environment, Session, Events",
        "Agent, Session, Environment, Events"
      ],
      correct: 2,
      explain: "Stage a play: hire the actor (Agent), build the set (Environment), open a performance (Session), then watch the cue stream (Events). Managed agents are enabled by default for every API account."
    },
    scene15: {
      q: "Northstar's returns system ends the day as a mixture of shapes. What makes that the correct answer?",
      options: [
        "Mixing shapes hedges against any single pattern being deprecated",
        "The architect spends autonomy where the problem is genuinely open and structure everywhere else",
        "Each lane needs its own model, so each needs its own orchestration shape",
        "Workflows are for prototypes and agents are for production, so both coexist during migration"
      ],
      correct: 1,
      explain: "Routing, chaining, parallelization, and an evaluator-optimizer loop cover the predictable lanes; only the genuinely open-ended lane becomes an agent — with abstract tools, environment inspection, and a permissions policy on anything touching money."
    }
  }
};
