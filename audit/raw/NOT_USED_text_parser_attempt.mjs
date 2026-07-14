import fs from 'fs';
import path from 'path';
const repo = '/home/peter/Documentos/repos/something';
const files = ['src/content/lessons.ts','src/content/linear.ts','src/content/indexed.ts','src/content/hierarchical.ts','src/content/graphs.ts','src/content/systems.ts','src/content/backend.ts'];
function findBalanced(text, startIndex, openChar, closeChar) {
  let depth = 0, inString = false, stringChar = '', escape = false;
  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === stringChar) { inString = false; stringChar = ''; }
      continue;
    }
    if (ch === '"' || ch === '\'' || ch === '`') { inString = true; stringChar = ch; continue; }
    if (ch === openChar) depth++;
    if (ch === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function topLevelObjects(arrayText) {
  const result = [];
  let inString = false, stringChar = '', escape = false, depth = 0, start = -1;
  for (let i = 0; i < arrayText.length; i++) {
    const ch = arrayText[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === stringChar) { inString = false; stringChar = ''; }
      continue;
    }
    if (ch === '"' || ch === '\'' || ch === '`') { inString = true; stringChar = ch; continue; }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        result.push(arrayText.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return result;
}
function capture(text, re) { const m = text.match(re); return m ? m[1] : null; }
const lessons = [];
for (const rel of files) {
  const file = path.join(repo, rel);
  const text = fs.readFileSync(file, 'utf8');
  const exportMatch = text.match(/export const\s+(\w+)(?::\s*LessonDefinition\[\])?\s*=\s*\[/);
  if (!exportMatch) continue;
  const arrayName = exportMatch[1];
  const arrayStart = text.indexOf('[', exportMatch.index);
  const arrayEnd = findBalanced(text, arrayStart, '[', ']');
  const arrayText = text.slice(arrayStart + 1, arrayEnd);
  const objects = topLevelObjects(arrayText);
  for (const obj of objects) {
    const id = capture(obj, /id:\s*"([^"]+)"/);
    const title = capture(obj, /title:\s*"([^"]+)"/);
    if (!id || !title) continue;
    const shortTitle = capture(obj, /shortTitle:\s*"([^"]+)"/);
    const module = capture(obj, /module:\s*"([^"]+)"/);
    const comparisonId = capture(obj, /comparisonId:\s*"([^"]+)"/);
    const representationsRaw = capture(obj, /representations:\s*\[([^\]]+)\]/s);
    const representations = representationsRaw ? [...representationsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    const controlsRaw = capture(obj, /controls:\s*\[([\s\S]*?)\](?:,\s*prediction:|,\s*challenge:|,\s*trace:)/);
    const controlIds = controlsRaw ? [...controlsRaw.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]) : [];
    lessons.push({ id, title, shortTitle, module, file: rel, arrayName, comparisonId, representations, hasFlowScene: /flowScene:/.test(obj), hasCreateFlowScene: /createFlowScene:/.test(obj), controlIds });
  }
}
console.log(JSON.stringify(lessons, null, 2));
