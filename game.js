const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#050510',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, MenuScene, GameScene]
};

const game = new Phaser.Game(config);
const pixelFont = { fontFamily: '"Press Start 2P"', fontSize: '14px', fill: '#ffffff' };
let bestTime = 0;

// --- СЦЕНА ЗАГРУЗКИ (Рисуем пиксельные спрайты и создаем анимации) ---
function BootScene() { Phaser.Scene.call(this, { key: 'BootScene' }); }
BootScene.prototype = Object.create(Phaser.Scene.prototype);
BootScene.prototype.constructor = BootScene;
BootScene.prototype.create = function() {
    let g = this.make.graphics({x: 0, y: 0, add: false});
    let p = 4; // Размер одного "пикселя" в коде

    // === 1. КОСМОНАВТ (4 кадра для анимации) ===
    function drawAstronaut(frame) {
        g.clear();
        // 1. Скафандр (Белый)
        g.fillStyle(0xffffff, 1);
        g.fillRect(2*p, 2*p, 4*p, 2*p); // Верх шлема
        g.fillRect(1*p, 4*p, 6*p, 4*p); // Шлем
        g.fillRect(2*p, 8*p, 4*p, 4*p); // Тело
        g.fillRect(1*p, 8*p, 1*p, 4*p); // Левая рука
        g.fillRect(6*p, 8*p, 1*p, 4*p); // Правая рука

        // 2. Ноги (в зависимости от кадра)
        if (frame === 0) { // Стойка
            g.fillRect(2*p, 12*p, 1*p, 2*p); 
            g.fillRect(5*p, 12*p, 1*p, 2*p);
        } else if (frame === 1) { // Левая вперед
            g.fillRect(1*p, 12*p, 2*p, 2*p); 
            g.fillRect(5*p, 12*p, 1*p, 2*p);
        } else if (frame === 2) { // Правая вперед
            g.fillRect(2*p, 12*p, 1*p, 2*p); 
            g.fillRect(5*p, 12*p, 2*p, 2*p);
        } else if (frame === 3) { // Промежуточная
            g.fillRect(2*p, 12*p, 1*p, 2*p); 
            g.fillRect(5*p, 12*p, 1*p, 2*p);
        }

        // 3. Визор (Темно-синий)
        g.fillStyle(0x1a1a3a, 1);
        g.fillRect(2*p, 4*p, 4*p, 4*p);
        // 4. Блик на визоре (Светло-фиолетовый)
        g.fillStyle(0xccccff, 1);
        g.fillRect(2*p, 4*p, 2*p, 2*p);
        // 5. Кнопки на груди
        g.fillStyle(0xff0000, 1); g.fillRect(2*p, 9*p, 1*p, 1*p);
        g.fillStyle(0x00ffff, 1); g.fillRect(3*p, 9*p, 1*p, 1*p);

        g.generateTexture('player_' + frame, 8*p, 16*p);
    }

    // Создаем 4 кадра
    drawAstronaut(0); // Стойка
    drawAstronaut(1); // Левая нога
    drawAstronaut(2); // Правая нога
    drawAstronaut(3); // Переходная (можно использовать как дубль стойки)

    // === 2. ПРИШЕЛЬЦЫ (Разные цвета, 2 кадра для парения) ===
    function drawAlien(color, frame) {
        g.clear();
        g.fillStyle(color, 1);
        let offsetY = frame === 1 ? 1*p : 0; // Смещение для анимации
        g.fillRect(1*p, (2*p)+offsetY, 6*p, 4*p); // Голова
        g.fillRect(2*p, (6*p)+offsetY, 4*p, 2*p); // Тело
        g.fillRect(1*p, (2*p)+offsetY, 1*p, 1*p); // Антенна
        g.fillRect(6*p, (2*p)+offsetY, 1*p, 1*p); // Антенна
        g.fillRect(0*p, (3*p)+offsetY, 1*p, 2*p); // Рука
        g.fillRect(7*p, (3*p)+offsetY, 1*p, 2*p); // Рука
        g.fillRect(2*p, (8*p)+offsetY, 1*p, 1*p); // Нога
        g.fillRect(5*p, (8*p)+offsetY, 1*p, 1*p); // Нога
        // Глаза
        g.fillStyle(0x000000, 1);
        g.fillRect(2*p, (3*p)+offsetY, 1*p, 2*p);
        g.fillRect(5*p, (3*p)+offsetY, 1*p, 2*p);
    }

    drawAlien(0xff8800, 0); g.generateTexture('enemy_zombie_0', 8*p, 12*p);
    drawAlien(0xff8800, 1); g.generateTexture('enemy_zombie_1', 8*p, 12*p);
    drawAlien(0x00ffff, 0); g.generateTexture('enemy_flyer_0', 8*p, 12*p);
    drawAlien(0x00ffff, 1); g.generateTexture('enemy_flyer_1', 8*p, 12*p);
    drawAlien(0x00ff44, 0); g.generateTexture('enemy_tank_0', 8*p, 12*p);
    drawAlien(0x00ff44, 1); g.generateTexture('enemy_tank_1', 8*p, 12*p);

    // === 3. ОСТАЛЬНОЕ ===
    g.clear(); g.fillStyle(0x00ffff, 1); g.fillRect(0, 0, 12, 4); g.generateTexture('bullet_pistol', 12, 4);
    g.clear(); g.fillStyle(0xffaa00, 1); g.fillRect(0, 0, 8, 4); g.generateTexture('bullet_shotgun', 8, 4);
    g.clear(); g.fillStyle(0xff00ff, 1); g.fillRect(0, 0, 18, 3); g.generateTexture('bullet_rifle', 18, 3);
    g.clear(); g.fillStyle(0xff0000, 1); g.fillRect(0, 0, 12, 6); g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 4, 6); g.generateTexture('bullet_rpg', 12, 6);
    g.clear(); g.fillStyle(0x00ffaa, 1); g.fillTriangle(10, 0, 20, 10, 10, 20); g.fillTriangle(10, 0, 0, 10, 10, 20); g.generateTexture('xp_gem', 20, 20);
    g.clear(); g.fillStyle(0xffcc00, 1); g.fillCircle(10, 10, 10); g.lineStyle(2, 0xffffff, 1); g.strokeCircle(10, 10, 6); g.generateTexture('coin', 20, 20);
    g.clear(); g.fillStyle(0xff0000, 1); g.fillCircle(7, 7, 7); g.fillCircle(17, 7, 7); g.fillTriangle(0, 10, 24, 10, 12, 24); g.fillStyle(0xff8888, 1); g.fillCircle(5, 5, 3); g.generateTexture('heart', 24, 24);
    g.clear(); g.fillStyle(0x333333, 1); g.fillCircle(24, 24, 22); g.fillStyle(0x222222, 1); g.fillCircle(15, 15, 6); g.fillCircle(30, 25, 8); g.generateTexture('crater', 48, 48);
    g.clear(); g.fillStyle(0xaaaaaa, 1); g.fillRect(6, 6, 12, 12); g.fillStyle(0x00ffff, 1); g.fillRect(0, 10, 4, 4); g.fillRect(20, 10, 4, 4); g.generateTexture('satellite', 24, 24);
    g.clear(); g.fillStyle(0x222222, 1); g.fillRect(0, 0, 64, 64); g.fillStyle(0x00ff00, 1); g.fillRect(4, 4, 56, 16); g.generateTexture('shop', 64, 64);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillCircle(3, 3, 3); g.generateTexture('particle_white', 6, 6);
    g.clear(); g.fillStyle(0xff0000, 1); g.fillCircle(3, 3, 3); g.generateTexture('particle_red', 6, 6);
    g.clear(); g.fillStyle(0x050510, 1); g.fillRect(0, 0, 800, 600);
    for(let i=0; i<150; i++) { g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.6)); g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(1, 2)); }
    g.generateTexture('bg_tile', 800, 600); g.destroy();

    // === СОЗДАНИЕ АНИМАЦИЙ ===
    // Анимация бега (4 кадра)
    this.anims.create({
        key: 'player_walk',
        frames: [
            { key: 'player_0' }, { key: 'player_1' }, 
            { key: 'player_3' }, { key: 'player_2' }
        ],
        frameRate: 10, // Скорость анимации
        repeat: -1
    });

    // Анимации парения врагов
    this.anims.create({ key: 'zombie_float', frames: [{ key: 'enemy_zombie_0' }, { key: 'enemy_zombie_1' }], frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'flyer_float', frames: [{ key: 'enemy_flyer_0' }, { key: 'enemy_flyer_1' }], frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'tank_float', frames: [{ key: 'enemy_tank_0' }, { key: 'enemy_tank_1' }], frameRate: 3, repeat: -1 });

    this.scene.start('MenuScene');
};

// --- МЕНЮ ---
function MenuScene() { Phaser.Scene.call(this, { key: 'MenuScene' }); }
MenuScene.prototype = Object.create(Phaser.Scene.prototype);
MenuScene.prototype.constructor = MenuScene;
MenuScene.prototype.create = function() {
    this.add.tileSprite(0, 0, 800, 600, 'bg_tile').setOrigin(0); 
    this.add.sprite(400, 200, 'player_0').setScale(4); // Космонавт в меню

    this.add.text(400, 100, 'КОСМИЧЕСКИЙ ВЫЖИВШИЙ', { ...pixelFont, fontSize: '28px', fill: '#00ffff', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);
    this.add.text(400, 350, 'РЕКОРД: ' + Math.floor(bestTime / 1000) + ' СЕК', { ...pixelFont, fill: '#ffff00' }).setOrigin(0.5);

    let playBtn = this.add.rectangle(400, 450, 300, 60, 0x113355).setStrokeStyle(3, 0x00ffff).setInteractive();
    this.add.text(400, 450, 'ИГРАТЬ', { ...pixelFont, fontSize: '20px' }).setOrigin(0.5);
    playBtn.on('pointerover', () => playBtn.setFillStyle(0x225588));
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x113355));
    playBtn.on('pointerdown', () => this.scene.start('GameScene'));
};

// --- ИГРА ---
function GameScene() { Phaser.Scene.call(this, { key: 'GameScene' }); }
GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

let player, bullets, enemies, xpOrbs, coins, craters, shops;
let satellites = [], drones = [];
let playerXp = 0, playerLevel = 1, xpToNextLevel = 30;
let xpBar, levelText, hearts = [], playerHealth = 3, maxHealth = 3;
let playerCoins = 0, coinText, timeText, bossHpBar;
let isInvulnerable = false, gameOver = false, isPaused = false;
let cursors, keys;
let fireRate = 800, bulletDamage = 2, moveSpeed = 250, bulletCount = 1, pickupRadius = 150;
let hasMeteor = false, droneFireRate = 1000, meteorFallSpeed = 5000;
let lastFired = 0, meteorTimer = 0, gameTime = 0, bossSpawnTimer = 0;
let currentWeapon = 'pistol';
let ownedWeapons = { pistol: true, shotgun: false, rifle: false, rpg: false };
let weaponStats = {
    pistol: { fireRate: 800, bulletCount: 1, spread: 0, damage: 2, color: 0x00ffff, speed: 600, maxAmmo: 12, reloadTime: 1000 },
    shotgun: { fireRate: 1200, bulletCount: 4, spread: 0.05, damage: 1.5, color: 0xffaa00, speed: 500, maxAmmo: 6, reloadTime: 1500 }, 
    rifle: { fireRate: 150, bulletCount: 1, spread: 0.05, damage: 1, color: 0xff00ff, speed: 800, maxAmmo: 30, reloadTime: 1500 },
    rpg: { fireRate: 2000, bulletCount: 1, spread: 0, damage: 5, color: 0xff0000, speed: 400, maxAmmo: 3, reloadTime: 2000 }
};
let currentAmmo = 12, isReloading = false, reloadTimer = 0, ammoText, reloadBar;
let shopPhaseTimer = 0, shopOpen = false;
let joystick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, base: null, thumb: null };
let currentBoss = null;

GameScene.prototype.create = function() {
    gameOver = false; isPaused = false; playerHealth = 3; maxHealth = 3; hearts = []; playerXp = 0; playerLevel = 1; xpToNextLevel = 30; gameTime = 0; playerCoins = 0;
    currentWeapon = 'pistol'; ownedWeapons = { pistol: true, shotgun: false, rifle: false, rpg: false };
    fireRate = weaponStats.pistol.fireRate; bulletDamage = weaponStats.pistol.damage; bulletCount = weaponStats.pistol.bulletCount;
    hasMeteor = false; satellites = []; drones = []; droneFireRate = 1000; meteorFallSpeed = 5000;
    bossSpawnTimer = 0; shopPhaseTimer = 0; shopOpen = false; currentBoss = null;
    currentAmmo = weaponStats.pistol.maxAmmo; isReloading = false;

    this.add.tileSprite(-2500, -2500, 5000, 5000, 'bg_tile').setOrigin(0);
    this.physics.world.setBounds(-2500, -2500, 5000, 5000);
    this.cameras.main.setBounds(-2500, -2500, 5000, 5000);

    craters = this.physics.add.staticGroup();
    for(let i = 0; i < 30; i++) {
        let cx = Phaser.Math.Between(-2000, 2000); let cy = Phaser.Math.Between(-2000, 2000);
        if (Phaser.Math.Distance.Between(0, 0, cx, cy) > 300) { 
            let crater = craters.create(cx, cy, 'crater'); 
            crater.setScale(Phaser.Math.FloatBetween(0.8, 1.5)); 
            crater.body.setCircle(24, 0, 0); 
        }
    }

    shops = this.physics.add.staticGroup();
    for(let i=0; i<3; i++) {
        let sx = Phaser.Math.Between(-1500, 1500); let sy = Phaser.Math.Between(-1500, 1500);
        if(Phaser.Math.Distance.Between(0,0,sx,sy) > 500) { let shop = shops.create(sx, sy, 'shop'); shop.setData('isOpen', false); }
    }

    player = this.physics.add.sprite(0, 0, 'player_0');
    player.setCollideWorldBounds(true); 
    player.body.setCircle(12, 4, 4); 
    player.play('player_walk'); // Включаем анимацию сразу
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    bullets = this.physics.add.group(); enemies = this.physics.add.group(); xpOrbs = this.physics.add.group(); coins = this.physics.add.group();

    let ui = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    ui.add(this.add.rectangle(400, 20, 800, 40, 0x000000).setOrigin(0.5).setAlpha(0.8));
    xpBar = this.add.rectangle(0, 20, 0, 20, 0x00ffff).setOrigin(0, 0.5);
    levelText = this.add.text(10, 10, 'LVL: 1', { ...pixelFont, fontSize: '10px' });
    timeText = this.add.text(350, 10, '00:00', { ...pixelFont, fontSize: '12px' });
    coinText = this.add.text(700, 10, '🪙: 0', { ...pixelFont, fill: '#ffff00' });
    ui.add([xpBar, levelText, timeText, coinText]);

    ammoText = this.add.text(10, 95, 'AMMO: 12/12', { ...pixelFont, fontSize: '10px' }).setScrollFactor(0).setDepth(100);
    reloadBar = this.add.rectangle(0, 120, 0, 4, 0xff0000).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

    bossHpBar = this.add.rectangle(400, 80, 0, 15, 0xff0000).setScrollFactor(0).setDepth(100).setVisible(false);

    for (let i = 0; i < maxHealth; i++) {
        hearts.push(this.add.image(30 + i * 30, 60, 'heart').setScrollFactor(0).setDepth(100));
    }

    cursors = this.input.keyboard.createCursorKeys(); keys = this.input.keyboard.addKeys('W,A,S,D');
    this.input.on('pointerdown', (p) => {
        if (p.x < 400 && !isPaused && !gameOver) {
            joystick.active = true; joystick.startX = p.x; joystick.startY = p.y;
            joystick.base = this.add.circle(p.x, p.y, 40, 0xffffff, 0.1).setScrollFactor(0).setDepth(100);
            joystick.thumb = this.add.circle(p.x, p.y, 20, 0xffffff, 0.3).setScrollFactor(0).setDepth(100);
        }
    });
    this.input.on('pointermove', (p) => {
        if (joystick.active) {
            joystick.curX = p.x; joystick.curY = p.y;
            let dist = Phaser.Math.Distance.Between(joystick.startX, joystick.startY, p.x, p.y);
            let angle = Phaser.Math.Angle.Between(joystick.startX, joystick.startY, p.x, p.y);
            if (dist > 40) dist = 40;
            joystick.thumb.x = joystick.startX + Math.cos(angle) * dist; joystick.thumb.y = joystick.startY + Math.sin(angle) * dist;
        }
    });
    this.input.on('pointerup', () => { joystick.active = false; if (joystick.base) joystick.base.destroy(); if (joystick.thumb) joystick.thumb.destroy(); });

    this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, enemies, playerHit, null, this);
    this.physics.add.overlap(player, xpOrbs, collectXp, null, this);
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    this.physics.add.collider(player, craters); this.physics.add.collider(enemies, craters);
    this.physics.add.collider(player, shops, openShop, null, this);

    this.time.addEvent({ delay: 2000, callback: spawnEnemy, callbackScope: this, loop: true });
};

GameScene.prototype.update = function(time, delta) {
    if (gameOver || isPaused) return;
    gameTime += delta; 
    timeText.setText(Math.floor(gameTime / 60000).toString().padStart(2, '0') + ':' + Math.floor((gameTime % 60000) / 1000).toString().padStart(2, '0'));
    
    if (isReloading) {
        reloadTimer += delta;
        reloadBar.width = (reloadTimer / weaponStats[currentWeapon].reloadTime) * 200;
        if (reloadTimer >= weaponStats[currentWeapon].reloadTime) {
            isReloading = false; reloadTimer = 0; reloadBar.width = 0;
            currentAmmo = weaponStats[currentWeapon].maxAmmo;
            ammoText.setText('AMMO: ' + currentAmmo + '/' + weaponStats[currentWeapon].maxAmmo);
        }
    }

    shopPhaseTimer += delta;
    if (shopPhaseTimer > 150000) { shopOpen = true; shopPhaseTimer = -30000; shops.getChildren().forEach(s => { s.setData('isOpen', true); s.setTint(0x00ff00); }); }
    else if (shopOpen && shopPhaseTimer > 0) { shopOpen = false; shops.getChildren().forEach(s => { s.setData('isOpen', false); s.clearTint(); }); }

    bossSpawnTimer += delta; 
    if (bossSpawnTimer > 120000) { bossSpawnTimer = 0; spawnBoss(this); }

    let vx = (cursors.left.isDown || keys.A.isDown) ? -1 : (cursors.right.isDown || keys.D.isDown) ? 1 : 0;
    let vy = (cursors.up.isDown || keys.W.isDown) ? -1 : (cursors.down.isDown || keys.S.isDown) ? 1 : 0;
    if (joystick.active) { let a = Phaser.Math.Angle.Between(joystick.startX, joystick.startY, joystick.curX, joystick.curY); vx = Math.cos(a); vy = Math.sin(a); }
    let len = Math.sqrt(vx*vx + vy*vy); 
    
    if (len > 0) {
        player.setVelocity((vx/len)*moveSpeed, (vy/len)*moveSpeed);
        player.setFlipX(vx < 0); 
        if (!player.anims.isPlaying) player.play('player_walk');
    } else {
        player.setVelocity(0);
        player.anims.stop();
        player.setTexture('player_0'); // Стойка
    }

    if (time > lastFired && !isReloading && currentAmmo > 0) { 
        let success = shoot(this); 
        if (success) {
            lastFired = time + weaponStats[currentWeapon].fireRate; 
            currentAmmo--;
            ammoText.setText('AMMO: ' + currentAmmo + '/' + weaponStats[currentWeapon].maxAmmo);
            if (currentAmmo <= 0) isReloading = true;
        }
    }

    drones.forEach((d, index) => {
        let a = (time / 500) + (index * (Math.PI * 2 / drones.length));
        d.x = player.x + Math.cos(a) * 60; d.y = player.y + Math.sin(a) * 60;
        if (time > d.lastFired) { shootFrom(this, d.x, d.y); d.lastFired = time + droneFireRate; }
    });

    satellites.forEach((sat, i) => {
        let a = (time / 1000) + (i * (Math.PI * 2 / satellites.length));
        sat.x = player.x + Math.cos(a) * 70; sat.y = player.y + Math.sin(a) * 70;
        enemies.getChildren().forEach(enemy => {
            if (Phaser.Math.Distance.Between(sat.x, sat.y, enemy.x, enemy.y) < 30) {
                if (!enemy.lastSatHit || time > enemy.lastSatHit + 1000) { enemy.lastSatHit = time; damageEnemy(this, enemy, 2); }
            }
        });
    });

    if (hasMeteor) { meteorTimer += delta; if (meteorTimer > meteorFallSpeed) { meteorTimer = 0; castMeteor(this); } }

    if (currentBoss && currentBoss.active) {
        bossHpBar.width = (currentBoss.hp / currentBoss.maxHp) * 400; bossHpBar.setVisible(true);
    } else { bossHpBar.setVisible(false); }

    enemies.getChildren().forEach(e => { 
        if (e.active) {
            this.physics.moveToObject(e, player, e.speed); 
            e.setFlipX(e.x > player.x); 
            if (!e.anims.isPlaying && e.anims.exists(e.animKey)) e.play(e.animKey);
        } 
    });
    xpOrbs.getChildren().forEach(xp => { 
        let dist = Phaser.Math.Distance.Between(player.x, player.y, xp.x, xp.y);
        if (dist < pickupRadius) this.physics.moveToObject(xp, player, 400); 
    });
    coins.getChildren().forEach(c => { 
        let dist = Phaser.Math.Distance.Between(player.x, player.y, c.x, c.y);
        if (dist < pickupRadius) this.physics.moveToObject(c, player, 400); 
    });
};

function shoot(scene) {
    let target = getNearestEnemy(scene, player.x, player.y); 
    if (!target) return false;
    let distToEnemy = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
    if (distToEnemy > 500) return false; 

    let angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    let s = weaponStats[currentWeapon]; let count = s.bulletCount + (bulletCount - 1);
    let spread = s.spread;
    if (bulletCount > 1 && s.spread === 0) spread = 0.15; 
    
    for (let i = 0; i < count; i++) {
        let off = (i - (count - 1) / 2) * spread; 
        let b = bullets.create(player.x, player.y, s.bulletCount > 1 ? 'bullet_shotgun' : (currentWeapon === 'rpg' ? 'bullet_rpg' : (currentWeapon === 'rifle' ? 'bullet_rifle' : 'bullet_pistol')));
        b.setTint(s.color); b.rotation = angle + off; b.damage = s.damage * bulletDamage;
        b.isRpg = (currentWeapon === 'rpg');
        scene.physics.velocityFromRotation(angle + off, s.speed, b.body.velocity);
    }
    scene.cameras.main.shake(50, 0.002);
    return true;
}
function shootFrom(scene, x, y) {
    let target = getNearestEnemy(scene, x, y); if (!target) return;
    let angle = Phaser.Math.Angle.Between(x, y, target.x, target.y);
    let b = bullets.create(x, y, 'bullet_pistol'); b.rotation = angle; b.damage = bulletDamage * 0.5;
    scene.physics.velocityFromRotation(angle, 600, b.body.velocity);
}
function getNearestEnemy(scene, x, y) {
    let nearest = null; let minDist = Infinity;
    enemies.getChildren().forEach(e => { let d = Phaser.Math.Distance.Between(x, y, e.x, e.y); if (d < minDist) { minDist = d; nearest = e; } });
    return nearest;
}
function spawnEnemy() {
    if (gameOver || isPaused || shopOpen) return;
    let count = 1 + Math.floor(gameTime / 60000); 
    for(let i=0; i<count; i++) {
        let rand = Math.random();
        let type = 'enemy_zombie'; let speed = 50; let hp = 1; let anim = 'zombie_float';
        if (rand > 0.8 && gameTime > 15000) { type = 'enemy_flyer'; speed = 100; hp = 1; anim = 'flyer_float'; }
        else if (rand > 0.6 && gameTime > 40000) { type = 'enemy_tank'; speed = 40; hp = 3; anim = 'tank_float'; }
        
        let angle = Math.random() * Math.PI * 2;
        let dist = 600; 
        let e = enemies.create(player.x + Math.cos(angle)*dist, player.y + Math.sin(angle)*dist, type + '_0');
        e.speed = speed; e.hp = hp * (1 + gameTime/120000); e.maxHp = e.hp; e.animKey = anim;
        e.play(anim);
    }
}
function spawnBoss(scene) {
    let angle = Math.random() * Math.PI * 2;
    let b = enemies.create(player.x + Math.cos(angle)*600, player.y + Math.sin(angle)*600, 'enemy_boss');
    b.speed = 40; b.hp = 30 + (gameTime/1000)*2; b.maxHp = b.hp; b.isBoss = true; 
    currentBoss = b;
}
function hitEnemy(b, e) {
    b.destroy();
    if (b.isRpg) {
        let exp = this.add.circle(e.x, e.y, 80, 0xff5500, 0.5); this.time.delayedCall(100, () => exp.destroy());
        enemies.getChildren().forEach(en => { if (Phaser.Math.Distance.Between(e.x, e.y, en.x, en.y) < 80) { damageEnemy(this, en, b.damage * 2); } });
    } else {
        damageEnemy(this, e, b.damage);
    }
}
function damageEnemy(scene, e, damage) {
    e.hp -= damage;
    e.setTint(0xffffff); scene.time.delayedCall(100, () => { if(e.active) e.clearTint(); });
    if (e.hp <= 0) killEnemy(scene, e);
}
function killEnemy(scene, e) {
    let emitter = scene.add.particles(e.x, e.y, 'particle_red', { speed: { min: 50, max: 200 }, scale: { start: 1, end: 0 }, lifespan: 300, quantity: 10 });
    scene.time.delayedCall(300, () => emitter.destroy());
    if (e.isBoss) { scene.cameras.main.shake(500, 0.02); currentBoss = null; }

    e.destroy(); 
    let xp = xpOrbs.create(e.x, e.y, 'xp_gem'); xp.setScale(0.5);
    let c = coins.create(e.x, e.y, 'coin'); c.setScale(0.5);

    if (e.isBoss) { 
        for(let i=0; i<15; i++){ let x = xpOrbs.create(e.x, e.y, 'xp_gem'); if(i<5) coins.create(e.x, e.y, 'coin'); } 
    }
}
function collectXp(p, x) { x.destroy(); playerXp += 5; xpBar.width = (playerXp / xpToNextLevel) * 800; if (playerXp >= xpToNextLevel) levelUp.call(this); }
function collectCoin(p, c) { c.destroy(); playerCoins++; coinText.setText('🪙: ' + playerCoins); }
function playerHit(p, e) {
    if (gameOver || isInvulnerable) return;
    playerHealth--; hearts[playerHealth].setTint(0x000000); isInvulnerable = true;
    this.cameras.main.shake(200, 0.01);
    let a = Phaser.Math.Angle.Between(e.x, e.y, p.x, p.y); p.setVelocity(Math.cos(a) * 400, Math.sin(a) * 400);
    this.tweens.add({ targets: p, alpha: 0.2, duration: 100, yoyo: true, repeat: 5 });
    if (playerHealth <= 0) { 
        gameOver = true; this.physics.pause(); p.setTint(0xff0000); if (gameTime > bestTime) bestTime = gameTime; 
        this.add.text(400, 250, 'ИГРА ОКОНЧЕНА', { ...pixelFont, fontSize: '30px', fill: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        let restartBtn = this.add.text(400, 350, 'ЗАНОВО', { ...pixelFont, fontSize: '16px', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(200);
        restartBtn.on('pointerdown', () => this.scene.start('MenuScene')); 
    } else { this.time.delayedCall(1500, () => { isInvulnerable = false; p.alpha = 1; }); }
}
function openShop(p, s) {
    if (!s.getData('isOpen') || isPaused) return;
    isPaused = true; this.physics.pause();
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9).setScrollFactor(0).setDepth(200);
    let title = this.add.text(400, 50, 'МАГАЗИН', { ...pixelFont, fontSize: '24px', fill: '#00ffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    let coinDisplay = this.add.text(400, 100, 'МОНЕТ: ' + playerCoins, { ...pixelFont, fill: '#ffff00' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    let elements = [overlay, title, coinDisplay];
    let weapons = [
        { id: 'pistol', name: 'ПИСТОЛЕТ', price: 0, desc: 'Урон 2' },
        { id: 'shotgun', name: 'ДРОБОВИК', price: 25, desc: '4 пули' },
        { id: 'rifle', name: 'АВТОМАТ', price: 50, desc: 'Скорострел' },
        { id: 'rpg', name: 'РПГ', price: 100, desc: 'Взрыв' }
    ];
    weapons.forEach((w, i) => {
        let y = 180 + i * 90;
        let bg = this.add.rectangle(400, y, 600, 70, 0x113355).setStrokeStyle(2, 0x00ffff).setScrollFactor(0).setDepth(200);
        let name = this.add.text(150, y, w.name, { ...pixelFont }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(200);
        let desc = this.add.text(150, y + 20, w.desc, { ...pixelFont, fontSize: '10px', fill: '#aaa' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(200);
        let price = this.add.text(650, y, ownedWeapons[w.id] ? 'КУПЛЕНО' : ('🪙 ' + w.price), { ...pixelFont, fill: ownedWeapons[w.id] ? '#00ff00' : '#ffff00' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(200);
        let zone = this.add.zone(400, y, 600, 70).setInteractive().setScrollFactor(0).setDepth(200);
        zone.on('pointerdown', () => {
            if (ownedWeapons[w.id]) { currentWeapon = w.id; currentAmmo = weaponStats[currentWeapon].maxAmmo; ammoText.setText('AMMO: ' + currentAmmo + '/' + weaponStats[currentWeapon].maxAmmo); elements.forEach(e=>e.destroy()); bg.destroy(); name.destroy(); desc.destroy(); price.destroy(); zone.destroy(); this.physics.resume(); isPaused = false; return; }
            if (playerCoins >= w.price) {
                playerCoins -= w.price; ownedWeapons[w.id] = true; currentWeapon = w.id;
                currentAmmo = weaponStats[currentWeapon].maxAmmo; ammoText.setText('AMMO: ' + currentAmmo + '/' + weaponStats[currentWeapon].maxAmmo);
                price.setText('КУПЛЕНО').setStyle({ fill: '#00ff00' }); coinDisplay.setText('МОНЕТ: ' + playerCoins);
            }
        });
        elements.push(bg, name, desc, price, zone);
    });
    let closeBtn = this.add.text(400, 550, 'ЗАКРЫТЬ', { ...pixelFont, backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(200);
    closeBtn.on('pointerdown', () => { elements.forEach(e => e.destroy()); closeBtn.destroy(); isPaused = false; this.physics.resume(); });
    elements.push(closeBtn);
}
function levelUp() {
    isPaused = true; this.physics.pause(); playerXp = 0; playerLevel++; xpToNextLevel += 20; xpBar.width = 0; levelText.setText('LVL: ' + playerLevel);
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setScrollFactor(0).setDepth(200);
    let title = this.add.text(400, 80, 'ВЫБЕРИ УЛУЧШЕНИЕ', { ...pixelFont, fontSize: '20px', fill: '#00ffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    
    let pool = [
        { title: 'УРОН', desc: '+1 к урону', color: 0x113355, action: () => bulletDamage += 1 },
        { title: 'СКОРОСТЬ АТАКИ', desc: 'Быстрее стрельба', color: 0x113355, action: () => fireRate *= 0.85 },
        { title: 'СКОРОСТЬ', desc: '+20 к скорости', color: 0x333333, action: () => moveSpeed += 20 },
        { title: 'ЛЕЧЕНИЕ', desc: 'Восстановить 1 HP', color: 0x333333, action: () => { if (playerHealth < maxHealth) { playerHealth++; hearts[playerHealth-1].clearTint(); } } },
        { title: 'ДОП. ПУЛЯ', desc: '+1 снаряд', color: 0x113355, action: () => bulletCount = Math.min(bulletCount + 1, 7) },
        { title: 'МАКС. HP', desc: '+1 сердечко', color: 0x551155, action: () => { maxHealth++; playerHealth = maxHealth; let newHeart = this.add.image(30 + (maxHealth - 1) * 30, 60, 'heart').setScrollFactor(0).setDepth(100); hearts.push(newHeart); hearts.forEach(h => h.clearTint()); } },
        { title: 'МЕТЕОРИТ', desc: 'Падает чаще', color: 0x551155, action: () => { hasMeteor = true; meteorFallSpeed = Math.max(1000, meteorFallSpeed - 500); } },
        { title: 'ДРОН', desc: '+1 дрон', color: 0x551155, action: () => { if (drones.length < 4) { let d = this.add.circle(0, 0, 8, 0x00ffff).setDepth(5); d.lastFired = 0; drones.push(d); } } },
        { title: 'СПУТНИК', desc: 'Вращается и бьет', color: 0x551155, action: () => { if (satellites.length < 3) { let s = this.add.image(player.x, player.y, 'satellite').setDepth(5); satellites.push(s); } } }
    ];

    Phaser.Utils.Array.Shuffle(pool); let choices = pool.slice(0, 3); let elements = [overlay, title];
    choices.forEach((c, i) => {
        let y = 200 + i * 130;
        let bg = this.add.rectangle(400, y, 500, 100, c.color).setStrokeStyle(2, 0xffffff).setScrollFactor(0).setDepth(200);
        let t1 = this.add.text(400, y - 20, c.title, { ...pixelFont }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        let t2 = this.add.text(400, y + 20, c.desc, { ...pixelFont, fontSize: '10px', fill: '#aaa' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        let zone = this.add.zone(400, y, 500, 100).setInteractive().setScrollFactor(0).setDepth(200);
        zone.on('pointerdown', () => { c.action.call(this); elements.forEach(e => e.destroy()); bg.destroy(); t1.destroy(); t2.destroy(); zone.destroy(); isPaused = false; this.physics.resume(); });
        elements.push(bg, t1, t2, zone);
    });
}
function castMeteor(scene) {
    let targets = enemies.getChildren(); if (targets.length === 0) return;
    Phaser.Utils.Array.Shuffle(targets).slice(0, 3).forEach(e => {
        let m = scene.add.image(e.x, e.y - 300, 'particle_red').setScale(3);
        scene.tweens.add({ targets: m, y: e.y, duration: 400, onComplete: () => {
            m.destroy(); let exp = scene.add.circle(e.x, e.y, 60, 0xff5500, 0.8); scene.time.delayedCall(200, () => exp.destroy());
            scene.cameras.main.shake(100, 0.005);
            enemies.getChildren().forEach(en => { if (Phaser.Math.Distance.Between(e.x, e.y, en.x, en.y) < 60) { damageEnemy(scene, en, 3); } });
        }});
    });
}
