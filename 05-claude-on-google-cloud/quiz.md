# 05 · Claude on Google Cloud — Quiz

### Q1. Why should you never call Vertex AI directly from client-side code?
---
**A:** API credentials must stay secret; exposing them in client-side code makes them visible to anyone. Always route requests through your own server, which acts as a secure intermediary.
*Memory hook:* Never tape the vault key to the storefront window; let your server be the locked back office.

### Q2. Walk through the four internal stages Claude uses to generate text, as taught in this course.
---
**A:** Tokenization (break input into tokens) → Embedding (each token becomes a numeric vector) → Contextualization (embeddings adjusted based on neighboring context to resolve meaning) → Generation (produces next-token probabilities, mixes probability with randomness, repeats).
*Memory hook:* A factory **cuts letters into tiles**, **maps them**, **checks neighboring tiles**, then **builds the next word**.

### Q3. Name the three conditions that stop Claude's text generation.
---
**A:** Max tokens reached, a natural end-of-sequence token, or a predefined stop sequence.
*Memory hook:* Three stop signs can end the parade: **out of budget**, **natural finish**, or **your red stop ribbon**.

### Q4. What are the four setup steps for Vertex AI access before making your first request?
---
**A:** (1) Enable the Anthropic model in Vertex AI's Model Garden. (2) Install the gcloud CLI. (3) `gcloud init` / `gcloud auth login`. (4) `gcloud config set project YOUR_PROJECT_ID` and `gcloud auth application-default login`.
*Memory hook:* Open the model shop, get the gcloud toolkit, sign in, then point the compass at your project and mint the app credential.

### Q5. How does the Anthropic SDK pick up your Vertex credentials — do you manually pass an API key?
---
**A:** No — the SDK automatically uses the `gcloud auth application-default login` credentials tied to your GCP project; no manual API key wiring needed.
*Memory hook:* Once you stamp the Google Cloud passport, the SDK finds it in your pocket instead of asking you to tape a key onto every request.

### Q6. What client class do you use to call Claude via Vertex, and what two parameters does it require?
---
**A:** `AnthropicVertex(region=..., project_id=...)`.
*Memory hook:* The Vertex client needs two coordinates on its map: **which region** and **which project**.

### Q7. How does Vertex's model naming convention differ from the direct Anthropic API's?
---
**A:** Vertex model names include an `@` version suffix, e.g. `claude-sonnet-4@20250514`, vs. a plain model name string on the direct API.
*Memory hook:* Vertex gives the model a dated passport stamp after the `@`; the direct API travels with just the model name.

### Q8. Is `max_tokens` a target Claude tries to hit, or a ceiling?
---
**A:** A ceiling/budget — Claude stops whenever it judges the response complete, but will never exceed the max_tokens limit.
*Memory hook:* `max_tokens` is the theater's fire-code occupancy limit, not a promise that every seat will be filled.

### Q9. How does the `AnthropicVertex` client's call shape (`.messages.create(model, max_tokens, messages)`) compare to Bedrock's `.converse()` call?
---
**A:** Vertex's call shape closely mirrors the direct Anthropic API (`messages.create`), while Bedrock uses a differently-structured `converse(modelId=..., messages=[...])` call — Vertex is the more API-similar of the two cloud deployment options.
*Memory hook:* Vertex speaks the familiar `messages.create` dialect; Bedrock arrives wearing the different `converse` uniform.

### Q10. Across Vertex, Bedrock, and the direct Anthropic API, what stays constant and what changes?
---
**A:** What changes: authentication method, client class, exact call shape, and model-ID format. What stays constant: prompt engineering technique, tool schema design, RAG strategy, evaluation methodology, and agentic orchestration patterns — the "thinking layer" is identical everywhere.
*Memory hook:* Change the airport, passport, and boarding gate—but the pilot's checklist and navigation principles stay the same.

### Q11. How does the Anthropic Vertex SDK obtain credentials, and what command establishes them?
---
**A:** It uses Google Cloud application-default credentials rather than an Anthropic API key; `gcloud auth application-default login` establishes the credentials that the SDK picks up automatically.
*Memory hook:* `application-default login` is the one-time passport stamp; after that, the SDK recognizes the traveler automatically.

### Q12. What does a Vertex response contain, and why should the application inspect its stop reason?
---
**A:** It contains the generated message, usage information, and a stop reason. The stop reason distinguishes a natural completion from reaching the token budget or a configured stop sequence, which can affect logging and retry behavior.
*Memory hook:* Read the response like a flight board: **what arrived**, **how much fuel it used**, and **why it landed**.

### Q13. How can a Vertex application constrain a response to a small machine-readable format such as JSON or CSV?
---
**A:** Use an assistant prefill together with a stop sequence for the delimiter, or use a dedicated tool schema when the production output contract is strict; always parse and validate the result in application code.
*Memory hook:* Start the JSON parade behind its fence, stop it at the closing gate, and still count every float before letting it through.

### Q14. What must a Vertex tool loop preserve on the follow-up request after Claude asks to call a tool?
---
**A:** Preserve the complete assistant content, execute and validate the requested tool, send a matching result with its tool-use ID, and retain the original tool definitions.
*Memory hook:* Keep the full order ticket, cook the requested dish, return it with the matching table number, and leave the menu on the table.

### Q15. How can you tell whether a wrong RAG answer came from retrieval or generation?
---
**A:** Evaluate retrieval separately from generation: check whether the needed chunk was retrieved, whether Claude interpreted the supplied context correctly, and whether it synthesized the answer accurately.
*Memory hook:* Debug the three doors: **did the librarian fetch the right page, did Claude read it right, and did it tell the story right?**

## Model Selection & Core Mechanics

### Q16. What's the selection framework for choosing among Opus, Sonnet, and Haiku, and why do teams often mix models within one application?
---
**A:** Match model to priority: Opus for intelligence and deep multi-step reasoning (higher cost/latency, can work independently for hours), Haiku for speed and cost-efficient real-time or high-volume work (no reasoning capability), Sonnet for balanced coding-strong general use (the sweet spot for most cases). Teams commonly combine them in one app — e.g., Haiku for fast user-facing chat turns, Sonnet for core business logic, Opus for the hardest reasoning steps — rather than picking one model for everything.
*Memory hook:* Think of a kitchen: Haiku is the fry cook (fast orders), Sonnet is the line chef (reliable everyday dishes), Opus is the head chef called in for the tasting-menu showstopper.

## Conversations, System Prompts & Output Control

### Q17. Why does a naive follow-up request to Claude produce irrelevant answers, and what must the application do to fix it?
---
**A:** The Anthropic API is stateless — it stores no messages between requests. Each call has zero memory of prior exchanges. To maintain context, the application must manually keep the full messages list (alternating user/assistant entries) and resend the entire conversation history with every new request.
*Memory hook:* Claude has amnesia between every phone call — you must read it the whole transcript from the start each time you call back.

### Q18. What's the one hard technical rule about the `system` parameter, and what's the recommended implementation practice?
---
**A:** `system` cannot be passed as `None` — it must be conditionally included in the API call only when a system prompt actually exists. Best practice is to make system prompts configurable (not hard-coded) so the same calling code can be reused across use cases.
*Memory hook:* You can't hand the maître d' a blank instruction card — either give real instructions or don't hand over a card at all.

### Q19. Besides forcing clean structured output, what's the broader use of assistant-message prefilling, and how does it differ in purpose from a stop sequence?
---
**A:** Prefilling lets you steer the *content/stance* of Claude's response by manually writing the start of the assistant message (e.g., prefilling "coffee is better because" forces Claude to argue for coffee) — Claude treats the prefill as its own prior text and continues from there. Stop sequences instead control response *length/format* by halting generation the instant a trigger string appears. Prefill shapes direction; stop sequences shape termination.
*Memory hook:* Prefill is putting words in the actor's mouth to set the scene; a stop sequence is yelling "cut!" the moment the scene's over.

### Q20. When a stop sequence is triggered, does the matched trigger text appear in Claude's returned output?
---
**A:** No — the stop sequence text itself is excluded from the final output; generation halts immediately upon producing it, and the returned content ends right before it.
*Memory hook:* The stop sequence is a tripwire, not a finish-line banner — Claude stops the instant it touches the wire, and the wire itself never makes it into the photo.

## Temperature & Streaming

### Q21. What does temperature=0 actually guarantee, and what's the parameter's default value?
---
**A:** Temperature 0 makes generation deterministic — Claude always selects the highest-probability token at each step. The parameter defaults to 1.0 (favoring creativity/variation) if not explicitly set.
*Memory hook:* Dial temperature to 0 and Claude always orders the same "safest" dish off the menu; leave the dial untouched at 1.0 and it's more willing to try the daily special.

### Q22. When should you reach for low vs. high temperature?
---
**A:** Low temperature (near 0) for data extraction, factual tasks, and anything needing consistent/repeatable outputs. High temperature (near 1) for creative writing, brainstorming, jokes, and marketing copy where variation is desirable.
*Memory hook:* Tax forms want temperature near 0; open-mic night wants temperature near 1.

### Q23. List the six streaming event types Claude emits, and which one actually carries the visible text.
---
**A:** message_start, content_block_start, content_block_delta (this one carries the actual text chunks), content_block_stop, message_delta, message_stop.
*Memory hook:* A play has an opening curtain, scene-starts, the actual dialogue (delta), scene-ends, a delta note, and a closing curtain — only the dialogue line is what the audience actually reads.

### Q24. What are the two ways to consume a streaming response, and what does `get_final_message()` do?
---
**A:** (1) Basic streaming: `client.messages.create(..., stream=True)` returns a raw iterator of events you must parse yourself. (2) Text-focused streaming: `client.messages.stream()` used as a context manager exposes `stream.text_stream` for clean text-chunk access. `get_final_message()` collects all the streamed chunks back into one complete message object, useful for saving the full response to a database once streaming finishes.
*Memory hook:* One route hands you the raw firehose of drops; the other hands you a filtered tap plus a bucket (`get_final_message`) to catch everything that came through.

## Prompt Evaluation & Grading

### Q25. What are the three paths an engineer can take after writing a prompt, and which two are considered traps?
---
**A:** (1) Test once or twice and ship straight to production, (2) test with a few custom inputs and make minor tweaks for corner cases, (3) run the prompt through a full evaluation pipeline for objective scoring. Paths 1 and 2 are traps — most engineers under-test prompts before production; only path 3 (systematic evaluation) is recommended.
*Memory hook:* "It worked on my two examples" is the classic last words before a prompt faceplants in production — only the eval pipeline actually proves it.

### Q26. Walk through the 5-step typical eval workflow.
---
**A:** (1) Write an initial prompt draft with input variables, (2) build an evaluation dataset (minimum ~3 test inputs, hundreds/thousands in real use, hand-crafted or AI-generated), (3) run each dataset input through the prompt template and send to Claude, (4) grade each output on a 1-10 scale and average all scores, (5) iterate on the prompt based on results and repeat, comparing scores across versions.
*Memory hook:* Draft, dataset, drive it through Claude, grade like a teacher, then rewrite and resubmit — rinse and repeat until the report card improves.

### Q27. What are the three grader types, and what's the key gotcha about using an LLM as a model grader?
---
**A:** Code graders (programmatic checks like syntax/length/keyword presence), model graders (an extra API call asking an LLM to judge quality/completeness), and human graders (flexible but slow/expensive). Gotcha: without a prompt that explicitly requires stating strengths/weaknesses/reasoning, model graders default to middling scores around 6 — demanding reasoning first forces a more discriminating score.
*Memory hook:* A model grader asked "just give a number" shrugs and writes "6/10" every time; ask it to show its work first and it actually grades like a teacher, not a shrug emoji.

### Q28. How does code-based grading validate that Claude's output is "just code" with no extra commentary, and how is the final score computed when combined with a model grader?
---
**A:** It attempts to parse/compile the output using the appropriate validator for the expected format — `validate_json()` tries JSON parsing, `validate_python()` tries AST parsing, `validate_regex()` tries regex compilation — returning 10 if it parses cleanly and 0 if it throws an error. A dispatcher (`grade_syntax`) picks the right validator based on a "format" field on the test case. The final score merges the two signals by averaging: `(model_score + syntax_score) / 2`.
*Memory hook:* One judge checks "does the engine even start" (try/except parsing = pass/fail), the other judges "how well does it drive" (model quality score) — average the two scorecards for the final grade.

## Prompt Engineering Techniques

### Q29. What's the "Being Clear and Direct" technique, and what score improvement did the course example show from applying it?
---
**A:** Focus on the prompt's first line — open with an action verb (write, generate, create, identify, analyze) plus simple, direct language stating exactly the task and expected output format/content, instead of a vague opening. The course example jumped from a 2.32 to a 3.92 evaluation score just from tightening the first line.
*Memory hook:* Don't bury the lede — lead with the command, not a preamble, and watch the grade nearly double.

### Q30. Distinguish "Type A" and "Type B" guidelines in the "Being Specific" technique, and when should each be used?
---
**A:** Type A guidelines control output *attributes* (length, structure, qualities) and should almost always be included. Type B guidelines give the model *steps to follow*, forcing it to consider specific elements and improving reasoning quality — reserve these for complex problems requiring broader consideration of viewpoints or data beyond the model's natural scope. The course example showed adding guidelines lifted the score from 3.92 to 7.86.
*Memory hook:* Type A is telling the chef "plate it on a white dish, three items only" (attributes); Type B is handing the chef a numbered recipe card (steps) — combine both for the fanciest dishes.

### Q31. What's the purpose of wrapping content in XML tags within a prompt, and what's the naming best practice?
---
**A:** XML tags help the model distinguish between different types of interpolated content when large chunks of text are inserted into a prompt (e.g., `<sales_records>...</sales_records>`), reducing ambiguity about what each block represents and improving comprehension — especially helpful for simpler models. Best practice: use specific, descriptive tag names (e.g., "sales_records" rather than generic "data" or "records").
*Memory hook:* Label the moving boxes "kitchen" and "bedroom," not just "stuff" — Claude unpacks faster when it knows what's inside each box.

### Q32. What's the difference between one-shot and multi-shot prompting, and when is multi-shot specifically recommended?
---
**A:** One-shot = a single example embedded in the prompt (wrapped in XML tags showing sample input plus ideal output); multi-shot = multiple such examples. Multi-shot is specifically recommended for handling corner cases and edge cases — e.g., sarcasm detection — where extra context on tricky scenarios helps the model generalize correctly.
*Memory hook:* One flashcard teaches the rule; a whole deck of flashcards teaches the exceptions to the rule.

## Tool Use Fundamentals

### Q33. Why does Claude need "tool use" at all, and what's the 5-step flow from user question to final answer?
---
**A:** Claude's knowledge is frozen at training time — it has no access to real-time or current information on its own. Flow: (1) Claude gets the user's request plus instructions on available external data access, (2) Claude decides external data is needed and requests specific info, (3) the server runs code to fetch that data from an external source, (4) the server sends a follow-up request to Claude including the retrieved data, (5) Claude generates its final response using the original prompt plus the fetched data.
*Memory hook:* Claude is a brilliant expert stuck in a room with no windows — tool use is the intern who runs outside, checks the weather, and reports back before Claude answers.

### Q34. What are the tool-function best practices for input validation, and why does clear error messaging matter specifically for Claude, not just for developers?
---
**A:** Use descriptive function/argument names, validate inputs and raise errors for invalid data, and include meaningful error messages. This matters because Claude itself sees the exact error text when a tool call fails and can use it to retry with corrected parameters — e.g., an error like "location cannot be empty" lets Claude self-correct on the next attempt.
*Memory hook:* A vague crash log helps no one; a clear error message is a note Claude can actually read and act on to fix its own mistake.

### Q35. What three fields make up a tool schema, and what's the best-practice guidance on the description field length?
---
**A:** `name` (the tool function's name), `description` (explaining what the tool does, when to use it, and what data it returns), and `input_schema` (the actual JSON Schema describing the function's arguments, with type and description for each parameter). Best practice: write 3-4 sentence descriptions for both the tool itself and its individual arguments so Claude fully understands purpose and usage.
*Memory hook:* A tool schema is a job posting — give it a name, a solid job description (not one cryptic line), and a clear list of required qualifications (arguments).

### Q36. What three fields make up a tool_result block, and what is the tool_use_id used for?
---
**A:** `tool_use_id` (must match the ID from the original tool_use block so Claude can correlate which result answers which request), `content` (the tool function's output, converted to a string), and `is_error` (false by default, set true if the tool execution failed). The ID matching matters most when Claude makes several tool calls at once — each needs its own matched result.
*Memory hook:* Each tool call gets a claim ticket (tool_use_id); when you return the result, you staple it to the matching ticket stub so nothing gets handed back to the wrong customer.

### Q37. What stop_reason value signals that Claude wants to call a tool, and how does the "run conversation" loop use it?
---
**A:** `stop_reason == "tool_use"`. The loop calls Claude, appends its response to history, checks stop_reason — if it's not "tool_use" the loop breaks and returns the final answer; if it is "tool_use," the loop executes the requested tool(s), appends the results as a user message, and calls Claude again, repeating until stop_reason is no longer "tool_use."
*Memory hook:* "tool_use" is Claude raising its hand mid-lecture — the loop keeps calling on it until it stops raising its hand and just answers.

## Built-in Tools & Structured Output via Tools

### Q38. What problem does the "batch tool" workaround solve, and how much does it reduce request round-trips?
---
**A:** Claude can technically emit multiple tool_use blocks in one message but rarely does in practice — instead it tends to send separate sequential single-tool-use messages, burning extra request rounds. The batch tool is an abstraction Claude calls instead of individual tools: it takes an "invocations" list (each naming a tool plus arguments), the server runs them all and returns one combined result. This "tricks" Claude into effectively parallel execution, cutting request rounds from N+1 down to just 2 (initial request + batch response).
*Memory hook:* Instead of Claude placing a dozen separate takeout orders one call at a time, you hand it one combo-meal menu (batch tool) and it orders everything in one shot.

### Q39. Besides prefill plus stop sequence, what's the alternative method for extracting reliable structured JSON from Claude, and what parameter forces it?
---
**A:** Use tools: define a JSON schema whose *inputs* match your desired output structure, then force Claude to call that specific tool via `tool_choice = {"type": "tool", "name": "tool_name"}`. Claude responds with a tool_use block containing the structured arguments (accessed via `response.content[0].input`) — no tool_result round-trip is needed since you just want the arguments, not a function to actually run. It's more reliable than prefill/stop-sequence but requires more setup.
*Memory hook:* Instead of asking Claude to write you a form and hoping it stays inside the lines, you hand it an actual fillable PDF form (the tool schema) and force it to fill in only the boxes.

### Q40. What's unique about the Text Editor tool compared to other tools Claude supports?
---
**A:** It's the only tool where Claude has a *built-in JSON schema* but no built-in implementation — developers must still write the actual tool function (a class with methods like view, string_replace, create_file) to handle Claude's requests. The schema stub differs by model version (Claude 3.7 vs 3.5 use different date-format stubs) and auto-expands to the full schema.
*Memory hook:* Anthropic hands you the tool's instruction manual for free, but you still have to build the tool yourself.

### Q41. How is the Web Search tool configured, and what does `max_uses` actually limit?
---
**A:** Minimal schema: `type="web_search_20250305"`, `name="web_search"`, `max_uses=5` (or similar) — no custom implementation needed, Claude runs the search itself. `max_uses` caps the total number of *searches* performed, not results returned (a single search can still return multiple results). `allowed_domains` can restrict searches to specific trusted sites (e.g., NIH.gov for medical content) to improve result quality. Response includes text blocks, server tool-use blocks (the search queries), web-search-result blocks (title/URL), and citation blocks.
*Memory hook:* max_uses is a punch card for how many times Claude can swipe out to the library, not how many books it's allowed to bring back each trip.

## RAG Techniques

### Q42. Why not just paste an entire large document into the prompt instead of using RAG?
---
**A:** Feeding a whole 100-1000 page document into the prompt runs into token limits, decreased model effectiveness with very long prompts, higher cost, and slower processing. RAG instead chunks the document and retrieves only the most relevant pieces for a given question, keeping prompts small, focused, fast, and cheap — at the cost of added preprocessing complexity and the need for a relevance-search mechanism.
*Memory hook:* Don't hand Claude the entire phone book to find one number — hand it just the relevant page.

### Q43. Name the three text-chunking strategies for RAG, and which one is the recommended default despite being suboptimal?
---
**A:** Size-based (equal-length chunks — easiest, most common in production, but can cut off mid-sentence), structure-based (split by headers/paragraphs/sections — works well on formatted docs, fails on plain text/PDFs), and semantic-based (NLP groups related sentences — most advanced, most complex). Default recommendation: chunk by character/size, since it's the most reliable across arbitrary document types even though results are suboptimal.
*Memory hook:* When in doubt, just cut the loaf into equal slices — it's not the fanciest bread-cutting method, but it works on every loaf you're handed.

### Q44. What problem does chunk "overlap" solve, and what's its trade-off?
---
**A:** Size-based chunking can cut sentences/context off mid-thought at chunk boundaries. Overlap fixes this by including some characters from the neighboring chunk on each side, preserving context across the cut. Trade-off: it creates text duplication across chunks (more storage/redundant content) in exchange for better chunk-level meaning.
*Memory hook:* Overlap is leaving the last page of one chapter taped to the front of the next, so nobody loses the thread mid-sentence — at the cost of printing that page twice.

### Q45. What does a text embedding actually represent, and what specific embedding model was named as available on Vertex AI?
---
**A:** An embedding model outputs a long list of numbers (each roughly -1 to +1) representing the meaning of the input text — each number is conceptually a score on some semantic "feature," though we don't know precisely what each dimension encodes. Google's **text-embedding-005** was named as the specific embedding model available on Vertex AI for generating these vectors.
*Memory hook:* An embedding is a fingerprint of meaning — you can't read what each ridge means individually, but two similar fingerprints mean two similar ideas.

### Q46. Define cosine similarity and cosine distance, including their value ranges, and where "normalization" fits into the RAG pipeline.
---
**A:** Cosine similarity = the cosine of the angle between two vectors, ranging -1 to 1, where 1 means very similar and -1 means very different. Cosine distance = 1 minus cosine similarity, so values near 0 mean high similarity and larger values mean less similarity. Normalization (scaling embedding vectors to unit length/magnitude 1.0) happens as a preprocessing step right after embedding generation, before the vectors are stored in the vector database — typically handled automatically by the embedding API.
*Memory hook:* Cosine similarity asks "how narrow is the angle between these two arrows" — a near-zero angle (similarity ~1) means they're pointing almost the same direction; distance is just that similarity flipped upside down.

### Q47. What problem does BM25 solve that pure semantic (embedding) search can miss, and how does it weight terms?
---
**A:** Semantic search alone can return results that are conceptually "nearby" but miss exact identifiers or specific terms — e.g., searching "incident 2023 Q4 011" might also surface an unrelated financial section that never mentions the incident. BM25 (Best Match 25) is a lexical/keyword search algorithm: it tokenizes the query, counts term frequency across chunks, and assigns higher importance weight to rare/specific terms (like "incident 2023") while down-weighting common words (like "a") — so it prioritizes chunks with exact, specific term matches that semantic search might dilute.
*Memory hook:* Semantic search finds the neighborhood; BM25 finds the exact street address by weighting rare words like "011" far more than common filler like "the."

### Q48. What is Reciprocal Rank Fusion, and how does it combine results from multiple search indexes (e.g., vector + BM25)?
---
**A:** RRF merges ranked result lists from different search methods into one combined ranking. For each document, its score is the sum of `1/(1+rank)` across every method it appears in (e.g., rank 1 in one list, rank 2 in another). Documents are then sorted by this combined score — a doc ranking highly in multiple methods beats one that only ranks moderately in a single method.
*Memory hook:* RRF is like combining two leaderboards by rewarding whoever placed near the top on *either* board, not just whichever board you glanced at first.

### Q49. In the reranking step, why does the implementation pass document IDs to Claude instead of full chunk text, and what's reranking's main trade-off?
---
**A:** Using random/assigned document IDs (instead of the full text) is more efficient — Claude just returns an ordered list of IDs, and the application looks up the corresponding text afterward, avoiding the cost of having Claude repeat full chunk content in its response. Trade-off: reranking increases retrieval accuracy but adds latency because it requires an extra LLM call on top of the initial hybrid retrieval.
*Memory hook:* Ask the sommelier to just call out bottle numbers in order of preference, not read the whole label aloud each time — you already have the labels on file.

### Q50. What problem does "contextual retrieval" solve, and how does it handle documents too large to fit in a single prompt?
---
**A:** Chunking strips a piece of text from its surrounding document context, which can hurt retrieval accuracy (a chunk read in isolation loses meaning it had within the whole doc). Contextual retrieval fixes this by using an LLM to generate a brief description situating each chunk within the larger document *before* it's embedded/indexed, then prepending that generated context to the original chunk. For documents too large for one prompt, it uses selective context: include the first 1-3 "starter" chunks (for overall summary/abstract) plus the chunks immediately preceding the target chunk (for local context), skipping less-relevant middle chunks.
*Memory hook:* A puzzle piece means little on its own — contextual retrieval staples a mini "this piece goes here" note to the back of each piece before you file it away.

## Extended Thinking, Multimodal & Citations

### Q51. What are the two hard numeric/technical rules for using Extended Thinking, and when does the course recommend enabling it?
---
**A:** (1) Minimum thinking budget is 1024 tokens. (2) `max_tokens` must exceed `thinking_budget`, with a significant buffer recommended so there's still room for the actual response after thinking. The course recommends running prompt evals first and only enabling extended thinking when accuracy remains insufficient after prompt-optimization efforts — since it adds real cost and latency (you're billed for thinking tokens too).
*Memory hook:* Extended thinking is a toll road — there's a minimum toll (1024 tokens) and you'd better have budgeted enough gas (max_tokens) to actually finish the trip after paying it, and you only take this road when the free route wasn't good enough.

### Q52. What is a "redacted thinking block," and what security mechanism protects normal thinking blocks from tampering?
---
**A:** A redacted thinking block occurs when Claude's internal thinking text gets flagged by safety systems — the content is still provided, but in encrypted form, preserving conversational context without exposing the flagged reasoning. (A special test string can force one for testing purposes.) Separately, every normal thinking block carries a cryptographic signature that Claude checks to verify the thinking text hasn't been modified before reusing it later in the conversation.
*Memory hook:* Normal thinking blocks get a wax-seal signature to prove nobody tampered with them; flagged ones get blacked out like a redacted government memo instead of being shown in the clear.

### Q53. How many images can Claude analyze in a single request, what determines their token cost, and what's the "key takeaway" about accuracy?
---
**A:** Up to 100 images per request. Token cost is based on the image's pixel dimensions (height x width), via a specific cost equation. The key takeaway: image-analysis accuracy depends almost entirely on prompt-engineering quality (step-by-step instructions, one/multi-shot examples), not on image clarity alone — simple prompts typically fail even on clear images.
*Memory hook:* Handing Claude a crystal-clear photo with a lazy prompt is like handing a detective a perfect crime-scene photo but no case file — the picture alone doesn't solve it.

### Q54. How does implementing PDF support differ from implementing image support in the API call?
---
**A:** Almost nothing changes — swap the block's file type from "image" to "document", the media type from something like "image/png" to "application/pdf", and rename the variable (e.g., file_bytes instead of image_bytes). Claude can then extract text, images, charts, and tables directly from the PDF content.
*Memory hook:* PDFs ride the exact same bus as images — just change the destination label on the ticket.

### Q55. What are the two citation types Claude supports, and what location data does each include?
---
**A:** Citation page location (for PDF documents): cited text plus document index, document title, and start/end page numbers. Citation char location (for plain text sources): cited text plus character position within the text block. Both require adding a `citations: {enabled: true}` field alongside the source document in the request; the response then returns text blocks with citation arrays pointing back to the exact supporting source location.
*Memory hook:* A PDF citation is a page number in a book; a plain-text citation is a highlighted character range on an index card — same idea, different ruler.

## Prompt Caching

### Q56. What's the single strict requirement for cached content to actually be reused, and how long does a cache last?
---
**A:** The input text must be *exactly identical* to the previously cached content, up to and including the cache breakpoint — any change invalidates the cache and forces a fresh cache_creation. Cache duration is 5 minutes (temporary storage).
*Memory hook:* The cache is a wet-signature match — one character off and the teller refuses to honor it; and it self-shreds after 5 minutes regardless.

### Q57. Is prompt caching enabled by default, and what format change does a text block need to support a cache breakpoint?
---
**A:** No — caching requires a manual cache breakpoint set in the message blocks; it's off by default. To add a breakpoint, a text block must use the longhand object format `{type: "text", text: "content", cache_control: {...}}` instead of the plain shorthand string assignment.
*Memory hook:* You can't just whisper "cache this" — you have to fill out the longhand form with a `cache_control` field stapled to it, or nothing gets cached.

### Q58. What's the minimum content length eligible for caching, the max number of breakpoints allowed, and the required processing order of cacheable sections?
---
**A:** Minimum 1024 tokens of content is required for something to be cached at all. Up to 4 total breakpoints are allowed per request for granular caching control. Content is processed (and must be cached) in this order: tools → system prompt → messages.
*Memory hook:* You need at least a full page (1024 tokens) to bother filing it, you get at most 4 filing tabs, and the filing cabinet always sorts tools before system notes before the actual conversation.

### Q59. Distinguish `cache_creation_input_tokens` from `cache_read_input_tokens` in the API usage response.
---
**A:** `cache_creation_input_tokens` = tokens that were written to the cache on this request (first time seeing that content). `cache_read_input_tokens` = tokens that were pulled from an existing cache on this request (a repeat of previously cached content). Any modification to the cached tools/system prompt/messages forces a brand-new cache_creation instead of a cache_read.
*Memory hook:* cache_creation is the first photocopy going into the filing cabinet; cache_read is grabbing that same photocopy back out on every later request — change the original even slightly and you're back to photocopying from scratch.

## MCP (Model Context Protocol)

### Q60. What specific problem does MCP solve, and how is it related to (but distinct from) "tool use"?
---
**A:** MCP shifts the burden of *defining and running* tools away from your own server and onto a pre-built MCP server — instead of authoring your own tool schemas and function implementations for, say, a GitHub integration, you point Claude at an MCP server that already wraps that functionality into ready-made tools. MCP and tool use are complementary, not identical: tool use is the general mechanism, while MCP is about *who does the work* of building those tools (a pre-built server vs. you writing it yourself) — a common point of confusion.
*Memory hook:* Tool use is "Claude can use tools"; MCP is "someone else already built and is hosting the toolbox for you" — same toolbox, different landlord.

### Q61. What does "transport agnostic" mean for an MCP client-server connection, and what are the two core message-type pairs used for tool interaction?
---
**A:** The MCP client and server can communicate over multiple underlying transports (stdin/stdout, HTTP, WebSockets, etc.) — the protocol doesn't dictate the wire format. Core message-type pairs: "list tools request/result" (client asks the server what tools exist, server responds with the list) and "call tool request/result" (client asks the server to run a specific tool with arguments, server returns the execution result).
*Memory hook:* MCP doesn't care if the message travels by pigeon, pipe, or fiber — it just cares that "what tools do you have" and "run this tool" get asked and answered.

### Q62. What are the three MCP server primitives, and what's the "control pattern" that distinguishes who decides when each one is used?
---
**A:** Tools = model-controlled (Claude itself decides when to invoke them based on conversation needs, adding capabilities like calculation or data lookup). Resources = app-controlled (the application code decides when to fetch and use data, e.g., populating an autocomplete list or document picker). Prompts = user-controlled (users trigger them explicitly via UI buttons, menus, or slash commands to kick off predefined workflows). Summary: Tools serve the model, Resources serve the app, Prompts serve the user.
*Memory hook:* Tools are Claude's own hands reaching for something; Resources are the app quietly stocking the shelves; Prompts are the user pressing a menu button — three different people holding the remote.

### Q63. Distinguish "direct/static" resources from "templated" resources in MCP, and what role does the MIME type play?
---
**A:** Direct/static resources have a fixed URI that's always the same address (e.g., `docs://documents`). Templated resources have a parameterized URI with wildcards (e.g., `documents/{doc_id}`) whose parameters become function keyword arguments at call time, enabling dynamic content selection. The MIME type (e.g., application/json, text/plain) declared on a resource is a hint about the data format so the client knows how to parse the returned content.
*Memory hook:* A static resource is a fixed street address; a templated resource is "apartment {number}" at that address — and the MIME type is the note on the envelope telling you whether to expect a letter or a photograph inside.

### Q64. What does the MCP "Prompts" primitive actually return, and what's its core value proposition for server authors?
---
**A:** A defined MCP prompt (via the `@prompt` decorator, taking parameters like a document ID) returns a list of messages (user/assistant format) rather than raw text — these messages get fed directly to the LLM. Its value: it lets server authors ship high-quality, tested, domain-specific prompt templates that end users invoke (e.g., via a slash command) instead of everyone having to hand-write their own generic prompts for a specialized task.
*Memory hook:* An MCP prompt is a pre-written, chef-tested recipe card baked right into the toolbox — you don't improvise the dish from scratch every time.

## Agents & Workflows

### Q65. What's the core decision rule for choosing a workflow over an agent (or vice versa)?
---
**A:** Use a workflow when you know the exact task steps ahead of time — it's a series of predetermined, plannable calls to Claude. Use an agent when the task's exact steps are uncertain — you give Claude a set of tools and let it figure out how to combine them dynamically to complete the task.
*Memory hook:* A workflow is a recipe you follow step by step; an agent is a chef improvising with whatever's in the pantry because you don't know in advance what dish is needed.

### Q66. Describe the evaluator-optimizer workflow pattern using the image-to-3D-model example from the notes.
---
**A:** A "producer" creates output (Claude plus a CAD library builds a 3D model from an image description) and an "evaluator" judges that output's quality (Claude compares a rendering of the model back against the original image). The loop repeats — if the evaluator finds it inaccurate, feedback is sent back to the producer step to regenerate; if accurate, the final output (e.g., a STEP file) is returned. It's a self-correcting producer/evaluator loop.
*Memory hook:* One Claude sculpts the statue, a second Claude walks around it comparing it to the reference photo and says "redo the left ear" until it finally nods and says "ship it."

### Q67. Distinguish the chaining, routing, and parallelization workflow patterns.
---
**A:** Chaining breaks one big task into sequential steps where each step's output feeds the next (e.g., topic → research → script → video → post) — especially useful when a single complex prompt keeps violating some constraints, since a focused follow-up "fix this specific issue" prompt outperforms a single prompt juggling many requirements at once. Routing first classifies the input into a category, then forwards it to a specialized pipeline/prompt tailored to that category (e.g., an "educational" topic gets a clear-explanation script prompt, an "entertainment" topic gets a trendy-hook script prompt). Parallelization splits one complex analysis into several independent parallel sub-requests (each focused on one narrow aspect), then feeds all the sub-results into a final aggregator step for the combined answer.
*Memory hook:* Chaining is a relay race (baton passed step to step), routing is an airport terminal (sorted onto the right gate first), parallelization is a group project (everyone researches their own slice, then someone stitches the report together).

### Q68. What's the "tool abstraction principle" for building effective agents, illustrated by the Claude Code example?
---
**A:** Agents work best with a small set of *abstract*, general-purpose tools that Claude can combine creatively, rather than many narrow, hyper-specialized tools. Example: Claude Code relies on abstract tools like bash, web fetch, and file write instead of dedicated "refactor" or "install" tools — the general primitives let Claude assemble whatever specific action is actually needed.
*Memory hook:* Give Claude a Swiss Army knife (bash, fetch, write), not a drawer full of single-purpose gadgets each labeled for one exact job.

### Q69. Why do agents need "environment inspection," and what's the computer-use example illustrating it?
---
**A:** Agents often can't predict exactly how an action will change their environment, so they need feedback beyond a tool's raw return value to understand the actual outcome and current state before deciding the next step. Computer-use example: Claude takes a screenshot after every action (a click, a keystroke) because it can't know in advance whether that click navigated to a new page, opened a menu, or did nothing — the screenshot reveals the real resulting state so Claude can plan its next move accurately.
*Memory hook:* A blindfolded chess player needs someone to say "that move landed here" after every play — Claude's screenshot-after-every-click is exactly that check-in.

### Q70. Compare workflows and agents on accuracy, testability, and reliability — and what's the course's ultimate recommendation?
---
**A:** Workflows achieve higher accuracy (focused, specific steps), are easier to test/evaluate (known step sequences), and are more reliable for consistent completion. Agents have lower success rates (more delegated complexity), are harder to test (unpredictable execution paths), but offer more flexibility and adaptive UX for varied queries. Recommendation: prioritize workflows whenever possible for reliable problem-solving, and reach for agents only when true flexibility is required — users want a 100%-working product over an impressive-but-unreliable agent.
*Memory hook:* A vending machine (workflow) reliably gives you what you pressed every time; a smart assistant (agent) can improvise a whole meal but sometimes burns the toast — pick the vending machine unless you really need the improvisation.
