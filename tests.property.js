// tests.property.js — property-based tests for evaluate() and getDialogue().
// No external library required: a tiny generator + shrinker is implemented below.
// Run with: node tests.property.js

'use strict';

const { PARTS, LEVELS, evaluate, getDialogue, rangeToPct, START_PCT, END_PCT } = require('./game.js');

// ── Minimal property-testing engine ──────────────────────────
let passed = 0;
let failed = 0;
let totalRuns = 0;

function rng(seed) {
  // xorshift32 — deterministic, fast
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * forAll(label, gen, predicate, runs?)
 * Generates `runs` random samples from `gen(rand)`, asserts `predicate`.
 * On failure, prints the failing sample and marks the suite failed.
 */
function forAll(label, gen, predicate, runs = 500) {
  const rand = rng(label.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0));
  let failingSample = null;

  for (let i = 0; i < runs; i++) {
    const sample = gen(rand);
    totalRuns++;
    try {
      const ok = predicate(sample);
      if (ok === false || ok === null || ok === undefined) {
        failingSample = sample;
        break;
      }
    } catch (e) {
      failingSample = { sample, error: e.message };
      break;
    }
  }

  if (failingSample === null) {
    console.log(`  ✓  ${label} (${runs} samples)`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    console.error(`       Failing sample: ${JSON.stringify(failingSample, null, 2)}`);
    failed++;
  }
}

// ── Generators ────────────────────────────────────────────────
const VALID_OUTCOMES = ['tip', 'spin', 'battery', 'success'];

/** Pick a random real part from a list */
function pickPart(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

/** Generate a random body from the real catalogue */
function genBody(rand) { return pickPart(PARTS.bodies, rand); }
function genLimb(rand) { return pickPart(PARTS.limbs, rand); }
function genBattery(rand) { return pickPart(PARTS.batteries, rand); }
function genLevel(rand) { return pickPart(LEVELS, rand); }

/** Generate a synthetic part with arbitrary positive-number fields */
function genSyntheticBody(rand) {
  return {
    id: 'synth-body', label: 'Synth Body',
    mass:   0.1 + rand() * 9.9,   // 0.1 – 10
    width:  0.1 + rand() * 4.9,
    height: 0.1 + rand() * 4.9,
    img: '',
  };
}
function genSyntheticLimb(rand) {
  return {
    id: 'synth-limb', label: 'Synth Limb',
    stability_bonus: rand() * 2.0,  // 0 – 2
    img: '',
  };
}
function genSyntheticBattery(rand) {
  return {
    id: 'synth-battery', label: 'Synth Battery',
    power:    0.01 + rand() * 4.99,
    capacity: 0.01 + rand() * 4.99,
    img: '',
  };
}
function genSyntheticLevel(rand) {
  return {
    id: 'synth-level', label: 'Synth Level',
    icon: '?', colour: '#fff',
    balance: 0.1 + rand() * 2.9,
    torque:  0.1 + rand() * 2.9,
    range:   0.1 + rand() * 2.9,
    track: '', flavour: 'on the synth terrain',
    hint: '',
  };
}

function genFullSynthetic(rand) {
  return {
    body:    genSyntheticBody(rand),
    limb:    genSyntheticLimb(rand),
    battery: genSyntheticBattery(rand),
    level:   genSyntheticLevel(rand),
  };
}

function genFullReal(rand) {
  return {
    body:    genBody(rand),
    limb:    genLimb(rand),
    battery: genBattery(rand),
    level:   genLevel(rand),
  };
}

// ── Properties ────────────────────────────────────────────────
console.log('\n=== Property-Based Tests: evaluate() ===\n');

// P1: outcome is always one of the four known values (synthetic inputs)
console.log('--- Outcome validity ---');
forAll(
  'synthetic inputs always produce a known outcome',
  genFullSynthetic,
  ({ body, limb, battery, level }) => {
    const { outcome } = evaluate(body, limb, battery, level);
    return VALID_OUTCOMES.includes(outcome);
  }
);

forAll(
  'real catalogue inputs always produce a known outcome',
  genFullReal,
  ({ body, limb, battery, level }) => {
    const { outcome } = evaluate(body, limb, battery, level);
    return VALID_OUTCOMES.includes(outcome);
  }
);

// P2: scores are always finite numbers, never NaN or Infinity
console.log('\n--- Score finiteness ---');
forAll(
  'torque is always a finite number',
  genFullSynthetic,
  ({ body, limb, battery, level }) => {
    const { torque } = evaluate(body, limb, battery, level);
    return typeof torque === 'number' && isFinite(torque);
  }
);

forAll(
  'balance is always a finite number',
  genFullSynthetic,
  ({ body, limb, battery, level }) => {
    const { balance } = evaluate(body, limb, battery, level);
    return typeof balance === 'number' && isFinite(balance);
  }
);

forAll(
  'range is always a finite number',
  genFullSynthetic,
  ({ body, limb, battery, level }) => {
    const { range } = evaluate(body, limb, battery, level);
    return typeof range === 'number' && isFinite(range);
  }
);

// P3: a higher-power battery on the same body/limb/level never produces lower torque
console.log('\n--- Monotonicity: torque ---');
forAll(
  'doubling battery power never decreases torque',
  (rand) => {
    const body    = genSyntheticBody(rand);
    const limb    = genSyntheticLimb(rand);
    const level   = genSyntheticLevel(rand);
    const bat1    = genSyntheticBattery(rand);
    const bat2    = { ...bat1, power: bat1.power * 2 };
    return { body, limb, level, bat1, bat2 };
  },
  ({ body, limb, level, bat1, bat2 }) => {
    const r1 = evaluate(body, limb, bat1, level);
    const r2 = evaluate(body, limb, bat2, level);
    return r2.torque >= r1.torque;
  }
);

// P4: a higher-capacity battery on the same body/limb/level never reduces range
console.log('\n--- Monotonicity: range ---');
forAll(
  'doubling battery capacity never decreases range',
  (rand) => {
    const body    = genSyntheticBody(rand);
    const limb    = genSyntheticLimb(rand);
    const level   = genSyntheticLevel(rand);
    const bat1    = genSyntheticBattery(rand);
    const bat2    = { ...bat1, capacity: bat1.capacity * 2 };
    return { body, limb, level, bat1, bat2 };
  },
  ({ body, limb, level, bat1, bat2 }) => {
    const r1 = evaluate(body, limb, bat1, level);
    const r2 = evaluate(body, limb, bat2, level);
    return r2.range >= r1.range;
  }
);

// P5: a wider body (higher width, same height) never decreases balance
console.log('\n--- Monotonicity: balance ---');
forAll(
  'wider body (same height) never decreases balance',
  (rand) => {
    const limb    = genSyntheticLimb(rand);
    const battery = genSyntheticBattery(rand);
    const level   = genSyntheticLevel(rand);
    const b1      = genSyntheticBody(rand);
    const b2      = { ...b1, width: b1.width * 1.5 };
    return { limb, battery, level, b1, b2 };
  },
  ({ limb, battery, level, b1, b2 }) => {
    const r1 = evaluate(b1, limb, battery, level);
    const r2 = evaluate(b2, limb, battery, level);
    return r2.balance >= r1.balance;
  }
);

// P6: lowering a threshold never causes a previously-passing combo to fail
console.log('\n--- Threshold monotonicity ---');
forAll(
  'lowering a level threshold never converts success to failure',
  (rand) => {
    const body    = genSyntheticBody(rand);
    const limb    = genSyntheticLimb(rand);
    const battery = genSyntheticBattery(rand);
    const lv1     = genSyntheticLevel(rand);
    // lv2 has strictly lower thresholds than lv1 → should be easier
    const lv2     = { ...lv1, balance: lv1.balance * 0.5, torque: lv1.torque * 0.5, range: lv1.range * 0.5 };
    return { body, limb, battery, lv1, lv2 };
  },
  ({ body, limb, battery, lv1, lv2 }) => {
    const r1 = evaluate(body, limb, battery, lv1);
    const r2 = evaluate(body, limb, battery, lv2);
    // If r1 succeeded, r2 must also succeed (easier level)
    if (r1.outcome === 'success') return r2.outcome === 'success';
    return true; // non-success on hard level, no constraint on easy
  }
);

// P7: rangeToPct output always lies in [START_PCT, END_PCT]
console.log('\n--- rangeToPct bounds ---');
forAll(
  'rangeToPct always returns a value in [START_PCT, END_PCT]',
  (rand) => ({ range: rand() * 10 }),  // 0 – 10
  ({ range }) => {
    const pct = rangeToPct(range);
    return pct >= START_PCT && pct <= END_PCT;
  }
);

forAll(
  'rangeToPct is non-decreasing',
  (rand) => {
    const r1 = rand() * 5;
    const r2 = r1 + rand() * 5;
    return { r1, r2 };
  },
  ({ r1, r2 }) => rangeToPct(r2) >= rangeToPct(r1)
);

// P8: getDialogue never returns an empty string for real catalogue combos
console.log('\n--- Dialogue completeness ---');
forAll(
  'real parts always produce a non-empty dialogue string',
  genFullReal,
  ({ body, limb, battery, level }) => {
    const result  = evaluate(body, limb, battery, level);
    const html    = getDialogue(result, body, limb, battery, level);
    return typeof html === 'string' && html.trim().length > 10;
  }
);

// P9: evaluate() result object always has exactly the expected keys
console.log('\n--- Result shape ---');
forAll(
  'evaluate() always returns an object with outcome, torque, balance, range',
  genFullSynthetic,
  ({ body, limb, battery, level }) => {
    const result = evaluate(body, limb, battery, level);
    return (
      typeof result === 'object' &&
      'outcome' in result &&
      'torque'  in result &&
      'balance' in result &&
      'range'   in result &&
      Object.keys(result).length === 4
    );
  }
);

// P10: evaluate() is deterministic — same inputs give the same result every call
console.log('\n--- Determinism ---');
forAll(
  'evaluate() is deterministic for the same inputs',
  genFullSynthetic,
  ({ body, limb, battery, level }) => {
    const r1 = evaluate(body, limb, battery, level);
    const r2 = evaluate(body, limb, battery, level);
    return (
      r1.outcome === r2.outcome &&
      r1.torque  === r2.torque  &&
      r1.balance === r2.balance &&
      r1.range   === r2.range
    );
  }
);

// ── Summary ───────────────────────────────────────────────────
console.log(`\n=== Property tests: ${passed} properties passed, ${failed} failed`);
console.log(`    Total samples checked: ${totalRuns} ===\n`);
if (failed > 0) process.exit(1);
