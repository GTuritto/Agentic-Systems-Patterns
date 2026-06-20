import fs from 'node:fs'
import ts from 'typescript'

const files = [
  'native-framework-examples/mastra-refund/src/mastra/agents/refund-agent.ts',
  'native-framework-examples/mastra-refund/src/mastra/tools/refund-tools.ts',
  'native-framework-examples/mastra-refund/src/mastra/workflows/refund-workflow.ts',
  'native-framework-examples/mastra-refund/src/mastra/evals/refund-release-gate.ts',
  'native-framework-examples/mastra-refund/src/mastra/index.ts',
]

let failed = false

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const result = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
    },
    reportDiagnostics: true,
  })

  const diagnostics = result.diagnostics?.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error) ?? []
  if (diagnostics.length > 0) {
    failed = true
    for (const diagnostic of diagnostics) {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      console.error(`${file}: ${message}`)
    }
  }
}

if (failed) {
  process.exit(1)
}

console.log('Native TypeScript framework examples compile syntactically')
