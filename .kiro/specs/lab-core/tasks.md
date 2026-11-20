# Tasks: Frankenstein's Lab

Build order: scaffold → data → logic → visuals → animation → dialogue → polish → ship.

## Checklist

1. [x] Create `index.html`, `style.css`, `game.js` with empty stubs; confirm it opens in browser.
2. [x] Add spooky base theme to `style.css` (dark background, green accent, horror font via Google Fonts).
3. [x] Draw or source 3 body SVGs, 3 limb SVGs, 3 battery SVGs, 1 scientist SVG, 1 track SVG; drop in `assets/`.
4. [x] Build the parts selection UI: 3 columns of 3 cards each, highlight on click, one-active-per-column rule.
5. [x] Wire "Bring it to life!" button: disabled until all three columns have a selection.
6. [x] Implement `evaluate()` in `game.js` with the torque / balance / range formulas.
7. [x] Write unit tests (plain JS, no framework) for all 27 part combos; fix any tuning needed so outcomes are interesting.
8. [x] Build the animation area: assemble robot from selected SVG sprites using CSS stacking.
9. [x] Implement the four CSS keyframe animations (`anim-move`, `anim-tip`, `anim-spin`, `anim-stop`).
10. [x] Wire animation to outcome: on button click, run `evaluate()`, apply the matching class, fire scientist on `animationend`.
11. [ ] Build the Mad Scientist panel: character image + speech bubble; write four flavour-text templates (one per outcome) that interpolate the real numbers.
12. [ ] Implement "Try Again": reset selections, hide scientist panel, remove animation classes.
13. [ ] Cross-browser check in Chrome, Firefox, Safari; fix any SVG or animation issues.
14. [ ] Final playtest all 27 combos; adjust one or two part values if any outcome feels wrong.
15. [ ] Write a short `README.md` play guide (how to play, what the numbers mean).
16. [ ] Commit everything and push to GitHub. Done.
