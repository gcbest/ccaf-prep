/* Shared loader, validator, and derived-metric calculations for the Section 8 learning graph.
   Both scripts/validate.mjs and scripts/build-web-data.mjs go through here so the
   checks and the published data can never drift apart. */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..", "..");
export const DATA = join(ROOT, "data");

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(`could not parse ${path}: ${err.message}`);
  }
}

export function load() {
  const clusters = readJson(join(DATA, "clusters.json")).clusters;
  const standards = readJson(join(DATA, "curriculum-standards.json")).standards;
  const topics = readJson(join(DATA, "topics.json")).topics;
  const dependencies = readJson(join(DATA, "dependencies.json")).dependencies;
  const encompassings = readJson(join(DATA, "encompassings.json")).encompassings;

  const kpDir = join(DATA, "knowledge-points");
  const kpFiles = readdirSync(kpDir).filter((f) => f.endsWith(".json")).sort();
  const kpByTopic = {};
  for (const file of kpFiles) {
    const parsed = readJson(join(kpDir, file));
    for (const entry of parsed.topics) {
      if (kpByTopic[entry.topicId]) {
        throw new Error(`duplicate knowledge points for ${entry.topicId} (${file})`);
      }
      kpByTopic[entry.topicId] = entry;
    }
  }

  return { clusters, standards, topics, dependencies, encompassings, kpByTopic, kpFiles };
}

/* ---------- validation ---------- */

export function validate(g) {
  const errors = [];
  const warnings = [];

  const topicIds = new Set();
  for (const t of g.topics) {
    if (topicIds.has(t.id)) errors.push(`duplicate topic id ${t.id}`);
    topicIds.add(t.id);
    for (const field of ["type", "cluster", "name", "description", "assessmentPrompt"]) {
      if (!t[field]) errors.push(`${t.id}: missing ${field}`);
    }
    if (!["CONCEPTUAL", "PROCEDURAL", "FACTUAL"].includes(t.type)) {
      errors.push(`${t.id}: unknown type ${t.type}`);
    }
    if (!g.clusters.some((c) => c.id === t.cluster)) {
      errors.push(`${t.id}: unknown cluster ${t.cluster}`);
    }
    for (const s of t.standards || []) {
      if (!g.standards.some((x) => x.id === s)) errors.push(`${t.id}: unknown standard ${s}`);
    }
    if (!(t.evidence || []).length) warnings.push(`${t.id}: no evidence (mastery criteria) listed`);
  }

  for (const d of g.dependencies) {
    if (!topicIds.has(d.topicId)) errors.push(`dependency references unknown topic ${d.topicId}`);
    if (!topicIds.has(d.prerequisiteId)) {
      errors.push(`dependency references unknown prerequisite ${d.prerequisiteId}`);
    }
    if (!["hard", "soft"].includes(d.strength)) {
      errors.push(`${d.topicId} <- ${d.prerequisiteId}: strength must be hard or soft`);
    }
    if (!d.reason) warnings.push(`${d.topicId} <- ${d.prerequisiteId}: no reason given`);
  }

  for (const e of g.encompassings) {
    if (!topicIds.has(e.topicId)) errors.push(`encompassing references unknown topic ${e.topicId}`);
    if (!topicIds.has(e.encompassedId)) {
      errors.push(`encompassing references unknown topic ${e.encompassedId}`);
    }
    if (!(e.coverage > 0 && e.coverage <= 1)) {
      errors.push(`${e.topicId} => ${e.encompassedId}: coverage must be in (0, 1]`);
    }
    if (e.topicId === e.encompassedId) errors.push(`${e.topicId} encompasses itself`);
  }

  // Every topic needs something to teach and something to review with.
  for (const t of g.topics) {
    const kp = g.kpByTopic[t.id];
    if (!kp) {
      errors.push(`${t.id}: no knowledge points`);
      continue;
    }
    if (!(kp.knowledgePoints || []).length) errors.push(`${t.id}: empty knowledgePoints array`);
    if (!(kp.reviewQuestions || []).length) errors.push(`${t.id}: no reviewQuestions`);
    for (const point of kp.knowledgePoints || []) {
      if (!point.teach) errors.push(`${point.id}: no teach block`);
      if ((point.questions || []).length < 2) {
        errors.push(`${point.id}: needs at least 2 questions so a retry can use a fresh one`);
      }
      for (const q of point.questions || []) checkQuestion(q, errors);
      for (const p of point.keyPrerequisites || []) {
        if (!topicIds.has(p)) errors.push(`${point.id}: unknown keyPrerequisite ${p}`);
      }
    }
    for (const q of kp.reviewQuestions || []) checkQuestion(q, errors);
  }

  for (const id of Object.keys(g.kpByTopic)) {
    if (!topicIds.has(id)) errors.push(`knowledge points for unknown topic ${id}`);
  }

  const seenQ = new Set();
  for (const q of allQuestions(g)) {
    if (seenQ.has(q.id)) errors.push(`duplicate question id ${q.id}`);
    seenQ.add(q.id);
  }

  errors.push(...findCycles(g.topics, g.dependencies.filter((d) => d.strength === "hard"), "hard prerequisite"));
  errors.push(...findCycles(
    g.topics,
    g.encompassings.map((e) => ({ topicId: e.topicId, prerequisiteId: e.encompassedId })),
    "encompassing"
  ));

  return { errors, warnings };
}

function checkQuestion(q, errors) {
  if (!q.id) errors.push("question with no id");
  if (!q.q) errors.push(`${q.id}: no prompt`);
  if (!Array.isArray(q.options) || q.options.length < 3) {
    errors.push(`${q.id}: needs at least 3 options`);
  }
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= (q.options || []).length) {
    errors.push(`${q.id}: correct index out of range`);
  }
  if (!q.explain) errors.push(`${q.id}: no explanation`);
}

export function allQuestions(g) {
  const out = [];
  for (const entry of Object.values(g.kpByTopic)) {
    for (const point of entry.knowledgePoints || []) out.push(...(point.questions || []));
    out.push(...(entry.reviewQuestions || []));
  }
  return out;
}

function findCycles(topics, edges, label) {
  const adj = {};
  for (const t of topics) adj[t.id] = [];
  for (const e of edges) {
    if (adj[e.prerequisiteId]) adj[e.prerequisiteId].push(e.topicId);
  }
  const state = {};
  const stack = [];
  const errors = [];

  function walk(id) {
    state[id] = 1;
    stack.push(id);
    for (const next of adj[id] || []) {
      if (state[next] === 1) {
        const at = stack.indexOf(next);
        errors.push(`${label} cycle: ${stack.slice(at).concat(next).join(" → ")}`);
      } else if (!state[next]) {
        walk(next);
      }
    }
    stack.pop();
    state[id] = 2;
  }

  for (const t of topics) if (!state[t.id]) walk(t.id);
  return errors;
}

/* ---------- derived metrics ---------- */

/* layer = longest chain of hard prerequisites behind a topic. It is what the graph
   view uses for a column, and what the task queue uses as a tie-breaker so that
   foundational work is offered before work that sits on top of it. */
export function computeLayers(topics, dependencies) {
  const hard = dependencies.filter((d) => d.strength === "hard");
  const prereqs = {};
  for (const t of topics) prereqs[t.id] = [];
  for (const d of hard) prereqs[d.topicId].push(d.prerequisiteId);

  const layer = {};
  function depth(id, seen = new Set()) {
    if (layer[id] !== undefined) return layer[id];
    if (seen.has(id)) return 0; // cycles are reported separately; don't hang here
    seen.add(id);
    let best = 0;
    for (const p of prereqs[id]) best = Math.max(best, depth(p, seen) + 1);
    layer[id] = best;
    return best;
  }
  for (const t of topics) depth(t.id);
  return layer;
}

/* centrality = share of the graph that sits downstream of a topic, over hard and
   soft edges alike. High-centrality topics are the ones worth reaching first,
   because everything else is waiting on them. */
export function computeCentrality(topics, dependencies) {
  const dependents = {};
  for (const t of topics) dependents[t.id] = [];
  for (const d of dependencies) dependents[d.prerequisiteId].push(d.topicId);

  const out = {};
  for (const t of topics) {
    const seen = new Set();
    const queue = [...dependents[t.id]];
    while (queue.length) {
      const id = queue.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      queue.push(...dependents[id]);
    }
    out[t.id] = Number((seen.size / Math.max(1, topics.length - 1)).toFixed(3));
  }
  return out;
}

/* Column-per-layer layout, computed once at build time so the page only has to
   draw. Nodes within a layer are grouped by cluster to keep colours together. */
export function computeLayout(topics, layer, clusters) {
  const COL = 210;
  const ROW = 62;
  const MARGIN_X = 120;
  const MARGIN_Y = 46;

  const order = new Map(clusters.map((c, i) => [c.id, i]));
  const byLayer = {};
  for (const t of topics) (byLayer[layer[t.id]] ||= []).push(t);

  const pos = {};
  let maxRows = 0;
  for (const [lz, list] of Object.entries(byLayer)) {
    list.sort((a, b) =>
      (order.get(a.cluster) - order.get(b.cluster)) || a.name.localeCompare(b.name)
    );
    maxRows = Math.max(maxRows, list.length);
    list.forEach((t, i) => {
      pos[t.id] = { x: MARGIN_X + Number(lz) * COL, y: MARGIN_Y + i * ROW };
    });
  }

  const layers = Object.keys(byLayer).length;
  return {
    pos,
    width: MARGIN_X * 2 + (layers - 1) * COL,
    height: MARGIN_Y * 2 + (maxRows - 1) * ROW,
  };
}
