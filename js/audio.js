// ═══════════════════════════════════════════
//  AUDIO ENGINE — Web Audio API Sound System
// ═══════════════════════════════════════════

const AudioEngine = (function(){
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let musicPlaying = false;
  let musicOsc = null;
  let musicLFO = null;

  // Settings
  let masterVolume = 0.7;
  let sfxVolume = 0.8;
  let musicVolume = 0.3;

  function init(){
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = masterVolume;
      masterGain.connect(ctx.destination);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = sfxVolume;
      sfxGain.connect(masterGain);

      musicGain = ctx.createGain();
      musicGain.gain.value = musicVolume;
      musicGain.connect(masterGain);
    } catch(e) {
      console.warn('Audio init failed:', e);
    }
  }

  function ensureCtx(){
    if(!ctx) init();
    if(ctx && ctx.state === 'suspended') ctx.resume();
    return !!ctx;
  }

  // ── SHOOT SOUND ──
  // Quick punchy electronic blip
  function playShoot(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now); osc.stop(now + 0.08);
  }

  // ── EXPLOSION SOUND ──
  // White noise burst + low thump
  function playExplosion(intensity = 1.0){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const dur = 0.3 * intensity;

    // Noise burst
    const bufLen = ctx.sampleRate * dur | 0;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < bufLen; i++){
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / (bufLen * 0.4));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.2 * intensity, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(nGain); nGain.connect(sfxGain);
    noise.start(now);

    // Low thump
    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.connect(oGain); oGain.connect(sfxGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 * intensity, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
    oGain.gain.setValueAtTime(0.25 * intensity, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now); osc.stop(now + 0.25);
  }

  // ── COMBO DING ──
  // Rising pitch for increasing combos
  function playCombo(comboLevel){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const baseFreq = 440 + Math.min(comboLevel, 50) * 15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now); osc.stop(now + 0.15);
  }

  // ── COMBO BREAK ──
  // Descending sad tone
  function playComboBreak(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now); osc.stop(now + 0.35);
  }

  // ── POWERUP COLLECT ──
  // Ascending arpeggio
  function playPowerup(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(sfxGain);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.06;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    });
  }

  // ── SHARD COLLECT ──
  // Quick bright ping
  function playShard(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now); osc.stop(now + 0.08);
  }

  // ── BOSS ENTRANCE ──
  // Dramatic low rumble + dissonant chord
  function playBossEntrance(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;

    // Low rumble
    const bufLen = ctx.sampleRate * 2 | 0;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < bufLen; i++){
      data[i] = (Math.random() * 2 - 1) * 0.5 * Math.sin(i / ctx.sampleRate * Math.PI * 40);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.2, now);
    nGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    noise.connect(filter); filter.connect(nGain); nGain.connect(sfxGain);
    noise.start(now);

    // Dissonant chord
    [110, 139, 165].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(sfxGain);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.start(now + 0.3); osc.stop(now + 2.5);
    });
  }

  // ── BOSS PHASE TRANSITION ──
  function playPhaseTransition(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.start(now); osc.stop(now + 0.7);
  }

  // ── BOSS DEATH ──
  function playBossDeath(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    for(let i = 0; i < 4; i++){
      const t = now + i * 0.15;
      playExplosion(1.5 - i * 0.2);
    }
    // Victory chord
    setTimeout(() => {
      if(!ctx) return;
      const t = ctx.currentTime;
      [523, 659, 784].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(sfxGain);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
        osc.start(t); osc.stop(t + 1);
      });
    }, 700);
  }

  // ── LASER SOUND ──
  function playLaser(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.8);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.start(now); osc.stop(now + 0.8);
  }

  // ── POWER DOWN (death) ──
  function playPowerDown(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    // Descending whine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 2.0);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    osc.start(now); osc.stop(now + 2.2);
    // Static burst
    const dur = 1.5, rate = ctx.sampleRate, n = rate * dur | 0;
    const buf = ctx.createBuffer(1, n, rate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / (n * 0.6));
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.15, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    noise.connect(nGain); nGain.connect(sfxGain);
    noise.start(now);
  }

  // ── ACHIEVEMENT UNLOCK ──
  function playAchievement(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const notes = [784, 988, 1175, 1568]; // G5, B5, D6, G6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(sfxGain);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.08;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    });
  }

  // ── SECTOR TRANSITION ──
  function playSectorTransition(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    // Sweeping filter effect
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(200, now + 1);
    filter.Q.value = 5;

    // White noise through filter
    const bufLen = ctx.sampleRate * 1 | 0;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    noise.connect(filter); filter.connect(gain); gain.connect(sfxGain);
    noise.start(now);
  }

  // ── WISH GRANTED ──
  function playWish(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    // Magical shimmer
    for(let i = 0; i < 6; i++){
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(sfxGain);
      osc.type = 'sine';
      const freq = 800 + i * 200 + Math.random() * 100;
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + i * 0.05 + 0.2);
      const t = now + i * 0.05;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    }
  }

  // ── UI CLICK ──
  function playUIClick(){
    if(!ensureCtx()) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'square';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.start(now); osc.stop(now + 0.03);
  }

  // ── AMBIENT MUSIC ──
  // Procedural dark synthwave background
  function startMusic(){
    if(!ensureCtx() || musicPlaying) return;
    musicPlaying = true;

    // Bass drone
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.value = 55; // A1
    bassGain.gain.value = 0.06;

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 200;

    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(musicGain);
    bass.start();

    // Pad chord (Am - A2, C3, E3)
    const padFreqs = [110, 130.81, 164.81];
    const padOscs = padFreqs.map(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(musicGain);
      osc.start();
      return { osc, gain };
    });

    // LFO for filter sweep
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow
    lfoGain.gain.value = 100;
    lfo.connect(lfoGain);
    lfoGain.connect(bassFilter.frequency);
    lfo.start();

    musicOsc = { bass, bassGain, bassFilter, padOscs, lfo, lfoGain };
  }

  function stopMusic(){
    if(!musicPlaying || !musicOsc) return;
    musicPlaying = false;
    try {
      const now = ctx.currentTime;
      musicOsc.bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1);
      musicOsc.padOscs.forEach(p => p.gain.gain.exponentialRampToValueAtTime(0.001, now + 1));
      setTimeout(() => {
        try {
          musicOsc.bass.stop();
          musicOsc.padOscs.forEach(p => p.osc.stop());
          musicOsc.lfo.stop();
        } catch(e) {}
        musicOsc = null;
      }, 1200);
    } catch(e) {
      musicOsc = null;
    }
  }

  // ── VOLUME CONTROLS ──
  function setMasterVolume(v){ masterVolume = v; if(masterGain) masterGain.gain.value = v; }
  function setSfxVolume(v){ sfxVolume = v; if(sfxGain) sfxGain.gain.value = v; }
  function setMusicVolume(v){ musicVolume = v; if(musicGain) musicGain.gain.value = v; }

  return {
    init, ensureCtx,
    playShoot, playExplosion, playCombo, playComboBreak,
    playPowerup, playShard, playBossEntrance, playPhaseTransition,
    playBossDeath, playLaser, playPowerDown, playAchievement,
    playSectorTransition, playWish, playUIClick,
    startMusic, stopMusic,
    setMasterVolume, setSfxVolume, setMusicVolume,
    get masterVolume(){ return masterVolume; },
    get sfxVolume(){ return sfxVolume; },
    get musicVolume(){ return musicVolume; },
  };
})();
