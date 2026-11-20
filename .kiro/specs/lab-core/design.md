# Design: Frankenstein's Lab

## File Structure

```
frankensteins-lab/
  index.html       — single page, all UI
  style.css        — layout, spooky theme, animation classes
  game.js          — parts data, physics engine, animation controller
  assets/
    bodies/        — 3 SVG body sprites
    limbs/         — 3 SVG limb sprites
    batteries/     — 3 SVG battery sprites
    scientist.svg  — mad scientist character
    track.svg      — flat ground track background
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
| Heavy Torso | 2.0 | 1.0 | 1.4 | — | — | — |
| Barrel Chest | 1.5 | 1.5 | 1.1 | — | — | — |
| Spindly Legs | — | — | — | 0.0 | — | — |
| Wide Wheels  | — | — | — | 0.3 | — | — |
| Springy Coils| — | — | — | 0.1 | — | — |
| Tiny Cell    | — | — | — | — | 0.5 | 0.4 |
| Standard Pack| — | — | — | — | 1.0 | 1.0 |
| Mega Capacitor| — | — | — | — | 1.6 | 1.8 |

(Exact numbers tuned during Day 4 playtesting so all 27 combos have at least one failure and at least one success path.)

## Physics Engine (game.js)

```js
function evaluate(body, limb, battery) {
  const torque  = battery.power / body.mass;
  const balance = body.width / body.height + limb.stability_bonus;
  const range   = battery.capacity / body.mass;

  if (balance < 0.7) return { outcome: 'tip',     torque, balance, range };
  if (torque  < 0.6) return { outcome: 'spin',    torque, balance, range };
  if (range   < 0.5) return { outcome: 'battery', torque, balance, range };
  return               { outcome: 'success',  torque, balance, range };
}
```

## Animation (style.css + game.js)

The robot is assembled from three stacked SVG sprites positioned with CSS. Animation uses CSS keyframe classes toggled by JS:

| Class | Effect |
|---|---|
| `.anim-move` | Translates robot from left to right over 4 s |
| `.anim-tip` | Rotates robot 90° over 1.5 s, then fades |
| `.anim-spin` | Wheels spin, no X translation |
| `.anim-stop` | Robot decelerates to a halt mid-track |

JS adds the class after a 500 ms "power-up" flash, then fires a callback on `animationend` to show the scientist panel.

## UI Layout (index.html)

```
┌─────────────────────────────────────┐
│  🧪 Frankenstein's Lab              │
├──────────┬──────────┬───────────────┤
│  Body    │ Movement │  Battery      │
│ [3 cards]│ [3 cards]│  [3 cards]    │
├──────────┴──────────┴───────────────┤
│        [Bring it to life!]          │
├─────────────────────────────────────┤
│  [track animation area]             │
├─────────────────────────────────────┤
│  🧑‍🔬 Mad Scientist speech bubble     │
│      [Try Again]                    │
└─────────────────────────────────────┘
```

## Scope Cuts (to fit 8 days solo)

- No sound.
- No mobile layout (desktop-first only).
- No persistent high score.
- No part unlock progression.
- Scientist has one static pose (no lip-sync or idle animation).
