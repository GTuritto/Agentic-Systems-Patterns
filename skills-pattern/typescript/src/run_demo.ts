import path from "node:path";
import { defaultSkillRoot, runReleaseNotesSkill } from "./skill_package.ts";

const skillRoot = defaultSkillRoot();
const evidencePath = path.join(skillRoot, "fixtures", "release-evidence.json");
const result = await runReleaseNotesSkill({ skillRoot, evidencePath });

console.log(result.output);
