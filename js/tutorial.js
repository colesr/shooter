// ═══════════════════════════════════════════
//  TUTORIAL / ONBOARDING SYSTEM
// ═══════════════════════════════════════════

const Tutorial = (function(){
  const TUTORIAL_KEY = 'neonShooterTutorialSeen';

  function hasSeenTutorial(){
    return localStorage.getItem(TUTORIAL_KEY) === 'true';
  }

  function markTutorialSeen(){
    localStorage.setItem(TUTORIAL_KEY, 'true');
  }

  function shouldShowTutorial(){
    return !hasSeenTutorial();
  }

  function buildTutorialHTML(){
    return `
      <div class="tutorial-title">OPERATIVE BRIEFING</div>
      <div class="tutorial-sub">// MISSION PROTOCOL — READ BEFORE DEPLOYMENT //</div>
      <div class="tutorial-steps">
        <div class="tutorial-step">
          <div class="tutorial-step-num">01</div>
          <div class="tutorial-step-text">
            <strong style="color:#00ffcc">AIM & FIRE</strong><br>
            Move your mouse to aim the crosshair.
            <span class="tutorial-step-key">LEFT CLICK</span> to fire at buildings.
            Hold for continuous fire with upgrades.
          </div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-num">02</div>
          <div class="tutorial-step-text">
            <strong style="color:#ff2d78">COMBOS</strong><br>
            Hit buildings consecutively to build your combo multiplier.
            Missing resets your combo. Higher combos = more points and shards.
          </div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-num">03</div>
          <div class="tutorial-step-text">
            <strong style="color:#b24bff">SHARDS & UPGRADES</strong><br>
            Destroyed buildings drop <span style="color:#b24bff">💠 SHARDS</span>.
            Collect them by moving your cursor near them.
            Spend shards in the <span class="tutorial-step-key">SHOP</span> for permanent upgrades.
          </div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-num">04</div>
          <div class="tutorial-step-text">
            <strong style="color:#ff00ff">POWER-UPS</strong><br>
            Buildings sometimes drop power-ups:
            <span style="color:#ff00ff">SPREAD</span> (triple shot),
            <span style="color:#ff6600">OVERCLOCK</span> (rapid fire),
            <span style="color:#00ccff">SLOWMO</span> (slow time).
            Fly through them to collect.
          </div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-num">05</div>
          <div class="tutorial-step-text">
            <strong style="color:#ffe600">SHOOTING STARS & WISHES</strong><br>
            Watch for <span style="color:#ffe600">★ shooting stars</span> crossing the sky.
            Hit one to receive a powerful one-time wish upgrade!
          </div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-num">06</div>
          <div class="tutorial-step-text">
            <strong style="color:#ff2d78">BOSS FIGHTS</strong><br>
            Mini-bosses and <span style="color:#ff2d78">THE ARCHITECT</span> appear as you score higher.
            Dodge their projectiles (touching one = death!) and shoot them down for massive rewards.
          </div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-num">07</div>
          <div class="tutorial-step-text">
            <strong style="color:#00ffcc">CONTROLS SUMMARY</strong><br>
            <span class="tutorial-step-key">MOUSE</span> Aim &nbsp;
            <span class="tutorial-step-key">LMB</span> Fire &nbsp;
            <span class="tutorial-step-key">ESC</span> Pause &nbsp;
            <span class="tutorial-step-key">S</span> Debug star
          </div>
        </div>
      </div>
      <button class="tutorial-close" onclick="Tutorial.close()">UNDERSTOOD — BEGIN MISSION</button>
    `;
  }

  function open(){
    const modal = document.getElementById('tutorial-modal');
    if(!modal) return;
    modal.innerHTML = buildTutorialHTML();
    modal.classList.add('open');
  }

  function close(){
    const modal = document.getElementById('tutorial-modal');
    if(!modal) return;
    modal.classList.remove('open');
    markTutorialSeen();
  }

  return {
    hasSeenTutorial, markTutorialSeen, shouldShowTutorial,
    buildTutorialHTML, open, close
  };
})();
