import { CONFIG } from './config.js';
import { createGrid, CELL_TYPES } from './grid.js';
import { buildWorldPath } from './pathModel.js';
import { Enemy } from './enemy.js';
import { Tower } from './tower.js';
import { Projectile } from './projectile.js';
import { WaveManager } from './waveManager.js';

export const GAME_PHASE = {
  READY: 'ready',
  BUILD: 'build',
  WAVE: 'wave',
  VICTORY: 'victory',
  GAME_OVER: 'game_over',
};

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.grid = createGrid();
    this.worldPath = buildWorldPath(this.grid.path, this.grid);
    this.waveManager = new WaveManager();
    this.phase = GAME_PHASE.READY;
    this.lives = CONFIG.gameplay.startingLives;
    this.money = CONFIG.gameplay.startingMoney;
    this.score = 0;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.selectedTowerType = null;
    this.selectedTowerId = null;
    this.hoverCell = null;
  }

  setSelectedTowerType(type) {
    this.selectedTowerType = type;
    this.selectedTowerId = null;
  }

  get selectedTower() {
    return this.towers.find((t) => t.id === this.selectedTowerId) || null;
  }

  canPlaceTower(cell) {
    if (!cell) return false;
    if (![GAME_PHASE.BUILD, GAME_PHASE.READY].includes(this.phase)) return false;
    if (cell.type !== CELL_TYPES.BUILDABLE) return false;
    if (this.towers.some((t) => t.cell.x === cell.x && t.cell.y === cell.y)) return false;
    if (!this.selectedTowerType) return false;
    return this.money >= CONFIG.towers[this.selectedTowerType].cost;
  }

  placeTower(cell) {
    if (!this.canPlaceTower(cell)) return false;
    const tower = new Tower(this.selectedTowerType, cell, this.grid.cellSize);
    this.towers.push(tower);
    this.money -= CONFIG.towers[this.selectedTowerType].cost;
    return true;
  }

  selectTowerAtCell(cell) {
    const tower = this.towers.find((t) => t.cell.x === cell.x && t.cell.y === cell.y);
    this.selectedTowerId = tower ? tower.id : null;
  }

  startWave() {
    if (this.phase === GAME_PHASE.GAME_OVER || this.phase === GAME_PHASE.VICTORY) return;
    if (this.phase === GAME_PHASE.WAVE) return;
    const wave = this.waveManager.startNextWave();
    if (!wave) return;
    this.phase = GAME_PHASE.WAVE;
  }

  spawnEnemy(type, multipliers) {
    this.enemies.push(new Enemy(type, this.worldPath, multipliers));
  }

  tryUpgradeSelectedTower() {
    if (![GAME_PHASE.BUILD, GAME_PHASE.READY].includes(this.phase)) return false;
    const tower = this.selectedTower;
    if (!tower || !tower.canUpgrade()) return false;
    if (this.money < tower.upgradeCost) return false;
    this.money -= tower.upgradeCost;
    tower.upgrade();
    return true;
  }

  update(dt) {
    if (this.phase === GAME_PHASE.GAME_OVER || this.phase === GAME_PHASE.VICTORY) {
      this.updateEffects(dt);
      return;
    }

    if (this.phase === GAME_PHASE.WAVE) {
      this.waveManager.update(dt, (type, multipliers) => this.spawnEnemy(type, multipliers));
    }

    this.towers.forEach((tower) => {
      tower.update(dt);
      const target = tower.findTarget(this.enemies, this.grid.cellSize);
      if (target && tower.canFire()) {
        this.projectiles.push(new Projectile(tower, target));
        tower.onFired();
      }
    });

    this.enemies.forEach((enemy) => enemy.update(dt, this.worldPath));

    this.projectiles.forEach((projectile) => {
      projectile.update(dt, this.enemies, this.grid.cellSize);
      if (!projectile.active && projectile.explosionTtl > 0) {
        this.effects.push({
          x: projectile.x,
          y: projectile.y,
          color: '#ff2ac9',
          radius: projectile.explosionRadius,
          ttl: projectile.explosionTtl,
          maxTtl: projectile.explosionTtl,
        });
      }
    });

    this.resolveEnemyOutcomes();
    this.projectiles = this.projectiles.filter((p) => p.active);
    this.updateEffects(dt);

    if (this.lives <= 0) {
      this.phase = GAME_PHASE.GAME_OVER;
      return;
    }

    if (this.phase === GAME_PHASE.WAVE) {
      const waveDone = this.waveManager.isWaveFullySpawned() && this.enemies.length === 0;
      if (waveDone) {
        if (this.waveManager.currentIndex + 1 >= CONFIG.gameplay.totalWaves) {
          this.phase = GAME_PHASE.VICTORY;
          this.money += CONFIG.gameplay.victoryBonus;
        } else {
          this.phase = GAME_PHASE.BUILD;
          this.score += 100;
          this.money += 40;
        }
      }
    } else if (this.phase === GAME_PHASE.READY) {
      this.phase = GAME_PHASE.BUILD;
    }
  }

  updateEffects(dt) {
    this.effects.forEach((fx) => { fx.ttl -= dt; });
    this.effects = this.effects.filter((fx) => fx.ttl > 0);
  }

  resolveEnemyOutcomes() {
    let leaked = 0;
    const survivors = [];

    this.enemies.forEach((enemy) => {
      if (enemy.reachedExit && !enemy.dead) {
        leaked += 1;
        return;
      }
      if (enemy.dead) {
        this.money += enemy.reward;
        this.score += enemy.score;
        return;
      }
      survivors.push(enemy);
    });

    this.enemies = survivors;
    if (leaked > 0) this.lives -= leaked;
  }
}
