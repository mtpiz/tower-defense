import { keyForCell } from './utils.js';

const DIRS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export const toWorldPoint = (cell, grid) => ({
  x: cell.x * grid.cellSize + grid.cellSize / 2,
  y: cell.y * grid.cellSize + grid.cellSize / 2,
});

export const buildWorldPath = (cells, grid) => cells.map((cell) => toWorldPoint(cell, grid));

const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const findPathCells = (grid, blockedSet) => {
  const start = grid.spawn;
  const goal = grid.exit;
  const startKey = keyForCell(start.x, start.y);
  const goalKey = keyForCell(goal.x, goal.y);

  const open = [{ ...start, f: heuristic(start, goal) }];
  const openKey = new Set([startKey]);
  const cameFrom = new Map();
  const gScore = new Map([[startKey, 0]]);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    const currentKey = keyForCell(current.x, current.y);
    openKey.delete(currentKey);

    if (currentKey === goalKey) {
      const path = [{ x: goal.x, y: goal.y }];
      let k = goalKey;
      while (cameFrom.has(k)) {
        const prev = cameFrom.get(k);
        path.push(prev);
        k = keyForCell(prev.x, prev.y);
      }
      return path.reverse();
    }

    DIRS.forEach((dir) => {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      if (nx < 0 || nx >= grid.cols || ny < 0 || ny >= grid.rows) return;

      const nKey = keyForCell(nx, ny);
      if (nKey !== goalKey && nKey !== startKey && blockedSet.has(nKey)) return;

      const tentative = (gScore.get(currentKey) ?? Infinity) + 1;
      if (tentative >= (gScore.get(nKey) ?? Infinity)) return;

      cameFrom.set(nKey, { x: current.x, y: current.y });
      gScore.set(nKey, tentative);
      const f = tentative + heuristic({ x: nx, y: ny }, goal);
      if (!openKey.has(nKey)) {
        open.push({ x: nx, y: ny, f });
        openKey.add(nKey);
      }
    });
  }

  return null;
};
