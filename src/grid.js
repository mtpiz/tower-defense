import { CONFIG } from './config.js';
import { generatePathCells } from './mazeGenerator.js';
import { keyForCell } from './utils.js';

export const CELL_TYPES = {
  BUILDABLE: 'buildable',
  PATH: 'path',
  SPAWN: 'spawn',
  EXIT: 'exit',
  BLOCKED: 'blocked',
};

export const createGrid = () => {
  const { cols, rows, minBuildableRatio } = CONFIG.grid;

  for (let i = 0; i < 50; i += 1) {
    const path = generatePathCells(cols, rows, CONFIG.pathGeneration);
    const pathSet = new Set(path.map((c) => keyForCell(c.x, c.y)));
    const spawn = path[0];
    const exit = path[path.length - 1];

    const cells = Array.from({ length: rows }, (_, y) => (
      Array.from({ length: cols }, (_, x) => {
        const key = keyForCell(x, y);
        if (x === spawn.x && y === spawn.y) return { x, y, type: CELL_TYPES.SPAWN };
        if (x === exit.x && y === exit.y) return { x, y, type: CELL_TYPES.EXIT };
        if (pathSet.has(key)) return { x, y, type: CELL_TYPES.PATH };
        return { x, y, type: CELL_TYPES.BUILDABLE };
      })
    ));

    const buildable = cells.flat().filter((c) => c.type === CELL_TYPES.BUILDABLE).length;
    const ratio = buildable / (cols * rows);
    if (ratio >= minBuildableRatio) {
      return { cells, path, spawn, exit, cols, rows, cellSize: CONFIG.grid.cellSize };
    }
  }

  throw new Error('Grid generation failed to satisfy buildable-area constraints.');
};

export const getCellAtCanvas = (grid, x, y) => {
  const cx = Math.floor(x / grid.cellSize);
  const cy = Math.floor(y / grid.cellSize);
  if (cx < 0 || cx >= grid.cols || cy < 0 || cy >= grid.rows) return null;
  return grid.cells[cy][cx];
};
