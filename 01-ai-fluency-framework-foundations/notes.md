# 01 · AI Fluency: Framework & Foundations

Source: AI Fluency: Framework & Foundations (Anthropic Academy) — official CCA-F prep course #1.

## Why AI fluency matters — three modes of engaging AI
- **Automation** — you hand a task fully to AI with little/no human involvement in execution; best for routine, well-defined work where the process is already trusted.
- **Augmentation** — AI assists while you stay actively in the loop, reviewing and steering; best when judgment/context matters and you want to retain control over the outcome.
- **Agency** — AI operates with a degree of independent initiative toward a goal, making its own choices about how to get there (the mode most agentic systems and Claude Code operate in).
Choosing the right mode for a given task is itself a skill — it's the practical expression of the Delegation competency below.

## The 4D Framework for AI Fluency
Developed by Prof. Rick Dakan (Ringling College of Art and Design) and Prof. Joseph Feller (University College Cork). Licensed CC BY-NC-SA 4.0. Four core competencies:
- **Delegation** — deciding what work should go to a human vs. to AI; understanding both the goal and what the AI is actually capable of.
- **Description** — communicating effectively with AI: defining the output you want, guiding its process, specifying behavior/constraints.
- **Discernment** — critically evaluating AI outputs for quality, accuracy, and appropriateness before you rely on them.
- **Diligence** — using AI responsibly and ethically, with transparency and accountability for what you ship.

Practical mapping: the "setting the stage / defining the task / specifying rules" prompt framework (see 02-claude-101) is a Description skill in practice; troubleshooting a bad response draws on Discernment (spot the problem) and Diligence (own the fix).

## Effective prompting techniques (the six + the secret weapon)
1. **Give context** — explain the situation, audience, and constraints so the AI isn't guessing.
2. **Show examples** — demonstrate the pattern/format you want rather than only describing it.
3. **Specify constraints** — state length, tone, format, and any hard boundaries explicitly.
4. **Break into steps** — for multi-part or complex asks, decompose the task instead of one large ask.
5. **Ask the AI to think first** — invite it to reason or outline before producing the final answer.
6. **Define role/tone** — tell the AI who it should act as and how it should sound.
- **The "secret weapon"**: ask the AI to improve your own prompt before you use it — it's often better at prompt-engineering its own instructions than you are on the first pass.

## Why this course anchors the exam
This is the first of the seven official CCA-F prep courses. It's foundational vocabulary (Delegation/Description/Discernment/Diligence, Automation/Augmentation/Agency) that later courses — and exam scenario questions — assume you already know.

## The 4D framework in full detail

The short labels are useful only when the subcomponents are explicit. In an exam scenario, first identify what kind of human judgment is missing, then decide which AI behavior to request.

### Delegation: awareness before assignment

Delegation is not simply "give the task to Claude." It has three parts:

- **Problem Awareness** — understand the goal, audience, success criteria, constraints, and nature of the work before involving AI. If the problem is vague to you, Claude cannot reliably fix the ambiguity.
- **Platform Awareness** — understand the capabilities and limitations of the available AI system: context-window limits, knowledge cutoff, hallucination risk, tool access, file access, privacy boundaries, and whether the task needs a chat, coding, research, or agentic surface.
- **Task Delegation** — deliberately distribute work between human and AI. Keep work that needs domain expertise, values, accountability, or high-stakes judgment with the human; delegate drafting, transformation, comparison, exploration, and repetitive analysis when AI is a good fit.

A good delegation decision considers three options for each task: human-led, AI-led, or collaborative. The objective is the best human–AI partnership, not maximum automation.

### Description: three dimensions of a good request

Description establishes what Claude should produce and how it should work with you.

- **Product Description** — describe the output: deliverable, audience, format, level of detail, tone, examples, and acceptance criteria.
- **Process Description** — describe the method: steps, framework, evidence standard, tools, order of operations, and whether Claude should outline or verify before finalizing.
- **Performance Description** — describe the collaboration behavior: concise or detailed, challenging or supportive, question-first or assumption-first, exploratory or decisive, and how it should respond to feedback.

The more consequential or unfamiliar the work, the more useful it is to describe all three. A clear product request with no process or performance guidance may still produce an answer that is technically plausible but unusable.

### Discernment: evaluate the same three dimensions

Discernment is the human responsibility to inspect and improve the collaboration continuously.

- **Product Discernment** — check the output for accuracy, appropriateness, coherence, relevance, completeness, format, and fit for the intended audience.
- **Process Discernment** — inspect the approach and reasoning: are the steps logical, are assumptions visible, was important evidence ignored, and is the method appropriate for the problem?
- **Performance Discernment** — assess how Claude collaborates: does it use the requested terminology and tone, respond to corrections, ask useful questions, and respect the stated boundaries?

Domain expertise makes discernment stronger, but a useful practice is to ask Claude for multiple explanations, compare the strongest and weakest parts, and give specific corrective feedback. Fluent wording is not evidence of correctness.

### The Description–Discernment loop

Use this loop for a multi-step project:

1. Establish the vision, value, and definition of success.
2. Break the project into tasks and decide what is human-led, AI-led, or collaborative.
3. Set Product, Process, and Performance descriptions for the current task.
4. Execute one task at a time.
5. Apply Product, Process, and Performance discernment to the result and method.
6. Refine the description or delegation plan based on what you learned.
7. Integrate domain knowledge and make the final human decision.

This is a feedback loop, not a one-time prompt. Each iteration should reduce ambiguity or improve quality.

### Diligence: responsible use and ownership

Diligence covers the responsible conditions around creating and sharing AI-assisted work:

- **Creation Diligence** — choose systems, tools, data, and workflows thoughtfully. Consider privacy, security, bias, copyright, safety, and whether the platform is appropriate for the information.
- **Transparency Diligence** — disclose AI's role when the audience or context expects it. Disclosure can differ in personal, academic, professional, and regulated settings.
- **Deployment Diligence** — verify the output before sharing or acting on it, and personally own and vouch for the result. Human review is part of deployment, not an optional cleanup step.

A practical diligence statement can name the system used, what it contributed, what you reviewed or changed, and who is responsible for the final work.

## Generative AI capabilities and limitations

Generative AI learns patterns from large datasets and generates likely continuations; it does not automatically possess grounded understanding or current knowledge. Claude is versatile at conversation, transformation, drafting, analysis, and tool-mediated tasks, but it can still:

- rely on a knowledge cutoff or incomplete context;
- hallucinate plausible but unsupported facts;
- lose important details when context is too large;
- make mistakes in complex reasoning, calculations, or interpretation;
- reflect limitations in its data, tools, or instructions.

Pair capability with human judgment, creativity, ethical oversight, and verification. The right question is not "Can Claude produce something?" but "What role should Claude play, and what evidence will establish that the result is safe and good enough?"

## Project-planning exercise

For a medium-sized, multi-step project, first ask Claude questions until the vision and success criteria are explicit. Then list the major tasks and discuss each one:

- what human knowledge, creativity, judgment, or accountability it requires;
- what Claude can do well and what limitations matter;
- whether the task should be human-led, AI-led, or collaborative;
- what Product, Process, and Performance descriptions will guide it;
- how the result will be checked and what diligence is required before deployment.

Save the plan and use it as the shared context for the Description–Discernment loop.
