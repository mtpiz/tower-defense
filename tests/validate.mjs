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

const progressionValidation = () => {
  const state = new GameState();
  assert.deepEqual(
    state.unlockedTowerTypes,
    ['pulse', 'nova'],
    'only the two starter towers should be unlocked at the start',
  );
  assert.equal(
    state.setBuildMode('tower', 'rail'),
    false,
    'locked towers should not be selectable before their unlock wave',
  );

  state.waveManager.currentIndex = 1;
  assert.ok(
    state.unlockedTowerTypes.includes('rail'),
    'rail tower should unlock in time for wave 3',
  );

  state.waveManager.currentIndex = 4;
  assert.ok(
    state.unlockedTowerTypes.includes('shard'),
    'shard tower should unlock in time for wave 6',
  );

  const wm = new WaveManager();
  assert.ok(
    wm.waves[2].sequence.includes('shielded'),
    'wave 3 should introduce shielded enemies',
  );
  assert.ok(
    wm.waves[5].sequence.includes('swarm'),
    'wave 6 should introduce swarm enemies',
  );
};

mapAndPathValidation();
placementPhaseValidation();
deterministicWavesValidation();
progressionValidation();
console.log('All gameplay validation checks passed.');
