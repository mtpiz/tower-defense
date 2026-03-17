const AudioContextCtor =
  typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;

const noop = () => {};

const scheduleGainEnvelope = (gainParam, now, peak, attack, release) => {
  gainParam.cancelScheduledValues(now);
  gainParam.setValueAtTime(0.0001, now);
  gainParam.exponentialRampToValueAtTime(peak, now + attack);
  gainParam.exponentialRampToValueAtTime(0.0001, now + attack + release);
};

export class AudioController {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.enabled = true;
  }

  get muted() {
    return !this.enabled;
  }

  ensureReady() {
    if (!AudioContextCtor) {
      return;
    }

    if (!this.context) {
      this.context = new AudioContextCtor();

      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 18;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.18;

      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.enabled ? 0.28 : 0.0001;
      this.masterGain.connect(compressor);
      compressor.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') {
      this.context.resume().catch(noop);
    }
  }

  toggleMuted() {
    this.enabled = !this.enabled;

    if (this.masterGain && this.context) {
      const now = this.context.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.28 : 0.0001, now, 0.015);
    }

    return this.muted;
  }

  playEvents(events) {
    if (!events.length || !this.enabled) {
      return;
    }

    this.ensureReady();

    if (!this.context || this.context.state !== 'running') {
      return;
    }

    const towerEvents = events.filter((event) => event.type === 'tower-fired').slice(0, 6);
    const killEvents = events.filter((event) => event.type === 'enemy-destroyed').slice(0, 4);

    towerEvents.forEach((event, index) => {
      this.playTowerShot(event.towerType, index * 0.012);
    });

    killEvents.forEach((event, index) => {
      this.playEnemyExplosion(event.enemyType, index * 0.02);
    });
  }

  getNoiseBuffer() {
    if (!this.context) {
      return null;
    }

    if (this.noiseBuffer) {
      return this.noiseBuffer;
    }

    const duration = 0.24;
    const frameCount = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      const decay = 1 - index / frameCount;
      data[index] = (Math.random() * 2 - 1) * decay;
    }

    this.noiseBuffer = buffer;
    return buffer;
  }

  playTowerShot(towerType, offset = 0) {
    if (!this.context || !this.masterGain) {
      return;
    }

    if (towerType === 'nova') {
      this.playNovaShot(offset);
      return;
    }

    if (towerType === 'rail') {
      this.playRailShot(offset);
      return;
    }

    if (towerType === 'shard') {
      this.playShardShot(offset);
      return;
    }

    this.playPulseShot(offset);
  }

  playPulseShot(offset = 0) {
    const now = this.context.currentTime + offset;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(760, now + 0.09);
    filter.Q.value = 1.4;

    const tone = this.context.createOscillator();
    tone.type = 'sawtooth';
    tone.frequency.setValueAtTime(1460, now);
    tone.frequency.exponentialRampToValueAtTime(460, now + 0.09);

    const overtone = this.context.createOscillator();
    overtone.type = 'square';
    overtone.frequency.setValueAtTime(2100, now);
    overtone.frequency.exponentialRampToValueAtTime(700, now + 0.065);

    const gain = this.context.createGain();
    scheduleGainEnvelope(gain.gain, now, 0.08, 0.004, 0.086);

    tone.connect(filter);
    overtone.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    tone.start(now);
    overtone.start(now);
    tone.stop(now + 0.095);
    overtone.stop(now + 0.07);
  }

  playNovaShot(offset = 0) {
    const now = this.context.currentTime + offset;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.16);

    const main = this.context.createOscillator();
    main.type = 'triangle';
    main.frequency.setValueAtTime(380, now);
    main.frequency.exponentialRampToValueAtTime(104, now + 0.16);

    const sub = this.context.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(180, now);
    sub.frequency.exponentialRampToValueAtTime(62, now + 0.16);

    const gain = this.context.createGain();
    scheduleGainEnvelope(gain.gain, now, 0.11, 0.01, 0.15);

    main.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    main.start(now);
    sub.start(now);
    main.stop(now + 0.17);
    sub.stop(now + 0.17);
  }

  playRailShot(offset = 0) {
    const now = this.context.currentTime + offset;
    const osc = this.context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.11);

    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);

    const gain = this.context.createGain();
    scheduleGainEnvelope(gain.gain, now, 0.09, 0.003, 0.11);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playShardShot(offset = 0) {
    const now = this.context.currentTime + offset;
    const osc = this.context.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(760, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);

    const gain = this.context.createGain();
    scheduleGainEnvelope(gain.gain, now, 0.055, 0.002, 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playEnemyExplosion(enemyType, offset = 0) {
    if (!this.context || !this.masterGain) {
      return;
    }

    const now = this.context.currentTime + offset;
    const buffer = this.getNoiseBuffer();

    if (buffer) {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value =
        enemyType === 'runner' ? 1.35 : enemyType === 'tank' ? 0.78 : 1;

      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value =
        enemyType === 'runner' ? 1900 : enemyType === 'tank' ? 760 : 1180;
      filter.Q.value = 0.8;

      const noiseGain = this.context.createGain();
      scheduleGainEnvelope(noiseGain.gain, now, 0.07, 0.003, 0.14);

      source.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      source.start(now);
      source.stop(now + 0.16);
    }

    const pop = this.context.createOscillator();
    pop.type = 'triangle';
    const startFreq = enemyType === 'runner' ? 260 : enemyType === 'tank' ? 130 : 180;
    pop.frequency.setValueAtTime(startFreq, now);
    pop.frequency.exponentialRampToValueAtTime(Math.max(48, startFreq * 0.34), now + 0.15);

    const popGain = this.context.createGain();
    scheduleGainEnvelope(popGain.gain, now, 0.06, 0.004, 0.145);

    pop.connect(popGain);
    popGain.connect(this.masterGain);
    pop.start(now);
    pop.stop(now + 0.16);
  }
}
