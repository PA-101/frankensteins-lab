# Design: Frankenstein's Lab

## File Structure

```
frankensteins-lab/
  index.html       — single page, all UI
  style.css        — layout, spooky theme, animation classes
  game.js          — parts data, level data, physics engine, animation controller
  assets/
    bodies/        — 3 SVG body sprites
    limbs/         — 3 SVG limb sprites
    batteries/     — 3 SVG battery sprites
    tracks/
      flat.svg     — Flat Graveyard Road background
      mud.svg      — Muddy Hill background
      bridge.svg   — Rickety Bridge background
    scientist.svg  — mad scientist character
```

No frameworks. No build step. Open `index.html` in a browser and it works.

## Parts Data (game.js)

Each part is a plain object:

```js
{ id, label, mass, width, height, stability_bonus, power, capacity }
```

| Part | mass | width | height | stability_bonus | power | capacity |
|---|---|---|---|---|---|---|
| Light Frame | 1.0 | 1.2 | 1.0 | — | — | — |
| Heavy Torso | 2.0 | 0.9 | 1.6 | — | — | — |
| Barrel Chest | 1.5 | 1.5 | 1.1 | — | — | — |
| Spindly Legs | — | — | — | 0.0 | — | — |
| Wide Wheels  | — | — | — | 0.3 | — | — |
| Springy Coils| — | — | — | 0.1 | — | — |
| Tiny Cell    | — | — | — | — | 0.5 | 0.4 |
| Standard Pack| — | — | — | — | 1.2 | 0.5 |
| Mega Cap     | — | — | — | — | 1.6 | 1.8 |

## Level Data (game.js)

```js
const LEVELS = [
  { id: 'flat',   label: 'Flat Graveyard Road', balance: 0.70, torque: 0.60, range: 0.50,
    track: 'assets/tracks/flat.svg',
    flavour: 'on the graveyard road' },
  { id: 'mud',    label: 'Muddy Hill',           balance: 0.70, torque: 0.90, range: 0.65,
    track: 'assets/tracks/mud.svg',
    flavour: 'on the muddy hill' },
  { id: 'bridge', label: 'Rickety Bridge',       balance: 1.10, torque: 0.65, range: 0.50,
    track: 'assets/tracks/bridge.svg',
    flavour: 'on the rickety bridge' },
];
```

Distribution (tip / spin / battery / success out of 27 combos):
- Flat: 6 / 7 / 4 / 10
- Mud: 6 / 12 / 3 / 6
- Bridge: 9 / 6 / 3 / 9

## Physics Engine (game.js)

```js
function evaluate(body, limb, battery, level) {
  const torque  = battery.power    / body.mass;
  const balance = body.width / body.height + limb.stability_bonus;
  const range   = battery.capacity / body.mass;

  if (balance < level.balance) return { outcome: 'tip',     torque, balance, range };
  if (torque  < level.torque)  return { outcome: 'spin',    torque, balance, range };
  if (range   < level.range)   return { outcome: 'battery', torque, balance, range };
  return                              { outcome: 'success',  torque, balance, range };
}
```

## UI Layout (index.html)

```
┌─────────────────────────────────────┐
│  🧪 Frankenstein's Lab              │
├──────────┬──────────┬───────────────┤
│  Body    │ Movement │  Battery      │
│ [3 cards]│ [3 cards]│  [3 cards]    │
├──────────┴──────────┴───────────────┤
│  Choose Terrain: [Flat][Mud][Bridge]│
├─────────────────────────────────────┤
│        [Bring it to life!]          │
├─────────────────────────────────────┤
│  [track animation area]             │
├─────────────────────────────────────┤
│  🧑‍🔬 Mad Scientist speech bubble     │
│      [Try Again]                    │
└─────────────────────────────────────┘
```

## Animation

The robot is assembled from two stacked SVG sprites (body + limbs) positioned absolutely inside the track wrapper. The track background (`<img class="track-bg">`) swaps `src` when the user picks a level.

Animation classes (applied by JS):

| Class | Effect |
|---|---|
| `.anim-move` | Translates robot left→right to finish, using `--stop-x` CSS var |
| `.anim-tip` | Rotates robot 90° and fades |
| `.anim-spin` | Violent shake without forward movement |
| `.anim-stop` | Coasts to partial stop, glow fades |

## Scope Cuts (to fit 8 days solo)

- No sound.
- No mobile layout (desktop-first only).
- No persistent high score.
- No part unlock progression.
- Scientist has one static pose (no lip-sync or idle animation).
