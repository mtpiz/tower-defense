# Neon Grid Defense (Maze-Builder Edition)

A single-page browser tower defense where you build the enemy maze, unlock stronger towers, and defend a neon kill-zone.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a desktop browser.

Audio unlocks on the first button press or click inside the page. Use the `Sound On` / `Sound Off` button in the HUD to mute it.

## Core loop

- The map is one large grid with random spawn and exit cells each run.
- You get a limited stock of block tiles to place and shape enemy routing.
- You place combat towers on the same grid, and towers also block movement.
- Placement is only valid if at least one path from spawn to exit remains.
- Start waves manually, earn money from kills, unlock more towers across the wave curve, then keep refining the maze between waves.

## Module structure

- `src/main.js` - bootstrap, loop, input handling.
- `src/gameState.js` - phases, economy, placement rules, path-validity checks.
- `src/grid.js` - grid model, spawn/exit generation, block cell writes.
- `src/pathModel.js` - A* pathfinding for dynamic routing.
- `src/enemy.js` - enemy archetypes and path-following movement.
- `src/tower.js` / `src/projectile.js` - targeting, firing, damage and splash resolution.
- `src/waveManager.js` - finite wave definitions and deterministic enemy order.
- `src/renderer.js` - neon canvas rendering of grid, route preview, combat, and upgrade visuals.
- `src/ui.js` - HUD, build controls, unlock messaging, and the upgrade panel.
- `src/config.js` - centralized tuning constants.
- `src/audio.js` - procedural Web Audio laser shots and enemy explosion effects.

## Tuning

- Grid size, spawn distance, and starting resources: `src/config.js`.
- Block-tile economy: `gameplay.startingBlockTiles` and `blockTilesPerWave` in `src/config.js`.
- Tower unlocks, upgrade stats, and costs: `src/config.js`.
- Enemy unlocks, armor, and rewards: `src/config.js`.
- Wave pacing and composition: `src/waveManager.js`.
- Audio envelopes and gain: `src/audio.js`.

## Validation

```bash
node tests/validate.mjs
```

Checks initial route validity, build-phase placement guards, unlock progression, and deterministic wave sequencing.
