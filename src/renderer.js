import { CELL_TYPES } from './grid.js';
import { GAME_PHASE } from './gameState.js';
import { CONFIG } from './config.js';

const drawEnemyShape = (ctx, enemy) => {
  const s = 9;
  ctx.beginPath();
  if (enemy.shape === 'triangle') {
    ctx.moveTo(enemy.x, enemy.y - s);
    ctx.lineTo(enemy.x + s, enemy.y + s);
    ctx.lineTo(enemy.x - s, enemy.y + s);
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
    const color = CONFIG.towers[tower.type].color;
    const isSelected = state.selectedTowerId === tower.id;
    const r = tower.type === 'pulse' ? 11 : 13;

    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, r, 0, Math.PI * 2);
    ctx.stroke();

    if (tower.type === 'nova') {
      ctx.beginPath();
      ctx.moveTo(tower.x - 8, tower.y);
      ctx.lineTo(tower.x + 8, tower.y);
      ctx.moveTo(tower.x, tower.y - 8);
      ctx.lineTo(tower.x, tower.y + 8);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

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
    ctx.arc(p.x, p.y, p.towerType === 'nova' ? 5 : 3.5, 0, Math.PI * 2);
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
    ctx.fillText(state.phase === GAME_PHASE.VICTORY ? 'VICTORY' : 'GAME OVER', ctx.canvas.width / 2, ctx.canvas.height / 2);
  }

  ctx.shadowBlur = 0;
};
