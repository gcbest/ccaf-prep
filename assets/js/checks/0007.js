/* Section checks for lesson 0007 — Claude on Google Cloud (Vertex AI). */
window.CCAF_CHECKS = {
  lesson: "0007-claude-on-google-cloud",
  items: {
    scene0: {
      q: "An exam scenario names Vertex AI and then describes an agent design problem. What should you do with the Vertex framing?",
      options: [
        "Treat it as a hint that the orchestration answer differs on Google Cloud",
        "Look for the Vertex-specific detail — auth, model-ID format, project/region — layered on a domain-general question whose answer is unchanged",
        "Assume the question is really about data residency and quota tiers",
        "Rewrite the architecture around Google's own SDKs before answering"
      ],
      correct: 1,
      explain: "Deployment choice changes authentication, project and region configuration, the client class, and model-ID syntax. It does not create a separate prompting, tool-design, or agent theory."
    },
    scene3: {
      q: "Aster's Vertex request fails to find the model. What are the first two things to check?",
      options: [
        "The API key and the SDK version",
        "Model enablement in Model Garden, and whether the right project is set",
        "Region availability and provisioned throughput quota",
        "The max_tokens ceiling and the message role order"
      ],
      correct: 1,
      explain: "“Model not enabled in Model Garden” and “wrong project” are Vertex-native failure causes with no equivalent on the direct API — on Vertex, model access is a per-project act of enablement performed in the Console."
    },
    scene5: {
      q: "Aster swaps Anthropic() for AnthropicVertex(region=..., project_id=...). What happens to the call itself?",
      options: [
        "It becomes client.converse(modelId=..., messages=[...])",
        "It stays .messages.create(model, max_tokens, messages) — same required arguments, same extraction",
        "It needs an extra location argument alongside model",
        "It must be wrapped in a Google auth context manager per request"
      ],
      correct: 1,
      explain: "The client construction changed and the model string changed to model-name@version-date. The call itself did not — same message dictionaries, same roles, same message.content[0].text."
    },
    scene7: {
      q: "Which item belongs in the “what does not change” half of Aster's table?",
      options: [
        "Statelessness — no stored history, so your application resends the full conversation every call",
        "The endpoint, which becomes a region passed to the client",
        "The SDK install, which becomes anthropic[vertex]",
        "Billing and governance, which move into the customer's Google Cloud project"
      ],
      correct: 0,
      explain: "Change the airport, the passport, and the boarding gate — the pilot's checklist and navigation principles stay the same."
    },
    scene13: {
      q: "Meridian wants a nightly exception report with fixed steps, and a dispatcher assistant that handles anything thrown at it. How should they be built?",
      options: [
        "Both as agents, since both call tools",
        "The report as a workflow; the assistant as an agent, because it needs an unknown sequence of tools",
        "Both as workflows, with routing standing in for the assistant's flexibility",
        "The report as an agent for resilience; the assistant as a routing workflow"
      ],
      correct: 1,
      explain: "Either way the operational contract is identical: budgets, timeouts, stop conditions, retries, state, observability, and a human approval path for actions that change external systems. Shared capabilities are not controls."
    },
    scene14: {
      q: "Kwame's board asks what Vertex's regional quota limits are. What is the defensible answer?",
      options: [
        "Cite the documented per-region model availability matrix",
        "Confirm it for this project, region, and model rather than quoting a memorized number",
        "Assume parity with the direct Anthropic API's published limits",
        "Start concurrency at three and derive the ceiling empirically"
      ],
      correct: 1,
      explain: "The course is specific about auth commands, the client constructor, and the model-ID format — not about region lists, data-residency rules, or quota tiers. Knowing your own deployment's limits is Platform Awareness."
    }
  }
};
