# Neon Grid Defense (Maze-Builder Edition)

A single-page browser tower defense where **you build the enemy maze**.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a desktop browser.

## Core loop

- The map is one large grid with random **spawn** and **exit** cells each run.
- You get a limited stock of **block tiles** to place and shape enemy routing.
- You also place combat towers (Pulse and Nova), and towers also block movement.
- Placement is only valid if at least one path from spawn to exit remains.
- Start waves manually, earn money from kills, buy towers/upgrades, then continue building the maze between waves.

## Module structure

- `src/main.js` — bootstrap, loop, input handling.
- `src/gameState.js` — phases, economy, placement rules, path-validity checks.
- `src/grid.js` — grid model, spawn/exit generation, block cell writes.
- `src/pathModel.js` — A* pathfinding for dynamic routing.
- `src/enemy.js` — enemy archetypes and path-following movement.
- `src/tower.js` / `src/projectile.js` — targeting, firing, damage/splash.
- `src/waveManager.js` — finite wave definitions and deterministic enemy order.
- `src/renderer.js` — neon canvas rendering of grid, route preview, combat.
- `src/ui.js` — HUD, build mode controls, and upgrade panel.
- `src/config.js` — centralized tuning constants.

## Tuning

- Grid size/spawn distance and starting resources: `src/config.js`.
- Block-tile economy: `gameplay.startingBlockTiles` + `blockTilesPerWave` in `src/config.js`.
- Tower/enemy stats: `src/config.js`.
- Wave pacing/composition: `src/waveManager.js`.

## Validation

```bash
node tests/validate.mjs
```

Checks map path validity, build-phase placement guards, and deterministic wave sequencing.
