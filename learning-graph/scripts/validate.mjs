#!/usr/bin/env node
/* Validate a learning graph without writing anything.

   Usage: node learning-graph/scripts/validate.mjs [section]
            (no argument) → Section 8, at learning-graph/
            section-03    → Building with the Claude API
            all           → every section */

import { readdirSync } from "node:fs";
import { basename } from "node:path";
import { load, validate, allQuestions, computeLayers, sectionRoot, ROOT } from "./lib/graph.mjs";

const arg = process.argv[2];
const roots = arg === "all"
  ? [ROOT, ...readdirSync(ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith("section-"))
      .map((e) => sectionRoot(e.name))]
  : [sectionRoot(arg)];

let failed = 0;

for (const root of roots) {
  const g = load(root);
  const { errors, warnings } = validate(g);

  const layer = computeLayers(g.topics, g.dependencies);
  const entry = g.topics.filter((t) => layer[t.id] === 0);

  console.log(`\n${g.meta.section}  (${basename(root)})`);
  console.log(`topics             ${g.topics.length}`);
  console.log(`prerequisite edges ${g.dependencies.length} (${g.dependencies.filter((d) => d.strength === "hard").length} hard)`);
  console.log(`encompassings      ${g.encompassings.length}`);
  console.log(`knowledge points   ${Object.values(g.kpByTopic).reduce((n, e) => n + e.knowledgePoints.length, 0)}`);
  console.log(`questions          ${allQuestions(g).length}`);
  console.log(`layers             ${Math.max(...Object.values(layer)) + 1}`);
  console.log(`entry topics       ${entry.map((t) => t.id).join(", ")}`);

  for (const w of warnings) console.warn(`warning: ${w}`);
  for (const e of errors) console.error(`error: ${e}`);
  if (errors.length) {
    console.error(`${errors.length} error(s).`);
    failed += errors.length;
  }
}

if (failed) process.exit(1);
console.log("\nOK");
