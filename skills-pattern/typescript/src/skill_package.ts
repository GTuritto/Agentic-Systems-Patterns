import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ReleaseEvidence = {
  version?: string;
  owner?: string;
  summary?: string;
  changes?: string[];
  verification?: string[];
  artifacts?: string[];
  knownLimits?: string[];
};

export type SkillPackage = {
  root: string;
  skillMarkdown: string;
  policyMarkdown: string;
  templateMarkdown: string;
};

export type SkillValidation = {
  status: "pass" | "fail";
  reasons: string[];
};

export type SkillRunResult = {
  status: "rendered" | "needs_evidence" | "blocked";
  validation: SkillValidation;
  output: string;
};

const requiredTemplateFields = [
  "version",
  "owner",
  "summary",
  "changes",
  "verification",
  "artifacts",
  "knownLimits",
];

const requiredEvidenceFields: Array<keyof ReleaseEvidence> = [
  "version",
  "owner",
  "summary",
  "changes",
  "verification",
  "artifacts",
];

export function defaultSkillRoot() {
  const current = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(current, "..", "..", "release-notes-skill");
}

export async function readSkillPackage(root = defaultSkillRoot()): Promise<SkillPackage> {
  const [skillMarkdown, policyMarkdown, templateMarkdown] = await Promise.all([
    fs.readFile(path.join(root, "SKILL.md"), "utf8"),
    fs.readFile(path.join(root, "references", "release-policy.md"), "utf8"),
    fs.readFile(path.join(root, "templates", "release-notes.md"), "utf8"),
  ]);

  return {
    root,
    skillMarkdown,
    policyMarkdown,
    templateMarkdown,
  };
}

export async function readEvidence(evidencePath: string): Promise<ReleaseEvidence> {
  return JSON.parse(await fs.readFile(evidencePath, "utf8")) as ReleaseEvidence;
}

export function validateSkillPackage(skillPackage: SkillPackage): SkillValidation {
  const reasons: string[] = [];
  const skillWordCount = skillPackage.skillMarkdown.split(/\s+/).filter(Boolean).length;

  if (!/^# Release Notes Skill/m.test(skillPackage.skillMarkdown)) reasons.push("missing skill title");
  if (!/## Activation/.test(skillPackage.skillMarkdown)) reasons.push("missing activation section");
  if (!/## Procedure/.test(skillPackage.skillMarkdown)) reasons.push("missing procedure section");
  if (!/## Do Not/.test(skillPackage.skillMarkdown)) reasons.push("missing negative constraints");
  if (skillWordCount > 260) reasons.push("SKILL.md is too long for first-load instructions");
  if (!/Required Evidence/.test(skillPackage.policyMarkdown)) reasons.push("policy missing required evidence");

  for (const field of requiredTemplateFields) {
    if (!skillPackage.templateMarkdown.includes(`{{${field}}}`)) {
      reasons.push(`template missing placeholder: ${field}`);
    }
  }

  if (/api[_-]?key|password|secret/i.test(skillPackage.skillMarkdown)) {
    reasons.push("skill instructions mention secret-like terms");
  }

  return {
    status: reasons.length === 0 ? "pass" : "fail",
    reasons,
  };
}

export function validateEvidence(evidence: ReleaseEvidence): string[] {
  const missing = requiredEvidenceFields.filter(field => {
    const value = evidence[field];
    return Array.isArray(value) ? value.length === 0 : !value;
  });

  return missing.map(field => `missing evidence: ${field}`);
}

export function renderReleaseNotes(template: string, evidence: ReleaseEvidence) {
  const replacements: Record<string, string> = {
    version: evidence.version ?? "",
    owner: evidence.owner ?? "",
    summary: evidence.summary ?? "",
    changes: bulletList(evidence.changes),
    verification: bulletList(evidence.verification),
    artifacts: bulletList(evidence.artifacts),
    knownLimits: bulletList(evidence.knownLimits?.length ? evidence.knownLimits : ["None recorded."]),
  };

  return Object.entries(replacements).reduce(
    (rendered, [field, value]) => rendered.split(`{{${field}}}`).join(value),
    template,
  );
}

export async function runReleaseNotesSkill(options: {
  skillRoot?: string;
  evidencePath: string;
}): Promise<SkillRunResult> {
  const skillPackage = await readSkillPackage(options.skillRoot);
  const validation = validateSkillPackage(skillPackage);
  if (validation.status === "fail") {
    return {
      status: "blocked",
      validation,
      output: validation.reasons.join("\n"),
    };
  }

  const evidence = await readEvidence(options.evidencePath);
  const evidenceIssues = validateEvidence(evidence);
  if (evidenceIssues.length > 0) {
    return {
      status: "needs_evidence",
      validation: { status: "fail", reasons: evidenceIssues },
      output: evidenceIssues.join("\n"),
    };
  }

  return {
    status: "rendered",
    validation,
    output: renderReleaseNotes(skillPackage.templateMarkdown, evidence),
  };
}

function bulletList(items: string[] | undefined) {
  if (!items?.length) return "- None recorded.";
  return items.map(item => `- ${item}`).join("\n");
}
