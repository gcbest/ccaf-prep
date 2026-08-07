/* Section checks for lesson 0001 — Claude 101: choose the right surface.
   One question per exposition scene (scenes with their own decision point are skipped). */
window.CCAF_CHECKS = {
  lesson: "0001-claude-101-choose-the-right-surface",
  items: {
    scene0: {
      q: "A new hire wants to work through a hard problem and come out understanding it, not just holding the answer. Which setting does this section point to?",
      options: [
        "Thinking",
        "Learning mode",
        "A custom Style",
        "A 1M-token context window"
      ],
      correct: 1,
      explain: "Thinking lets Claude spend more effort reasoning before it answers; Learning mode guides your reasoning instead of simply handing you the answer."
    },
    scene4: {
      q: "Maya's brief asks for “plain language, a numbered decision tree, and one example conversation under 120 words.” Which of the three prompt ingredients is that?",
      options: [
        "Setting the stage",
        "Defining the task",
        "Specifying rules",
        "Independent verification"
      ],
      correct: 2,
      explain: "Setting the stage is role, objective, and context; defining the task is the specific action; specifying rules covers style, tone, format, constraints, and examples."
    },
    scene5: {
      q: "Claude's second draft has the right structure but a soft conclusion, and everything established so far is still useful. What does this section say to do?",
      options: [
        "Start a fresh chat so the weak draft stops influencing the next one",
        "Give specific feedback in the same chat and look at the next output",
        "Re-send the original prompt unchanged and hope for a better sample",
        "Ask Claude to explain why its own conclusion was too soft"
      ],
      correct: 1,
      explain: "Redirect within the same chat while the context is still useful; restart only when the conversation has accumulated the wrong assumptions and needs a clean frame."
    },
    scene6: {
      q: "Northstar's support playbook is growing toward the context limit. How does this section say Claude keeps working with it?",
      options: [
        "Upgrade to a plan with a larger context window so it all fits",
        "Use RAG to search the knowledge base and retrieve only the relevant pieces",
        "Split the playbook into one Project per policy document",
        "Let Memory carry the playbook forward between conversations"
      ],
      correct: 1,
      explain: "Retrieval Augmented Generation is described as expanding effective capacity by up to 10x — but the source material still has to be organized and reviewed, or retrieval just finds the relevant mess faster."
    },
    scene7: {
      q: "The Friday launch kit is a repeatable procedure: inspect the folder, summarize changes, create three files, run a checklist. Where does it belong?",
      options: [
        "In the Project knowledge base, because it is context the team reuses",
        "In a Skill, because Projects store the what and Skills define the how",
        "In the project description, so Claude reads it before every task",
        "In an Artifact, because the output is substantial and reusable"
      ],
      correct: 1,
      explain: "A Skill is a package of instructions, scripts, and resources loaded dynamically for a specialized workflow. The project description is metadata for humans browsing the Projects list — not instructions Claude acts on."
    },
    scene8: {
      q: "Northstar wants the launch kit delivered as a PowerPoint deck. How is that produced, per this section?",
      options: [
        "As an ordinary Artifact, the same as an HTML page or React component",
        "By a separate file-creation capability, with Skills returning downloadable documents",
        "As a Mermaid diagram Artifact that the team exports manually",
        "By publishing the Artifact and letting a viewer remix it into slides"
      ],
      correct: 1,
      explain: "Word, Excel, PowerPoint, and PDF files are handled by a separate file-creation capability rather than being treated as ordinary Artifacts."
    },
    scene9: {
      q: "An employee connects Notion through a Claude connector. What can Claude reach?",
      options: [
        "Everything in the Notion workspace, since the connector authenticates once",
        "Only what that user is already allowed to access in Notion",
        "Everything the administrator approved for the organization",
        "Nothing until each page is individually shared into the conversation"
      ],
      correct: 1,
      explain: "A connector is an office badge, not a skeleton key: it grants scoped access without erasing the source system's permissions, individual permissions can be toggled, and the connection can be revoked."
    },
    scene10: {
      q: "An admin is configuring “Ask Northstar,” the organization-wide Enterprise Search experience. Which connectors does setup require?",
      options: [
        "Documents and Email, with Chat optional",
        "Documents and Chat, with Email optional",
        "Chat only — documents are indexed automatically",
        "All three: Documents, Chat, and Email"
      ],
      correct: 1,
      explain: "A Documents connector and a Chat connector are required; Email can be added but is optional. Each employee then authenticates personally, and results stay permission-scoped."
    },
    scene12: {
      q: "You are about to automate the Friday launch kit. What does the lightweight eval loop start with?",
      options: [
        "Writing synthetic edge cases that stress the prompt's limits",
        "Gathering 5–10 real examples of the task the team already performs",
        "Asking Claude to grade the quality of its own output",
        "Turning on web search so answers are grounded in current evidence"
      ],
      correct: 1,
      explain: "You run test prompts built from the context people naturally provide, compare outputs against the originals, and refine the prompt or add examples based on consistent misses."
    }
  }
};
