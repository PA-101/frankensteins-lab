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

function runAnimation(result) {
  const stage   = document.getElementById('stage');
  const robot   = document.getElementById('robot');
  const bodyImg = document.getElementById('robot-body-img');
  const limbImg = document.getElementById('robot-limbs-img');

  // Set robot sprites to selected parts
  bodyImg.src = selection.body.img;
  bodyImg.alt = selection.body.label;
  limbImg.src = selection.limb.img;
  limbImg.alt = selection.limb.label;

  // Show stage
  stage.classList.add('visible');

  // Reset any previous animation classes and position
  robot.className = 'robot-sprite';
  robot.style.left = '60px';

  // Brief power-flash, then animate
  robot.classList.add('power-flash');

  setTimeout(() => {
    robot.classList.remove('power-flash');
    robot.classList.add(ANIM_CLASS[result.outcome]);

    // After animation ends, show scientist panel (Task 11 wires the text)
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

  // Deselect all cards
  document.querySelectorAll('.part-card').forEach(c => c.classList.remove('selected'));
  updateButton();

  // Hide stage and scientist
  const stage   = document.getElementById('stage');
  const panel   = document.getElementById('scientist-panel');
  const robot   = document.getElementById('robot');
  if (stage)  stage.classList.remove('visible');
  if (panel)  panel.classList.remove('visible');
  if (robot)  robot.className = 'robot-sprite';
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
  module.exports = { PARTS, THRESHOLD, evaluate };
}
