export const toWorldPoint = (cell, grid) => ({
  x: cell.x * grid.cellSize + grid.cellSize / 2,
  y: cell.y * grid.cellSize + grid.cellSize / 2,
});

export const buildWorldPath = (cells, grid) => cells.map((cell) => toWorldPoint(cell, grid));

export const pathProgressAtPoint = (point, worldPath) => {
  let bestIndex = 0;
  let bestDist = Infinity;
  worldPath.forEach((p, idx) => {
    const dx = p.x - point.x;
    const dy = p.y - point.y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      bestIndex = idx;
    }
  });
  return bestIndex;
};
