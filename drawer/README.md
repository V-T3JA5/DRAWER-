# Drawer — your egd guide

Static Next.js site for an 11-week Engineering Graphics and Design course.

## Setup

This was built in a sandboxed environment with no network access, so none
of the following has actually been run or verified end-to-end — you're the
first real test of it. Standard steps:

```bash
npm install
npm run dev       # runs the manifest generator, then starts the dev server
```

```bash
npm run build     # runs the manifest generator, then a static export into out/
```

`npm run dev` and `npm run build` both regenerate `public/manifest.json`
automatically first (via the `predev`/`prebuild` scripts) — you never need
to run the generator by hand, though `npm run manifest` does it directly if
you want to check its output without starting the whole dev server.

## Adding content

Drop correctly-named files into `public/content/week{N}/` — no code
changes needed. Naming convention:

```
w{N}_title.md                → week name (shows on the home page card)
w{N}_desc.md                 → week card description
w{N}_cover.{jpg|jpeg|png|webp|svg}
w{N}_prelab.md + w{N}_prelab.{image ext}
w{N}_postlab.md + w{N}_postlab.{image ext}
w{N}_procedure.md + w{N}_procedure.{image ext}
w{N}_q{Q}_title.md
w{N}_q{Q}_s{S}.md + w{N}_q{Q}_s{S}.{image ext}
```

A week with no `w{N}_title.md` renders as a greyed "coming soon" card — the
site always shows all 11 regardless of how much content exists. Weeks 3, 5,
6, 9, 10, 11 are currently empty on purpose, to prove that path works.

The manifest generator warns (but never fails the build) about gaps in step
numbering and a few other easy mistakes — check the console output after
running it.

Markdown support is intentionally minimal (see `lib/markdown.js`): bold,
bullet lists, numbered lists, and `#`/`##`/`###` headings. No
react-markdown/remark, per the original brief.

## What's real vs. placeholder

**Real, working mechanisms:**
- The manifest generator (`scripts/generate-manifest.mjs`) — actually run
  and verified against the sample content in this repo.
- The content system and markdown parser.
- Static export config (`next.config.js`).
- GLTFLoader tries `public/models/main-model.glb` first, falls back to the
  procedural shape on failure (expected until you add a real file — see
  `public/models/README.md`).
- Week and tutorial pages, including keyboard step navigation.

**Placeholder, by design, pending your input:**
- The opening animation (`components/IntroDraw.js`) is a minimal abstract
  line-draw, not the real hand-drawn "Drawer" signature trace — that needs
  your actual logo path data to look like a genuine signature rather than
  a fabricated one. Swap the SVG `<path>` in that file once you have it;
  the animation mechanism (stroke-dashoffset) won't need to change.
- Instagram/LinkedIn handles on the home page are literal "add handle
  here" placeholder text.
- No domain has been chosen or checked for availability — confirm before
  building deployment around one, per the original spec's own note.

**Genuinely untested:**
Everything that needs `npm install` or an actual `next build` — I don't
have network access in the environment this was built in, so nothing past
plain Node.js syntax checking and directly running the manifest generator
has been verified. Syntax was written carefully and I'm confident in it,
but "confident" isn't "tested." Please run `npm run build` early and tell
me what breaks, if anything does.

## Deployment

Static export → Vercel (or any static host). Use a private GitHub repo if
you want the source hidden — repo privacy, not the framework, is what does
that; the built HTML/CSS/JS is visible to any visitor regardless of repo
visibility.
