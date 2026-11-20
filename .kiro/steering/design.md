# Visual Design: Frankenstein's Lab

## Colour palette

| Role | Value | Use |
|---|---|---|
| Background | `#0d0d1a` | Page and all panel backgrounds |
| Surface | `#12121f` | Cards, containers |
| Surface raised | `#1a1a2e` | Selected cards, speech bubble |
| Border | `#2a2a4a` | All non-glowing borders |
| Green accent | `#68d391` | Primary glow, selected states, GO marker, body column |
| Green dim | `#2d6a4f` | Inactive green borders |
| Amber accent | `#f6ad55` | Secondary glow, button, finish marker, physics numbers |
| Amber dim | `#7c4a10` | Hover fill on button |
| Body text | `#e2e8f0` | All readable text |
| Muted text | `#718096` | Hints, card sub-labels |

## Typography

- **Display / headings**: Creepster (Google Fonts), spooky, wide letter-spacing.
- **Body / data**: Share Tech Mono (Google Fonts), monospace, clean, readable at small sizes.
- Never mix more than these two families.
- Minimum body font size: 0.72 rem for hints; 0.9 rem for speech text.

## Glow rules

- Selected cards: `box-shadow: 0 0 14px <accent-colour>55`.
- Active button: `box-shadow: 0 0 10px var(--amber-glow)`.
- Robot sprite on track: `drop-shadow(0 0 6px var(--green-glow))`.
- Scientist panel: `box-shadow: 0 0 20px var(--green-glow)`.
- Never stack more than two `drop-shadow` layers on a single element.

## Layout rules

1. **No text overlapping icons.** Part-card names sit below the SVG icon, never on top of it. Level-card hints sit below the level name in a separate `<span>`.
2. Part cards use `flex-direction: column; align-items: center` so icon → name stacks vertically with a gap.
3. The speech bubble text is in its own `<p>` beneath the scientist name `<div>` — never float text over the scientist image.
4. The robot sprite and track background are siblings in `.track-wrapper`; the track SVG is `position: absolute; bottom: 0` and the robot is `position: absolute; bottom: 28px`. They must never overlap the UI above them.

## Animation guidelines

- Animate only what tells a story (robot moving, failing, glowing up).
- Do not animate background decorations or card hovers beyond a 0.15 s translateY lift.
- Respect `prefers-reduced-motion`: all keyframe animations should be suppressed or reduced to a simple opacity fade when that media query fires.

## Accessibility notes

- Minimum contrast ratio 4.5:1 between text and its background.
- `#e2e8f0` on `#12121f` ≈ 11:1. ✓
- `#68d391` on `#12121f` ≈ 6.5:1. ✓
- `#f6ad55` on `#12121f` ≈ 7:1. ✓
- All `<img>` elements carry a descriptive `alt` attribute.
- The "Bring it to life!" button is a real `<button>` element, never a `<div>`.
