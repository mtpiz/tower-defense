export const CONFIG = {
  grid: {
    cols: 18,
    rows: 12,
    cellSize: 48,
    minBuildableRatio: 0.58,
  },
  gameplay: {
    startingLives: 20,
    startingMoney: 220,
    totalWaves: 10,
    victoryBonus: 120,
  },
  pathGeneration: {
    retries: 90,
    minPathLength: 28,
    maxPathLength: 88,
    turnBias: 0.62,
  },
  projectile: {
    speed: 420,
    novaExplosionDuration: 0.16,
  },
  towers: {
    pulse: {
      name: 'Pulse Tower',
      color: '#2af6ff',
      cost: 90,
      levels: [
        { range: 2.5, fireRate: 2.2, damage: 15, projectileSpeed: 460, upgradeCost: 70 },
        { range: 2.8, fireRate: 2.5, damage: 21, projectileSpeed: 500, upgradeCost: 120 },
        { range: 3.2, fireRate: 2.9, damage: 30, projectileSpeed: 540, upgradeCost: null },
      ],
    },
    nova: {
      name: 'Nova Tower',
      color: '#ff2ac9',
      cost: 130,
      levels: [
        { range: 2.2, fireRate: 0.95, damage: 34, splashRadius: 0.95, projectileSpeed: 360, upgradeCost: 90 },
        { range: 2.4, fireRate: 1.1, damage: 48, splashRadius: 1.15, projectileSpeed: 385, upgradeCost: 150 },
        { range: 2.7, fireRate: 1.25, damage: 65, splashRadius: 1.35, projectileSpeed: 420, upgradeCost: null },
      ],
    },
  },
  enemies: {
    normal: { color: '#9e5bff', shape: 'diamond', hp: 70, speed: 78, reward: 15, score: 30 },
    runner: { color: '#7fff3a', shape: 'triangle', hp: 45, speed: 120, reward: 11, score: 25 },
    tank: { color: '#ff8f2a', shape: 'square', hp: 160, speed: 56, reward: 26, score: 48 },
  },
};
