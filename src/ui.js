import { CONFIG } from './config.js';
import { GAME_PHASE } from './gameState.js';

export class UIController {
  constructor(state, canvas, onRestart) {
    this.state = state;
    this.canvas = canvas;
    this.onRestart = onRestart;

    this.livesEl = document.getElementById('livesValue');
    this.moneyEl = document.getElementById('moneyValue');
    this.scoreEl = document.getElementById('scoreValue');
    this.waveEl = document.getElementById('waveValue');
    this.blocksEl = document.getElementById('blocksValue');
    this.statusTextEl = document.getElementById('statusText');

    this.blockBtn = document.getElementById('blockBtn');
    this.pulseBtn = document.getElementById('pulseBtn');
    this.novaBtn = document.getElementById('novaBtn');
    this.startWaveBtn = document.getElementById('startWaveBtn');
    this.restartBtn = document.getElementById('restartBtn');

    this.towerPanel = document.getElementById('towerPanel');
    this.towerInfo = document.getElementById('towerInfo');
    this.upgradeBtn = document.getElementById('upgradeBtn');

    this.bindEvents();
  }

  bindEvents() {
    this.blockBtn.addEventListener('click', () => this.state.setBuildMode('block'));
    this.pulseBtn.addEventListener('click', () => this.state.setBuildMode('tower', 'pulse'));
    this.novaBtn.addEventListener('click', () => this.state.setBuildMode('tower', 'nova'));
    this.startWaveBtn.addEventListener('click', () => this.state.startWave());
    this.restartBtn.addEventListener('click', () => this.onRestart());
    this.upgradeBtn.addEventListener('click', () => this.state.tryUpgradeSelectedTower());
  }

  update() {
    this.livesEl.textContent = this.state.lives;
    this.moneyEl.textContent = this.state.money;
    this.scoreEl.textContent = this.state.score;
    this.blocksEl.textContent = this.state.blockTilesLeft;
    this.waveEl.textContent = `${Math.max(0, this.state.waveManager.currentIndex + 1)} / ${CONFIG.gameplay.totalWaves}`;

    this.blockBtn.classList.toggle('selected', this.state.buildMode === 'block');
    this.pulseBtn.classList.toggle('selected', this.state.buildMode === 'tower' && this.state.selectedTowerType === 'pulse');
    this.novaBtn.classList.toggle('selected', this.state.buildMode === 'tower' && this.state.selectedTowerType === 'nova');
    this.startWaveBtn.disabled = this.state.phase !== GAME_PHASE.BUILD || !this.state.waveManager.hasNextWave() || !this.state.pathPreview;

    let status = 'Design the maze: place block tiles and towers, keeping at least one route open.';
    if (!this.state.pathPreview) status = 'No route to exit! Remove obstacles by restarting the level.';
    if (this.state.phase === GAME_PHASE.WAVE) status = 'Wave active: your maze and kill-zone are live.';
    if (this.state.phase === GAME_PHASE.GAME_OVER) status = 'Defeat. Hit restart for fresh spawn/exit points.';
    if (this.state.phase === GAME_PHASE.VICTORY) status = 'Victory! Restart to build a new deadly maze.';
    this.statusTextEl.textContent = status;

    this.restartBtn.classList.toggle('hidden', this.state.phase !== GAME_PHASE.GAME_OVER && this.state.phase !== GAME_PHASE.VICTORY);

    const tower = this.state.selectedTower;
    if (!tower) {
      this.towerPanel.classList.add('hidden');
      return;
    }

    this.towerPanel.classList.remove('hidden');
    const stats = tower.stats;
    this.towerInfo.innerHTML = `
      <p><strong>${tower.template.name}</strong></p>
      <p>Level: ${tower.level + 1} / ${tower.template.levels.length}</p>
      <p>Damage: ${stats.damage}</p>
      <p>Range: ${stats.range.toFixed(2)}</p>
      <p>Fire Rate: ${stats.fireRate.toFixed(2)} /s</p>
      <p>${tower.type === 'nova' ? `Splash: ${stats.splashRadius.toFixed(2)}` : 'Splash: none'}</p>
      <p>Upgrade Cost: ${tower.canUpgrade() ? tower.upgradeCost : 'MAX'}</p>
    `;
    this.upgradeBtn.disabled = !tower.canUpgrade() || this.state.money < (tower.upgradeCost || 0);
  }
}
