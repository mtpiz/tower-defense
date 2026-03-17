import assert from 'node:assert/strict';

import { GameState, GAME_PHASE } from '../src/gameState.js';
import { CELL_TYPES } from '../src/grid.js';
import { WaveManager } from '../src/waveManager.js';

const firstBuildableCell = (state) => state.grid.cells.flat().find((c) => c.type === CELL_TYPES.BUILDABLE);

const mapAndPathValidation = () => {
  const state = new GameState();
  const path = state.pathPreview;
  assert.ok(path?.length > 2, 'generated map should have an initial route between spawn and exit');
  assert.equal(path[0].x, state.grid.spawn.x);
  assert.equal(path[0].y, state.grid.spawn.y);
  assert.equal(path[path.length - 1].x, state.grid.exit.x);
  assert.equal(path[path.length - 1].y, state.grid.exit.y);
};

const placementPhaseValidation = () => {
  const state = new GameState();
  state.phase = GAME_PHASE.BUILD;
  const cell = firstBuildableCell(state);
  state.phase = GAME_PHASE.WAVE;

  state.setBuildMode('block');
  assert.equal(state.placeBlock(cell), false, 'block placement must be blocked during active wave');

  state.setBuildMode('tower', 'pulse');
  assert.equal(state.placeTower(cell), false, 'tower placement must be blocked during active wave');
};

const deterministicWavesValidation = () => {
  const wmA = new WaveManager();
  const wmB = new WaveManager();
  assert.deepEqual(
    wmA.waves.map((w) => w.sequence),
    wmB.waves.map((w) => w.sequence),
  );
};

mapAndPathValidation();
placementPhaseValidation();
deterministicWavesValidation();
console.log('All gameplay validation checks passed.');
