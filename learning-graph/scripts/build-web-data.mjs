#!/usr/bin/env node
/* Regenerate a section's graph-data.js and data/manifest.json from the JSON
   source of truth, and write the derived centrality/layer values back into
   topics.json so the taxonomy files stay self-describing.

   The site loads graph-data.js with a <script> tag rather than fetching the JSON,
   so the page works from file:// as well as from GitHub Pages.

   Usage: node learning-graph/scripts/build-web-data.mjs [section]
            (no argument) → Section 8, at learning-graph/
            section-03    → Building with the Claude API */

import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  load, validate, allQuestions, sectionFromArgv,
  computeLayers, computeCentrality, computeLayout,
} from "./lib/graph.mjs";

const ROOT = sectionFromArgv();
const g = load(ROOT);
const DATA = g.data;
const { errors, warnings } = validate(g);
for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\nrefusing to build with ${errors.length} error(s).`);
  process.exit(1);
}

const layer = computeLayers(g.topics, g.dependencies);
const centrality = computeCentrality(g.topics, g.dependencies);
const layout = computeLayout(g.topics, layer, g.clusters);

/* --- write derived values back into topics.json --- */
const topicsPath = join(DATA, "topics.json");
const topicsDoc = JSON.parse(readFileSync(topicsPath, "utf8"));
for (const t of topicsDoc.topics) {
  t.centrality = centrality[t.id];
  t.layer = layer[t.id];
}
writeFileSync(topicsPath, JSON.stringify(topicsDoc, null, 2) + "\n");

/* --- assemble what the page needs --- */
const topics = g.topics.map((t) => ({
  ...t,
  centrality: centrality[t.id],
  layer: layer[t.id],
  x: layout.pos[t.id].x,
  y: layout.pos[t.id].y,
  knowledgePoints: g.kpByTopic[t.id].knowledgePoints,
  reviewQuestions: g.kpByTopic[t.id].reviewQuestions,
}));

const payload = {
  version: 1,
  builtAt: new Date().toISOString().slice(0, 10),
  subject: g.meta.subject,
  section: g.meta.section,
  sectionShort: g.meta.sectionShort,
  storageKey: g.meta.storageKey,
  notesPath: g.meta.notesPath,
  clusters: g.clusters,
  standards: g.standards,
  topics,
  dependencies: g.dependencies,
  encompassings: g.encompassings,
  layout: { width: layout.width, height: layout.height },
};

const banner =
  "/* GENERATED FILE — do not edit.\n" +
  `   Source of truth: ${g.meta.dataPath}/*.json\n` +
  `   Rebuild with: node learning-graph/scripts/build-web-data.mjs ${g.meta.buildArg}`.trimEnd() +
  " */\n";

writeFileSync(
  join(ROOT, "graph-data.js"),
  banner + "window.CCAF_GRAPH = " + JSON.stringify(payload) + ";\n"
);

/* --- manifest --- */
function sha(file) {
  return createHash("sha256").update(readFileSync(join(DATA, file))).digest("hex").slice(0, 16);
}
const files = [
  "topics.json", "dependencies.json", "encompassings.json",
  "clusters.json", "curriculum-standards.json",
].concat(g.kpFiles.map((f) => `knowledge-points/${f}`));

const manifest = {
  builtAt: payload.builtAt,
  stats: {
    topics: g.topics.length,
    clusters: g.clusters.length,
    dependencies: g.dependencies.length,
    hardDependencies: g.dependencies.filter((d) => d.strength === "hard").length,
    encompassings: g.encompassings.length,
    knowledgePoints: topics.reduce((n, t) => n + t.knowledgePoints.length, 0),
    questions: allQuestions(g).length,
    layers: Math.max(...Object.values(layer)) + 1,
    coreTopics: g.topics.filter((t) => t.core).length,
    estimatedMinutes: g.topics.reduce((n, t) => n + (t.estMinutes || 0), 0),
  },
  checksums: Object.fromEntries(files.map((f) => [f, "sha256:" + sha(f)])),
};
writeFileSync(join(DATA, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`${g.meta.section}: wrote graph-data.js, data/manifest.json, and derived fields in data/topics.json`);
console.table(manifest.stats);
