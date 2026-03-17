import { CONFIG } from './config.js';
import { keyForCell } from './utils.js';

export const CELL_TYPES = {
  BUILDABLE: 'buildable',
  SPAWN: 'spawn',
  EXIT: 'exit',
  BLOCKED: 'blocked',
};

const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const randomCell = (cols, rows) => ({
  x: Math.floor(Math.random() * cols),
  y: Math.floor(Math.random() * rows),
});

export const createGrid = () => {
  const { cols, rows, minSpawnExitDistance } = CONFIG.grid;
  let spawn = randomCell(cols, rows);
  let exit = randomCell(cols, rows);

  for (let i = 0; i < 200; i += 1) {
    spawn = randomCell(cols, rows);
    exit = randomCell(cols, rows);
    if (manhattan(spawn, exit) >= minSpawnExitDistance) break;
  }

  const cells = Array.from({ length: rows }, (_, y) => (
    Array.from({ length: cols }, (_, x) => {
      if (x === spawn.x && y === spawn.y) return { x, y, type: CELL_TYPES.SPAWN };
      if (x === exit.x && y === exit.y) return { x, y, type: CELL_TYPES.EXIT };
      return { x, y, type: CELL_TYPES.BUILDABLE };
    })
  ));

  return { cells, spawn, exit, cols, rows, cellSize: CONFIG.grid.cellSize, blockedCells: new Set() };
};

export const getCellAtCanvas = (grid, x, y) => {
  const cx = Math.floor(x / grid.cellSize);
  const cy = Math.floor(y / grid.cellSize);
  if (cx < 0 || cx >= grid.cols || cy < 0 || cy >= grid.rows) return null;
  return grid.cells[cy][cx];
};

export const setCellType = (grid, cell, type) => {
  grid.cells[cell.y][cell.x].type = type;
  const key = keyForCell(cell.x, cell.y);
  if (type === CELL_TYPES.BLOCKED) grid.blockedCells.add(key);
  else grid.blockedCells.delete(key);
};
