// tests.js — plain JS unit tests for evaluate(), no framework.
// Run with: node tests.js

'use strict';

const { PARTS, THRESHOLD, evaluate, rangeToPct, START_PCT, END_PCT } = require('./game.js');

// ── Tiny test harness ─────────────────────────────────────────
let passed = 0;
let failed = 0;

function expect(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✓  ${description}`);
    passed++;
  } else {
    console.error(`  ✗  ${description}`);
    console.error(`       expected: ${expected}`);
    console.error(`       got:      ${actual}`);
    failed++;
  }
}

function expectTrue(description, condition) {
  expect(description, condition, true);
}

// ── Helper: look up parts by id ───────────────────────────────
function body(id)    { return PARTS.bodies.find(p => p.id === id); }
function limb(id)    { return PARTS.limbs.find(p => p.id === id); }
function battery(id) { return PARTS.batteries.find(p => p.id === id); }

// ── Ground truth for all 27 combos ───────────────────────────
const EXPECTED = [
  // light-frame
  ['light-frame', 'spindly-legs',  'tiny-cell',      'spin'],
  ['light-frame', 'spindly-legs',  'standard-pack',  'success'],
  ['light-frame', 'spindly-legs',  'mega-capacitor', 'success'],
  ['light-frame', 'wide-wheels',   'tiny-cell',      'spin'],
  ['light-frame', 'wide-wheels',   'standard-pack',  'success'],
  ['light-frame', 'wide-wheels',   'mega-capacitor', 'success'],
  ['light-frame', 'springy-coils', 'tiny-cell',      'spin'],
  ['light-frame', 'springy-coils', 'standard-pack',  'success'],
  ['light-frame', 'springy-coils', 'mega-capacitor', 'success'],
  // heavy-torso
  ['heavy-torso', 'spindly-legs',  'tiny-cell',      'tip'],
  ['heavy-torso', 'spindly-legs',  'standard-pack',  'tip'],
  ['heavy-torso', 'spindly-legs',  'mega-capacitor', 'tip'],
  ['heavy-torso', 'wide-wheels',   'tiny-cell',      'spin'],
  ['heavy-torso', 'wide-wheels',   'standard-pack',  'battery'],
  ['heavy-torso', 'wide-wheels',   'mega-capacitor', 'success'],
  ['heavy-torso', 'springy-coils', 'tiny-cell',      'tip'],
  ['heavy-torso', 'springy-coils', 'standard-pack',  'tip'],
  ['heavy-torso', 'springy-coils', 'mega-capacitor', 'tip'],
  // barrel-chest
  ['barrel-chest', 'spindly-legs',  'tiny-cell',      'spin'],
  ['barrel-chest', 'spindly-legs',  'standard-pack',  'battery'],
  ['barrel-chest', 'spindly-legs',  'mega-capacitor', 'success'],
  ['barrel-chest', 'wide-wheels',   'tiny-cell',      'spin'],
  ['barrel-chest', 'wide-wheels',   'standard-pack',  'battery'],
  ['barrel-chest', 'wide-wheels',   'mega-capacitor', 'success'],
  ['barrel-chest', 'springy-coils', 'tiny-cell',      'spin'],
  ['barrel-chest', 'springy-coils', 'standard-pack',  'battery'],
  ['barrel-chest', 'springy-coils', 'mega-capacitor', 'success'],
];

// ── Run tests ─────────────────────────────────────────────────
console.log('\n=== Frankenstein\'s Lab — Physics Tests ===\n');

// 1. All 27 combo outcomes
console.log('--- All 27 part combinations ---');
for (const [b, l, bat, expectedOutcome] of EXPECTED) {
  const result = evaluate(body(b), limb(l), battery(bat));
  expect(`${b} + ${l} + ${bat}`, result.outcome, expectedOutcome);
}

// 2. Score types are numbers
console.log('\n--- Score fields are numbers ---');
const sample = evaluate(body('light-frame'), limb('wide-wheels'), battery('standard-pack'));
expect('torque is a number',  typeof sample.torque,  'number');
expect('balance is a number', typeof sample.balance, 'number');
expect('range is a number',   typeof sample.range,   'number');

// 3. Exact threshold edge cases
console.log('\n--- Threshold boundary cases ---');
const edgeBalanceFail = evaluate(
  { mass: 1, width: 0.69, height: 1.0 },
  { stability_bonus: 0 },
  { power: 2, capacity: 2 }
);
expect('balance = 0.69 → tip', edgeBalanceFail.outcome, 'tip');

const edgeBalancePass = evaluate(
  { mass: 1, width: 0.70, height: 1.0 },
  { stability_bonus: 0 },
  { power: 2, capacity: 2 }
);
expect('balance = 0.70 → not tip (success)', edgeBalancePass.outcome, 'success');

const edgeTorqueFail = evaluate(
  { mass: 1, width: 1.0, height: 1.0 },
  { stability_bonus: 0 },
  { power: 0.59, capacity: 2 }
);
expect('torque = 0.59 → spin', edgeTorqueFail.outcome, 'spin');

const edgeTorquePass = evaluate(
  { mass: 1, width: 1.0, height: 1.0 },
  { stability_bonus: 0 },
  { power: 0.60, capacity: 2 }
);
expect('torque = 0.60 → not spin (success)', edgeTorquePass.outcome, 'success');

const edgeRangeFail = evaluate(
  { mass: 1, width: 1.0, height: 1.0 },
  { stability_bonus: 0 },
  { power: 1.0, capacity: 0.49 }
);
expect('range = 0.49 → battery', edgeRangeFail.outcome, 'battery');

const edgeRangePass = evaluate(
  { mass: 1, width: 1.0, height: 1.0 },
  { stability_bonus: 0 },
  { power: 1.0, capacity: 0.50 }
);
expect('range = 0.50 → success', edgeRangePass.outcome, 'success');

// 4. Outcome distribution sanity check
console.log('\n--- Outcome distribution ---');
const counts = { tip: 0, spin: 0, battery: 0, success: 0 };
for (const [b, l, bat] of EXPECTED.map(r => r.slice(0, 3))) {
  counts[evaluate(body(b), limb(l), battery(bat)).outcome]++;
}
expect('at least 1 tip outcome',     counts.tip     >= 1, true);
expect('at least 1 spin outcome',    counts.spin    >= 1, true);
expect('at least 1 battery outcome', counts.battery >= 1, true);
expect('at least 1 success outcome', counts.success >= 1, true);
expect('all 27 combos covered',      Object.values(counts).reduce((a, b) => a + b, 0), 27);

// 5. Distance / stop-position logic
console.log('\n--- Stop-position mapping (rangeToPct) ---');

// Low range → closer to start
const lowRangePct  = rangeToPct(0.5);   // just above battery threshold
const highRangePct = rangeToPct(1.5);   // near success territory
expectTrue('low range stops before high range',  lowRangePct < highRangePct);
expectTrue('low range stop is after START_PCT',  lowRangePct > START_PCT);
expectTrue('high range stop is before END_PCT',  highRangePct <= END_PCT);

// Minimum clamp: very tiny range doesn't go below START+10%
const tinyRangePct = rangeToPct(0.01);
expectTrue('tiny range is clamped above start',  tinyRangePct >= START_PCT);

// Maximum clamp: very large range doesn't overshoot END
const hugeRangePct = rangeToPct(999);
expectTrue('huge range is clamped at END_PCT',   hugeRangePct <= END_PCT);

// Battery combos should produce a stop well short of the finish
const batteryResult = evaluate(body('barrel-chest'), limb('wide-wheels'), battery('standard-pack'));
expect('barrel+wide+standard is battery failure', batteryResult.outcome, 'battery');
const stopPct = rangeToPct(batteryResult.range);
expectTrue('battery stop is left of finish',  stopPct < END_PCT);
expectTrue('battery stop is right of start',  stopPct > START_PCT);

// Success combos should use END_PCT (finish line)
// (the mapping for success bypasses rangeToPct and uses END_PCT directly — just verify range score is high)
const successResult = evaluate(body('light-frame'), limb('wide-wheels'), battery('mega-capacitor'));
expect('light+wide+mega is success', successResult.outcome, 'success');
expectTrue('success range score is well above threshold', successResult.range >= THRESHOLD.range);

// ── Summary ───────────────────────────────────────────────────
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
