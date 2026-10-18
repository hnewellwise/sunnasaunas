#!/usr/bin/env node
/**
 * Check that translated content mirrors the English source structurally: same sections in the
 * same order with the same layout fields (images, heights, links, ...); only copy differs.
 * Also lists each locale's translationStatus so reviewers can see what is left.
 *   node scripts/check-translations.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import { parse } from 'yaml';

const ROOT = new URL('../src/content/', import.meta.url).pathname;
const LOCALES = ['pt', 'fr', 'es'];
// Keys whose values are copy (translated). Everything else must match English exactly.
const TEXT = new Set(['title', 'seoTitle', 'description', 'heading', 'body', 'aside', 'text', 'label', 'imageNote', 'alt', 'head', 'rows', 'slug']);

const fm = async (file) => parse((await readFile(file, 'utf8')).split(/^---$/m)[1]);

function layout(value) {
  if (Array.isArray(value)) return value.map(layout);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([k]) => !TEXT.has(k)).map(([k, v]) => [k, layout(v)]));
  }
  return value;
}

let problems = 0;
const status = {};
for (const collection of ['pages', 'circle', 'work']) {
  const enFiles = await readdir(`${ROOT}${collection}/en`);
  const enByKey = {};
  for (const f of enFiles) {
    const d = await fm(`${ROOT}${collection}/en/${f}`);
    enByKey[d.translationKey] = d;
  }
  for (const lang of LOCALES) {
    let files = [];
    try { files = await readdir(`${ROOT}${collection}/${lang}`); } catch {}
    const seen = new Set();
    for (const f of files) {
      const d = await fm(`${ROOT}${collection}/${lang}/${f}`);
      seen.add(d.translationKey);
      (status[lang] ??= {})[d.translationStatus] = ((status[lang] ??= {})[d.translationStatus] ?? 0) + 1;
      const src = enByKey[d.translationKey];
      if (!src) { console.log(`✗ ${collection}/${lang}/${f}: no English source for translationKey "${d.translationKey}"`); problems++; continue; }
      const strip = ({ translationStatus, ...rest }) => rest;
      const a = JSON.stringify(layout(strip(src))), b = JSON.stringify(layout(strip(d)));
      if (a !== b) {
        problems++;
        console.log(`✗ ${collection}/${lang}/${f}: layout differs from English`);
        const sa = layout(strip(src)), sb = layout(strip(d));
        for (const k of new Set([...Object.keys(sa), ...Object.keys(sb)])) {
          if (JSON.stringify(sa[k]) !== JSON.stringify(sb[k])) {
            if (Array.isArray(sa[k]) && Array.isArray(sb[k])) {
              sa[k].forEach((x, i) => JSON.stringify(x) !== JSON.stringify(sb[k][i]) && console.log(`    ${k}[${i}]\n      en: ${JSON.stringify(x)}\n      ${lang}: ${JSON.stringify(sb[k][i])}`));
              if (sa[k].length !== sb[k].length) console.log(`    ${k}: ${sa[k].length} vs ${sb[k].length} items`);
            } else console.log(`    ${k}: en=${JSON.stringify(sa[k])} ${lang}=${JSON.stringify(sb[k])}`);
          }
        }
      }
    }
    const missing = Object.keys(enByKey).filter((k) => !seen.has(k));
    if (missing.length) console.log(`· ${collection}/${lang}: not yet translated: ${missing.join(', ')}`);
  }
}
console.log('\ntranslationStatus by locale:', JSON.stringify(status));
console.log(problems ? `${problems} structural problem(s)` : 'Structure matches English.');
process.exit(problems ? 1 : 0);
