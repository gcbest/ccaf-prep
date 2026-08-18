#!/usr/bin/env node
/* Validate the learning graph without writing anything.
   Usage: node learning-graph/scripts/validate.mjs */

import { load, validate, allQuestions, computeLayers } from "./lib/graph.mjs";

const g = load();
const { errors, warnings } = validate(g);

const layer = computeLayers(g.topics, g.dependencies);
const roots = g.topics.filter((t) => layer[t.id] === 0);

console.log(`topics             ${g.topics.length}`);
console.log(`prerequisite edges ${g.dependencies.length} (${g.dependencies.filter((d) => d.strength === "hard").length} hard)`);
console.log(`encompassings      ${g.encompassings.length}`);
console.log(`knowledge points   ${Object.values(g.kpByTopic).reduce((n, e) => n + e.knowledgePoints.length, 0)}`);
console.log(`questions          ${allQuestions(g).length}`);
console.log(`layers             ${Math.max(...Object.values(layer)) + 1}`);
console.log(`entry topics       ${roots.map((t) => t.id).join(", ")}`);

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log("\nOK");
