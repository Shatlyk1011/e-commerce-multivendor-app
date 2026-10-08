import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

const sourceRoot = new URL('../src/', import.meta.url).pathname
const catalog = JSON.parse(readFileSync(new URL('../src/lib/locales/tk.json', import.meta.url), 'utf8'))
const missing = new Map()

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return filesIn(path)
    return /\.tsx?$/.test(entry.name) ? [path] : []
  })
}

for (const file of filesIn(sourceRoot)) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )

  function visit(node) {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isJsxText(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const text = node.text.replace(/\s+/g, ' ').trim()
      if (/[А-Яа-яЁё]/.test(text) && !catalog[text]) missing.set(text, file)
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
}

if (missing.size) {
  for (const [text, file] of missing) console.error(`${file}: ${text}`)
  console.error(`${missing.size} storefront strings are missing Turkmen translations.`)
  process.exitCode = 1
} else {
  console.log(`All storefront Russian strings have Turkmen catalog entries (${Object.keys(catalog).length} entries).`)
}
