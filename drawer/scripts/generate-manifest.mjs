// scripts/generate-manifest.mjs
//
// Scans public/content/week{N}/ for loose, hand-named files and writes
// public/manifest.json describing STRUCTURE ONLY — counts, which weeks/
// questions/steps exist, and which theory sections + images are present.
// It never copies actual .md text into the manifest; pages read that
// directly from disk at render time, so there's exactly one source of
// truth for content.
//
// This is intentionally forgiving: a missing week folder, a missing
// theory file, or a gap in step numbering is normal mid-production, not
// an error. The only output for problems is a console warning — the
// build must never fail because content is incomplete.
//
// Run automatically via the "predev" and "prebuild" npm scripts, so a
// non-technical person adding files never needs to touch this file or
// remember to regenerate anything by hand.

import { readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = join(__dirname, '..', 'public', 'content');
const MANIFEST_PATH = join(__dirname, '..', 'public', 'manifest.json');
const TOTAL_WEEKS = 11;
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

const warnings = [];

function warn(message) {
  warnings.push(message);
}

/** First existing image file for a given base name, e.g. "w3_cover" -> "w3_cover.png". */
function findImage(dirFiles, baseName) {
  for (const ext of IMAGE_EXTS) {
    const name = `${baseName}.${ext}`;
    if (dirFiles.includes(name)) return name;
  }
  return null;
}

/** Does an exact file exist in this week's folder? */
function hasFile(dirFiles, name) {
  return dirFiles.includes(name);
}

/**
 * Scans filenames for a pattern like w3_q7_title.md and returns the
 * sorted, deduplicated list of numbers found — never assumes numbers
 * are sequential or start at 1, since content gets added out of order.
 */
function findNumbers(dirFiles, regex) {
  const found = new Set();
  for (const file of dirFiles) {
    const match = file.match(regex);
    if (match) found.add(Number(match[1]));
  }
  return Array.from(found).sort((a, b) => a - b);
}

function buildTheorySection(weekNum, dirFiles, kind) {
  const textFile = `w${weekNum}_${kind}.md`;
  const hasText = hasFile(dirFiles, textFile);
  const image = findImage(dirFiles, `w${weekNum}_${kind}`);
  return {
    hasText,
    hasImage: Boolean(image),
    image,
  };
}

function buildQuestion(weekNum, dirFiles, questionNum) {
  const titleFile = `w${weekNum}_q${questionNum}_title.md`;
  const hasTitle = hasFile(dirFiles, titleFile);
  if (!hasTitle) {
    warn(`Week ${weekNum}, Question ${questionNum}: missing title file (${titleFile}) — question will be skipped.`);
  }

  const stepRegex = new RegExp(`^w${weekNum}_q${questionNum}_s(\\d+)\\.md$`);
  const stepNumbers = findNumbers(dirFiles, stepRegex);

  // Gap detection: e.g. steps [1, 2, 4] found with no 3.
  if (stepNumbers.length > 0) {
    const maxStep = stepNumbers[stepNumbers.length - 1];
    for (let s = stepNumbers[0]; s <= maxStep; s++) {
      if (!stepNumbers.includes(s)) {
        warn(`Week ${weekNum}, Question ${questionNum}: missing step ${s} (have steps ${stepNumbers.join(', ')}) — gap in the sequence.`);
      }
    }
  }

  const steps = stepNumbers.map((stepNum) => {
    const stepText = `w${weekNum}_q${questionNum}_s${stepNum}.md`;
    const stepImage = findImage(dirFiles, `w${weekNum}_q${questionNum}_s${stepNum}`);
    if (!stepImage) {
      warn(`Week ${weekNum}, Question ${questionNum}, Step ${stepNum}: has text but no image — step will render text-only.`);
    }
    return {
      step: stepNum,
      hasText: hasFile(dirFiles, stepText),
      image: stepImage,
    };
  });

  return {
    id: questionNum,
    hasTitle,
    stepCount: steps.length,
    steps,
  };
}

function buildWeek(weekNum) {
  const weekDir = join(CONTENT_ROOT, `week${weekNum}`);

  if (!existsSync(weekDir)) {
    // A missing folder is normal, not an error — the week just isn't
    // started yet and renders as a greyed "coming soon" card.
    return { id: weekNum, hasContent: false };
  }

  const dirFiles = readdirSync(weekDir);
  const titleFile = `w${weekNum}_title.md`;

  if (!hasFile(dirFiles, titleFile)) {
    return { id: weekNum, hasContent: false };
  }

  const cover = findImage(dirFiles, `w${weekNum}_cover`);
  if (!cover) {
    warn(`Week ${weekNum}: has a title but no cover image (w${weekNum}_cover.*) — card will use the placeholder pattern.`);
  }

  // Matches any file belonging to a question (title or a step), so a
  // question with steps but a missing title is still detected — and
  // then flagged by the hasTitle warning below — rather than silently
  // disappearing because only title files were scanned for.
  const questionRegex = new RegExp(`^w${weekNum}_q(\\d+)_`);
  const questionNumbers = findNumbers(dirFiles, questionRegex);
  const questions = questionNumbers.map((qNum) => buildQuestion(weekNum, dirFiles, qNum));

  return {
    id: weekNum,
    hasContent: true,
    hasDesc: hasFile(dirFiles, `w${weekNum}_desc.md`),
    cover,
    theory: {
      prelab: buildTheorySection(weekNum, dirFiles, 'prelab'),
      postlab: buildTheorySection(weekNum, dirFiles, 'postlab'),
      procedure: buildTheorySection(weekNum, dirFiles, 'procedure'),
    },
    questionCount: questions.length,
    questions,
  };
}

function generate() {
  if (!existsSync(CONTENT_ROOT)) {
    mkdirSync(CONTENT_ROOT, { recursive: true });
  }

  const weeks = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    weeks.push(buildWeek(w));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalWeeks: TOTAL_WEEKS,
    weeks,
  };

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  const contentCount = weeks.filter((w) => w.hasContent).length;
  console.log(`[manifest] wrote public/manifest.json — ${contentCount}/${TOTAL_WEEKS} weeks have content.`);

  if (warnings.length > 0) {
    console.log(`[manifest] ${warnings.length} warning(s) (build continues):`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
}

generate();
