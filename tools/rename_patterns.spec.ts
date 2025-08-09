import { toKebabCaseDir, rewriteFileRefs } from './rename_patterns.ts';
import path from 'node:path';

function assertEqual(actual: any, expected: any, msg: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error('Assertion failed:', msg, '\nActual:', actual, '\nExpected:', expected);
    process.exit(1);
  }
}

// Unit tests for toKebabCaseDir
(() => {
  const cases: Array<[string, string]> = [
    ['Single Agent Pattern', 'single-agent-pattern'],
    ['ReAct Pattern (Reason + Act)', 'react-pattern-reason-act'],
    ['Agent Chain - Pipeline Pattern', 'agent-chain-pipeline-pattern'],
    ['Chain-of-Thought (CoT) Pattern', 'chain-of-thought-cot-pattern'],
    ['  Memory-Augmented   Agent  Pattern  ', 'memory-augmented-agent-pattern'],
  ];
  for (const [input, expected] of cases) {
    const got = toKebabCaseDir(input);
    assertEqual(got, expected, `toKebabCaseDir(${input})`);
  }
  console.log('toKebabCaseDir tests passed');
})();

// Fixture-based rewrite tests
(() => {
  const absOld = path.resolve('/repo', 'ReAct Pattern (Reason + Act)');
  const absNew = path.resolve('/repo', 'react-pattern-reason-act');
  const renames: Record<string, string> = { [absOld]: absNew };

  const mdIn = `- [ReAct](./ReAct%20Pattern%20(Reason%20+%20Act)/README.md)\n- [Link](../ReAct Pattern (Reason + Act)/autogen_typescript_example/react_agent.ts)`;
  const { changed: mdChanged, newContent: mdOut } = rewriteFileRefs('/repo/Agentic_Patterns.md', mdIn, renames);
  if (!mdChanged) { console.error('Expected markdown to change'); process.exit(1); }
  if (!mdOut.includes('./react-pattern-reason-act/README.md')) { console.error('Failed to rewrite encoded MD link'); process.exit(1); }

  const pkgIn = JSON.stringify({ scripts: {
    react: 'ts-node --esm "./react-pattern-reason-act/autogen_typescript_example/react_agent.ts"'
  } }, null, 2);
  const { changed: pkgChanged, newContent: pkgOut } = rewriteFileRefs('/repo/package.json', pkgIn, renames);
  if (!pkgChanged) { console.error('Expected package.json to change'); process.exit(1); }
  if (!pkgOut.includes('./react-pattern-reason-act/autogen_typescript_example/react_agent.ts')) { console.error('Failed to rewrite package.json script'); process.exit(1); }
  if (pkgOut.includes('"./react-pattern-reason-act')) { console.error('Quotes should be removed for simple path'); process.exit(1); }

  console.log('rewriteFileRefs tests passed');
})();
