import { CONFIG } from './config.js';
import { GameState } from './gameState.js';
import { getCellAtCanvas } from './grid.js';
import { render } from './renderer.js';
import { UIController } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let state = new GameState();
canvas.width = CONFIG.grid.cols * CONFIG.grid.cellSize;
canvas.height = CONFIG.grid.rows * CONFIG.grid.cellSize;

const restartGame = () => {
  state = new GameState();
  ui.state = state;
};

const ui = new UIController(state, canvas, restartGame);

const getMouseCanvasPos = (evt) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height),
  };
};

canvas.addEventListener('mousemove', (evt) => {
  const pos = getMouseCanvasPos(evt);
  state.hoverCell = getCellAtCanvas(state.grid, pos.x, pos.y);
});

canvas.addEventListener('mouseleave', () => {
  state.hoverCell = null;
});

canvas.addEventListener('click', (evt) => {
  const pos = getMouseCanvasPos(evt);
  const cell = getCellAtCanvas(state.grid, pos.x, pos.y);
  if (!cell) return;

  const placed = state.placeTower(cell);
  if (!placed) {
    state.selectTowerAtCell(cell);
  }
});

let lastTime = performance.now();

const loop = (timestamp) => {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  state.update(dt);
  ui.update();
  render(ctx, state);

  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
