import { CONFIG } from './config.js';
import { dist2 } from './utils.js';

let towerId = 0;

export class Tower {
  constructor(type, cell, cellSize) {
    this.id = towerId;
    towerId += 1;
    this.type = type;
    this.cell = cell;
    this.x = cell.x * cellSize + cellSize / 2;
    this.y = cell.y * cellSize + cellSize / 2;
    this.level = 0;
    this.cooldown = 0;
  }

  get template() {
    return CONFIG.towers[this.type];
  }

  get stats() {
    return this.template.levels[this.level];
  }

  get upgradeCost() {
    return this.stats.upgradeCost;
  }

  canUpgrade() {
    return this.level < this.template.levels.length - 1;
  }

  upgrade() {
    if (this.canUpgrade()) this.level += 1;
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  findTargets(enemies, cellSize) {
    const range = this.stats.range * cellSize;
    const rangeSq = range * range;
    const targetCount = this.stats.targetCount || 1;
    const candidates = [];

    enemies.forEach((enemy) => {
      if (enemy.dead || enemy.reachedExit) return;
      const d2 = dist2(this.x, this.y, enemy.x, enemy.y);
      if (d2 > rangeSq) return;
      candidates.push(enemy);
    });

    candidates.sort((a, b) => b.progress - a.progress);
    return candidates.slice(0, targetCount);
  }

  canFire() {
    return this.cooldown <= 0;
  }

  onFired() {
    this.cooldown = 1 / this.stats.fireRate;
  }
}
