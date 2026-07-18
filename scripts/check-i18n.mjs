import fs from 'fs';
import path from 'path';

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', '.next', '.git', 'scripts'].includes(e.name)) walk(p, files);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(p);
  }
  return files;
}

const enContent = fs.readFileSync('lib/i18n/en.ts', 'utf8');
const arContent = fs.readFileSync('lib/i18n/ar.ts', 'utf8');
const enKeys = new Set([...enContent.matchAll(/'([^']+)':/g)].map((m) => m[1]));
const arKeys = new Set([...arContent.matchAll(/'([^']+)':/g)].map((m) => m[1]));

const used = new Set();
const files = walk('.');
for (const f of files) {
  if (f.includes('lib\\i18n') || f.includes('lib/i18n')) continue;
  const c = fs.readFileSync(f, 'utf8');
  for (const m of c.matchAll(/\bt\(\s*['`]([^'`]+)['`]/g)) used.add(m[1]);
}

const missingEn = [...used].filter((k) => !enKeys.has(k));
const missingAr = [...enKeys].filter((k) => !arKeys.has(k));
const extraAr = [...arKeys].filter((k) => !enKeys.has(k));

console.log('Used t() keys:', used.size);
console.log('en.ts keys:', enKeys.size);
console.log('ar.ts keys:', arKeys.size);
console.log('\nMissing from en.ts:', missingEn.length);
missingEn.sort().forEach((k) => console.log(' -', k));
console.log('\nIn en but missing from ar:', missingAr.length);
missingAr.sort().forEach((k) => console.log(' -', k));
console.log('\nIn ar but missing from en:', extraAr.length);
extraAr.sort().forEach((k) => console.log(' -', k));
