// enemies.js — Mini-boss enemy types for cyberpunk shooter
// PhaseBomber, ShieldOrb, SplitWorm

class PhaseBomber {
  constructor(maxHp){
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.dead = false;
    this.hitFlash = 0;
    this.tick = 0;
    this.type = 'phase_bomber';

    // Flies in from top, swoops across screen
    this.x = -50;
    this.y = H * 0.15;
    this.phase = 'enter'; // enter, attack, retreat
    this.attackRuns = 0;
    this.maxRuns = 3;
    this.targetX = W * 0.5;

    this.shootTimer = 0;
    this.projectiles = [];
    this.bombs = []; // bombs that fall with gravity
  }

  update(dt){
    if(this.dead) return;
    this.tick += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    if(this.phase === 'enter'){
      this.x += (this.targetX - this.x) * 0.02 * dt;
      if(Math.abs(this.x - this.targetX) < 20) this.phase = 'attack';
    } else if(this.phase === 'attack'){
      // Weave back and forth
      this.x += Math.sin(this.tick * 0.02) * 2 * dt;
      this.y = H * 0.15 + Math.sin(this.tick * 0.01) * 30;

      // Drop bombs
      this.shootTimer += dt;
      if(this.shootTimer >= 60){
        this.shootTimer = 0;
        this.bombs.push({
          x: this.x, y: this.y + 20,
          vx: (Math.random() - 0.5) * 2,
          vy: 1,
          life: 200
        });
      }

      // After some time, switch to retreat and re-enter
      if(this.tick > 300 + this.attackRuns * 200){
        this.phase = 'retreat';
        this.targetX = this.x < W/2 ? W + 50 : -50;
      }
    } else if(this.phase === 'retreat'){
      this.x += (this.targetX - this.x) * 0.03 * dt;
      if(this.x < -40 || this.x > W + 40){
        this.attackRuns++;
        if(this.attackRuns >= this.maxRuns){
          this.phase = 'attack';
          this.x = W * 0.5;
        } else {
          this.phase = 'enter';
          this.x = this.targetX < 0 ? W + 50 : -50;
          this.targetX = W * (0.3 + Math.random() * 0.4);
        }
      }
    }

    // Update bombs with gravity
    for(let i = this.bombs.length - 1; i >= 0; i--){
      const b = this.bombs[i];
      b.x += b.vx * dt * 0.5;
      b.y += b.vy * dt * 0.5;
      b.vy += 0.08 * dt; // gravity
      b.life -= dt;

      // Player hit
      if(Math.hypot(b.x - mX, b.y - mY) < 20 && mInside){
        this.bombs.splice(i, 1);
        if(!isDying) triggerDeath();
        continue;
      }

      // Remove if offscreen or expired
      if(b.life <= 0 || b.y > H + 50) this.bombs.splice(i, 1);
    }
  }

  bulletHit(bx, by, bz){
    const sc = focal / Math.max(1, bz);
    const bsx = W/2 + bx * sc, bsy = H/2 + by * sc;
    if(Math.hypot(bsx - this.x, bsy - this.y) < 45){
      this.hp--;
      this.hitFlash = 8;
      bossHPF.style.width = (this.hp / this.maxHp * 100) + '%';
      addShake(3);
      addFreezeFrame(1);
      spawnExplosion(bx, by, bz, '#ff3399', 5);
      if(this.hp <= 0) this._die();
      return true;
    }
    return false;
  }

  _die(){
    this.dead = true;
    for(let i = 0; i < 3; i++){
      setTimeout(() => {
        spawnExplosion(this.x + (Math.random()-0.5)*80, this.y + (Math.random()-0.5)*40, 100, '#ff3399', 18);
        addShake(10);
      }, i * 120);
    }
    const pts = 28 * combo * wishMultiplier;
    score += pts; lifetime += pts;
    if(score > best) best = score;
    dropShards(0, 0, 100, 16 + getBossShardBonus());
    showNotify('PHASE BOMBER DESTROYED! +' + pts, '#ff3399');
    bossActive = false; boss = null;
    bossBar.classList.remove('visible');
    nextBossScore = score + 30;
    updateHUD(); saveData(); pushToLB(score);
  }

  draw(){
    if(this.dead) return;
    const flash = this.hitFlash > 0;
    const col = flash ? '#ffffff' : '#ff3399';

    ctx.save();
    ctx.strokeStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2;

    // Wing shape (triangle)
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 15);
    ctx.lineTo(this.x - 40, this.y + 20);
    ctx.lineTo(this.x + 40, this.y + 20);
    ctx.closePath();
    ctx.stroke();

    // Center body
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(this.x, this.y + 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Engine glow
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgba(255,51,153,${0.5 + 0.3 * Math.sin(this.tick * 0.1)})`;
    ctx.beginPath();
    ctx.arc(this.x - 20, this.y + 20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 20, this.y + 20, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw bombs
    ctx.save();
    ctx.fillStyle = '#ff3399';
    ctx.shadowColor = '#ff3399';
    ctx.shadowBlur = 8;
    this.bombs.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.strokeStyle = 'rgba(255,51,153,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 5, b.y - b.vy * 5);
      ctx.stroke();
    });
    ctx.restore();
  }

  getSiphon(){ return 0; }
}

class ShieldOrb {
  constructor(maxHp){
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.dead = false;
    this.hitFlash = 0;
    this.tick = 0;
    this.type = 'shield_orb';

    this.x = W * 0.7;
    this.y = H * 0.4;
    this.targetX = this.x;
    this.targetY = this.y;
    this.teleportTimer = 0;
    this.teleportCooldown = 180;
    this.isTeleporting = false;
    this.teleportAlpha = 1;

    // Rotating shield segments - bullets only pass through gaps
    this.shieldAngle = 0;
    this.shieldGaps = 2; // Number of openings
    this.shieldRadius = 50;

    this.shootTimer = 0;
    this.projectiles = [];
  }

  update(dt){
    if(this.dead) return;
    this.tick += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.shieldAngle += 0.015 * dt;

    // Teleport logic
    this.teleportTimer += dt;
    if(this.teleportTimer >= this.teleportCooldown && !this.isTeleporting){
      this.isTeleporting = true;
      this.teleportAlpha = 1;
      this.targetX = W * (0.4 + Math.random() * 0.5);
      this.targetY = H * (0.15 + Math.random() * 0.6);
    }

    if(this.isTeleporting){
      this.teleportAlpha -= 0.05 * dt;
      if(this.teleportAlpha <= 0){
        this.x = this.targetX;
        this.y = this.targetY;
        this.teleportAlpha = 0;
        setTimeout(() => {
          this.teleportAlpha = 1;
          this.isTeleporting = false;
          this.teleportTimer = 0;
        }, 200);
      }
    } else {
      // Gentle float
      this.x += Math.sin(this.tick * 0.008) * 0.3 * dt;
      this.y += Math.cos(this.tick * 0.006) * 0.2 * dt;
    }

    // Shoot homing projectiles
    this.shootTimer += dt;
    if(this.shootTimer >= 90 && !this.isTeleporting){
      this.shootTimer = 0;
      const angle = Math.atan2(mY - this.y, mX - this.x);
      this.projectiles.push({
        x: this.x, y: this.y,
        vx: Math.cos(angle) * 2.5,
        vy: Math.sin(angle) * 2.5,
        life: 180
      });
    }

    // Update projectiles
    for(let i = this.projectiles.length - 1; i >= 0; i--){
      const p = this.projectiles[i];
      // Gentle homing
      const angle = Math.atan2(mY - p.y, mX - p.x);
      p.vx += Math.cos(angle) * 0.03;
      p.vy += Math.sin(angle) * 0.03;
      const speed = Math.hypot(p.vx, p.vy);
      if(speed > 3){ p.vx *= 3/speed; p.vy *= 3/speed; }

      p.x += p.vx * dt * 0.5;
      p.y += p.vy * dt * 0.5;
      p.life -= dt;

      if(Math.hypot(p.x - mX, p.y - mY) < 14 && mInside){
        this.projectiles.splice(i, 1);
        if(!isDying) triggerDeath();
        continue;
      }
      if(p.life <= 0) this.projectiles.splice(i, 1);
    }
  }

  bulletHit(bx, by, bz){
    const sc = focal / Math.max(1, bz);
    const bsx = W/2 + bx * sc, bsy = H/2 + by * sc;

    if(this.isTeleporting) return false;

    const dist = Math.hypot(bsx - this.x, bsy - this.y);

    // Check if bullet passes through shield gap
    if(dist < this.shieldRadius + 10 && dist > 20){
      const bulletAngle = Math.atan2(bsy - this.y, bsx - this.x);
      const shieldSections = 6;
      const gapSize = (Math.PI * 2 / shieldSections) * 0.4;
      let blocked = true;

      for(let i = 0; i < this.shieldGaps; i++){
        const gapAngle = this.shieldAngle + (i / this.shieldGaps) * Math.PI * 2;
        let diff = bulletAngle - gapAngle;
        while(diff > Math.PI) diff -= Math.PI * 2;
        while(diff < -Math.PI) diff += Math.PI * 2;
        if(Math.abs(diff) < gapSize){
          blocked = false;
          break;
        }
      }

      if(blocked){
        addShake(1);
        spawnExplosion(bx, by, bz, '#66ffcc', 2);
        return true; // Bullet consumed but no damage
      }
    }

    // Hit core
    if(dist < 35){
      this.hp--;
      this.hitFlash = 8;
      bossHPF.style.width = (this.hp / this.maxHp * 100) + '%';
      addShake(4);
      addFreezeFrame(2);
      spawnExplosion(bx, by, bz, '#66ffcc', 8);
      if(this.hp <= 0) this._die();
      return true;
    }
    return false;
  }

  _die(){
    this.dead = true;
    for(let i = 0; i < 4; i++){
      setTimeout(() => {
        spawnExplosion(this.x + (Math.random()-0.5)*100, this.y + (Math.random()-0.5)*100, 100, '#66ffcc', 18);
        addShake(10);
      }, i * 100);
    }
    const pts = 32 * combo * wishMultiplier;
    score += pts; lifetime += pts;
    if(score > best) best = score;
    dropShards(0, 0, 100, 18 + getBossShardBonus());
    showNotify('SHIELD ORB DESTROYED! +' + pts, '#66ffcc');
    bossActive = false; boss = null;
    bossBar.classList.remove('visible');
    nextBossScore = score + 30;
    updateHUD(); saveData(); pushToLB(score);
  }

  draw(){
    if(this.dead) return;
    const flash = this.hitFlash > 0;
    const col = flash ? '#ffffff' : '#66ffcc';
    const alpha = this.isTeleporting ? Math.max(0, this.teleportAlpha) : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Shield ring
    const segments = 6;
    const gapSize = (Math.PI * 2 / segments) * 0.4;
    ctx.strokeStyle = `rgba(102,255,204,${0.6 + 0.2 * Math.sin(this.tick * 0.05)})`;
    ctx.shadowColor = '#66ffcc';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;

    for(let i = 0; i < segments; i++){
      const startAngle = this.shieldAngle + (i / segments) * Math.PI * 2 + gapSize;
      const endAngle = this.shieldAngle + ((i + 1) / segments) * Math.PI * 2 - gapSize;

      // Check if this is a gap segment
      let isGap = false;
      for(let g = 0; g < this.shieldGaps; g++){
        const gapIdx = Math.floor(g * segments / this.shieldGaps);
        if(i === gapIdx) isGap = true;
      }

      if(!isGap){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.shieldRadius, startAngle, endAngle);
        ctx.stroke();
      }
    }

    // Core orb
    ctx.strokeStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glow
    ctx.fillStyle = col;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Projectiles (homing orbs)
    ctx.save();
    ctx.fillStyle = '#66ffcc';
    ctx.shadowColor = '#66ffcc';
    ctx.shadowBlur = 10;
    this.projectiles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  getSiphon(){ return 0; }
}

class SplitWorm {
  constructor(maxHp){
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.dead = false;
    this.hitFlash = 0;
    this.tick = 0;
    this.type = 'split_worm';

    // Create segments
    this.segmentCount = 8;
    this.segments = [];
    for(let i = 0; i < this.segmentCount; i++){
      this.segments.push({
        x: W + 50 + i * 25,
        y: H * 0.4,
        radius: 15 - i * 0.8,
        hp: Math.ceil(maxHp / this.segmentCount),
        alive: true
      });
    }

    // Head follows a path
    this.pathAngle = 0;
    this.pathCenterX = W * 0.6;
    this.pathCenterY = H * 0.4;
    this.pathRadiusX = W * 0.25;
    this.pathRadiusY = H * 0.2;

    this.shootTimer = 0;
    this.projectiles = [];
  }

  update(dt){
    if(this.dead) return;
    this.tick += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    // Move head along path
    this.pathAngle += 0.012 * dt;
    const headX = this.pathCenterX + Math.cos(this.pathAngle) * this.pathRadiusX;
    const headY = this.pathCenterY + Math.sin(this.pathAngle * 1.5) * this.pathRadiusY;

    // Head follows target
    if(this.segments[0].alive){
      this.segments[0].x += (headX - this.segments[0].x) * 0.04 * dt;
      this.segments[0].y += (headY - this.segments[0].y) * 0.04 * dt;
    }

    // Each segment follows the previous
    for(let i = 1; i < this.segments.length; i++){
      const prev = this.segments[i-1];
      const seg = this.segments[i];
      if(!seg.alive) continue;

      const dx = prev.x - seg.x;
      const dy = prev.y - seg.y;
      const dist = Math.hypot(dx, dy);
      const targetDist = 22;

      if(dist > targetDist){
        seg.x += (dx / dist) * (dist - targetDist) * 0.1 * dt;
        seg.y += (dy / dist) * (dist - targetDist) * 0.1 * dt;
      }
    }

    // Shoot from head
    this.shootTimer += dt;
    if(this.shootTimer >= 100 && this.segments[0].alive){
      this.shootTimer = 0;
      const angle = Math.atan2(mY - this.segments[0].y, mX - this.segments[0].x);
      this.projectiles.push({
        x: this.segments[0].x,
        y: this.segments[0].y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 150
      });
    }

    // Update projectiles
    for(let i = this.projectiles.length - 1; i >= 0; i--){
      const p = this.projectiles[i];
      p.x += p.vx * dt * 0.5;
      p.y += p.vy * dt * 0.5;
      p.life -= dt;

      if(Math.hypot(p.x - mX, p.y - mY) < 14 && mInside){
        this.projectiles.splice(i, 1);
        if(!isDying) triggerDeath();
        continue;
      }
      if(p.life <= 0 || p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50){
        this.projectiles.splice(i, 1);
      }
    }

    // Check if all segments dead
    if(!this.segments.some(s => s.alive) && !this.dead){
      this._die();
    }
  }

  bulletHit(bx, by, bz){
    const sc = focal / Math.max(1, bz);
    const bsx = W/2 + bx * sc, bsy = H/2 + by * sc;

    for(let i = 0; i < this.segments.length; i++){
      const seg = this.segments[i];
      if(!seg.alive) continue;

      if(Math.hypot(bsx - seg.x, bsy - seg.y) < seg.radius + 10){
        seg.hp--;
        this.hp--;
        this.hitFlash = 6;
        bossHPF.style.width = (this.hp / this.maxHp * 100) + '%';
        addShake(2);
        addFreezeFrame(1);
        spawnExplosion(bx, by, bz, '#ff8800', 4);

        if(seg.hp <= 0){
          seg.alive = false;
          spawnExplosion(bx, by, bz, '#ff8800', 12);
          addShake(6);
          addFreezeFrame(2);
        }

        if(this.hp <= 0) this._die();
        return true;
      }
    }
    return false;
  }

  _die(){
    this.dead = true;
    this.segments.forEach(s => s.alive = false);
    for(let i = 0; i < 4; i++){
      setTimeout(() => {
        const seg = this.segments[Math.floor(Math.random() * this.segments.length)];
        spawnExplosion(seg.x + (Math.random()-0.5)*40, seg.y + (Math.random()-0.5)*40, 100, '#ff8800', 16);
        addShake(8);
      }, i * 100);
    }
    const pts = 30 * combo * wishMultiplier;
    score += pts; lifetime += pts;
    if(score > best) best = score;
    dropShards(0, 0, 100, 17 + getBossShardBonus());
    showNotify('SPLIT WORM DESTROYED! +' + pts, '#ff8800');
    bossActive = false; boss = null;
    bossBar.classList.remove('visible');
    nextBossScore = score + 30;
    updateHUD(); saveData(); pushToLB(score);
  }

  draw(){
    if(this.dead) return;
    const flash = this.hitFlash > 0;

    ctx.save();

    // Draw segments back to front
    for(let i = this.segments.length - 1; i >= 0; i--){
      const seg = this.segments[i];
      if(!seg.alive) continue;

      const col = flash ? '#ffffff' : (i === 0 ? '#ffaa00' : '#ff8800');
      ctx.strokeStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill
      ctx.fillStyle = `rgba(255,136,0,${0.15 + (i === 0 ? 0.15 : 0)})`;
      ctx.fill();

      // Eyes on head
      if(i === 0){
        ctx.fillStyle = col;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(seg.x - 5, seg.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(seg.x + 5, seg.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Segment HP bar
      if(i === 0 || seg.hp < this.maxHp / this.segmentCount){
        const hpw = seg.radius * 2;
        const hph = 4;
        const hpY = seg.y + seg.radius + 8;
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(seg.x - hpw/2, hpY, hpw, hph);
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(seg.x - hpw/2, hpY, hpw * (seg.hp / (this.maxHp / this.segmentCount)), hph);
      }
    }

    // Draw connections between alive segments
    ctx.strokeStyle = 'rgba(255,136,0,0.3)';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    for(let i = 1; i < this.segments.length; i++){
      if(!this.segments[i].alive || !this.segments[i-1].alive) continue;
      ctx.beginPath();
      ctx.moveTo(this.segments[i-1].x, this.segments[i-1].y);
      ctx.lineTo(this.segments[i].x, this.segments[i].y);
      ctx.stroke();
    }

    ctx.restore();

    // Projectiles
    ctx.save();
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 10;
    this.projectiles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  getSiphon(){ return 0; }
}
