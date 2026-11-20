// game.js — Frankenstein's Lab
'use strict';

// ── Parts catalogue ──────────────────────────────────────────
const PARTS = {
  bodies: [
    { id: 'light-frame',  label: 'Light Frame',  mass: 1.0, width: 1.2, height: 1.0, img: 'assets/bodies/light-frame.svg' },
    { id: 'heavy-torso',  label: 'Heavy Torso',  mass: 2.0, width: 0.9, height: 1.6, img: 'assets/bodies/heavy-torso.svg' },
    { id: 'barrel-chest', label: 'Barrel Chest', mass: 1.5, width: 1.5, height: 1.1, img: 'assets/bodies/barrel-chest.svg' },
  ],
  limbs: [
    { id: 'spindly-legs',  label: 'Spindly Legs',  stability_bonus: 0.0, img: 'assets/limbs/spindly-legs.svg' },
    { id: 'wide-wheels',   label: 'Wide Wheels',   stability_bonus: 0.3, img: 'assets/limbs/wide-wheels.svg' },
    { id: 'springy-coils', label: 'Springy Coils', stability_bonus: 0.1, img: 'assets/limbs/springy-coils.svg' },
  ],
  batteries: [
    { id: 'tiny-cell',      label: 'Tiny Cell',       power: 0.5, capacity: 0.4, img: 'assets/batteries/tiny-cell.svg' },
    { id: 'standard-pack',  label: 'Standard Pack',   power: 1.2, capacity: 0.5, img: 'assets/batteries/standard-pack.svg' },
    { id: 'mega-capacitor', label: 'Mega Capacitor',  power: 1.6, capacity: 1.8, img: 'assets/batteries/mega-capacitor.svg' },
  ],
};

// ── Physics thresholds ────────────────────────────────────────
const THRESHOLD = { balance: 0.7, torque: 0.6, range: 0.5 };

// ── Physics engine ────────────────────────────────────────────
/**
 * evaluate(body, limb, battery) → { outcome, torque, balance, range }
 * outcome is one of: 'tip' | 'spin' | 'battery' | 'success'
 */
function evaluate(body, limb, battery) {
  const torque  = battery.power    / body.mass;
  const balance = body.width / body.height + limb.stability_bonus;
  const range   = battery.capacity / body.mass;

  let outcome;
  if      (balance < THRESHOLD.balance) outcome = 'tip';
  else if (torque  < THRESHOLD.torque)  outcome = 'spin';
  else if (range   < THRESHOLD.range)   outcome = 'battery';
  else                                   outcome = 'success';

  return { outcome, torque, balance, range };
}

// ── Selection state ───────────────────────────────────────────
const selection = { body: null, limb: null, battery: null };

// ── DOM refs ──────────────────────────────────────────────────
let btnActivate;

// ── Build a single part card ──────────────────────────────────
function makeCard(part, category) {
  const card = document.createElement('div');
  card.className = 'part-card';
  card.dataset.id = part.id;
  card.dataset.category = category;

  const img = document.createElement('img');
  img.src = part.img;
  img.alt = part.label;

  const name = document.createElement('div');
  name.className = 'part-card-name';
  name.textContent = part.label;

  card.appendChild(img);
  card.appendChild(name);
  card.addEventListener('click', () => selectPart(card, part, category));
  return card;
}

// ── Handle a card click ───────────────────────────────────────
function selectPart(clickedCard, part, category) {
  const column = clickedCard.closest('.part-column');
  column.querySelectorAll('.part-card').forEach(c => c.classList.remove('selected'));
  clickedCard.classList.add('selected');
  selection[category] = part;
  updateButton();
}

function updateButton() {
  btnActivate.disabled = !(selection.body && selection.limb && selection.battery);
}

// ── Populate a column ─────────────────────────────────────────
function buildColumn(containerId, parts, category) {
  const col = document.getElementById(containerId);
  if (!col) return;
  parts.forEach(part => col.appendChild(makeCard(part, category)));
}

// ── Animation controller ──────────────────────────────────────
const ANIM_CLASS = {
  tip:     'anim-tip',
  spin:    'anim-spin',
  battery: 'anim-stop',
  success: 'anim-move',
};

/*
 * Map a physics score to a pixel position inside the track.
 * The usable track runs from START_PX (~8% from left) to END_PX (~88% from left).
 * We express positions as percentages so they scale with the wrapper width.
 *
 * For success:  stop-x = END_PX  (finish line)
 * For battery:  stop-x = lerp(START_PX, END_PX, clamp(range / 1.5, 0.15, 0.85))
 *               A range score just above the threshold (0.5) → ~40% of the way.
 *               A range score near success (1.5+) → ~85% of the way.
 */
const START_PCT = 8;    // percent from left where the robot starts (near GO flag)
const END_PCT   = 82;   // percent from left where the finish line is

function rangeToPct(range) {
  // Clamp ratio between 0.1 and 1.0, map to [START_PCT, END_PCT]
  const ratio = Math.max(0.1, Math.min(range / 1.5, 1.0));
  return START_PCT + ratio * (END_PCT - START_PCT);
}

function runAnimation(result) {
  const stage   = document.getElementById('stage');
  const robot   = document.getElementById('robot');
  const bodyImg = document.getElementById('robot-body-img');
  const limbImg = document.getElementById('robot-limbs-img');

  // Set robot sprites
  bodyImg.src = selection.body.img;
  bodyImg.alt = selection.body.label;
  limbImg.src = selection.limb.img;
  limbImg.alt = selection.limb.label;

  // Show stage
  stage.classList.add('visible');

  // Clear any previous animation state fully
  robot.className = 'robot-sprite';
  // Removing a class doesn't restart a finished animation; force reflow
  void robot.offsetWidth; // eslint-disable-line no-void

  // Compute stop position as a percentage of wrapper width
  const startX = `${START_PCT}%`;
  let   stopX;

  if (result.outcome === 'success') {
    stopX = `${END_PCT}%`;
  } else if (result.outcome === 'battery') {
    // Partial travel proportional to range score (capped below END)
    const pct = Math.min(rangeToPct(result.range), END_PCT - 5);
    stopX = `${pct}%`;
  } else {
    // tip and spin: robot stays near start
    stopX = startX;
  }

  // Write positions as CSS custom properties so keyframes can read them
  robot.style.setProperty('--start-x', startX);
  robot.style.setProperty('--stop-x',  stopX);
  robot.style.left = startX;

  // Brief power-flash, then apply the outcome animation
  robot.classList.add('power-flash');

  setTimeout(() => {
    robot.classList.remove('power-flash');
    void robot.offsetWidth; // force reflow so power-flash removal is committed
    robot.classList.add(ANIM_CLASS[result.outcome]);

    // After the animation finishes, show the scientist panel
    robot.addEventListener('animationend', onAnimEnd, { once: true });
  }, 500);
}

function onAnimEnd() {
  // Scientist panel text is populated in Task 11.
  // For now, just make the panel visible.
  const panel = document.getElementById('scientist-panel');
  if (panel) panel.classList.add('visible');
}

// ── Reset / Try Again ─────────────────────────────────────────
function resetGame() {
  selection.body = null;
  selection.limb = null;
  selection.battery = null;

  document.querySelectorAll('.part-card').forEach(c => c.classList.remove('selected'));
  updateButton();

  const stage   = document.getElementById('stage');
  const panel   = document.getElementById('scientist-panel');
  const robot   = document.getElementById('robot');
  if (stage)  stage.classList.remove('visible');
  if (panel)  panel.classList.remove('visible');
  if (robot) {
    robot.className = 'robot-sprite';
    robot.style.removeProperty('--start-x');
    robot.style.removeProperty('--stop-x');
    robot.style.removeProperty('left');
  }
}

// ── Init (browser only) ───────────────────────────────────────
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  btnActivate = document.getElementById('btn-activate');

  buildColumn('col-bodies',    PARTS.bodies,    'body');
  buildColumn('col-limbs',     PARTS.limbs,     'limb');
  buildColumn('col-batteries', PARTS.batteries, 'battery');

  btnActivate.addEventListener('click', () => {
    if (!selection.body || !selection.limb || !selection.battery) return;
    const result = evaluate(selection.body, selection.limb, selection.battery);
    runAnimation(result);
    btnActivate.disabled = true;  // prevent double-click mid-animation
  });

  const tryAgain = document.getElementById('btn-try-again');
  if (tryAgain) tryAgain.addEventListener('click', resetGame);
});

// ── Export for tests (Node only) ─────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = { PARTS, THRESHOLD, evaluate, rangeToPct, START_PCT, END_PCT };
}
