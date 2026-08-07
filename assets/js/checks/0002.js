/* Section checks for lesson 0002 — AI Fluency: the four D framework. */
window.CCAF_CHECKS = {
  lesson: "0002-ai-fluency-the-four-d-framework",
  items: {
    scene0: {
      q: "Hollis says “I don't think the tool is the argument.” What does this section define AI fluency as instead?",
      options: [
        "Knowing which Claude surface each team should be licensed for",
        "Knowing which mode of engagement a task calls for, how to describe it, how to evaluate the result, and how to be accountable",
        "Knowing the capabilities and limitations of the model you bought",
        "Knowing how to write prompts that reliably avoid hallucination"
      ],
      correct: 1,
      explain: "AI fluency is not tool knowledge — the four things named here become Delegation, Description, Discernment, and Diligence."
    },
    scene2: {
      q: "Northstar is deciding whether a task should be Automation, Augmentation, or Agency. Which competency is that choice?",
      options: [
        "Delegation",
        "Description",
        "Discernment",
        "Diligence"
      ],
      correct: 0,
      explain: "Choosing between Automation, Augmentation, and Agency is the practical expression of Delegation — what work should go to a human and what should go to AI."
    },
    scene3: {
      q: "Nadia asks “Can Claude help with the churn thing?” and cannot say what the churn thing is. What does Problem Awareness ask her to settle first?",
      options: [
        "Which Claude surface and context window the task needs",
        "The goal, audience, success criteria, constraints, and nature of the work",
        "The product, process, and performance description for the prompt",
        "Whether the output will need disclosure to the regional directors"
      ],
      correct: 1,
      explain: "Problem Awareness is the first half of Delegation and happens before AI is involved at all: if the problem is vague to you, Claude cannot reliably fix the ambiguity."
    },
    scene4: {
      q: "Hollis pins a card listing context limits, knowledge cutoff, hallucination risk, tool and file access, and privacy boundaries. Which competency is that card?",
      options: [
        "Discernment — inspecting output before relying on it",
        "Platform Awareness, the second half of Delegation",
        "Diligence — using AI responsibly and transparently",
        "Performance Description — how Claude should collaborate"
      ],
      correct: 1,
      explain: "Platform Awareness means understanding what the available system can and cannot do, including whether the task needs a chat, coding, research, or agentic surface."
    },
    scene6: {
      q: "Nadia's memo is twelve pages, addressed to nobody, and asserts conclusions without showing its work. Which Description dimensions did she leave out?",
      options: [
        "Product — she never said what the deliverable was",
        "Process and Performance — she described the output and nothing else",
        "Performance only — the tone was wrong for Bram",
        "All three — she gave no description at all"
      ],
      correct: 1,
      explain: "She described the product she wanted and nothing else. A clear product request with no process or performance guidance can still produce something technically plausible but unusable."
    },
    scene8: {
      q: "Nadia is new to the churn domain, so her expertise cannot carry the discernment. What practice does this section give her?",
      options: [
        "Defer the judgment to someone with domain expertise",
        "Ask Claude for multiple explanations, compare the strongest and weakest parts, and give specific corrective feedback",
        "Check whether the wording is fluent and internally consistent",
        "Re-run the same prompt several times and keep the most common answer"
      ],
      correct: 1,
      explain: "Domain expertise makes discernment stronger, but comparing multiple explanations works even when you are new to the subject. Fluent wording is not evidence of correctness."
    },
    scene10: {
      q: "In the seven-step loop, discernment reveals a problem at step 5. What does step 6 permit you to change?",
      options: [
        "Only the description — the delegation plan is fixed once set",
        "Either the description or the delegation plan",
        "Only the delegation plan, since a bad result means the task was misassigned",
        "Neither — you restate the vision and begin again at step 1"
      ],
      correct: 1,
      explain: "Hollis's account-weighting catch did both: the process description gained an evidence rule, and the ranking task moved from AI-led toward collaborative."
    },
    scene11: {
      q: "Of the six prompting techniques, which one does this section single out as drawing most directly on Description?",
      options: [
        "Give context",
        "Show examples",
        "Break into steps",
        "Ask the AI to think first"
      ],
      correct: 1,
      explain: "Showing an example is about communicating effectively with the AI and defining the desired output — a photo of the perfect sandwich beats a paragraph about roughly this much lettuce."
    },
    scene15: {
      q: "This section warns against a specific habit when working an exam scenario question. What is it?",
      options: [
        "Jumping straight to naming a competency instead of first asking what human judgment is missing",
        "Assuming the scenario needs Augmentation when it describes a routine process",
        "Treating Delegation and Description as separable competencies",
        "Answering before checking which of the seven courses the scenario comes from"
      ],
      correct: 0,
      explain: "Name the gap before you name the label: work out what specific kind of human judgment is missing, then decide which AI behavior supplies it."
    }
  }
};
