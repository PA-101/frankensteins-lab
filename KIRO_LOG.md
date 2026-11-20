# KIRO_LOG — Frankenstein's Lab

A plain-language record of Kiro features used in this project and what each one did.

---

## 1. Project cloning

**Feature:** Shell command via Kiro's terminal tool.
**What it did:** Cloned the GitHub repo into `C:\Users\prana\projects\frankensteins-lab` with `git clone`.

---

## 2. Steering document (`.kiro\steering\product.md`)

**Feature:** Kiro steering file — a markdown file in `.kiro\steering\` that Kiro reads as persistent project context.
**What it did:** Gave Kiro a one-paragraph description of the project (name, genre, hackathon category). Every subsequent request in this project picks up that context automatically, so Kiro doesn't need to be re-told what the game is.

---

## 3. Spec files (`.kiro\specs\lab-core\`)

**Feature:** Kiro spec folder — structured `requirements.md`, `design.md`, and `tasks.md` files that define what to build and in what order.
**What it did:** Gave the project a clear build plan. Kiro used `tasks.md` as a checklist, ticking tasks off as they were completed. Requirements and design were updated when new features (levels) were added.

---

## 4. Scaffolding (Tasks 1–4)

**Feature:** File creation tools (`fs_write`) and SVG asset generation.
**What it did:** Created `index.html`, `style.css`, `game.js`, and all 10 SVG assets (3 bodies, 3 limbs, 3 batteries, 1 scientist, 1 track). Set up the spooky visual theme with Creepster + Share Tech Mono fonts and the green/amber glow palette.

---

## 5. Physics engine and unit tests (Tasks 5–7)

**Feature:** `game.js` logic + plain-JS test runner in `tests.js`.
**What it did:** Implemented `evaluate()` with three formulas (torque, balance, range). Ran all 27 part combinations through Node before writing any test expectations — caught a distribution bug (zero battery failures) and tuned part values before committing. Tests run with `node tests.js`, no test framework required.

---

## 6. Animation (Tasks 8–10)

**Feature:** CSS keyframes + JS animation controller.
**What it did:** Four distinct animations: smooth drive to finish, tip-over fall, stall shake, battery coast-and-fade. Stop position driven by physics scores via CSS custom properties (`--stop-x`) so a strong build travels further than a weak one.

---

## 7. Dr. Voltan dialogue (Task 11)

**Feature:** Template dialogue engine + typewriter effect in `game.js`.
**What it did:** Four outcome buckets × 3 variant lines each, chosen by a deterministic hash of the part IDs. Each line names the terrain, the failing score, the actual number, and the threshold. Text types out one character at a time for atmosphere. Tests verified all 27 combos produce a non-empty string and each outcome has three distinct lines.

---

## 8. Terrain levels

**Feature:** Per-level physics threshold objects in `LEVELS[]`.
**What it did:** Added three terrain levels (Flat / Mud / Bridge), each with different balance/torque/range thresholds. UI adds a level-picker row; track background SVG swaps when a level is selected. Tests cover all 3 × 27 = 81 combos.

---

## 9. Property-based tests (`tests.property.js`)

**Feature:** Hand-rolled property-testing engine (no library — npm unavailable on this machine).
**What it did:** Defined 14 mathematical invariants (outcome always valid, scores always finite, monotonicity of torque/balance/range, threshold monotonicity, rangeToPct bounds, dialogue never empty, result shape, determinism). Checked each against 500 random synthetic inputs — 7 000 total samples. No bugs found; the physics formulas are consistent with their mathematical properties.

---

## 10. Design steering (`.kiro\steering\design.md`)

**Feature:** Second steering file, focused on visual rules.
**What it did:** Recorded the colour palette, typography rules, glow constraints, layout rules (no text over icons), animation guidelines, and accessibility notes. Kiro reads this automatically in future requests, keeping visual changes consistent without re-describing the style each time.

---

## 11. Agent hook (`.kiro\hooks\run-tests-on-game-change.json`)

**Feature:** Kiro hooks — JSON files in `.kiro\hooks\` that declare triggers and actions.
**What it did:** Registered a `file_change` trigger on `game.js` that runs `node tests.js && node tests.property.js` automatically when the file is saved. **Requires the Kiro IDE** to activate — the hook runner is part of the Kiro editor, not a standalone process. Running the tests manually (`node tests.js`) always works without the IDE.

---

## Notes

- All work done as a static web app — no backend, no build step, no npm.
- Tests run with `node tests.js` and `node tests.property.js` from the project root.
- The game opens by double-clicking `index.html` in a browser.
