import { CONFIG } from './config.js';

let projectileId = 1;

export class Projectile {
  constructor(tower, target) {
    this.id = projectileId;
    projectileId += 1;
    this.towerType = tower.type;
    this.color = tower.template.color;
    this.damage = tower.stats.damage;
    this.splashRadiusCells = tower.stats.splashRadius || 0;
    this.speed = tower.stats.projectileSpeed || CONFIG.projectile.speed;
    this.x = tower.x;
    this.y = tower.y;
    this.targetId = target.id;
    this.active = true;
    this.explosionTtl = 0;
    this.explosionRadius = 0;
  }

  update(dt, enemies, gridCellSize, emitAudioEvent = () => {}) {
    if (!this.active) return;

    const target = enemies.find((e) => e.id === this.targetId && !e.dead && !e.reachedExit);
    if (!target) {
      this.active = false;
      return;
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;

    if (dist <= step) {
      this.x = target.x;
      this.y = target.y;
      this.applyImpact(enemies, target, gridCellSize, emitAudioEvent);
      this.active = false;
      return;
    }

    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  applyImpact(enemies, target, gridCellSize, emitAudioEvent) {
    if (this.towerType === 'nova') {
      const radius = this.splashRadiusCells * gridCellSize;
      const radiusSq = radius * radius;
      enemies.forEach((enemy) => {
        if (enemy.dead || enemy.reachedExit) return;
        const dx = enemy.x - target.x;
        const dy = enemy.y - target.y;
        if ((dx * dx) + (dy * dy) <= radiusSq) {
          if (enemy.applyDamage(this.damage)) {
            emitAudioEvent({ type: 'enemy-destroyed', enemyType: enemy.type });
          }
        }
      });
      this.explosionTtl = CONFIG.projectile.novaExplosionDuration;
      this.explosionRadius = radius;
      return;
    }

    if (target.applyDamage(this.damage)) {
      emitAudioEvent({ type: 'enemy-destroyed', enemyType: target.type });
    }
  }
}
