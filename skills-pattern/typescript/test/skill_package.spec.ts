import path from "node:path";
import {
  defaultSkillRoot,
  readSkillPackage,
  renderReleaseNotes,
  runReleaseNotesSkill,
  validateEvidence,
  validateSkillPackage,
  type ReleaseEvidence,
} from "../src/skill_package.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const skillRoot = defaultSkillRoot();
const skillPackage = await readSkillPackage(skillRoot);
const validation = validateSkillPackage(skillPackage);

assert(validation.status === "pass", `Expected valid skill package: ${validation.reasons.join(", ")}`);
assert(skillPackage.skillMarkdown.includes("## Activation"), "Expected activation section");
assert(skillPackage.policyMarkdown.includes("Required Evidence"), "Expected policy required evidence");

const evidencePath = path.join(skillRoot, "fixtures", "release-evidence.json");
const result = await runReleaseNotesSkill({ skillRoot, evidencePath });
assert(result.status === "rendered", "Expected rendered release notes");
assert(result.output.includes("# Release Notes: 2026-06-21-skills-reference"), "Expected release title");
assert(result.output.includes("npm run skills:test"), "Expected verification evidence");
assert(!result.output.includes("{{"), "Expected all placeholders replaced");

const missingEvidence: ReleaseEvidence = {
  version: "missing-fields",
  changes: [],
};
const evidenceIssues = validateEvidence(missingEvidence);
assert(evidenceIssues.includes("missing evidence: owner"), "Expected owner evidence issue");
assert(evidenceIssues.includes("missing evidence: verification"), "Expected verification evidence issue");

const unsafeTemplate = "# Release Notes: {{version}}\n\n{{summary}}";
const rendered = renderReleaseNotes(unsafeTemplate, {
  version: "v1",
  owner: "maintainer",
  summary: "Shipped source-backed skill package.",
  changes: ["Added skill package."],
  verification: ["npm run skills:test"],
  artifacts: ["skills-pattern/release-notes-skill/SKILL.md"],
});
assert(rendered.includes("v1"), "Expected template replacement");
assert(!rendered.includes("{{summary}}"), "Expected summary replacement");

console.log("Skills package tests OK");
