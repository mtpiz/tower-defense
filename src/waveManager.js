import { CONFIG } from './config.js';
import { makeRng, shuffleWithRng } from './utils.js';

const makeWave = (waveNumber) => {
  const runners = Math.min(8 + waveNumber * 2, 28);
  const normals = 6 + waveNumber * 3;
  const tanks = waveNumber >= 4 ? Math.floor((waveNumber - 2) * 1.4) : 0;

  const sequence = [];
  for (let i = 0; i < normals; i += 1) sequence.push('normal');
  for (let i = 0; i < runners; i += 1) sequence.push('runner');
  for (let i = 0; i < tanks; i += 1) sequence.push('tank');

  const rng = makeRng((waveNumber * 7919) ^ 0x9e3779b9);
  shuffleWithRng(sequence, rng);

  return {
    number: waveNumber,
    spawnInterval: Math.max(0.3, 0.82 - waveNumber * 0.04),
    hpMultiplier: 1 + waveNumber * 0.17,
    speedMultiplier: 1 + waveNumber * 0.03,
    rewardMultiplier: 1 + waveNumber * 0.08,
    sequence,
  };
};

export class WaveManager {
  constructor() {
    this.waves = Array.from({ length: CONFIG.gameplay.totalWaves }, (_, idx) => makeWave(idx + 1));
    this.currentIndex = -1;
    this.spawnTimer = 0;
    this.spawned = 0;
    this.active = false;
  }

  hasNextWave() {
    return this.currentIndex < this.waves.length - 1;
  }

  startNextWave() {
    if (!this.hasNextWave()) return null;
    this.currentIndex += 1;
    this.spawnTimer = 0;
    this.spawned = 0;
    this.active = true;
    return this.waves[this.currentIndex];
  }

  get currentWave() {
    return this.waves[this.currentIndex] || null;
  }

  update(dt, spawnEnemy) {
    if (!this.active || !this.currentWave) return;
    this.spawnTimer -= dt;

    while (this.spawnTimer <= 0 && this.spawned < this.currentWave.sequence.length) {
      const type = this.currentWave.sequence[this.spawned];
      spawnEnemy(type, {
        hp: this.currentWave.hpMultiplier,
        speed: this.currentWave.speedMultiplier,
        reward: this.currentWave.rewardMultiplier,
      });
      this.spawned += 1;
      this.spawnTimer += this.currentWave.spawnInterval;
    }

    if (this.spawned >= this.currentWave.sequence.length) {
      this.active = false;
    }
  }

  isWaveFullySpawned() {
    if (!this.currentWave) return false;
    return this.spawned >= this.currentWave.sequence.length;
  }
}
