// ═══════════════════════════════════════════
//  GAME STATE MACHINE & CENTRALIZED STATE
// ═══════════════════════════════════════════

const GameState = (function(){
  // ── State Machine ──
  // States: 'menu', 'playing', 'paused', 'death', 'shop'
  let currentState = 'menu';
  let previousState = null;
  const listeners = [];

  function setState(newState){
    if(newState === currentState) return;
    previousState = currentState;
    currentState = newState;
    listeners.forEach(fn => fn(newState, previousState));
  }

  function getState(){ return currentState; }
  function getPreviousState(){ return previousState; }
  function onStateChange(fn){ listeners.push(fn); }

  // ── Difficulty ──
  // easy: 0.6x speed, 1.5x combo window, 0.5x enemy fire rate
  // normal: 1x everything
  // hard: 1.3x speed, 0.7x combo window, 1.5x enemy fire rate, 0.7x shard drops
  const DIFFICULTIES = {
    easy:   { label:'EASY',   speedMult:0.6,  comboMult:1.5,  enemyFireMult:0.5, shardMult:1.5, scoreMult:0.5, desc:'Relaxed pace, generous combos' },
    normal: { label:'NORMAL', speedMult:1.0,  comboMult:1.0,  enemyFireMult:1.0, shardMult:1.0, scoreMult:1.0, desc:'The intended experience' },
    hard:   { label:'HARD',   speedMult:1.3,  comboMult:0.7,  enemyFireMult:1.5, shardMult:0.7, scoreMult:1.5, desc:'Faster enemies, tighter combos' },
  };
  let difficulty = 'normal';

  function setDifficulty(d){
    if(DIFFICULTIES[d]) difficulty = d;
  }
  function getDifficulty(){ return difficulty; }
  function getDifficultyConfig(){ return DIFFICULTIES[difficulty]; }

  // ── Persistent Stats ──
  const STATS_KEY = 'neonShooterLifetimeStats';
  let lifetimeStats = {
    totalGames: 0,
    totalScore: 0,
    totalKills: 0,
    totalShots: 0,
    totalHits: 0,
    totalShardsCollected: 0,
    totalTimePlayed: 0,  // in seconds
    totalBossKills: 0,
    totalWishesGranted: 0,
    highestCombo: 0,
    highestScore: 0,
    highestWave: 0,
    totalDeaths: 0,
    fastestBossKill: Infinity, // frames
    longestSurvival: 0, // frames
    totalPowerupsCollected: 0,
    gamesPerDifficulty: { easy:0, normal:0, hard:0 },
  };

  function loadStats(){
    try {
      const saved = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      Object.keys(lifetimeStats).forEach(k => {
        if(saved[k] !== undefined) lifetimeStats[k] = saved[k];
      });
      // Ensure nested objects
      if(!lifetimeStats.gamesPerDifficulty) lifetimeStats.gamesPerDifficulty = {easy:0,normal:0,hard:0};
    } catch(e) {}
  }

  function saveStats(){
    try { localStorage.setItem(STATS_KEY, JSON.stringify(lifetimeStats)); } catch(e) {}
  }

  function updateStats(sessionData){
    lifetimeStats.totalGames++;
    lifetimeStats.totalScore += sessionData.score || 0;
    lifetimeStats.totalKills += sessionData.kills || 0;
    lifetimeStats.totalShots += sessionData.shots || 0;
    lifetimeStats.totalHits += sessionData.hits || 0;
    lifetimeStats.totalShardsCollected += sessionData.shardsCollected || 0;
    lifetimeStats.totalTimePlayed += Math.floor((sessionData.survivalTime || 0) / 60);
    lifetimeStats.totalBossKills += sessionData.bossKills || 0;
    lifetimeStats.totalWishesGranted += sessionData.wishesGranted || 0;
    lifetimeStats.totalPowerupsCollected += sessionData.powerupsCollected || 0;
    lifetimeStats.totalDeaths++;

    if(sessionData.score > lifetimeStats.highestScore) lifetimeStats.highestScore = sessionData.score;
    if(sessionData.maxCombo > lifetimeStats.highestCombo) lifetimeStats.highestCombo = sessionData.maxCombo;
    if(sessionData.wave > lifetimeStats.highestWave) lifetimeStats.highestWave = sessionData.wave;
    if(sessionData.survivalTime > lifetimeStats.longestSurvival) lifetimeStats.longestSurvival = sessionData.survivalTime;

    if(sessionData.gamesPerDifficulty) {
      lifetimeStats.gamesPerDifficulty[difficulty]++;
    } else {
      lifetimeStats.gamesPerDifficulty[difficulty]++;
    }

    saveStats();
  }

  function getStats(){ return lifetimeStats; }
  function getAccuracy(){
    if(lifetimeStats.totalShots === 0) return 0;
    return (lifetimeStats.totalHits / lifetimeStats.totalShots * 100).toFixed(1);
  }
  function getKDR(){
    if(lifetimeStats.totalDeaths === 0) return lifetimeStats.totalKills;
    return (lifetimeStats.totalKills / lifetimeStats.totalDeaths).toFixed(1);
  }
  function getAvgScore(){
    if(lifetimeStats.totalGames === 0) return 0;
    return Math.floor(lifetimeStats.totalScore / lifetimeStats.totalGames);
  }
  function formatTime(seconds){
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if(h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  // Init
  loadStats();

  return {
    setState, getState, getPreviousState, onStateChange,
    setDifficulty, getDifficulty, getDifficultyConfig, DIFFICULTIES,
    updateStats, getStats, saveStats, loadStats, getAccuracy, getKDR, getAvgScore, formatTime,
    get lifetimeStats(){ return lifetimeStats; },
  };
})();
