export const CONFIG = {
  grid: {
    cols: 24,
    rows: 14,
    cellSize: 40,
    minSpawnExitDistance: 22,
  },
  gameplay: {
    startingLives: 20,
    startingMoney: 260,
    startingBlockTiles: 42,
    blockTilesPerWave: 8,
    totalWaves: 10,
    victoryBonus: 140,
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
        { range: 2.7, fireRate: 2.3, damage: 15, projectileSpeed: 470, upgradeCost: 70 },
        { range: 3.0, fireRate: 2.7, damage: 21, projectileSpeed: 510, upgradeCost: 120 },
        { range: 3.4, fireRate: 3.0, damage: 29, projectileSpeed: 550, upgradeCost: null },
      ],
    },
    nova: {
      name: 'Nova Tower',
      color: '#ff2ac9',
      cost: 135,
      levels: [
        { range: 2.3, fireRate: 0.9, damage: 36, splashRadius: 1.0, projectileSpeed: 360, upgradeCost: 95 },
        { range: 2.5, fireRate: 1.05, damage: 50, splashRadius: 1.2, projectileSpeed: 390, upgradeCost: 155 },
        { range: 2.8, fireRate: 1.2, damage: 66, splashRadius: 1.4, projectileSpeed: 420, upgradeCost: null },
      ],
    },
  },
  enemies: {
    normal: { color: '#9e5bff', shape: 'diamond', hp: 75, speed: 82, reward: 14, score: 30 },
    runner: { color: '#7fff3a', shape: 'triangle', hp: 48, speed: 126, reward: 10, score: 24 },
    tank: { color: '#ff8f2a', shape: 'square', hp: 170, speed: 58, reward: 26, score: 50 },
  },
};
