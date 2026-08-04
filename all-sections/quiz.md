# All Sections · 60-Question Weighted Quiz

This is a curated 60-question set across the seven prep courses and the exam-guide reference. Each question has one primary domain label so the set can be reviewed against the exam weighting.

| Domain | Questions | Set share | Exam weight |
|---|---:|---:|---:|
| Agentic Architecture & Orchestration | 16 | 26.7% | 27% |
| Claude Code Configuration & Workflows | 12 | 20.0% | 20% |
| Prompt Engineering & Structured Output | 12 | 20.0% | 20% |
| Tool Design & MCP Integration | 11 | 18.3% | 18% |
| Context Management & Reliability | 9 | 15.0% | 15% |
| **Total** | **60** | **100%** | **100%** |

Questions appear before the answer divider. Labels are primary-domain assignments; several topics naturally overlap domains. Source IDs point back to the original course quiz or the exam-guide-derived `study-reference/ccaf_study_reference.md`.

## 1. Agentic Architecture & Orchestration · 16 questions

### Q1. List the five steps of the basic agent loop.

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q9

---

**A:** 1) Send a message with tools available. 2) Claude responds with a final answer or a tool-use request. 3) Your code executes the tool. 4) You send the result back as a `tool_result`. 5) Repeat until `stop_reason` is `end_turn`.

*Memory hook:* **ask → choose → run → report → repeat** until the baton reaches the finish line.

### Q2. What does `stop_reason: "tool_use"` signal in a Messages API response?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q8

---

**A:** Claude wants to call a tool rather than finish its turn. The application should execute the requested tool and send the result back; `end_turn` means Claude is done.

*Memory hook:* `tool_use` is a work order; `end_turn` is the “office closed” sign.

### Q3. What is the fundamental difference between a workflow and an agent?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q55

---

**A:** A workflow is a predefined series of Claude calls for a known problem where the steps can be planned in advance. An agent receives a goal and tools, then determines its own steps.

*Memory hook:* A workflow rides a train track; an agent chooses its own trail.

### Q4. What is the general recommendation for choosing between workflows and agents, and why?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q56

---

**A:** Prefer workflows wherever possible and use agents only when they are genuinely needed. Workflows are more predictable and reliable; users usually value consistent results over architectural sophistication.

### Q5. Describe the parallelization workflow pattern and one concrete benefit.

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q57

---

**A:** Split one complex decision into independent subtasks, run them simultaneously, and aggregate the results into a final decision. The benefit is focused attention on each subtask, which can produce more thorough analysis than one call handling everything.

### Q6. What problem does chaining solve, and what is the two-step fix for a prompt with many constraints Claude keeps partially ignoring?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q58

---

**A:** Chaining addresses the long-prompt problem in which one request with many rules is only partially followed. First generate a draft; then make a focused revision request addressing only the violated constraints.

### Q7. Describe the routing workflow pattern in two steps.

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q59

---

**A:** First, a Claude call categorizes the input into a predefined category. Second, the input is forwarded to the specialized pipeline for that category.

### Q8. What is the Evaluator-Optimizer pattern?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q60

---

**A:** A producer creates output, a grader evaluates it against criteria, and feedback returns to the producer for revision until the grader accepts the result.

### Q9. What are the four primitives of managed agents, in order?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q63

---

**A:** **Agent** (persona: model, system prompt, and tools) → **Environment** (where it runs) → **Session** (one run or unit of work) → **Events** (messages flowing in and out).

### Q10. When should you reach for managed agents instead of writing your own agent loop?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q68

---

**A:** Use managed agents when the loop may run for minutes to hours, touch many tools or files, or need to survive interruptions through resumability. Use a hand-written loop for shorter, simpler work.

### Q11. In hub-and-spoke multi-agent orchestration, who manages inter-subagent communication and error handling?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `study-reference/ccaf_study_reference.md` t3

---

- A. Each subagent independently
- B. The coordinator agent
- C. A shared queue that subagents poll directly
- D. The end user

**A:** **B. The coordinator agent.** In a hub-and-spoke design, the coordinator owns routing, communication, and error handling.

### Q12. What does an `AgentDefinition` specify for a subagent?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `study-reference/ccaf_study_reference.md` t5

---

- A. Only its name
- B. Its description, system prompt, and tool restrictions
- C. The coordinator's memory files
- D. The user's billing tier

**A:** **B.** An `AgentDefinition` describes the subagent type and constrains how it operates.

### Q13. Production data shows that in 12% of cases, an agent skips `get_customer` and calls `lookup_order` using only the customer's stated name, sometimes causing incorrect refunds. What change most effectively addresses the reliability issue?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `study-reference/ccaf_study_reference.md` s1 · Customer Support Resolution Agent

---

- A. Add a programmatic prerequisite that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer ID.
- B. Enhance the system prompt to say customer verification is mandatory.
- C. Add few-shot examples showing the correct order of tool calls.
- D. Add a routing classifier that enables only the tools appropriate to each request.

**A:** **A.** A programmatic prerequisite provides deterministic ordering and prevents financially consequential mistakes. Prompt instructions and examples remain probabilistic, while routing addresses tool availability rather than ordering.

### Q14. Each subagent completes successfully, but a research report covers only visual arts and misses music, writing, and film. Logs show the coordinator decomposed the task into three visual-arts subtasks. What is the most likely root cause?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `study-reference/ccaf_study_reference.md` s7 · Multi-Agent Research System

---

- A. The synthesis agent lacks instructions for identifying coverage gaps.
- B. The coordinator's task decomposition is too narrow.
- C. The web-search agent's queries are not comprehensive enough.
- D. The document-analysis agent filters non-visual sources.

**A:** **B.** The coordinator assigned an incomplete scope; the subagents executed successfully within the narrow scope they received.

### Q15. A synthesis agent verifies simple facts in 85% of cases but delegates every verification through the coordinator, adding 40% latency. What is the most effective approach?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `study-reference/ccaf_study_reference.md` s9 · Multi-Agent Research System

---

- A. Give the synthesis agent a scoped `verify_fact` tool for simple lookups; keep complex verification delegated through the coordinator.
- B. Batch all verification requests and return them to the coordinator at the end.
- C. Give the synthesis agent every web-search tool.
- D. Have the search agent proactively cache speculative context.

**A:** **A.** A narrowly scoped tool handles the common case with least privilege, while the coordinator retains control of complex verification.

### Q16. What must a Vertex tool loop preserve on the follow-up request after Claude asks to call a tool?

**Domain:** Agentic Architecture & Orchestration  
**Source:** `05-claude-on-google-cloud/quiz.md` Q14

---

**A:** Preserve the complete assistant content, execute and validate the requested tool, send a matching result with its tool-use ID, and retain the original tool definitions.

*Memory hook:* Keep the full order ticket, return the dish with the matching table number, and leave the menu on the table.

## 2. Tool Design & MCP Integration · 11 questions

### Q17. What are the three parts of a tool definition?

**Domain:** Tool Design & MCP Integration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q10

---

**A:** `name`, `description`, and `input_schema`.

*Memory hook:* A tool needs a name tag, a sign explaining when to use it, and an intake form.

### Q18. What is the key difference between a server tool and a client tool?

**Domain:** Tool Design & MCP Integration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q15

---

**A:** Server tools such as web search and code execution run on Anthropic's side after being declared by the application, so no application-managed agent loop is needed for them. Client tools such as memory or Bash run where the application's own code runs and require the application to execute them and return results.

### Q19. Give the one-line distinction between Tools, Skills, and MCP.

**Domain:** Tool Design & MCP Integration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q19

---

**A:** **Tools** are integrations whose code you own; **Skills** are reusable processes and procedures; **MCP** is a standard way to connect to third-party services and capabilities.

### Q20. How do you restrict an MCP toolset to read-only access, such as allowing search but blocking posting?

**Domain:** Tool Design & MCP Integration  
**Source:** `03-building-with-the-claude-api/quiz.md` Q22

---

**A:** Disable everything by default with `"default_config": {"enabled": false}`, then explicitly enable only the specific read tools in `configs`.

### Q21. What core problem does MCP solve?

**Domain:** Tool Design & MCP Integration  
**Source:** `06-introduction-to-mcp/quiz.md` Q1

---

**A:** MCP standardizes how AI applications connect to external tools, data sources, and workflows, so each integration does not require a bespoke client-server protocol.

### Q22. Why use an MCP resource instead of a tool call to inject a document's contents into a prompt?

**Domain:** Tool Design & MCP Integration  
**Source:** `06-introduction-to-mcp/quiz.md` Q10

---

**A:** A resource is read-only, application-controlled context. The client can select and inject the document directly without asking the model to decide whether to invoke a tool, making it appropriate for context that the application already knows should be included.

### Q23. Who controls MCP Tools, Resources, and Prompts?

**Domain:** Tool Design & MCP Integration  
**Source:** `06-introduction-to-mcp/quiz.md` Q14

---

**A:** The **model** controls Tools, the **application** controls Resources, and the **user** controls Prompts.

*Memory hook:* **Tool = model decides; resource = app sets the table; prompt = user presses the button.**

### Q24. What makes an MCP tool definition reliable for both Claude and the client application?

**Domain:** Tool Design & MCP Integration  
**Source:** `06-introduction-to-mcp/quiz.md` Q19

---

**A:** Use a clear name and specific description that explains when the tool applies and what it returns; use typed, validated inputs; and return predictable results with meaningful errors.

### Q25. What does `isRetryable: false` on a business error tell an agent?

**Domain:** Tool Design & MCP Integration  
**Source:** `study-reference/ccaf_study_reference.md` t17

---

- A. Retry immediately with backoff.
- B. Do not retry; explain the business-rule violation instead.
- C. Escalate regardless of context.
- D. The tool is permanently broken.

**A:** **B.** A non-retryable business error is a valid outcome that another attempt will not fix; the agent should explain the rule or choose an appropriate alternative.

### Q26. What are the three essential components of a Bedrock request through the `converse` API?

**Domain:** Tool Design & MCP Integration  
**Source:** `04-claude-with-amazon-bedrock/quiz.md` Q6

---

**A:** A Bedrock Runtime Client, a Model ID, and a user message containing the input text or content.

### Q27. Production logs show an agent frequently calls `get_customer` when a user asks about an order, instead of calling `lookup_order`. Both tools have minimal descriptions and accept similar identifier formats. What is the most effective first step?

**Domain:** Tool Design & MCP Integration  
**Source:** `study-reference/ccaf_study_reference.md` s2 · Customer Support Resolution Agent

---

- A. Add few-shot examples to the system prompt.
- B. Expand each tool description with input formats, examples, edge cases, and boundaries versus similar tools.
- C. Add a routing layer that pre-selects the tool before each turn.
- D. Consolidate both tools into one `lookup_entity` tool.

**A:** **B.** Tool descriptions are the primary mechanism Claude uses for tool selection. Specific boundaries and examples are the highest-leverage first fix; routing or consolidation may be valid later but are more complex.

## 3. Claude Code Configuration & Workflows · 12 questions

### Q28. Name the four steps of the “if you take one thing away from this course” Claude Code workflow.

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q4

---

**A:** **Explore → Plan → Code → Commit.**

### Q29. Is `CLAUDE.md` enforced configuration? What is the practical consequence for file length?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q17

---

**A:** No. It is guidance, and every line competes with every other line for Claude's attention. Longer files reduce the reliability of individual rules, so keep the file lean and focused.

### Q30. Where should a genuinely hard rule, such as “never push to main,” live instead of `CLAUDE.md`, and why?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q18

---

**A:** Put it in a `PreToolUse` hook. A hook can programmatically block the action; `CLAUDE.md` is only a probabilistic instruction.

### Q31. Which instruction surface owns each of these: (a) an always-true convention, (b) a task-specific procedure, and (c) a rule that must never be skippable?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q24

---

**A:** (a) `CLAUDE.md`; (b) a Skill; (c) a hook.

*Memory hook:* **House rules, recipe card, deadbolt**—convention, procedure, enforcement.

### Q32. List all six Claude Code permission modes and one key fact about each.

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q25

---

**A:** **Manual** is read-only and asks for everything else; **Accept edits** allows reads, edits, and common Bash commands but asks for other commands; **Plan** is read-only and proposes changes without editing; **Auto** accepts actions while a classifier reviews them for danger or intent, not correctness; **Don't ask** runs only pre-approved tools and silently denies the rest, which suits unattended CI; **Bypass permissions** skips checks and should be used only inside an isolated container or VM.

### Q33. What does Auto mode's classifier check, and what does it explicitly not catch?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q26

---

**A:** It checks intent and blocks dangerous actions such as production deploys, force pushes, piping downloaded code into a shell, or exfiltrating sensitive data. It does **not** check correctness, so broken-but-safe code can pass through.

### Q34. What should you pair with Auto mode to catch correctness issues the classifier misses?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q27

---

**A:** A `Stop` hook that runs the test suite.

### Q35. How do you get structured, schema-constrained output from a headless Claude Code run?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `07-claude-code-in-action/quiz.md` Q39

---

**A:** Pair `--output-format json` with `--json-schema '<your schema>'`. The matching object is placed in `structured_output` and can be extracted with `jq`.

### Q36. You want a custom `/review` slash command available to every developer when they clone or pull the repository. Where should the command file live?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `study-reference/ccaf_study_reference.md` s4 · Code Generation with Claude Code

---

- A. In `.claude/commands/` in the project repository
- B. In `~/.claude/commands/` in each developer's home directory
- C. In the root `CLAUDE.md`
- D. In `.claude/config.json` with a commands array

**A:** **A.** Project-scoped commands in `.claude/commands/` are version-controlled and shared with everyone who clones or pulls the repository.

### Q37. You are restructuring a monolith into microservices across dozens of files with major service-boundary decisions. Which approach should you take?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `study-reference/ccaf_study_reference.md` s5 · Code Generation with Claude Code

---

- A. Enter Plan mode to explore dependencies and design the approach before changing code.
- B. Start direct execution and let implementation reveal service boundaries.
- C. Use direct execution with comprehensive instructions for every service.
- D. Start direct execution and switch to Plan mode only if complexity appears.

**A:** **A.** Plan mode is designed for large changes with architectural decisions and multiple valid approaches; it allows course correction before expensive edits.

### Q38. Test files are scattered throughout the codebase, but all tests should follow the same conventions. What is the most maintainable approach?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `study-reference/ccaf_study_reference.md` s6 · Code Generation with Claude Code

---

- A. Put a rule file in `.claude/rules/` with YAML frontmatter using a glob such as `**/*.test.tsx`.
- B. Put every convention in the root `CLAUDE.md` and rely on Claude to infer the relevant section.
- C. Create a Skill for each code type and require manual invocation.
- D. Put a separate `CLAUDE.md` in every subdirectory.

**A:** **A.** Path-scoped `.claude/rules/` files apply conventions based on file location regardless of which directory contains the test.

### Q39. A CI script runs `claude "Analyze this pull request for security issues"` and hangs waiting for interactive input. What is the correct approach?

**Domain:** Claude Code Configuration & Workflows  
**Source:** `study-reference/ccaf_study_reference.md` s10 · Claude Code for Continuous Integration

---

- A. Add the `-p` / `--print` flag.
- B. Set `CLAUDE_HEADLESS=true`.
- C. Redirect standard input from `/dev/null`.
- D. Add a `--batch` flag.

**A:** **A.** `-p` / `--print` runs Claude Code non-interactively, prints the result, and exits—appropriate for CI/CD.

## 4. Prompt Engineering & Structured Output · 12 questions

### Q40. List the six effective prompting techniques from the AI Fluency course.

**Domain:** Prompt Engineering & Structured Output  
**Source:** `01-ai-fluency-framework-foundations/quiz.md` Q6

---

**A:** Give context, show examples, specify constraints, break the task into steps, ask Claude to think first, and define the role or tone.

### Q41. What are the three elements of an effective prompt in the Claude 101 framework?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `02-claude-101/quiz.md` Q13

---

**A:** **Set the stage** with role, objective, and context; **define the task** with the action to take; and **specify rules** such as style, tone, and examples.

### Q42. What are the five steps of the prompt-engineering iteration cycle?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `03-building-with-the-claude-api/quiz.md` Q33

---

**A:** Set a goal → write an initial prompt → evaluate it → apply a technique → re-evaluate, repeating the last two steps as needed.

### Q43. What are the two types of specificity you can add to a prompt, and when should each be used?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `03-building-with-the-claude-api/quiz.md` Q35

---

**A:** **Output-quality guidelines** specify qualities such as length, structure, or tone and belong in almost every prompt. **Process steps** specify how to work and are most useful for complex or critical-thinking tasks.

### Q44. Where should you source your best few-shot examples from?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `03-building-with-the-claude-api/quiz.md` Q38

---

**A:** Use the highest-scoring outputs from a prompt-evaluation run: real input/output pairs that worked well, along with an explanation of why they are good.

### Q45. What is the difference between prompt engineering and prompt evaluation?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `03-building-with-the-claude-api/quiz.md` Q40

---

**A:** Prompt engineering is the set of techniques used to write better prompts. Prompt evaluation measures how well a prompt performs through objective or automated testing.

### Q46. List the five steps of a typical prompt-evaluation workflow.

**Domain:** Prompt Engineering & Structured Output  
**Source:** `03-building-with-the-claude-api/quiz.md` Q41

---

**A:** Draft a prompt → create an evaluation dataset → run the inputs through Claude → run outputs through a grader → change the prompt and repeat.

### Q47. What technique guarantees schema-compliant output and eliminates JSON syntax errors?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `study-reference/ccaf_study_reference.md` t45

---

- A. Ask for JSON in the prompt.
- B. Use `tool_use` with a JSON schema.
- C. Apply regular-expression post-processing.
- D. Use batch processing.

**A:** **B.** Schema-constrained `tool_use` removes JSON syntax errors, though the application must still validate semantic correctness.

### Q48. An extraction fails schema validation. What should the retry prompt include?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `study-reference/ccaf_study_reference.md` t48

---

- A. Only “try again.”
- B. The original document, the failed extraction, and the specific validation errors.
- C. A completely new document.
- D. Nothing; switch models instead.

**A:** **B.** Error-specific feedback gives Claude the context needed to repair the invalid fields rather than retrying blindly.

### Q49. How can a Vertex application constrain a response to a small machine-readable format such as JSON or CSV?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `05-claude-on-google-cloud/quiz.md` Q13

---

**A:** Use an assistant prefill together with a stop sequence for the delimiter, or use a dedicated tool schema when the production output contract is strict. Always parse and validate the result in application code.

### Q50. An agent resolves only 55% of support requests, escalating simple cases while autonomously handling complex policy exceptions. What is the most effective way to improve escalation calibration?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `study-reference/ccaf_study_reference.md` s3 · Customer Support Resolution Agent

---

- A. Add explicit escalation criteria to the system prompt with few-shot examples for when to escalate versus resolve.
- B. Ask the agent for a self-reported confidence score and escalate below a threshold.
- C. Deploy a separate classifier trained on historical tickets.
- D. Use sentiment analysis and escalate negative sentiment.

**A:** **A.** Explicit criteria and examples directly clarify the decision boundary. Self-reported confidence and sentiment are unreliable proxies, while a separate classifier is premature before the prompt boundary is fixed.

### Q51. A manager proposes using the Message Batches API for both a blocking pre-merge check and an overnight technical-debt report because it saves 50% on cost. How should you evaluate the proposal?

**Domain:** Prompt Engineering & Structured Output  
**Source:** `study-reference/ccaf_study_reference.md` s11 · Claude Code for Continuous Integration

---

- A. Use batch processing for the overnight report only; keep real-time calls for pre-merge checks.
- B. Use batch processing for both and poll for completion.
- C. Keep real-time calls for both to avoid result-ordering issues.
- D. Use batch processing for both with a real-time fallback.

**A:** **A.** Batches can take up to 24 hours with no latency SLA, so they fit asynchronous reports but not a blocking pre-merge gate.

## 5. Context Management & Reliability · 9 questions

### Q52. Name Anthropic's four context-management patterns.

**Domain:** Context Management & Reliability  
**Source:** `03-building-with-the-claude-api/quiz.md` Q24

---

**A:** Just-in-time context, server-side compaction, prompt caching, and the memory tool.

### Q53. How do you enable server-side compaction in an API request, and what does it do?

**Domain:** Context Management & Reliability  
**Source:** `03-building-with-the-claude-api/quiz.md` Q26

---

**A:** Add `context_management: {"edits": [{"type": "compact"}]}`. The API summarizes older turns into a single block once input crosses a trigger threshold, so the application does not need to track conversation length manually.

### Q54. What two parts of a typical request are the best candidates for prompt caching, and why?

**Domain:** Context Management & Reliability  
**Source:** `03-building-with-the-claude-api/quiz.md` Q30

---

**A:** The system prompt and tool definitions, because they tend to remain stable across requests while the user message changes.

### Q55. What problem does RAG solve, and how does it solve it at a high level?

**Domain:** Context Management & Reliability  
**Source:** `03-building-with-the-claude-api/quiz.md` Q47

---

**A:** RAG handles documents that are too large to fit in one prompt by chunking and indexing them, then retrieving only the chunks relevant to the user's question at query time.

### Q56. Why might a synthesis agent miss a key finding buried in the middle of a long aggregated input?

**Domain:** Context Management & Reliability  
**Source:** `study-reference/ccaf_study_reference.md` t54

---

- A. The finding was formatted incorrectly.
- B. The “lost in the middle” effect causes models to attend less to information buried in long inputs.
- C. The finding used the wrong JSON schema.
- D. Batch processing dropped it.

**A:** **B.** Models tend to process information at the beginning and end of long inputs more reliably than material in the middle.

### Q57. How do you prevent numeric details from being lost during progressive summarization?

**Domain:** Context Management & Reliability  
**Source:** `study-reference/ccaf_study_reference.md` t55

---

- A. Summarize more aggressively.
- B. Extract the details into a persistent “case facts” block included in every prompt.
- C. Remove the details from context entirely.
- D. Store them only in the final message.

**A:** **B.** Keep important transactional facts—such as amounts, dates, and order numbers—in a persistent block outside summarized history.

### Q58. How do you decide which individual extracted fields need human review?

**Domain:** Context Management & Reliability  
**Source:** `study-reference/ccaf_study_reference.md` t62

---

- A. Route the whole document based on one overall score.
- B. Use field-level confidence scores calibrated with labeled validation data.
- C. Always require 100% human review.
- D. Never review anything above 90% aggregate accuracy.

**A:** **B.** Calibrated field-level confidence allows low-confidence fields to be routed for review without sending every field or document to a human.

### Q59. A web-search subagent times out while researching a complex topic. Which error-propagation approach best enables intelligent coordinator recovery?

**Domain:** Context Management & Reliability  
**Source:** `study-reference/ccaf_study_reference.md` s8 · Multi-Agent Research System

---

- A. Return structured error context containing the failure type, attempted query, partial results, and alternatives.
- B. Retry internally and return only “search unavailable” after retries are exhausted.
- C. Return an empty result set marked as successful.
- D. Propagate the exception to a top-level handler that terminates the workflow.

**A:** **A.** Structured context gives the coordinator enough information to choose a recovery path; generic failure, false success, or workflow termination discards useful information.

### Q60. A pull request modifies 14 files. A single-pass review gives detailed feedback for some files, superficial feedback for others, and contradictory feedback on identical patterns. How should the review be restructured?

**Domain:** Context Management & Reliability  
**Source:** `study-reference/ccaf_study_reference.md` s12 · Claude Code for Continuous Integration

---

- A. Run focused per-file analyses, then a separate cross-file integration pass.
- B. Require developers to split the PR into 3–4-file submissions.
- C. Use a larger-context model and keep the one-pass review.
- D. Run three full-PR reviews and keep only findings repeated twice.

**A:** **A.** Separate local analysis from cross-file synthesis reduces attention dilution while preserving an integration pass for data-flow and interaction issues.
