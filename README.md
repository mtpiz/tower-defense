# Neon Grid Defense (Tower Defense Vertical Slice)

A single-page browser-based tower defense game built with modular vanilla JavaScript and HTML5 Canvas.

## Run locally

Because this uses ES modules, run with a local static server:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a desktop browser.

## Module structure

- `src/main.js` — bootstrap, canvas loop, wiring input + systems.
- `src/gameState.js` — authoritative game state and phase transitions.
- `src/config.js` — centralized balance/constants.
- `src/grid.js` — grid model and cell rules.
- `src/mazeGenerator.js` — robust random path generation with retries/tuning knobs.
- `src/pathModel.js` — path world-space conversion helpers.
- `src/enemy.js` — enemy archetype instances and movement.
- `src/tower.js` — tower behavior, targeting, upgrades.
- `src/projectile.js` — projectile travel and splash impact logic.
- `src/waveManager.js` — finite wave definitions and spawner timing.
- `src/renderer.js` — neon canvas rendering.
- `src/ui.js` — HUD controls and tower info/upgrade panel.
- `styles.css` / `index.html` — app shell and neon UI styles.

## Tuning notes

Primary balance knobs are in `src/config.js`:

- `pathGeneration`: `minPathLength`, `maxPathLength`, `turnBias`, retries.
- `grid`: `cols`, `rows`, `cellSize`, buildable ratio.
- `towers`: per-level stats/cost/upgrade costs for Pulse and Nova.
- `enemies`: archetype health/speed/reward/score values.
- `gameplay`: starting resources, lives, total waves.

Wave pacing and enemy composition are in `src/waveManager.js` (`makeWave`).


## Validation

```bash
node tests/validate.mjs
```

Runs lightweight deterministic checks for wave generation, placement phase rules, and path/buildable grid constraints.
