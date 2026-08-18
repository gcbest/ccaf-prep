# Learning graphs

Knowledge graphs for the two heaviest sections of this study system, plus a browser app
that teaches through them. The method is from [*The Math Academy Way*](https://mathacademy.com/)
(Justin Skycak); the data format follows [`withmarbleapp/os-taxonomy`](https://github.com/withmarbleapp/os-taxonomy),
with one file added that os-taxonomy does not have.

| Section | Page | Data | Storage key |
|---|---|---|---|
| **8** · The Claude Agent SDK | [`index.html`](index.html) | `data/` | `ccaf_learning_graph_v1` |
| **3** · Building with the Claude API | [`section-03/index.html`](section-03/index.html) | `section-03/data/` | `ccaf_learning_graph_03_v1` |

Section 8 lives at the root because its URL predates the second graph. One `app.js` and one
`scripts/` directory serve both; everything section-specific — topics, names, storage key —
arrives in that section's `graph-data.js`, built from its own `data/section.json`.

Progress is tracked separately per section, so working through one never marks anything
complete in the other.

Everything is static — no build step is needed to *run* it, only to *change* it.

## What is here

```
learning-graph/
├── app.js                         SHARED — scheduler, task runner, views
├── schema/*.schema.json           SHARED — JSON Schema for each data file
├── scripts/                       SHARED
│   ├── validate.mjs               check without writing
│   ├── build-web-data.mjs         regenerate graph-data.js + manifest.json
│   └── lib/graph.mjs              loader, validator, derived metrics
│
├── index.html                     Section 8's app
├── graph-data.js                  GENERATED — the whole graph, inlined for <script>
├── data/                          Section 8's source of truth
│   ├── section.json               identity: name, storage key, notes path
│   ├── topics.json                micro-topics (nodes)
│   ├── dependencies.json          prerequisite edges
│   ├── encompassings.json         encompassing edges  ← not in os-taxonomy
│   ├── clusters.json              domain summaries
│   ├── curriculum-standards.json  CCA-F domains + glossary terms
│   ├── knowledge-points/*.json    teaching content, one file per cluster
│   └── manifest.json              GENERATED — stats + checksums
│
└── section-03/                    Section 3, same layout
    ├── index.html
    ├── graph-data.js
    └── data/…
```

At the time of writing:

| | Section 8 | Section 3 |
|---|---|---|
| topics | 44 | 68 |
| clusters | 5 | 11 |
| prerequisite edges | 64 (49 hard) | 99 (79 hard) |
| encompassings | 48 | 77 |
| knowledge points | 60 | 83 |
| questions | 164 | 254 |
| layers deep | 8 | 9 |
| entry topics | 1 | 1 |

## The data model

### Topics — `data/topics.json`

A micro-topic is small enough to teach in one sitting and to assess on its own.

```json
{
  "id": "mt_context_isolation",
  "type": "CONCEPTUAL",
  "cluster": "cl_subagents",
  "name": "Context isolation: what crosses inward",
  "description": "A subagent's context window starts fresh…",
  "core": true,
  "estMinutes": 10,
  "evidence": ["List what a subagent does and does not inherit", "…"],
  "assessmentPrompt": "How does a subagent receive context from prior research findings?",
  "standards": ["ccaf:d1", "ccaf:d5", "ccaf-glossary:t6"],
  "sources": [{ "label": "Lesson · What actually crosses the boundary", "href": "…" }],
  "centrality": 0.442,
  "layer": 4
}
```

`centrality` and `layer` are derived — `build-web-data.mjs` computes them and writes them
back. `core` marks the topics that appear most often as prerequisites; the scheduler serves
those first, so they accumulate the most practice by the end.

Ids are readable (`mt_context_isolation`) rather than opaque (`mt_N8CpN1EJrP`) — the one
deliberate departure from os-taxonomy, because this graph is hand-maintained.

### Prerequisites — `data/dependencies.json`

```json
{
  "topicId": "mt_hub_and_spoke",
  "prerequisiteId": "mt_context_isolation",
  "strength": "hard",
  "reason": "Hub-and-spoke is forced by isolation: there is no sibling channel"
}
```

**hard** gates the knowledge frontier — the topic does not open until the prerequisite is
mastered. **soft** only orders the queue. Every edge carries a `reason`, which is both
documentation and a forcing function: an edge you cannot justify in a sentence usually
should not exist.

### Encompassings — `data/encompassings.json`

The file os-taxonomy has no equivalent of, and the one that makes spaced repetition
survivable in a graph this connected.

```json
{
  "topicId": "mt_subagent_return",
  "encompassedId": "mt_context_isolation",
  "coverage": 0.7,
  "reason": "The return path is the same boundary, walked the other way"
}
```

Working on the advanced topic implicitly practises the simpler one. `coverage` is the
fraction actually exercised. Encompassed topics are usually prerequisites; prerequisites
are often *not* fully encompassed, which is why this is a separate relation rather than a
field on the dependency.

### Knowledge points — `data/knowledge-points/*.json`

The teaching content, split by cluster so the files stay editable.

```json
{
  "topicId": "mt_context_isolation",
  "knowledgePoints": [
    {
      "id": "kp_isolation_1",
      "name": "The inheritance table",
      "keyPrerequisites": ["mt_agent_definition"],
      "teach": "<p>A subagent's context window <strong>starts fresh</strong>…</p>",
      "questions": [ { "id": "…", "q": "…", "options": [...], "correct": 2, "explain": "…" } ]
    }
  ],
  "reviewQuestions": [ … ]
}
```

Knowledge points are **ordered**: the first covers the most basic idea, later ones
introduce the harder cases. `keyPrerequisites` name the earlier topics that point leans on
most directly — they are what a targeted remedial review draws from. `reviewQuestions` are
held back from the lesson so spaced reviews are not re-runs of what you just answered.

Each knowledge point needs at least two questions, enforced by the validator, so a retry
after a stumble can use one you have not just seen.

## How the app uses it

| Math Academy idea | Implementation |
|---|---|
| Knowledge frontier | A topic is *ready* when every hard prerequisite is mastered. New lessons are only ever served from the frontier. |
| Scaffolded mastery | Knowledge points cleared in order; all questions right to advance. Dependents unlock on topic mastery, not on reading. |
| Targeted remediation | Two failures on the *same* knowledge point stop the lesson and queue a remedial review on that point's `keyPrerequisites`. The bar is never lowered. |
| FIRe | A repetition pays credit down encompassing edges, discounted by `coverage`, by answer quality, and by how early the implicit review lands (min 0.25×). Credit accumulates to a full repetition, up to 3 levels deep. |
| Compression | When a due topic is encompassed (≥ 0.5) by another due topic, only the advanced one is served; the simpler one's schedule is deferred by the credit it received. |
| Spaced repetition | 1, 3, 7, 16, 35, 75, 160 days. A failed review steps the ladder back rather than forward. |
| Diagnostic | Up to 14 questions, each chosen to split the remaining uncertainty most evenly. A correct answer infers the prerequisites known; a wrong one infers everything downstream unknown. Inferred passes get a 1-day review so a bad guess surfaces fast (conditional completion). |
| Layering | The queue interleaves reviews and new lessons rather than draining one first, and prefers core, high-centrality topics. |
| XP | 10 per knowledge point cleared first try, 5 after a stumble, +15 for mastering a topic, 8 for a clean review, 3 for a shaky one, 6 for a remediation. |

Progress lives in `localStorage` under `ccaf_learning_graph_v1`, and syncs through the
same `assets/js/gist-sync.js` the rest of the site uses.

## Working on it

Both scripts take a section argument. With none, they act on Section 8 at the root.

```bash
node learning-graph/scripts/validate.mjs                    # Section 8
node learning-graph/scripts/validate.mjs section-03         # Section 3
node learning-graph/scripts/validate.mjs all                # every section

node learning-graph/scripts/build-web-data.mjs              # Section 8
node learning-graph/scripts/build-web-data.mjs section-03   # Section 3
```

**Edit the JSON, never `graph-data.js`.** The build inlines the data into a `<script>` tag
so the page works over `file://` as well as GitHub Pages; a `fetch` of the JSON would fail
locally.

The validator checks referential integrity, cycles in both the hard-prerequisite graph and
the encompassing graph, duplicate question ids, correct-index bounds, and that every topic
has knowledge points with enough questions. It exits non-zero on any error, and
`build-web-data.mjs` refuses to write if validation fails.

### Adding a topic

1. Add it to `data/topics.json` with its cluster, evidence, and standards.
2. Wire it into `data/dependencies.json` — at least one hard prerequisite unless it is an
   entry point, each with a reason.
3. Consider `data/encompassings.json`: what does this topic implicitly practise, and what
   keeps it fresh? A topic with no incoming encompassing edges will need explicit review
   forever.
4. Write its knowledge points in the matching `data/knowledge-points/*.json`.
5. Run the build.

### Adding a section

1. `mkdir -p learning-graph/section-NN/data/knowledge-points`.
2. Write `data/section.json` — the id, the display names, a **unique** `storageKey`, and the
   `buildArg` the build script is invoked with.
3. Write the other five data files and the knowledge points.
4. Copy an existing `index.html`, fix the relative paths (`../../` for site assets, `../app.js`
   for the engine), and rewrite the section-specific copy.
5. `node learning-graph/scripts/build-web-data.mjs section-NN`.

A duplicated `storageKey` would silently merge two sections' progress, which is why the
build writes it into `graph-data.js` rather than letting the page guess.

## Sources

**Section 8** comes from [`08-claude-agent-sdk/notes.md`](../08-claude-agent-sdk/notes.md), built
from the official Agent SDK TypeScript and Python references and the Subagents, Hooks, and
Permissions guides on `docs.claude.com`, cross-checked against the CCA-F Exam Guide v1.0.
Where the shipping SDK and the exam guide disagree — most importantly the `Task` → `Agent`
tool rename — the graph teaches both and says which belongs on the exam.

**Section 3** comes from [`03-building-with-the-claude-api/notes.md`](../03-building-with-the-claude-api/notes.md),
built from the Anthropic Academy course *Building with the Claude API* with Claude Platform 101
background folded in, and cross-checked against the same exam guide. It is the widest section
on the list — it feeds four of the five exam domains — which is why it earned a graph of its own:
read in lesson order it is three long lessons, but the dependency structure underneath is nine
layers deep from a single entry point (`messages.create`).
