import { CELL_TYPES } from './grid.js';
import { GAME_PHASE } from './gameState.js';
import { CONFIG } from './config.js';

const rgbaFromHex = (hex, alpha) => {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const drawEnemyShape = (ctx, enemy) => {
  const s = enemy.size || 10;
  ctx.beginPath();
  if (enemy.shape === 'triangle') {
    ctx.moveTo(enemy.x, enemy.y - s);
    ctx.lineTo(enemy.x + s, enemy.y + s);
    ctx.lineTo(enemy.x - s, enemy.y + s);
  } else if (enemy.shape === 'hexagon') {
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = enemy.x + Math.cos(angle) * s;
      const py = enemy.y + Math.sin(angle) * s;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  } else if (enemy.shape === 'square') {
    ctx.rect(enemy.x - s, enemy.y - s, s * 2, s * 2);
  } else if (enemy.shape === 'diamond') {
    ctx.moveTo(enemy.x, enemy.y - s);
    ctx.lineTo(enemy.x + s, enemy.y);
    ctx.lineTo(enemy.x, enemy.y + s);
    ctx.lineTo(enemy.x - s, enemy.y);
  } else {
    ctx.arc(enemy.x, enemy.y, s, 0, Math.PI * 2);
  }
  ctx.closePath();
};

const drawUpgradeAura = (ctx, tower, radius, color) => {
  if (tower.level <= 0) {
    return;
  }

  ctx.save();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = rgbaFromHex(color, tower.level >= 2 ? 0.52 : 0.34);
  ctx.lineWidth = 1.6 + tower.level * 0.35;
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, radius + 4 + tower.level * 2, 0, Math.PI * 2);
  ctx.stroke();

  if (tower.level >= 2) {
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
};

const drawPulseTower = (ctx, tower, radius) => {
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(tower.x, tower.y, 4 + tower.level, 0, Math.PI * 2);
  ctx.stroke();

  if (tower.level >= 1) {
    ctx.beginPath();
    ctx.moveTo(tower.x - radius - 3, tower.y);
    ctx.lineTo(tower.x + radius + 3, tower.y);
    ctx.moveTo(tower.x, tower.y - radius - 3);
    ctx.lineTo(tower.x, tower.y + radius + 3);
    ctx.stroke();
  }

  if (tower.level >= 2) {
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, radius - 5, 0, Math.PI * 2);
    ctx.stroke();
  }
};

const drawNovaTower = (ctx, tower, radius) => {
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tower.x - 8, tower.y);
  ctx.lineTo(tower.x + 8, tower.y);
  ctx.moveTo(tower.x, tower.y - 8);
  ctx.lineTo(tower.x, tower.y + 8);
  ctx.stroke();

  if (tower.level >= 1) {
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, radius - 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (tower.level >= 2) {
    ctx.beginPath();
    ctx.moveTo(tower.x - radius - 2, tower.y);
    ctx.lineTo(tower.x + radius + 2, tower.y);
    ctx.moveTo(tower.x, tower.y - radius - 2);
    ctx.lineTo(tower.x, tower.y + radius + 2);
    ctx.stroke();
  }
};

const drawRailTower = (ctx, tower, radius) => {
  ctx.beginPath();
  ctx.moveTo(tower.x, tower.y - radius);
  ctx.lineTo(tower.x + radius * 0.8, tower.y);
  ctx.lineTo(tower.x, tower.y + radius);
  ctx.lineTo(tower.x - radius * 0.8, tower.y);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tower.x - 10, tower.y);
  ctx.lineTo(tower.x + 10, tower.y);
  ctx.stroke();

  if (tower.level >= 1) {
    ctx.beginPath();
    ctx.moveTo(tower.x, tower.y - radius - 5);
    ctx.lineTo(tower.x, tower.y + radius + 5);
    ctx.stroke();
  }

  if (tower.level >= 2) {
    ctx.beginPath();
    ctx.moveTo(tower.x - radius - 3, tower.y - 4);
    ctx.lineTo(tower.x + radius + 3, tower.y - 4);
    ctx.moveTo(tower.x - radius - 3, tower.y + 4);
    ctx.lineTo(tower.x + radius + 3, tower.y + 4);
    ctx.stroke();
  }
};

const drawShardTower = (ctx, tower, radius) => {
  ctx.beginPath();
  ctx.moveTo(tower.x, tower.y - radius);
  ctx.lineTo(tower.x + radius * 0.95, tower.y + radius * 0.55);
  ctx.lineTo(tower.x - radius * 0.95, tower.y + radius * 0.55);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(tower.x, tower.y + 2, 4, 0, Math.PI * 2);
  ctx.stroke();

  if (tower.level >= 1) {
    ctx.beginPath();
    ctx.moveTo(tower.x - 6, tower.y - 2);
    ctx.lineTo(tower.x, tower.y - radius - 5);
    ctx.lineTo(tower.x + 6, tower.y - 2);
    ctx.stroke();
  }

  if (tower.level >= 2) {
    ctx.beginPath();
    ctx.moveTo(tower.x - radius - 2, tower.y + radius * 0.45);
    ctx.lineTo(tower.x - 5, tower.y + 2);
    ctx.lineTo(tower.x + 5, tower.y + 2);
    ctx.lineTo(tower.x + radius + 2, tower.y + radius * 0.45);
    ctx.stroke();
  }
};

const drawTower = (ctx, tower, isSelected) => {
  const color = CONFIG.towers[tower.type].color;
  const radius = tower.type === 'pulse' ? 12 : tower.type === 'nova' ? 14 : 13;

  ctx.save();
  ctx.shadowBlur = 20 + tower.level * 4;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.fillStyle = rgbaFromHex(color, 0.1 + tower.level * 0.04);
  ctx.lineWidth = isSelected ? 3 : 2 + tower.level * 0.2;

  drawUpgradeAura(ctx, tower, radius, color);

  if (tower.type === 'pulse') {
    drawPulseTower(ctx, tower, radius);
  } else if (tower.type === 'nova') {
    drawNovaTower(ctx, tower, radius);
  } else if (tower.type === 'rail') {
    drawRailTower(ctx, tower, radius);
  } else {
    drawShardTower(ctx, tower, radius);
  }

  if (tower.level >= 1) {
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 3 + tower.level, 0, Math.PI * 2);
    ctx.fill();
  }

  if (tower.level >= 2) {
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export const render = (ctx, state) => {
  const { grid } = state;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#030307';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.cols; x += 1) {
      const cell = grid.cells[y][x];
      const px = x * grid.cellSize;
      const py = y * grid.cellSize;

      if (cell.type === CELL_TYPES.SPAWN) ctx.fillStyle = 'rgba(127, 255, 58, 0.3)';
      else if (cell.type === CELL_TYPES.EXIT) ctx.fillStyle = 'rgba(255, 87, 122, 0.3)';
      else if (cell.type === CELL_TYPES.BLOCKED) ctx.fillStyle = 'rgba(95, 34, 140, 0.65)';
      else ctx.fillStyle = 'rgba(20, 35, 55, 0.30)';

      ctx.fillRect(px, py, grid.cellSize, grid.cellSize);
      ctx.strokeStyle = 'rgba(42, 246, 255, 0.09)';
      ctx.strokeRect(px, py, grid.cellSize, grid.cellSize);
    }
  }

  if (state.pathPreview?.length) {
    ctx.strokeStyle = 'rgba(127,255,58,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    state.pathPreview.forEach((cell, idx) => {
      const px = cell.x * grid.cellSize + grid.cellSize / 2;
      const py = cell.y * grid.cellSize + grid.cellSize / 2;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  if (state.hoverCell) {
    const c = state.hoverCell;
    const valid = state.buildMode === 'block' ? state.canPlaceBlock(c) : state.canPlaceTower(c);
    ctx.fillStyle = valid ? 'rgba(127, 255, 58, 0.22)' : 'rgba(255, 87, 122, 0.22)';
    ctx.fillRect(c.x * grid.cellSize, c.y * grid.cellSize, grid.cellSize, grid.cellSize);
  }

  state.towers.forEach((tower) => {
    const isSelected = state.selectedTowerId === tower.id;
    drawTower(ctx, tower, isSelected);

    if (isSelected) {
      ctx.shadowBlur = 0;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(42,246,255,0.5)';
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, tower.stats.range * grid.cellSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  state.enemies.forEach((enemy) => {
    ctx.shadowBlur = 14;
    ctx.shadowColor = enemy.color;
    ctx.fillStyle = enemy.color;
    drawEnemyShape(ctx, enemy);
    ctx.fill();

    const hpW = 18;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(enemy.x - hpW / 2, enemy.y - 15, hpW, 3);
    ctx.fillStyle = '#2af6ff';
    ctx.fillRect(enemy.x - hpW / 2, enemy.y - 15, hpW * hpRatio, 3);
  });

  state.projectiles.forEach((p) => {
    ctx.shadowBlur = 14;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(
      p.x,
      p.y,
      p.towerType === 'nova' ? 5 : p.towerType === 'rail' ? 4.5 : 3.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  state.effects.forEach((fx) => {
    const alpha = fx.ttl / fx.maxTtl;
    ctx.shadowBlur = 16;
    ctx.shadowColor = fx.color;
    ctx.strokeStyle = `rgba(255, 42, 201, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, fx.radius * (1 + (1 - alpha) * 0.35), 0, Math.PI * 2);
    ctx.stroke();
  });

  if (state.phase === GAME_PHASE.GAME_OVER || state.phase === GAME_PHASE.VICTORY) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = state.phase === GAME_PHASE.VICTORY ? '#7fff3a' : '#ff577a';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      state.phase === GAME_PHASE.VICTORY ? 'VICTORY' : 'GAME OVER',
      ctx.canvas.width / 2,
      ctx.canvas.height / 2,
    );
  }

  ctx.shadowBlur = 0;
};
