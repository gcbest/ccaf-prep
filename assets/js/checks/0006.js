/* Section checks for lesson 0006 — Claude with Amazon Bedrock. */
window.CCAF_CHECKS = {
  lesson: "0006-claude-with-amazon-bedrock",
  items: {
    scene0: {
      q: "Ana asks: “Are we porting an application, or rebuilding one?” What does this section answer?",
      options: [
        "Rebuilding — Bedrock's models behave differently enough to need new prompts",
        "Porting — Bedrock changes the access layer, not the architecture above it",
        "Rebuilding — the tool loop must be re-expressed in AWS primitives",
        "Porting, but only the prompts carry over; tools and RAG must be redesigned"
      ],
      correct: 1,
      explain: "Credentials, client construction, call method, model identifier, regional availability, and some parameter names change. Prompt engineering, tool schema design, RAG, evaluation, orchestration, and verification do not."
    },
    scene2: {
      q: "Rosa writes her first Bedrock call. Why is a message's content a list rather than a bare string?",
      options: [
        "Because Bedrock batches several messages into one request",
        "Because one message can carry several parts — text, images, other media",
        "Because each list entry maps to a separate role",
        "Because converse returns a list and the shapes must match"
      ],
      correct: 1,
      explain: "That list is what makes multimodal requests possible at all. There are still only two roles — user and assistant — sharing the same structure, which is what makes multi-turn chaining trivial."
    },
    scene5: {
      q: "On Ana's whiteboard, which of these lands in the “changes” column?",
      options: [
        "Tool schema design — name, description, input schema",
        "Context management — both are stateless, so you resend history",
        "The model identifier — a Bedrock model ID or cross-region inference profile ID",
        "Evaluation — dataset, run, grade, average, iterate"
      ],
      correct: 2,
      explain: "Credentials, client construction, call shape, model identifier, regional availability, docs/SDK, and governance surface change. Everything architectural stays identical. As Fadumo puts it: a plumbing job, not a rebuild."
    },
    scene8: {
      q: "The portal streams with converse_stream. Of the five event types, which one do you actually read text from?",
      options: [
        "message start",
        "content block delta",
        "content block stop",
        "metadata"
      ],
      correct: 1,
      explain: "The stream is a parade of five float types, but only the content block delta float throws candy — grab delta.text and ignore the rest of the procession."
    },
    scene12: {
      q: "The first fire-risk scoring attempt from satellite imagery scores badly. What fixes it?",
      options: [
        "Higher-resolution imagery, since token cost already scales with pixel dimensions",
        "Prompt engineering — sequential steps, a verification pass, and alternating image/text examples",
        "Splitting the images across more than 20 message parts",
        "Moving the images into the system parameter so they are not treated as input"
      ],
      correct: 1,
      explain: "The accuracy comes from the instructions, not the camera. Note the two limits too: a maximum of 20 images across all messages in one request, and token cost scaling with height × width."
    },
    scene15: {
      q: "In MCP's three server primitives, who controls a resource?",
      options: [
        "The model — Claude decides when to fetch it",
        "The app — your code decides when to fetch the data, exposed by URI",
        "The user — a person triggers it as a predefined workflow",
        "The transport layer, which caches it by MIME type"
      ],
      correct: 1,
      explain: "Tools are model-controlled, resources are app-controlled, prompts are user-controlled. Tools serve the model, resources serve the app, prompts serve users."
    }
  }
};
