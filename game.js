const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#050510',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, MenuScene, WardrobeScene, GameScene]
};

const game = new Phaser.Game(config);
const pixelFont = { fontFamily: '"Press Start 2P"', fontSize: '16px', fill: '#ffffff' };
let bestTime = 0;
let selectedSkin = 'player_classic';

// --- СЦЕНА ЗАГРУЗКИ ---
function BootScene() { Phaser.Scene.call(this, { key: 'BootScene' }); }
BootScene.prototype = Object.create(Phaser.Scene.prototype);
BootScene.prototype.constructor = BootScene;
BootScene.prototype.create = function() {
    let g = this.make.graphics({x: 0, y: 0, add: false});
    let p = 4;

    // Космонавты (Ранец слева)
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(2*p, 2*p, 4*p, 2*p); g.fillRect(1*p, 4*p, 6*p, 4*p); g.fillRect(2*p, 8*p, 4*p, 4*p); g.fillRect(1*p, 8*p, 1*p, 4*p); g.fillRect(6*p, 8*p, 1*p, 4*p); g.fillRect(2*p, 12*p, 1*p, 2*p); g.fillRect(5*p, 12*p, 1*p, 2*p); g.fillStyle(0x1a1a3a, 1); g.fillRect(2*p, 4*p, 4*p, 4*p); g.fillStyle(0xccccff, 1); g.fillRect(2*p, 4*p, 2*p, 2*p); g.fillStyle(0xff0000, 1); g.fillRect(2*p, 9*p, 1*p, 1*p); g.fillStyle(0x00ffff, 1); g.fillRect(3*p, 9*p, 1*p, 1*p); g.fillStyle(0x555555, 1); g.fillRect(0*p, 6*p, 1*p, 6*p); g.generateTexture('player_classic', 8*p, 16*p);

    g.clear(); g.fillStyle(0xff5500, 1); g.fillRect(1*p, 1*p, 6*p, 2*p); g.fillRect(0*p, 3*p, 8*p, 5*p); g.fillRect(1*p, 8*p, 6*p, 4*p); g.fillRect(0*p, 8*p, 1*p, 4*p); g.fillRect(7*p, 8*p, 1*p, 4*p); g.fillRect(1*p, 12*p, 2*p, 3*p); g.fillRect(5*p, 12*p, 2*p, 3*p); g.fillStyle(0x222222, 1); g.fillRect(2*p, 3*p, 4*p, 3*p); g.fillStyle(0xffff00, 1); g.fillRect(2*p, 9*p, 1*p, 1*p); g.fillRect(4*p, 9*p, 1*p, 1*p); g.fillStyle(0x333333, 1); g.fillRect(0*p, 5*p, 2*p, 6*p); g.generateTexture('player_heavy', 8*p, 16*p);

    g.clear(); g.fillStyle(0x333333, 1); g.fillRect(3*p, 2*p, 3*p, 2*p); g.fillRect(2*p, 4*p, 5*p, 5*p); g.fillRect(3*p, 9*p, 3*p, 3*p); g.fillRect(1*p, 9*p, 1*p, 3*p); g.fillRect(6*p, 9*p, 1*p, 3*p); g.fillRect(3*p, 12*p, 1*p, 2*p); g.fillRect(5*p, 12*p, 1*p, 2*p); g.fillStyle(0x00ff00, 1); g.fillRect(3*p, 5*p, 3*p, 2*p); g.fillStyle(0x555555, 1); g.fillRect(0*p, 6*p, 1*p, 5*p); g.generateTexture('player_scout', 8*p, 16*p);

    g.clear(); g.fillStyle(0xff8800, 1); g.fillCircle(3, 3, 3); g.generateTexture('flame', 6, 6);

    // Враги
    g.clear(); g.fillStyle(0x00ff00, 1); g.fillRect(2*p, 1*p, 4*p, 2*p); g.fillRect(1*p, 3*p, 6*p, 3*p); g.fillRect(0*p, 4*p, 1*p, 1*p); g.fillRect(7*p, 4*p, 1*p, 1*p); g.fillStyle(0x000000, 1); g.fillRect(3*p, 2*p, 1*p, 1*p); g.fillRect(5*p, 2*p, 1*p, 1*p); g.generateTexture('enemy_small', 8*p, 6*p);
    g.clear(); g.fillStyle(0xaa00ff, 1); g.fillRect(1*p, 0*p, 6*p, 2*p); g.fillRect(2*p, 2*p, 4*p, 4*p); g.fillRect(1*p, 3*p, 1*p, 3*p); g.fillRect(6*p, 3*p, 1*p, 3*p); g.fillStyle(0xffffff, 1); g.fillRect(3*p, 2*p, 1*p, 1*p); g.fillRect(5*p, 2*p, 1*p, 1*p); g.generateTexture('enemy_medium', 8*p, 6*p);
    g.clear(); g.fillStyle(0xff0044, 1); g.fillRect(1*p, 1*p, 6*p, 5*p); g.fillRect(0*p, 2*p, 1*p, 3*p); g.fillRect(7*p, 2*p, 1*p, 3*p); g.fillStyle(0x000000, 1); g.fillRect(2*p, 2*p, 4*p, 2*p); g.generateTexture('enemy_tank', 8*p, 7*p);
    g.clear(); g.fillStyle(0x00ffff, 1); g.fillRect(3*p, 0*p, 2*p, 2*p); g.fillRect(1*p, 2*p, 6*p, 2*p); g.fillRect(0*p, 3*p, 1*p, 1*p); g.fillRect(7*p, 3*p, 1*p, 1*p); g.fillStyle(0x000000, 1); g.fillRect(3*p, 1*p, 1*p, 1*p); g.generateTexture('enemy_flyer', 8*p, 4*p);

    // Босс
    g.clear(); g.fillStyle(0x8800ff, 1); g.fillCircle(64, 64, 60); g.fillStyle(0xff0000, 1); g.fillCircle(40, 40, 15); g.fillCircle(88, 40, 15); g.fillCircle(64, 80, 20); g.generateTexture('enemy_boss', 128, 128);

    // Магазин
    g.clear(); g.fillStyle(0xeeeeee, 1); g.fillRect(10, 20, 44, 40); g.fillStyle(0xdddddd, 1); g.fillTriangle(10, 20, 32, 0, 54, 20); g.fillStyle(0xff0000, 1); g.fillTriangle(10, 60, 10, 40, 0, 60); g.fillTriangle(54, 60, 54, 40, 64, 60); g.fillStyle(0x333333, 1); g.fillRect(24, 40, 16, 20); g.fillStyle(0xff0000, 1); g.fillRect(14, 24, 36, 10); g.generateTexture('shop_closed', 64, 64);
    g.clear(); g.fillStyle(0xeeeeee, 1); g.fillRect(10, 20, 44, 40); g.fillStyle(0xdddddd, 1); g.fillTriangle(10, 20, 32, 0, 54, 20); g.fillStyle(0xff0000, 1); g.fillTriangle(10, 60, 10, 40, 0, 60); g.fillTriangle(54, 60, 54, 40, 64, 60); g.fillStyle(0x333333, 1); g.fillRect(24, 40, 16, 20); g.fillStyle(0x00ff00, 1); g.fillRect(14, 24, 36, 10); g.generateTexture('shop_open', 64, 64);

    // Препятствия
    g.clear(); g.fillStyle(0x333333, 1); g.fillCircle(24, 24, 22); g.fillStyle(0x222222, 1); g.fillCircle(15, 15, 6); g.fillCircle(30, 25, 8); g.generateTexture('obstacle_rock', 48, 48);

    // Остальное
    g.clear(); g.fillStyle(0x00ffff, 1); g.fillRect(0, 0, 12, 4); g.generateTexture('bullet_pistol', 12, 4);
    g.clear(); g.fillStyle(0xffaa00, 1); g.fillRect(0, 0, 8, 4); g.generateTexture('bullet_shotgun', 8, 4);
    g.clear(); g.fillStyle(0xff00ff, 1); g.fillRect(0, 0, 18, 3); g.generateTexture('bullet_rifle', 18, 3);
    
    // ОГНЕМЕТ: Частица огня (вытянутая)
    g.clear(); g.fillStyle(0xff5500, 1); g.fillRect(0, 0, 8, 6); 
    g.fillStyle(0xffff00, 1); g.fillRect(0, 1, 4, 4); // Яркое ядро
    g.generateTexture('bullet_flame', 8, 6);

    g.clear(); g.fillStyle(0x00ffaa, 1); g.fillTriangle(10, 0, 20, 10, 10, 20); g.fillTriangle(10, 0, 0, 10, 10, 20); g.generateTexture('xp_gem', 20, 20);
    g.clear(); g.fillStyle(0xffcc00, 1); g.fillCircle(10, 10, 10); g.lineStyle(2, 0xffffff, 1); g.strokeCircle(10, 10, 6); g.generateTexture('coin', 20, 20);
    g.clear(); g.fillStyle(0xff0000, 1); g.fillCircle(7, 7, 7); g.fillCircle(17, 7, 7); g.fillTriangle(0, 10, 24, 10, 12, 24); g.fillStyle(0xff8888, 1); g.fillCircle(5, 5, 3); g.generateTexture('heart', 24, 24);
    g.clear(); g.fillStyle(0xaaaaaa, 1); g.fillRect(6, 6, 12, 12); g.fillStyle(0x00ffff, 1); g.fillRect(0, 10, 4, 4); g.fillRect(20, 10, 4, 4); g.generateTexture('satellite', 24, 24);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillCircle(3, 3, 3); g.generateTexture('particle_white', 6, 6);
    g.clear(); g.fillStyle(0xff0000, 1); g.fillCircle(3, 3, 3); g.generateTexture('particle_red', 6, 6);
    
    // Фоны
    g.clear(); g.fillStyle(0x050510, 1); g.fillRect(0, 0, 800, 600);
    for(let i=0; i<300; i++) { g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.9)); g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(1, 3)); }
    for(let i=0; i<5; i++) { g.fillStyle(0x330066, 0.3); g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(100, 200)); }
    g.generateTexture('menu_bg', 800, 600);
    g.clear(); g.fillStyle(0x050510, 1); g.fillRect(0, 0, 800, 600);
    for(let i=0; i<150; i++) { g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.6)); g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(1, 2)); }
    g.generateTexture('bg_tile', 800, 600); g.destroy();

    this.scene.start('MenuScene');
};

// --- МЕНЮ ---
function MenuScene() { Phaser.Scene.call(this, { key: 'MenuScene' }); }
MenuScene.prototype = Object.create(Phaser.Scene.prototype);
MenuScene.prototype.constructor = MenuScene;
MenuScene.prototype.create = function() {
    this.add.image(400, 300, 'menu_bg');
    this.add.text(400, 100, 'КОСМИЧЕСКИЙ ВЫЖИВШИЙ', { ...pixelFont, fontSize: '32px', fill: '#00ffff', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5);
    this.add.text(400, 180, 'РЕКОРД: ' + Math.floor(bestTime / 1000) + ' СЕК', { ...pixelFont, fontSize: '18px', fill: '#ffff00' }).setOrigin(0.5);

    let playBtn = this.add.rectangle(400, 350, 300, 60, 0x113355).setStrokeStyle(3, 0x00ffff).setInteractive();
    this.add.text(400, 350, 'ИГРАТЬ', { ...pixelFont, fontSize: '24px' }).setOrigin(0.5);
    playBtn.on('pointerover', () => playBtn.setFillStyle(0x225588));
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x113355));
    playBtn.on('pointerdown', () => this.scene.start('GameScene'));

    let wardrobeBtn = this.add.rectangle(400, 440, 300, 60, 0x331155).setStrokeStyle(3, 0xaa00ff).setInteractive();
    this.add.text(400, 440, 'ГАРДЕРОБ', { ...pixelFont, fontSize: '20px' }).setOrigin(0.5);
    wardrobeBtn.on('pointerover', () => wardrobeBtn.setFillStyle(0x552288));
    wardrobeBtn.on('pointerout', () => wardrobeBtn.setFillStyle(0x331155));
    wardrobeBtn.on('pointerdown', () => this.scene.start('WardrobeScene'));
};

// --- ГАРДЕРОБ ---
function WardrobeScene() { Phaser.Scene.call(this, { key: 'WardrobeScene' }); }
WardrobeScene.prototype = Object.create(Phaser.Scene.prototype);
WardrobeScene.prototype.constructor = WardrobeScene;
WardrobeScene.prototype.create = function() {
    this.add.image(400, 300, 'menu_bg');
    this.add.text(400, 80, 'ГАРДЕРОБ', { ...pixelFont, fontSize: '32px', fill: '#aa00ff' }).setOrigin(0.5);

    let skins = [
        { id: 'player_classic', name: 'КЛАССИКА' },
        { id: 'player_heavy', name: 'ТЯЖЕЛЫЙ' },
        { id: 'player_scout', name: 'РАЗВЕДЧИК' }
    ];

    skins.forEach((skin, index) => {
        let x = 200 + index * 200;
        let y = 300;
        let frame = this.add.rectangle(x, y, 150, 200, 0x000000).setStrokeStyle(3, skin.id === selectedSkin ? 0x00ff00 : 0x333333).setInteractive();
        this.add.sprite(x, y - 30, skin.id).setScale(3);
        this.add.text(x, y + 60, skin.name, { ...pixelFont, fontSize: '10px', fill: '#fff' }).setOrigin(0.5);
        frame.on('pointerover', () => frame.setFillStyle(0x222222));
        frame.on('pointerout', () => frame.setFillStyle(0x000000));
        frame.on('pointerdown', () => { selectedSkin = skin.id; this.scene.restart(); });
    });

    let backBtn = this.add.rectangle(400, 520, 200, 50, 0x550000).setStrokeStyle(2, 0xff0000).setInteractive();
    this.add.text(400, 520, 'НАЗАД', { ...pixelFont, fontSize: '16px' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
};

// --- ИГРА ---
function GameScene() { Phaser.Scene.call(this, { key: 'GameScene' }); }
GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

let player, bullets, enemies, xpOrbs, coins, obstacles, shops;
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
let ownedWeapons = { pistol: true, shotgun: false, rifle: false, flamethrower: false };
let weaponStats = {
    pistol: { fireRate: 800, bulletCount: 1, spread: 0, damage: 2, color: 0x00ffff, speed: 600, maxAmmo: 12, reloadTime: 1000 },
    shotgun: { fireRate: 1200, bulletCount: 4, spread: 0.05, damage: 1.5, color: 0xffaa00, speed: 500, maxAmmo: 6, reloadTime: 1500 }, 
    rifle: { fireRate: 150, bulletCount: 1, spread: 0.05, damage: 1, color: 0xff00ff, speed: 800, maxAmmo: 30, reloadTime: 1500 },
    flamethrower: { fireRate: 300, bulletCount: 1, spread: 0, damage: 0.5, color: 0xff5500, speed: 250, maxAmmo: 50, reloadTime: 2000 } // Огнемет: быстрый темп, малый урон, близко, много патронов
};
let currentAmmo = 12, isReloading = false, reloadTimer = 0, ammoText, reloadBar;
let shopPhaseTimer = 0, shopOpen = false;
let joystick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, base: null, thumb: null };
let currentBoss = null;

let vampirismChance = 0;
let isExplosive = false;
let attackRange = 500;

GameScene.prototype.create = function() {
    gameOver = false; isPaused = false; playerHealth = 3; maxHealth = 3; hearts = []; playerXp = 0; playerLevel = 1; xpToNextLevel = 30; gameTime = 0; playerCoins = 0;
    currentWeapon = 'pistol'; ownedWeapons = { pistol: true, shotgun: false, rifle: false, flamethrower: false };
    fireRate = weaponStats.pistol.fireRate; bulletDamage = weaponStats.pistol.damage; bulletCount = weaponStats.pistol.bulletCount;
    hasMeteor = false; satellites = []; drones = []; droneFireRate = 1000; meteorFallSpeed = 5000;
    bossSpawnTimer = 0; shopPhaseTimer = 0; shopOpen = false; currentBoss = null;
    currentAmmo = weaponStats.pistol.maxAmmo; isReloading = false;
    vampirismChance = 0; isExplosive = false; attackRange = 500;

    this.add.tileSprite(-2500, -2500, 5000, 5000, 'bg_tile').setOrigin(0);
    this.physics.world.setBounds(-2500, -2500, 5000, 5000);
    this.cameras.main.setBounds(-2500, -2500, 5000, 5000);

    obstacles = this.physics.add.staticGroup();
    for(let i = 0; i < 20; i++) {
        let cx = Phaser.Math.Between(-2000, 2000); let cy = Phaser.Math.Between(-2000, 2000);
        if (Phaser.Math.Distance.Between(0, 0, cx, cy) > 300) { 
            let obs = obstacles.create(cx, cy, 'obstacle_rock'); 
            obs.setScale(Phaser.Math.FloatBetween(0.8, 1.5)); 
            obs.body.setCircle(22, 2, 2);
        }
    }

    shops = this.physics.add.staticGroup();
    for(let i=0; i<3; i++) {
        let sx = Phaser.Math.Between(-1500, 1500); let sy = Phaser.Math.Between(-1500, 1500);
        if(Phaser.Math.Distance.Between(0,0,sx,sy) > 500) { 
            let shop = shops.create(sx, sy, 'shop_closed'); 
            shop.setData('isOpen', false); 
        }
    }

    player = this.physics.add.sprite(0, 0, selectedSkin);
    player.setCollideWorldBounds(true); 
    player.body.setCircle(12, 4, 4); 
    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    this.cameras.main.setZoom(0.7);

    player.flameEmitter = this.add.particles(0, 0, 'flame', {
        speed: { min: 20, max: 50 }, scale: { start: 0.8, end: 0 }, lifespan: 200, frequency: 50, quantity: 2
    });
    player.flameEmitter.startFollow(player, 0, 10); 
    player.flameEmitter.stop();

    bullets = this.physics.add.group(); enemies = this.physics.add.group(); xpOrbs = this.physics.add.group(); coins = this.physics.add.group();

    // Интерфейс
    let ui = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    ui.add(this.add.rectangle(400, 20, 800, 40, 0x000000).setOrigin(0.5).setAlpha(0.8));
    xpBar = this.add.rectangle(0, 20, 0, 20, 0x00ffff).setOrigin(0, 0.5);
    levelText = this.add.text(20, 10, 'LVL: 1', { ...pixelFont, fontSize: '18px', fill: '#00ffff' });
    timeText = this.add.text(400, 10, '00:00', { ...pixelFont, fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5, 0);
    coinText = this.add.text(780, 10, '🪙: 0', { ...pixelFont, fontSize: '18px', fill: '#ffff00' }).setOrigin(1, 0);
    ui.add([xpBar, levelText, timeText, coinText]);

    ammoText = this.add.text(20, 80, 'AMMO: 12/12', { ...pixelFont, fontSize: '14px', fill: '#fff' }).setScrollFactor(0).setDepth(100);
    reloadBar = this.add.rectangle(20, 105, 0, 6, 0xff0000).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    bossHpBar = this.add.rectangle(400, 80, 0, 15, 0xff0000).setScrollFactor(0).setDepth(100).setVisible(false);

    for (let i = 0; i < maxHealth; i++) {
        hearts.push(this.add.image(40 + i * 30, 140, 'heart').setScale(1.2).setScrollFactor(0).setDepth(100));
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
    this.physics.add.collider(player, obstacles); this.physics.add.collider(enemies, obstacles);
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
    if (shopPhaseTimer > 150000) { shopOpen = true; shopPhaseTimer = -30000; shops.getChildren().forEach(s => { s.setTexture('shop_open'); s.setData('isOpen', true); s.setTint(0x00ff00); }); }
    else if (shopOpen && shopPhaseTimer > 0) { shopOpen = false; shops.getChildren().forEach(s => { s.setTexture('shop_closed'); s.setData('isOpen', false); s.clearTint(); }); }

    bossSpawnTimer += delta; 
    if (bossSpawnTimer > 120000) { bossSpawnTimer = 0; spawnBoss(this); }

    let vx = (cursors.left.isDown || keys.A.isDown) ? -1 : (cursors.right.isDown || keys.D.isDown) ? 1 : 0;
    let vy = (cursors.up.isDown || keys.W.isDown) ? -1 : (cursors.down.isDown || keys.S.isDown) ? 1 : 0;
    if (joystick.active) { let a = Phaser.Math.Angle.Between(joystick.startX, joystick.startY, joystick.curX, joystick.curY); vx = Math.cos(a); vy = Math.sin(a); }
    let len = Math.sqrt(vx*vx + vy*vy); 
    
    if (len > 0) {
        player.setVelocity((vx/len)*moveSpeed, (vy/len)*moveSpeed);
        player.setFlipX(vx < 0); 
        if (!player.flameEmitter.emitting) { player.flameEmitter.start(); player.flameEmitter.angle = { min: 70, max: 110 }; }
    } else {
        player.setVelocity(0);
        player.flameEmitter.stop(); 
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

    enemies.getChildren().forEach(e => { if (e.active) { this.physics.moveToObject(e, player, e.speed); e.setFlipX(e.x > player.x); } });
    xpOrbs.getChildren().forEach(xp => { if (Phaser.Math.Distance.Between(player.x, player.y, xp.x, xp.y) < pickupRadius) this.physics.moveToObject(xp, player, 400); });
    coins.getChildren().forEach(c => { if (Phaser.Math.Distance.Between(player.x, player.y, c.x, c.y) < pickupRadius) this.physics.moveToObject(c, player, 400); });
};

function shoot(scene) {
    let target = getNearestEnemy(scene, player.x, player.y); 
    if (!target) return false;
    let distToEnemy = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
    if (distToEnemy > attackRange) return false; 

    let angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    let s = weaponStats[currentWeapon]; let count = s.bulletCount + (bulletCount - 1);
    let spread = s.spread;
    if (bulletCount > 1 && s.spread === 0) spread = 0.15; 
    
    // Если огнемет - стреляем веером коротких частиц
    if (currentWeapon === 'flamethrower') {
        for (let i = 0; i < 4; i++) {
            let off = (Math.random() - 0.5) * 0.4; // Случайный разброс струи
            let b = bullets.create(player.x, player.y, 'bullet_flame');
            b.rotation = angle + off;
            b.damage = s.damage * bulletDamage;
            b.isFlame = true;
            b.setScale(1 + Math.random()); // Разные размеры частиц
            scene.physics.velocityFromRotation(angle + off, s.speed, b.body.velocity);
            
            // Огонь живет недолго
            scene.time.delayedCall(400, () => { if(b.active) b.destroy(); });
        }
        scene.cameras.main.shake(30, 0.001);
        return true;
    }

    // Обычные пули
    for (let i = 0; i < count; i++) {
        let off = (i - (count - 1) / 2) * spread; 
        let b = bullets.create(player.x, player.y, s.bulletCount > 1 ? 'bullet_shotgun' : (currentWeapon === 'rifle' ? 'bullet_rifle' : 'bullet_pistol'));
        b.setTint(s.color); b.rotation = angle + off; b.damage = s.damage * bulletDamage;
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
        let type = 'enemy_small'; let speed = 70; let hp = 1; let scale = 1;
        if (rand > 0.8 && gameTime > 15000) { type = 'enemy_flyer'; speed = 120; hp = 1; scale = 1.2; }
        else if (rand > 0.6 && gameTime > 40000) { type = 'enemy_tank'; speed = 30; hp = 5; scale = 1.5; }
        else if (rand > 0.4) { type = 'enemy_medium'; speed = 60; hp = 2; scale = 1; }
        
        let angle = Math.random() * Math.PI * 2;
        let dist = 600; 
        let e = enemies.create(player.x + Math.cos(angle)*dist, player.y + Math.sin(angle)*dist, type);
        e.setScale(scale);
        e.speed = speed; e.hp = hp * (1 + gameTime/120000); e.maxHp = e.hp;
    }
}
function spawnBoss(scene) {
    let angle = Math.random() * Math.PI * 2;
    let b = enemies.create(player.x + Math.cos(angle)*600, player.y + Math.sin(angle)*600, 'enemy_boss');
    b.speed = 40; b.hp = 30 + (gameTime/1000)*2; b.maxHp = b.hp; b.isBoss = true; 
    currentBoss = b;
}
function hitEnemy(b, e) {
    // Логика для огнемета (урон + поджигание)
    if (b.isFlame) {
        damageEnemy(this, e, b.damage);
        e.setTint(0xff5500); // Враг горит
        this.time.delayedCall(200, () => { if(e.active) e.clearTint(); });
        b.destroy();
        return;
    }

    b.destroy();
    if (isExplosive) {
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

    if (Math.random() < vampirismChance && playerHealth < maxHealth) {
        playerHealth++; hearts[playerHealth-1].clearTint();
    }

    if (e.isBoss) { for(let i=0; i<15; i++){ let x = xpOrbs.create(e.x, e.y, 'xp_gem'); if(i<5) coins.create(e.x, e.y, 'coin'); } }
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
        { id: 'flamethrower', name: 'ОГНЕМЕТ', price: 100, desc: 'Огонь по площади' }
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
        { title: 'МАКС. HP', desc: '+1 сердечко', color: 0x551155, action: () => { maxHealth++; playerHealth = maxHealth; let newHeart = this.add.image(40 + (maxHealth - 1) * 30, 140, 'heart').setScale(1.2).setScrollFactor(0).setDepth(100); hearts.push(newHeart); hearts.forEach(h => h.clearTint()); } },
        { title: 'МЕТЕОРИТ', desc: 'Падает чаще', color: 0x551155, action: () => { hasMeteor = true; meteorFallSpeed = Math.max(1000, meteorFallSpeed - 500); } },
        { title: 'ДРОН', desc: '+1 дрон', color: 0x551155, action: () => { if (drones.length < 4) { let d = this.add.circle(0, 0, 8, 0x00ffff).setDepth(5); d.lastFired = 0; drones.push(d); } } },
        { title: 'СПУТНИК', desc: 'Вращается и бьет', color: 0x551155, action: () => { if (satellites.length < 3) { let s = this.add.image(player.x, player.y, 'satellite').setDepth(5); satellites.push(s); } } },
        { title: 'ВАМПИРИЗМ', desc: '5% шанс лечения с врага', color: 0x880000, action: () => vampirismChance += 0.05 },
        { title: 'ВЗРЫВНЫЕ ПУЛИ', desc: 'Пули бьют по площади', color: 0xff8800, action: () => { isExplosive = true; } },
        { title: 'ДАЛЬНОСТЬ', desc: '+100 к радиусу', color: 0x333333, action: () => attackRange += 100 }
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
