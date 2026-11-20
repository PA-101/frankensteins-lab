// tests.js — plain JS unit tests for evaluate(), no framework.
// Run with: node tests.js

'use strict';

const { PARTS, LEVELS, THRESHOLD, evaluate, rangeToPct, START_PCT, END_PCT,
        getDialogue, variantIndex } = require('./game.js');

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

// 6. Dr. Voltan dialogue — all 27 combos produce a non-empty string
console.log('\n--- Dr. Voltan dialogue (all 27 combos) ---');
for (const [b, l, bat, expectedOutcome] of EXPECTED) {
  const bodyPart    = body(b);
  const limbPart    = limb(l);
  const batteryPart = battery(bat);
  const result      = evaluate(bodyPart, limbPart, batteryPart);
  const dialogue    = getDialogue(result, bodyPart, limbPart, batteryPart);

  expectTrue(`${b} + ${l} + ${bat} → non-empty dialogue`,
    typeof dialogue === 'string' && dialogue.trim().length > 0);
}

// 7. Each outcome has 3 distinct lines (no two variants are identical)
console.log('\n--- Dialogue has 3 distinct lines per outcome ---');
for (const outcome of ['tip', 'spin', 'battery', 'success']) {
  // Find three combos that the hash assigns to variant 0, 1, and 2
  const byVariant = [null, null, null];
  for (const [b, l, bat, o] of EXPECTED) {
    if (o !== outcome) continue;
    const v = variantIndex(body(b), limb(l), battery(bat));
    if (byVariant[v] === null) byVariant[v] = [b, l, bat];
    if (byVariant.every(x => x !== null)) break;
  }
  if (byVariant.some(x => x === null)) {
    console.log(`  ⚠  could not find all 3 variants for '${outcome}' — hash distribution is too narrow`);
    continue;
  }
  const lines = byVariant.map(([b, l, bat]) => {
    const bp = body(b); const lp = limb(l); const batp = battery(bat);
    return getDialogue(evaluate(bp, lp, batp), bp, lp, batp);
  });
  expectTrue(`outcome '${outcome}': variant 0 ≠ variant 1`, lines[0] !== lines[1]);
  expectTrue(`outcome '${outcome}': variant 1 ≠ variant 2`, lines[1] !== lines[2]);
  expectTrue(`outcome '${outcome}': variant 0 ≠ variant 2`, lines[0] !== lines[2]);
}

// 8. Dialogue contains the real numbers relevant to each outcome
console.log('\n--- Dialogue includes real physics numbers ---');
const checkNum = (desc, comboArr, scoreKeys) => {
  const [b, l, bat] = comboArr;
  const bp = body(b); const lp = limb(l); const batp = battery(bat);
  const result   = evaluate(bp, lp, batp);
  const dialogue = getDialogue(result, bp, lp, batp);
  const plain    = dialogue.replace(/<[^>]+>/g, ''); // strip HTML tags
  for (const key of scoreKeys) {
    const numStr = result[key].toFixed(2);
    expectTrue(`${desc}: contains ${key}=${numStr}`, plain.includes(numStr));
  }
};
// Each outcome only needs to show the score(s) it failed on
checkNum('success (light+wide+mega)',    ['light-frame',  'wide-wheels',   'mega-capacitor'], ['torque', 'balance', 'range']);
checkNum('tip    (heavy+spindly+tiny)',  ['heavy-torso',  'spindly-legs',  'tiny-cell'],      ['balance']);
checkNum('spin   (barrel+spindly+tiny)', ['barrel-chest', 'spindly-legs',  'tiny-cell'],      ['torque']);
checkNum('battery(barrel+wide+standard)',['barrel-chest', 'wide-wheels',   'standard-pack'],  ['range']);

// 9. variantIndex returns 0, 1, or 2 for all 27 combos
console.log('\n--- variantIndex is always 0, 1, or 2 ---');
for (const [b, l, bat] of EXPECTED.map(r => r.slice(0, 3))) {
  const v = variantIndex(body(b), limb(l), battery(bat));
  expectTrue(`${b}+${l}+${bat} variant in {0,1,2}`, v === 0 || v === 1 || v === 2);
}

// 10. All 3 levels × 27 combos: produce a valid outcome and non-empty dialogue
console.log('\n--- All 3 levels × 27 combos ---');

// Expected distributions (pre-computed):
// flat:   tip:6  spin:7  battery:4  success:10
// mud:    tip:6  spin:12 battery:3  success:6
// bridge: tip:9  spin:6  battery:3  success:9

const VALID_OUTCOMES = new Set(['tip', 'spin', 'battery', 'success']);

for (const level of LEVELS) {
  const levelCounts = { tip: 0, spin: 0, battery: 0, success: 0 };

  for (const [b, l, bat] of EXPECTED.map(r => r.slice(0, 3))) {
    const bp   = body(b);
    const lp   = limb(l);
    const batp = battery(bat);
    const result  = evaluate(bp, lp, batp, level);
    const dialogue = getDialogue(result, bp, lp, batp, level);

    expectTrue(
      `${level.id}: ${b}+${l}+${bat} → valid outcome`,
      VALID_OUTCOMES.has(result.outcome)
    );
    expectTrue(
      `${level.id}: ${b}+${l}+${bat} → non-empty dialogue`,
      typeof dialogue === 'string' && dialogue.trim().length > 0
    );
    // Dialogue must mention the terrain flavour text (case-insensitive)
    const plain = dialogue.replace(/<[^>]+>/g, '').toLowerCase();
    const terrainCheck = level.flavour.split(' ').slice(-2).join(' ').toLowerCase();
    expectTrue(
      `${level.id}: ${b}+${l}+${bat} → dialogue mentions terrain`,
      plain.includes(terrainCheck)
    );

    levelCounts[result.outcome]++;
  }

  // Each level must produce all four outcomes
  expectTrue(`${level.id}: has tip outcomes`,     levelCounts.tip     >= 1);
  expectTrue(`${level.id}: has spin outcomes`,    levelCounts.spin    >= 1);
  expectTrue(`${level.id}: has battery outcomes`, levelCounts.battery >= 1);
  expectTrue(`${level.id}: has success outcomes`, levelCounts.success >= 1);
  expectTrue(`${level.id}: covers all 27 combos`,
    Object.values(levelCounts).reduce((a, b) => a + b, 0) === 27);
}

// 11. Level thresholds differ between levels
console.log('\n--- Level thresholds are distinct ---');
const [flat, mud, bridge] = LEVELS;
expectTrue('mud torque threshold > flat torque threshold',    mud.torque    > flat.torque);
expectTrue('mud range threshold > flat range threshold',      mud.range     > flat.range);
expectTrue('bridge balance threshold > flat balance threshold', bridge.balance > flat.balance);
expectTrue('bridge balance threshold > mud balance threshold',  bridge.balance > mud.balance);

// 12. evaluate() with no level argument defaults to flat (level 0) thresholds
console.log('\n--- evaluate() defaults to flat thresholds when level omitted ---');
const flatResult    = evaluate(body('heavy-torso'), limb('spindly-legs'), battery('tiny-cell'), flat);
const defaultResult = evaluate(body('heavy-torso'), limb('spindly-legs'), battery('tiny-cell'));
expect('default level gives same outcome as flat', defaultResult.outcome, flatResult.outcome);

// ── Summary ───────────────────────────────────────────────────
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
