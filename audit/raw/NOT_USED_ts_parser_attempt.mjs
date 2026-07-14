import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire('/home/peter/Documentos/repos/something/package.json');
const ts = require('typescript');
const repo = '/home/peter/Documentos/repos/something';
const contentFiles = ['src/content/lessons.ts','src/content/linear.ts','src/content/indexed.ts','src/content/hierarchical.ts','src/content/graphs.ts','src/content/systems.ts','src/content/backend.ts'];
function textOf(node, source) { return node.getText(source); }
function literal(node, source) {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((el) => literal(el, source));
  if (ts.isObjectLiteralExpression(node)) {
    const out = {};
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = prop.name.getText(source).replace(/['\"]/g, '');
      out[key] = literal(prop.initializer, source);
    }
    return out;
  }
  if (ts.isIdentifier(node)) return { kind: 'identifier', text: node.text };
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return { kind: 'function', text: textOf(node, source) };
  if (ts.isCallExpression(node)) return { kind: 'call', text: textOf(node, source) };
  if (ts.isPropertyAccessExpression(node)) return { kind: 'property-access', text: textOf(node, source) };
  return { kind: 'expression', text: textOf(node, source) };
}
function propMap(objectNode, source) {
  const map = new Map();
  for (const prop of objectNode.properties) {
    if (ts.isPropertyAssignment(prop)) {
      const key = prop.name.getText(source).replace(/['\"]/g, '');
      map.set(key, prop.initializer);
    }
  }
  return map;
}
const lessons = [];
for (const rel of contentFiles) {
  const file = path.join(repo, rel);
  const sourceText = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  ts.forEachChild(source, function visit(node) {
    if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        if (!decl.name.text.endsWith('Lessons')) continue;
        if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) continue;
        for (const el of decl.initializer.elements) {
          if (!ts.isObjectLiteralExpression(el)) continue;
          const props = propMap(el, source);
          const challenge = literal(props.get('challenge'), source);
          lessons.push({
            id: literal(props.get('id'), source),
            title: literal(props.get('title'), source),
            shortTitle: literal(props.get('shortTitle'), source),
            module: literal(props.get('module'), source),
            file: rel,
            array: decl.name.text,
            representations: literal(props.get('representations'), source),
            comparisonId: literal(props.get('comparisonId'), source),
            traceRef: literal(props.get('trace'), source),
            hasFlowScene: props.has('flowScene'),
            hasCreateFlowScene: props.has('createFlowScene'),
            flowScene: props.has('flowScene') ? textOf(props.get('flowScene'), source) : null,
            createFlowScene: props.has('createFlowScene') ? textOf(props.get('createFlowScene'), source) : null,
            controls: literal(props.get('controls'), source),
            challengeQuestion: challenge?.question ?? null,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  });
}
console.log(JSON.stringify(lessons, null, 2));
