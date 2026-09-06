// lib/content.js
//
// Server-side content access. The manifest (public/manifest.json) is
// STRUCTURE only — it says which files exist, not what they say. Actual
// text is always read directly from the .md files here, at render time,
// so there's exactly one source of truth. This only runs in Server
// Components / at build time (via `output: 'export'`), never in the
// browser.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_ROOT = join(process.cwd(), 'public', 'content');
const MANIFEST_PATH = join(process.cwd(), 'public', 'manifest.json');

let cachedManifest = null;

export function getManifest() {
  if (cachedManifest) return cachedManifest;
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(
      'public/manifest.json not found. Run `npm run manifest` (or `node scripts/generate-manifest.mjs`) before building — this normally happens automatically via the predev/prebuild npm scripts.'
    );
  }
  cachedManifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  return cachedManifest;
}

export function getAllWeeks() {
  return getManifest().weeks;
}

export function getWeek(weekId) {
  const id = Number(weekId);
  return getManifest().weeks.find((w) => w.id === id) || null;
}

/** Week ids that have content — used for generateStaticParams so a
 * "coming soon" week never gets its own (empty, broken) route. */
export function getContentWeekIds() {
  return getManifest()
    .weeks.filter((w) => w.hasContent)
    .map((w) => w.id);
}

function readTextFile(weekId, filename) {
  const filePath = join(CONTENT_ROOT, `week${weekId}`, filename);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8').trim();
}

export function getWeekTitle(weekId) {
  return readTextFile(weekId, `w${weekId}_title.md`);
}

export function getWeekDesc(weekId) {
  return readTextFile(weekId, `w${weekId}_desc.md`);
}

export function getTheoryText(weekId, kind) {
  return readTextFile(weekId, `w${weekId}_${kind}.md`);
}

export function getContentUrl(weekId, filename) {
  if (!filename) return null;
  return `/content/week${weekId}/${filename}`;
}

export function getQuestionTitle(weekId, questionId) {
  return readTextFile(weekId, `w${weekId}_q${questionId}_title.md`);
}

export function getQuestion(weekId, questionId) {
  const week = getWeek(weekId);
  if (!week || !week.hasContent) return null;
  return week.questions.find((q) => q.id === Number(questionId)) || null;
}

export function getStepText(weekId, questionId, stepNum) {
  return readTextFile(weekId, `w${weekId}_q${questionId}_s${stepNum}.md`);
}

/** Every (weekId, questionId) pair with real content — for the tutorial
 * route's generateStaticParams. */
export function getAllQuestionParams() {
  const params = [];
  for (const week of getContentWeekIds()) {
    const w = getWeek(week);
    for (const q of w.questions) {
      if (q.hasTitle && q.stepCount > 0) {
        params.push({ weekId: String(week), questionId: String(q.id) });
      }
    }
  }
  return params;
}
