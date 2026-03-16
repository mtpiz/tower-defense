import { keyForCell, shuffle } from './utils.js';

const DIRS = [
  { x: 1, y: 0, id: 'R' },
  { x: -1, y: 0, id: 'L' },
  { x: 0, y: 1, id: 'D' },
  { x: 0, y: -1, id: 'U' },
];

const weightedDirections = (lastDir, turnBias) => {
  const dirs = shuffle([...DIRS]);
  return dirs.sort((a, b) => {
    const scoreA = (a.id === 'R' ? 3 : 0) + (lastDir && a.id !== lastDir ? turnBias : 0) + (a.id === 'L' ? -1 : 0);
    const scoreB = (b.id === 'R' ? 3 : 0) + (lastDir && b.id !== lastDir ? turnBias : 0) + (b.id === 'L' ? -1 : 0);
    return scoreB - scoreA;
  });
};

export const generatePathCells = (cols, rows, cfg) => {
  for (let attempt = 0; attempt < cfg.retries; attempt += 1) {
    const start = { x: 0, y: Math.floor(Math.random() * rows) };
    const stack = [{ ...start, dir: null }];
    const visited = new Set([keyForCell(start.x, start.y)]);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const pathLength = stack.length;

      if (current.x === cols - 1 && pathLength >= cfg.minPathLength && pathLength <= cfg.maxPathLength) {
        return stack.map(({ x, y }) => ({ x, y }));
      }

      const remainingMin = (cols - 1) - current.x;
      if (pathLength + remainingMin > cfg.maxPathLength) {
        visited.delete(keyForCell(current.x, current.y));
        stack.pop();
        continue;
      }

      const candidates = weightedDirections(current.dir, cfg.turnBias)
        .map((d) => ({ x: current.x + d.x, y: current.y + d.y, dir: d.id }))
        .filter((n) => n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows)
        .filter((n) => !visited.has(keyForCell(n.x, n.y)));

      if (!candidates.length || pathLength >= cfg.maxPathLength) {
        visited.delete(keyForCell(current.x, current.y));
        stack.pop();
        continue;
      }

      const next = candidates[0];
      visited.add(keyForCell(next.x, next.y));
      stack.push(next);
    }
  }
  throw new Error('Unable to generate a valid path with current settings.');
};
