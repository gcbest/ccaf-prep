/* Section checks for lesson 0003 — Claude API: the first integration. */
window.CCAF_CHECKS = {
  lesson: "0003-claude-api-the-first-integration",
  items: {
    scene0: {
      q: "Rafael's three whiteboard boxes are Primitives, Infrastructure, and Controls. Where do managed agents, retries, queues, and observability sit?",
      options: [
        "Primitives",
        "Infrastructure",
        "Controls",
        "They span Primitives and Controls"
      ],
      correct: 1,
      explain: "Primitives are the API building blocks, Infrastructure is what scales an agentic system past a prototype, and Controls are dashboards and evals. Build with primitives, scale on infrastructure, run with control."
    },
    scene3: {
      q: "Which of the four stages is the one temperature acts on?",
      options: [
        "Tokenization — how the input is split into chunks",
        "Embedding — turning each token into numbers",
        "Contextualization — refining meaning from neighbouring tokens",
        "Generation — selecting the next word using probability plus randomness"
      ],
      correct: 3,
      explain: "The output layer produces probabilities for the next word and selects one using probability plus randomness — that randomness is exactly the dial temperature turns."
    },
    scene4: {
      q: "Theo sets max_tokens=1000 and gets a three-sentence answer back. What went wrong?",
      options: [
        "Nothing — max_tokens is a ceiling on generation, not a target length",
        "The model variable is wrong; longer output needs a larger model",
        "messages needs an assistant message seeded with the desired length",
        "max_tokens was overridden because no system prompt was supplied"
      ],
      correct: 0,
      explain: "This is the most commonly misread parameter: max_tokens forbids more than a thousand tokens, it does not ask for a thousand. If you want a specific length, say so in the prompt."
    },
    scene6: {
      q: "Rooftop's drafts are factually right but read like a legal notice. Ines wants a different posture, not different facts. What carries that?",
      options: [
        "A longer user message spelling out the desired tone",
        "The system prompt, passed as a plain string via the system keyword argument",
        "An assistant message pre-filling the opening sentence",
        "A lower temperature so the drafting is less formal"
      ],
      correct: 1,
      explain: "The system prompt controls how Claude responds, not what it responds — role on the first line, behavioural instructions after. When there is no system instruction, omit the parameter entirely rather than passing None."
    },
    scene8: {
      q: "Which streaming event carries the actual text chunks?",
      options: [
        "message_start",
        "content_block_start",
        "content_block_delta",
        "message_stop"
      ],
      correct: 2,
      explain: "message_start is the initial acknowledgement with no text; content_block_delta is the one that matters most. Streaming buys time-to-first-token, not quality."
    },
    scene12: {
      q: "The fire-risk assessment from satellite imagery keeps failing. Per this section, what is the usual cause?",
      options: [
        "The images are too low-resolution for the detail being scored",
        "The prompt is not sophisticated enough — image accuracy depends on prompt sophistication, not image quality",
        "Too many image blocks in one request; the limit is 100",
        "The images were placed before their text, confusing the reference order"
      ],
      correct: 1,
      explain: "Simple prompts often fail. The worked example only works with step-by-step analysis instructions, one- or multi-shot examples alternating image and text, explicit guidelines, and verification steps."
    },
    scene14: {
      q: "Claude starts answering questions that were only ever quoted inside the surveyor's notes. Which technique addresses this?",
      options: [
        "Wrapping each content section in a descriptive, custom XML tag",
        "Adding one-shot and multi-shot examples after the guidelines",
        "Moving the interpolated data into the system prompt",
        "Lowering max_tokens so less of the data is echoed back"
      ],
      correct: 0,
      explain: "XML tags stop Claude confusing your instructions with your data, or one data source with another — and descriptive names like surveyor_notes give context about the nature of the content, not just its boundary."
    },
    scene17: {
      q: "Rooftop's prompt scored 2.32 on its first eval run. What does Rafael take from that?",
      options: [
        "The prompt should be rewritten from scratch before scoring again",
        "A low first score is evidence, not failure — the number you report is the improvement",
        "The eval criteria are miscalibrated and need extra_criteria",
        "max_concurrent_tasks was too high and rate limits skewed the run"
      ],
      correct: 1,
      explain: "He also commits the eval dataset alongside the prompt, making it a regression suite. A prompt without an eval is an opinion; a prompt with a retained dataset is a component you can change safely."
    }
  }
};
