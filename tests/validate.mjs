import assert from 'node:assert/strict';

import { GameState, GAME_PHASE } from '../src/gameState.js';
import { CELL_TYPES } from '../src/grid.js';
import { WaveManager } from '../src/waveManager.js';
import { CONFIG } from '../src/config.js';

const firstBuildableCell = (state) => state.grid.cells.flat().find((c) => c.type === CELL_TYPES.BUILDABLE);

const placementPhaseValidation = () => {
  const state = new GameState();
  state.phase = GAME_PHASE.BUILD;
  state.setSelectedTowerType('pulse');
  const cell = firstBuildableCell(state);
  state.phase = GAME_PHASE.WAVE;
  const placed = state.placeTower(cell);
  assert.equal(placed, false, 'tower placement must be blocked during active wave');
  assert.equal(state.towers.length, 0, 'tower list must not change during active wave placement attempts');
};

const deterministicWavesValidation = () => {
  const wmA = new WaveManager();
  const wmB = new WaveManager();
  assert.deepEqual(
    wmA.waves.map((w) => w.sequence),
    wmB.waves.map((w) => w.sequence),
    'wave enemy sequence generation should be deterministic for each wave number',
  );
};

const progressionValidation = () => {
  const state = new GameState();
  assert.deepEqual(
    state.unlockedTowerTypes,
    ['pulse', 'nova'],
    'only the two starter towers should be unlocked at the start',
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

const gridValidation = () => {
  const state = new GameState();
  const path = state.grid.path;
  assert.equal(path[0].x, 0, 'path must start on left edge');
  assert.equal(path[path.length - 1].x, state.grid.cols - 1, 'path must end on right edge');

  for (let i = 1; i < path.length; i += 1) {
    const dx = Math.abs(path[i].x - path[i - 1].x);
    const dy = Math.abs(path[i].y - path[i - 1].y);
    assert.equal(dx + dy, 1, 'path cells must be cardinally adjacent');
  }

  const buildable = state.grid.cells.flat().filter((c) => c.type === CELL_TYPES.BUILDABLE).length;
  const ratio = buildable / (state.grid.cols * state.grid.rows);
  assert.ok(ratio >= CONFIG.grid.minBuildableRatio, 'buildable ratio must satisfy configuration threshold');
};

placementPhaseValidation();
deterministicWavesValidation();
progressionValidation();
gridValidation();

console.log('All gameplay validation checks passed.');
