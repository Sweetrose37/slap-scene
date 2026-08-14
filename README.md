# SLAP SCENE — Sticker Art Prompt Builder

SLAP SCENE v1.0.0 is a local-first, responsive studio for composing production-aware sticker-art prompts. It builds text prompts and planning data; it does not generate final images.

## Run

Open `index.html` directly, or run `node dev-server.cjs 4173` and visit `http://127.0.0.1:4173`. No build step, backend, account, or API key is required.

## Install on a phone

Open the public HTTPS site on the phone and tap **INSTALL APP**. Android browsers can show the native installation prompt. On iPhone or iPad, the app displays the Safari **Share → Add to Home Screen** steps. The installed app uses a standalone window and keeps projects, uploaded images, and music in that device's browser storage.

## Features

- Build With Me, compatibility-aware Shake the Box, and role-based Mix the Lab.
- Coordinated prompt packs, cut-safe sticker-sheet plans, and lock-controlled Remix.
- Subject intelligence, material zoning, anti-repetition, anatomy safeguards, and category-specific originality guards.
- Local project/library persistence, clipboard actions, and human-readable TXT and structured JSON exports.
- Original sample collage in `assets/samples/slap-scene-hero.png` used only as a creative preview/concept board.

Projects, prompts, packs, sheets, locks, and recent remix state use browser `localStorage`. Corrupted or older saved data falls back to safe defaults. There is no backend, database, account, image API, or API key.

## Project structure

- `index.html` — approved application shell
- `css/styles.css` — dark/neon responsive visual system
- `js/data.js` — creative option libraries
- `js/app.js` — prompt intelligence, workflows, state, persistence, copy, and export logic
- `assets/samples/` — local decorative sample artwork
- `tests/` — Phase 3–6 regression and release QA scripts

Run `node tests/smoke.cjs` for prompt-composer smoke tests.

Run `node tests/phase4.cjs` for weighted Shake, smart-lock, fusion-role, tension-mediation, and Phase 4 prompt-integration tests.

Run `node tests/phase5.cjs` for collection anchors, anti-clone packs, recurring characters, sheet planning, Remix locks/intensities, production guards, and prompt metadata.

Run `node tests/phase6.cjs` for final v1.0.0 stress, validation, resilience, accessibility, asset, and release-regression checks.

## Phase 3 creative intelligence

The browser-only composer now includes categorized subject intelligence, optional character and diversity controls, fashion and hair direction, material zoning, subject-aware prompt language, compatibility guidance, session-level anti-repetition, sticker-format construction rules, deformation safeguards, and dynamic originality guards for footwear, accessories, vehicles, technology, sports, and entertainment-inspired concepts.

Phase 4 adds weighted SAFE/FRESH/WILD Shake modes, ten persistent smart locks, local shake-signature history, meaningful-difference rejection, Lab surprise experiments, LIGHT/BALANCED/HEAVY fusion, creative-role assignment, conflict mediation, tension analysis, and anti-mud hierarchy—all routed through the same production-aware prompt composer.
