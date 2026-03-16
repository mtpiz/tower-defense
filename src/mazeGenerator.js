import { keyForCell } from './utils.js';

const DIRS = [
  { x: 1, y: 0, id: 'R' },
  { x: -1, y: 0, id: 'L' },
  { x: 0, y: 1, id: 'D' },
  { x: 0, y: -1, id: 'U' },
];

const weightedPick = (options) => {
  const total = options.reduce((sum, option) => sum + option.weight, 0);
  let roll = Math.random() * total;
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) return option;
  }
  return options[options.length - 1];
};

const buildCandidates = (current, cols, rows, visited, lastDir, turnBias) => {
  const remainingToExit = (cols - 1) - current.x;

  return DIRS
    .map((dir) => ({
      x: current.x + dir.x,
      y: current.y + dir.y,
      id: dir.id,
    }))
    .filter((next) => next.x >= 0 && next.x < cols && next.y >= 0 && next.y < rows)
    .filter((next) => !visited.has(keyForCell(next.x, next.y)))
    .map((next) => {
      let weight = 1;
      if (next.id === 'R') weight += 2.8;
      if (next.id === 'L') weight *= 0.2;
      if (lastDir && next.id !== lastDir) weight += turnBias;
      if (remainingToExit <= 1 && next.id !== 'R') weight *= 0.5;
      return { ...next, weight: Math.max(0.01, weight) };
    });
};

export const generatePathCells = (cols, rows, cfg) => {
  for (let attempt = 0; attempt < cfg.retries; attempt += 1) {
    const path = [{ x: 0, y: Math.floor(Math.random() * rows) }];
    const visited = new Set([keyForCell(path[0].x, path[0].y)]);
    let lastDir = null;

    while (path.length < cfg.maxPathLength) {
      const current = path[path.length - 1];
      if (current.x === cols - 1) break;

      const candidates = buildCandidates(current, cols, rows, visited, lastDir, cfg.turnBias);
      if (!candidates.length) break;

      const next = weightedPick(candidates);
      path.push({ x: next.x, y: next.y });
      visited.add(keyForCell(next.x, next.y));
      lastDir = next.id;
    }

    const end = path[path.length - 1];
    if (end.x === cols - 1 && path.length >= cfg.minPathLength && path.length <= cfg.maxPathLength) {
      return path;
    }
  }

  throw new Error('Unable to generate a valid path with current settings.');
};
