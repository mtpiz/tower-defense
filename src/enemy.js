import { CONFIG } from './config.js';

let enemyId = 1;

export class Enemy {
  constructor(type, worldPath, multipliers) {
    const base = CONFIG.enemies[type];
    this.id = enemyId;
    enemyId += 1;
    this.type = type;
    this.name = base.name;
    this.color = base.color;
    this.shape = base.shape;
    this.size = base.size || 10;
    this.armor = base.armor || 0;
    this.maxHp = Math.round(base.hp * multipliers.hp);
    this.hp = this.maxHp;
    this.speed = base.speed * multipliers.speed;
    this.reward = Math.round(base.reward * multipliers.reward);
    this.score = Math.round(base.score * multipliers.reward);
    this.x = worldPath[0].x;
    this.y = worldPath[0].y;
    this.pathIndex = 0;
    this.progress = 0;
    this.dead = false;
    this.reachedExit = false;
  }

  update(dt, worldPath) {
    if (this.dead || this.reachedExit) return;
    let remaining = this.speed * dt;

    while (remaining > 0 && this.pathIndex < worldPath.length - 1) {
      const from = worldPath[this.pathIndex];
      const to = worldPath[this.pathIndex + 1];
      const dx = to.x - this.x;
      const dy = to.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 0.001) {
        this.pathIndex += 1;
        this.progress = this.pathIndex;
        continue;
      }

      const step = Math.min(remaining, dist);
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      remaining -= step;

      if (step === dist) {
        this.pathIndex += 1;
      }
      this.progress = this.pathIndex + (step / Math.max(dist, 0.001));
    }

    if (this.pathIndex >= worldPath.length - 1) {
      this.reachedExit = true;
    }
  }

  applyDamage(amount) {
    if (this.dead || this.reachedExit) {
      return false;
    }

    const appliedDamage = Math.max(1, amount - this.armor);
    this.hp -= appliedDamage;
    if (this.hp <= 0) {
      this.dead = true;
      return true;
    }

    return false;
  }
}
