import { CONFIG } from './config.js';
import { GAME_PHASE } from './gameState.js';

export class UIController {
  constructor(state, canvas, onRestart, audio) {
    this.state = state;
    this.canvas = canvas;
    this.onRestart = onRestart;
    this.audio = audio;

    this.livesEl = document.getElementById('livesValue');
    this.moneyEl = document.getElementById('moneyValue');
    this.scoreEl = document.getElementById('scoreValue');
    this.waveEl = document.getElementById('waveValue');
    this.blocksEl = document.getElementById('blocksValue');
    this.statusTextEl = document.getElementById('statusText');

    this.blockBtn = document.getElementById('blockBtn');
    this.towerButtonsHost = document.getElementById('towerButtons');
    this.startWaveBtn = document.getElementById('startWaveBtn');
    this.soundBtn = document.getElementById('soundBtn');
    this.restartBtn = document.getElementById('restartBtn');

    this.towerPanel = document.getElementById('towerPanel');
    this.towerInfo = document.getElementById('towerInfo');
    this.upgradeBtn = document.getElementById('upgradeBtn');
    this.towerButtons = new Map();

    this.buildTowerButtons();
    this.bindEvents();
  }

  buildTowerButtons() {
    this.towerButtonsHost.textContent = '';
    CONFIG.towerOrder.forEach((type) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tower-button';
      button.dataset.towerType = type;
      button.addEventListener('click', () => {
        if (!this.state.isTowerUnlocked(type)) return;
        this.audio.ensureReady();
        this.state.setBuildMode('tower', type);
      });
      this.towerButtonsHost.appendChild(button);
      this.towerButtons.set(type, button);
    });
  }

  bindEvents() {
    this.blockBtn.addEventListener('click', () => {
      this.audio.ensureReady();
      this.state.setBuildMode('block');
    });
    this.startWaveBtn.addEventListener('click', () => {
      this.audio.ensureReady();
      this.state.startWave();
    });
    this.soundBtn.addEventListener('click', () => {
      this.audio.ensureReady();
      this.audio.toggleMuted();
    });
    this.restartBtn.addEventListener('click', () => {
      this.audio.ensureReady();
      this.onRestart();
    });
    this.upgradeBtn.addEventListener('click', () => {
      this.audio.ensureReady();
      this.state.tryUpgradeSelectedTower();
    });
  }

  update() {
    this.livesEl.textContent = this.state.lives;
    this.moneyEl.textContent = this.state.money;
    this.scoreEl.textContent = this.state.score;
    this.blocksEl.textContent = this.state.blockTilesLeft;

    const displayedWave =
      this.state.phase === GAME_PHASE.WAVE
        ? this.state.waveManager.currentIndex + 1
        : this.state.nextWaveNumber;
    this.waveEl.textContent = `${displayedWave} / ${CONFIG.gameplay.totalWaves}`;

    this.blockBtn.disabled = ![GAME_PHASE.BUILD, GAME_PHASE.READY].includes(this.state.phase);
    this.blockBtn.classList.toggle('selected', this.state.buildMode === 'block');

    this.towerButtons.forEach((button, type) => {
      const tower = CONFIG.towers[type];
      const unlocked = this.state.isTowerUnlocked(type);
      button.disabled =
        !unlocked
        || ![GAME_PHASE.BUILD, GAME_PHASE.READY].includes(this.state.phase);
      button.classList.toggle(
        'selected',
        this.state.buildMode === 'tower' && this.state.selectedTowerType === type,
      );
      button.classList.toggle('locked', !unlocked);
      button.innerHTML = unlocked
        ? `<span>${tower.name}</span><small>$${tower.cost} | ${tower.role}</small>`
        : `<span>${tower.name}</span><small>Unlocks on wave ${tower.unlockWave}</small>`;
    });

    this.soundBtn.classList.toggle('selected', !this.audio.muted);
    this.soundBtn.textContent = this.audio.muted ? 'Sound Off' : 'Sound On';

    this.startWaveBtn.disabled =
      this.state.phase !== GAME_PHASE.BUILD
      || !this.state.waveManager.hasNextWave()
      || !this.state.pathPreview;

    let status = 'Design the maze: place block tiles and towers, keeping at least one route open.';
    if (!this.state.pathPreview) {
      status = 'No route to exit. Restart to regenerate the maze and try a different layout.';
    } else if (this.state.phase === GAME_PHASE.BUILD && this.state.upcomingUnlocks.length > 0) {
      const unlockedNames = this.state.upcomingUnlocks
        .map((type) => CONFIG.towers[type].name)
        .join(', ');
      status = `Build phase: keep one lane open. New unlock ready for wave ${this.state.nextWaveNumber}: ${unlockedNames}.`;
    }

    if (this.state.phase === GAME_PHASE.WAVE) status = 'Wave active: your maze and kill-zone are live.';
    if (this.state.phase === GAME_PHASE.GAME_OVER) status = 'Defeat. Hit restart for fresh spawn and exit points.';
    if (this.state.phase === GAME_PHASE.VICTORY) status = 'Victory! Restart to build a new deadly maze.';
    this.statusTextEl.textContent = status;

    this.restartBtn.classList.toggle(
      'hidden',
      this.state.phase !== GAME_PHASE.GAME_OVER && this.state.phase !== GAME_PHASE.VICTORY,
    );

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
      <p>Shots: ${stats.shotsPerAttack || 1}</p>
      <p>Targets: ${stats.targetCount || 1}</p>
      <p>${tower.type === 'nova' ? `Splash: ${stats.splashRadius.toFixed(2)}` : 'Splash: none'}</p>
      <p>Upgrade Cost: ${tower.canUpgrade() ? tower.upgradeCost : 'MAX'}</p>
    `;
    this.upgradeBtn.disabled = !tower.canUpgrade() || this.state.money < (tower.upgradeCost || 0);
  }
}
