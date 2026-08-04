# 02 · Claude 101 — Quiz

### Q1. What training approach guides Claude to be helpful, harmless, and honest?
---
**A:** Constitutional AI.

### Q2. What protocol powers Claude's connectors, and what analogy does Anthropic use to describe it?
---
**A:** Model Context Protocol (MCP) — described as "USB-C for AI," a universal standard letting Claude connect to many applications through one consistent interface.

### Q3. Name the three "shapes of work" in the Claude desktop app and which tab each lives in.
---
**A:** Turn-by-turn work → Chat. Handing work off (multi-step, deliverable, scheduled) → Cowork. Building software → the Code tab.

### Q4. What happens to a Claude Project's knowledge base when it approaches the context window limit?
---
**A:** Claude switches from loading everything into context to using RAG (Retrieval Augmented Generation) — searching the knowledge base and pulling in only relevant parts, expanding effective capacity up to 10x.

### Q5. What's the key distinction between Projects and Skills?
---
**A:** Projects store knowledge Claude references (the "what"); Skills define a process/procedure Claude executes (the "how"). A skill can pull from knowledge stored in a project.

### Q6. Which file types are created via a separate "file creation" capability (Skills) rather than as Artifacts?
---
**A:** Word documents, Excel spreadsheets, PowerPoint presentations, and PDFs.

### Q7. What are the two types of connectors, and what's the difference?
---
**A:** Web connectors (link to cloud services like Google Drive/Slack/Notion) and desktop extensions (run locally via the Claude Desktop app, access local files/native apps).

### Q8. What two things does an admin need to connect when setting up Enterprise Search for an org?
---
**A:** A Documents connector (e.g., Google Drive or SharePoint) and a Chat connector (e.g., Slack or Microsoft Teams) are required; Email is recommended but optional.

### Q9. How does Claude's "Research" feature differ from a quick web search?
---
**A:** Research is agentic and multi-step: it plans using Thinking, runs many searches that build on each other (sometimes across hundreds of sources), synthesizes findings, and provides citations — taking minutes rather than seconds.

### Q10. What must be enabled for Research to function?
---
**A:** Web search must be enabled.

### Q11. In Cowork, what's the concrete difference between local folder access and Chat's file handling?
---
**A:** Cowork can read a folder's contents and save finished work back into that same folder; Chat can read what you upload but returns finished files only as downloads.

### Q12. What criteria make Claude auto-create an Artifact?
---
**A:** Content that's significant/self-contained (typically over 15 lines), likely to be edited/iterated/reused, complex enough to stand alone without the conversation, or something you'd reference/use later.

### Q13. What are the three elements of an effective prompt per Claude 101's framework?
---
**A:** Setting the stage (role/objective/context), defining the task (the action to take), specifying rules (style/tone/examples).

### Q14. A user complains Claude's response ignored their formatting preference even though they described it. What's the recommended fix?
---
**A:** Show, don't just tell — provide an example of the format or describe the structure explicitly (e.g., "use bullet points with bold headers for each section").

### Q15. What's the difference between "Memory" and "Styles" in Claude.ai personalization?
---
**A:** Memory automatically saves context (role, preferences, past decisions) across conversations. Styles let you set how Claude communicates (tone/format), either from presets or a custom description, applied across all conversations.

### Q16. Describe the lightweight eval approach for testing whether Claude is a good fit for a recurring task.
---
**A:** Gather 5–10 examples of the task you already do, write test prompts with natural context, run them and compare Claude's output to your originals (key info? right tone? gaps?), then refine your prompt/add examples based on findings.

### Q17. Why might Claude give a confidently wrong answer, and what's the mitigation?
---
**A:** Claude can generate plausible but incorrect information on specific/niche facts. Mitigate by verifying independently for high-stakes work, asking for sources/confidence level, and enabling web search to ground responses.

### Q18. What's a faster way to refine a message than sending a new follow-up?
---
**A:** Click the pencil icon on your own message to edit and resubmit it in place.
