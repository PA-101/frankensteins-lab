// game.js — Frankenstein's Lab
// Tasks 1-4: parts data + selection UI wiring only.
// Physics, animation, and scientist panel come in later tasks.

'use strict';

// ── Parts catalogue ──────────────────────────────────────────
const PARTS = {
  bodies: [
    { id: 'light-frame',  label: 'Light Frame',  mass: 1.0, width: 1.2, height: 1.0, img: 'assets/bodies/light-frame.svg' },
    { id: 'heavy-torso',  label: 'Heavy Torso',  mass: 2.0, width: 1.0, height: 1.4, img: 'assets/bodies/heavy-torso.svg' },
    { id: 'barrel-chest', label: 'Barrel Chest', mass: 1.5, width: 1.5, height: 1.1, img: 'assets/bodies/barrel-chest.svg' },
  ],
  limbs: [
    { id: 'spindly-legs',  label: 'Spindly Legs',  stability_bonus: 0.0, img: 'assets/limbs/spindly-legs.svg' },
    { id: 'wide-wheels',   label: 'Wide Wheels',   stability_bonus: 0.3, img: 'assets/limbs/wide-wheels.svg' },
    { id: 'springy-coils', label: 'Springy Coils', stability_bonus: 0.1, img: 'assets/limbs/springy-coils.svg' },
  ],
  batteries: [
    { id: 'tiny-cell',       label: 'Tiny Cell',       power: 0.5, capacity: 0.4, img: 'assets/batteries/tiny-cell.svg' },
    { id: 'standard-pack',   label: 'Standard Pack',   power: 1.0, capacity: 1.0, img: 'assets/batteries/standard-pack.svg' },
    { id: 'mega-capacitor',  label: 'Mega Capacitor',  power: 1.6, capacity: 1.8, img: 'assets/batteries/mega-capacitor.svg' },
  ],
};

// ── Selection state ───────────────────────────────────────────
const selection = { body: null, limb: null, battery: null };

// ── DOM refs (populated on DOMContentLoaded) ──────────────────
let btnActivate;

// ── Build a single part card element ─────────────────────────
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
  // Deselect any other card in the same column
  const column = clickedCard.closest('.part-column');
  column.querySelectorAll('.part-card').forEach(c => c.classList.remove('selected'));

  // Select this card
  clickedCard.classList.add('selected');
  selection[category] = part;

  // Enable button when all three are chosen
  updateButton();
}

function updateButton() {
  const ready = selection.body && selection.limb && selection.battery;
  btnActivate.disabled = !ready;
}

// ── Populate a column with cards ─────────────────────────────
function buildColumn(containerId, parts, category) {
  const col = document.getElementById(containerId);
  if (!col) return;
  parts.forEach(part => col.appendChild(makeCard(part, category)));
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  btnActivate = document.getElementById('btn-activate');

  buildColumn('col-bodies',    PARTS.bodies,    'body');
  buildColumn('col-limbs',     PARTS.limbs,     'limb');
  buildColumn('col-batteries', PARTS.batteries, 'battery');

  // Button click handler is a stub until Task 10 wires animation
  btnActivate.addEventListener('click', () => {
    // TODO (Task 5+): run evaluate(), trigger animation
    console.log('Selected:', selection);
  });
});
