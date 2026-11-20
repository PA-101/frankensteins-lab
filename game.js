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
  const panel = document.getElementById('scientist-panel');
  const textEl = document.getElementById('scientist-text');
  if (!panel || !textEl) return;

  const result = evaluate(selection.body, selection.limb, selection.battery);
  const html   = getDialogue(result, selection.body, selection.limb, selection.battery);

  textEl.innerHTML = '';
  panel.classList.add('visible');
  typewriterHTML(textEl, html, 22);
}

// ── Dr. Voltan dialogue engine ────────────────────────────────

/**
 * n(x) — format a number to 2 decimal places for display.
 */
function n(x) { return x.toFixed(2); }

/**
 * variantIndex(body, limb, battery) — deterministic 0/1/2 picker
 * so the same combo always shows the same line, but combos differ within an outcome.
 */
function variantIndex(body, limb, battery) {
  const s = body.id + limb.id + battery.id;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 3;
}

/**
 * getDialogue(result, body, limb, battery) → HTML string
 * Returns Dr. Voltan's explanation for this result.
 * Numbers are wrapped in <span class="highlight-num"> for amber styling.
 */
function getDialogue(result, body, limb, battery) {
  const { outcome, torque, balance, range } = result;
  const T  = `<span class="highlight-num">${n(torque)}</span>`;
  const B  = `<span class="highlight-num">${n(balance)}</span>`;
  const R  = `<span class="highlight-num">${n(range)}</span>`;
  const TH = `<span class="highlight-num">${n(THRESHOLD.torque)}</span>`;
  const BH = `<span class="highlight-num">${n(THRESHOLD.balance)}</span>`;
  const RH = `<span class="highlight-num">${n(THRESHOLD.range)}</span>`;
  const v  = variantIndex(body, limb, battery);

  const lines = {
    tip: [
      `Mwahahaha! Did you SEE that?! Your creation's balance score was a pitiful ${B} — `
      + `and I require at least ${BH} to stay upright. `
      + `The ${body.label} is too tall and narrow! `
      + `Torque × mass means nothing if the whole thing tips before the first step. `
      + `Add wider legs next time, you fool!`,

      `Oh, the BEAUTY of physics! Balance = width ÷ height + limb bonus. `
      + `Your ${body.label} gave you ${B}. `
      + `The minimum is ${BH}. `
      + `Even the ${limb.label} couldn't save it — their stability bonus was simply not enough. `
      + `It fell. Gloriously. As all tall things must.`,

      `Classic blunder! The ${body.label} has a dreadful width-to-height ratio. `
      + `Balance came out to ${B} — that's ${(THRESHOLD.balance - balance).toFixed(2)} below the ${BH} threshold. `
      + `The ${limb.label} added their bonus, but the math was doomed from the start. `
      + `My formula never lies. The grave never lies either.`,
    ],

    spin: [
      `HA! Torque = battery power ÷ body mass. `
      + `Your ${battery.label} produced ${n(battery.power)} of power, `
      + `divided by the ${body.label}'s mass of ${n(body.mass)}, `
      + `gives torque = ${T}. `
      + `I need at least ${TH}! The wheels spun magnificently and went absolutely nowhere. `
      + `More power, you imbecile!`,

      `The ${body.label} is simply too heavy for the ${battery.label}. `
      + `Torque = ${n(battery.power)} ÷ ${n(body.mass)} = ${T}. `
      + `Threshold: ${TH}. Gap: ${(THRESHOLD.torque - torque).toFixed(2)}. `
      + `It rattled, it shook, it spun its little wheels — `
      + `and stayed rooted to the spot like a tombstone. `
      + `Upgrade your power source!`,

      `My instruments confirm it: insufficient torque. `
      + `${n(battery.power)} watts into ${n(body.mass)} kg of ${body.label} = ${T} N·m. `
      + `Required: ${TH} N·m. `
      + `The deficit is ${(THRESHOLD.torque - torque).toFixed(2)}. `
      + `The creation WANTS to move — you can feel it shaking — `
      + `but physics is a cruel mistress. It cannot. Try a bigger battery!`,
    ],

    battery: [
      `It moved! Then… it didn't. Range = battery capacity ÷ body mass. `
      + `${n(battery.capacity)} ÷ ${n(body.mass)} = ${R}. `
      + `I demand at least ${RH} to reach the finish. `
      + `The ${battery.label} ran dry ${(THRESHOLD.range - range).toFixed(2)} units short. `
      + `The glow faded. The dream died. The ${body.label} just… stopped. Spectacular!`,

      `Torque was fine — ${T}, well above ${TH}. Balance was fine — ${B}. `
      + `But range? Range = ${n(battery.capacity)} capacity ÷ ${n(body.mass)} mass = ${R}. `
      + `The finish line needs ${RH}. `
      + `The ${battery.label} is simply too small for the ${body.label}. `
      + `It died mid-track, like a candle in a storm. Exquisite tragedy!`,

      `I've seen this before — always with the ${battery.label}. `
      + `Capacity: ${n(battery.capacity)}. Mass to haul: ${n(body.mass)}. `
      + `Range score: ${R}. Minimum to finish: ${RH}. `
      + `Your creation managed ${n(rangeToPct(range) - START_PCT)}% of the track before the lights went out. `
      + `More capacity, or a lighter body — those are your only paths to glory!`,
    ],

    success: [
      `YES! YES! IT WORKS! `
      + `Torque: ${T} ✓ (need ${TH}) — `
      + `Balance: ${B} ✓ (need ${BH}) — `
      + `Range: ${R} ✓ (need ${RH}). `
      + `All three scores pass! The ${body.label} with ${limb.label} and the ${battery.label} `
      + `is a masterpiece of mad engineering! `
      + `It REACHED THE FINISH LINE! My genius is confirmed once again!`,

      `FLAWLESS EXECUTION! `
      + `The ${battery.label} drove torque to ${T} — crushing the ${TH} minimum. `
      + `The ${body.label} balanced at ${B} — well above ${BH}. `
      + `And range hit ${R} — clearing the ${RH} threshold with room to spare. `
      + `I may have a tear in my eye. It's just the lab fumes. Probably.`,

      `The numbers don't lie and neither does Dr. Voltan! `
      + `Balance ${B}, torque ${T}, range ${R} — every single score above its threshold. `
      + `The ${limb.label} provided exactly the stability I needed; `
      + `the ${battery.label} had the range to close it out. `
      + `This combination WORKS. Write it down. Frame it. Tattoo it on your forearm!`,
    ],
  };

  return lines[outcome][v];
}

// ── Typewriter effect ─────────────────────────────────────────
/**
 * typewriterHTML(el, html, msPerChar)
 * Renders an HTML string one visible character at a time.
 * Tags are inserted instantly; only the text nodes are typed out.
 */
function typewriterHTML(el, html, msPerChar) {
  // Parse into a temporary container
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // Flatten into a sequence of { type: 'node'|'text', node, chars } items
  const steps = [];
  function walk(node, targetParent) {
    if (node.nodeType === Node.TEXT_NODE) {
      steps.push({ type: 'text', text: node.textContent, parent: targetParent });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(false); // shallow clone (no children)
      steps.push({ type: 'open', clone, parent: targetParent });
      node.childNodes.forEach(child => walk(child, clone));
    }
  }
  tmp.childNodes.forEach(child => walk(child, el));

  let stepIdx  = 0;
  let charIdx  = 0;
  let currentTextNode = null;

  function tick() {
    if (stepIdx >= steps.length) return; // done

    const step = steps[stepIdx];

    if (step.type === 'open') {
      step.parent.appendChild(step.clone);
      stepIdx++;
      tick(); // process next step immediately (tags are instant)
      return;
    }

    // text node
    if (charIdx === 0) {
      currentTextNode = document.createTextNode('');
      step.parent.appendChild(currentTextNode);
    }

    currentTextNode.textContent += step.text[charIdx];
    charIdx++;

    if (charIdx >= step.text.length) {
      stepIdx++;
      charIdx = 0;
      currentTextNode = null;
    }

    setTimeout(tick, msPerChar);
  }

  tick();
}
function resetGame() {
  selection.body = null;
  selection.limb = null;
  selection.battery = null;

  document.querySelectorAll('.part-card').forEach(c => c.classList.remove('selected'));
  updateButton();

  const stage   = document.getElementById('stage');
  const panel   = document.getElementById('scientist-panel');
  const robot   = document.getElementById('robot');
  const textEl  = document.getElementById('scientist-text');
  if (stage)  stage.classList.remove('visible');
  if (panel)  panel.classList.remove('visible');
  if (textEl) textEl.innerHTML = '';
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
  module.exports = { PARTS, THRESHOLD, evaluate, rangeToPct, START_PCT, END_PCT, getDialogue, variantIndex };
}
