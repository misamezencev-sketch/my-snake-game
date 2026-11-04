// 1. Настройка игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#050510',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);

// ==========================================
// СЦЕНА 1: ГЛАВНОЕ МЕНЮ
// ==========================================
function MenuScene() {
    Phaser.Scene.call(this, { key: 'MenuScene' });
}
MenuScene.prototype = Object.create(Phaser.Scene.prototype);
MenuScene.prototype.constructor = MenuScene;

MenuScene.prototype.create = function() {
    let g = this.make.graphics({x: 0, y: 0, add: false});
    g.fillStyle(0x222222, 1); g.fillRect(0, 0, 800, 600);
    for(let i=0; i<50; i++) {
        g.fillStyle(0x1a1a1a, 0.5); g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(10, 50));
    }
    g.generateTexture('menu_bg', 800, 600); g.destroy();
    this.add.image(400, 300, 'menu_bg');

    this.add.text(400, 150, 'КОСМИЧЕСКИЙ ВЫЖИВШИЙ', { fontSize: '40px', fill: '#00ffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
    
    let playBtn = this.add.rectangle(400, 400, 300, 80, 0x113355).setStrokeStyle(3, 0x00ffff).setInteractive();
    this.add.text(400, 400, 'ИГРАТЬ', { fontSize: '36px', fill: '#ffffff' }).setOrigin(0.5);

    playBtn.on('pointerdown', () => this.scene.start('GameScene'));
};

// ==========================================
// СЦЕНА 2: ИГРА
// ==========================================
function GameScene() {
    Phaser.Scene.call(this, { key: 'GameScene' });
}
GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

// Глобальные переменные
let player, bullets, enemies, xpOrbs, craters, coins, shops;
let satellites = [], drone;
let playerXp = 0, playerLevel = 1, xpToNextLevel = 100;
let xpBar, levelText, hearts = [], playerHealth = 3;
let playerCoins = 0, coinText;
let isInvulnerable = false, gameOver = false, isPaused = false;
let cursors, keys;
let fireRate = 800, bulletDamage = 1, moveSpeed = 250, bulletCount = 1, pickupRadius = 100;
let hasMeteor = false, hasDrone = false, droneFireRate = 1000;
let lastFired = 0, lastDroneFired = 0, meteorTimer = 0;
let gameTime = 0, timeText, difficultyTimer = 0, enemyHpMultiplier = 1, spawnRate = 1500, spawnTimer;
let bossSpawnTimer = 0;

// Оружие
let currentWeapon = 'pistol'; // pistol, shotgun, rifle, rpg
let ownedWeapons = { pistol: true, shotgun: false, rifle: false, rpg: false };
let weaponStats = {
    pistol: { fireRate: 800, bulletCount: 1, spread: 0, damage: 1, color: 0x00ffff, speed: 600 },
    shotgun: { fireRate: 1200, bulletCount: 3, spread: 0.3, damage: 0.7, color: 0xffaa00, speed: 500 },
    rifle: { fireRate: 150, bulletCount: 1, spread: 0.05, damage: 0.8, color: 0xff00ff, speed: 800 },
    rpg: { fireRate: 2000, bulletCount: 1, spread: 0, damage: 3, color: 0xff0000, speed: 400 }
};

// Магазины
let shopPhaseTimer = 0;
let shopOpen = false;
let shopUiContainer = null;
let joystick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, base: null, thumb: null };

GameScene.prototype.create = function() {
    gameOver = false; isPaused = false; playerHealth = 3; hearts = [];
    playerXp = 0; playerLevel = 1; xpToNextLevel = 100; gameTime = 0; playerCoins = 0;
    currentWeapon = 'pistol'; ownedWeapons = { pistol: true, shotgun: false, rifle: false, rpg: false };
    fireRate = weaponStats.pistol.fireRate; bulletDamage = weaponStats.pistol.damage; bulletCount = weaponStats.pistol.bulletCount;
    hasMeteor = false; hasDrone = false; satellites = [];
    enemyHpMultiplier = 1; spawnRate = 1500; bossSpawnTimer = 0; shopPhaseTimer = 0; shopOpen = false;

    // --- ГЕНЕРАЦИЯ ТЕКСТУР ---
    let g = this.make.graphics({x: 0, y: 0, add: false});
    
    // Игрок
    g.fillStyle(0xffffff, 1); g.fillRect(4, 0, 20, 24);
    g.fillStyle(0x00aaff, 1); g.fillRect(16, 6, 8, 12);
    g.fillStyle(0xaaaaaa, 1); g.fillRect(0, 4, 6, 16);
    g.generateTexture('player', 24, 24); g.clear();

    // Враги
    g.fillStyle(0x00ff44, 1); g.fillCircle(15, 15, 15); g.generateTexture('enemy_slime', 30, 30); g.clear();
    g.fillStyle(0xaa00ff, 1); g.fillTriangle(15, 0, 30, 30, 0, 30); g.generateTexture('enemy_flyer', 30, 30); g.clear();
    g.fillStyle(0xff3300, 1); g.fillRect(0, 0, 40, 40); g.generateTexture('enemy_tank', 40, 40); g.clear();
    g.fillStyle(0x8800ff, 1); g.fillCircle(40, 40, 40); g.fillStyle(0xff0000, 1); g.fillCircle(40, 40, 15); g.generateTexture('enemy_boss', 80, 80); g.clear();

    // Пули
    g.fillStyle(0x00ffff, 1); g.fillRect(0, 0, 15, 4); g.generateTexture('bullet', 15, 4); g.clear();

    // Звезда опыта и Монета
    g.fillStyle(0x00ffff, 1); g.beginPath(); g.moveTo(10, 0); g.lineTo(20, 10); g.lineTo(10, 20); g.lineTo(0, 10); g.closePath(); g.fillPath(); g.generateTexture('star', 20, 20); g.clear();
    g.fillStyle(0xffff00, 1); g.fillCircle(10, 10, 10); g.fillStyle(0xffaa00, 1); g.fillCircle(10, 10, 7); g.generateTexture('coin', 20, 20); g.clear();

    // Сердце, Метеорит, Кратер, Спутник
    g.fillStyle(0xff0000, 1); g.fillCircle(7, 7, 7); g.fillCircle(17, 7, 7); g.fillTriangle(0, 10, 24, 10, 12, 24); g.generateTexture('heart', 24, 24); g.clear();
    g.fillStyle(0xff5500, 1); g.fillCircle(20, 20, 20); g.generateTexture('meteor', 40, 40); g.clear();
    g.fillStyle(0x1a1a1a, 1); g.fillCircle(40, 40, 40); g.lineStyle(4, 0x333333, 1); g.strokeCircle(40, 40, 40); g.generateTexture('crater', 80, 80); g.clear();
    g.fillStyle(0x00ffff, 1); g.fillCircle(10, 10, 10); g.generateTexture('satellite', 20, 20); g.clear();

    // Магазин (Закрытый и Открытый)
    g.fillStyle(0x444444, 1); g.fillRect(0, 0, 60, 60); g.fillStyle(0x222222, 1); g.fillRect(5, 5, 50, 20); g.generateTexture('shop_closed', 60, 60); g.clear();
    g.fillStyle(0x444444, 1); g.fillRect(0, 0, 60, 60); g.fillStyle(0x00ff00, 1); g.fillRect(5, 5, 50, 20); g.generateTexture('shop_open', 60, 60); g.clear();

    // Фон
    g.fillStyle(0x333333, 1); g.fillRect(0, 0, 800, 600);
    for (let i = 0; i < 100; i++) {
        g.fillStyle(0x222222, Phaser.Math.FloatBetween(0.1, 0.5));
        g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(5, 30));
    }
    g.generateTexture('bg_tile', 800, 600); g.destroy();

    // --- МИР ---
    this.add.tileSprite(-2500, -2500, 5000, 5000, 'bg_tile').setOrigin(0);
    this.physics.world.setBounds(-2500, -2500, 5000, 5000);
    this.cameras.main.setBounds(-2500, -2500, 5000, 5000);

    // Кратеры
    craters = this.physics.add.staticGroup();
    for(let i = 0; i < 40; i++) {
        let cx = Phaser.Math.Between(-2000, 2000); let cy = Phaser.Math.Between(-2000, 2000);
        if (Phaser.Math.Distance.Between(0, 0, cx, cy) > 300) {
            let crater = craters.create(cx, cy, 'crater'); crater.body.setCircle(35, 5, 5); 
        }
    }

    // Магазины (5 штук)
    shops = this.physics.add.staticGroup();
    for(let i=0; i<5; i++) {
        let sx = Phaser.Math.Between(-2000, 2000); let sy = Phaser.Math.Between(-2000, 2000);
        if(Phaser.Math.Distance.Between(0,0,sx,sy) > 500) {
            let shop = shops.create(sx, sy, 'shop_closed');
            shop.setData('isOpen', false);
        }
    }

    player = this.physics.add.sprite(0, 0, 'player');
    player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    bullets = this.physics.add.group();
    enemies = this.physics.add.group();
    xpOrbs = this.physics.add.group();
    coins = this.physics.add.group();

    // UI
    let uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    let uiBg = this.add.rectangle(400, 20, 800, 40, 0x000000).setOrigin(0.5).setAlpha(0.7);
    xpBar = this.add.rectangle(0, 20, 0, 20, 0x00ffff).setOrigin(0, 0.5);
    levelText = this.add.text(10, 10, 'LVL: 1', { fontSize: '18px', fill: '#fff' });
    timeText = this.add.text(680, 10, '00:00', { fontSize: '18px', fill: '#fff' });
    coinText = this.add.text(680, 60, '🪙: 0', { fontSize: '24px', fill: '#ffff00' });
    uiContainer.add([uiBg, xpBar, levelText, timeText, coinText]);

    for (let i = 0; i < 3; i++) {
        let h = this.add.image(30 + i * 30, 60, 'heart').setScrollFactor(0).setDepth(100);
        hearts.push(h);
    }

    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D');

    // Джойстик
    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < 400 && !isPaused && !gameOver) {
            joystick.active = true; joystick.startX = pointer.x; joystick.startY = pointer.y;
            joystick.base = this.add.circle(pointer.x, pointer.y, 40, 0xffffff, 0.2).setScrollFactor(0).setDepth(100);
            joystick.thumb = this.add.circle(pointer.x, pointer.y, 20, 0xffffff, 0.5).setScrollFactor(0).setDepth(100);
        }
    });
    this.input.on('pointermove', (pointer) => {
        if (joystick.active) {
            joystick.curX = pointer.x; joystick.curY = pointer.y;
            let dist = Phaser.Math.Distance.Between(joystick.startX, joystick.startY, pointer.x, pointer.y);
            let angle = Phaser.Math.Angle.Between(joystick.startX, joystick.startY, pointer.x, pointer.y);
            if (dist > 40) dist = 40;
            joystick.thumb.x = joystick.startX + Math.cos(angle) * dist;
            joystick.thumb.y = joystick.startY + Math.sin(angle) * dist;
        }
    });
    this.input.on('pointerup', () => {
        joystick.active = false;
        if (joystick.base) joystick.base.destroy();
        if (joystick.thumb) joystick.thumb.destroy();
    });

    // Коллизии
    this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, enemies, playerHit, null, this);
    this.physics.add.overlap(player, xpOrbs, collectXp, null, this);
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    this.physics.add.collider(player, craters);
    this.physics.add.collider(enemies, craters);
    this.physics.add.collider(player, shops, openShop, null, this);

    spawnTimer = this.time.addEvent({ delay: spawnRate, callback: spawnEnemy, callbackScope: this, loop: true });
};

GameScene.prototype.update = function(time, delta) {
    if (gameOver || isPaused) return;

    gameTime += delta;
    timeText.setText(Math.floor(gameTime / 60000).toString().padStart(2, '0') + ':' + Math.floor((gameTime % 60000) / 1000).toString().padStart(2, '0'));
    
    // Таймер магазина
    shopPhaseTimer += delta;
    if (shopPhaseTimer > 150000) { // 2.5 минуты
        shopOpen = true;
        shopPhaseTimer = -30000; // 30 секунд открыто
        shops.getChildren().forEach(shop => {
            shop.setTexture('shop_open');
            shop.setData('isOpen', true);
        });
    } else if (shopOpen && shopPhaseTimer > 0) {
        shopOpen = false;
        shops.getChildren().forEach(shop => {
            shop.setTexture('shop_closed');
            shop.setData('isOpen', false);
        });
    }

    difficultyTimer += delta;
    if (difficultyTimer > 30000) {
        difficultyTimer = 0;
        enemyHpMultiplier += 0.2;
        spawnRate = Math.max(300, spawnRate - 100); 
        if(!shopOpen) spawnTimer.delay = spawnRate;
    }

    // Босс раз в 5 минут
    bossSpawnTimer += delta;
    if (bossSpawnTimer > 300000) {
        bossSpawnTimer = 0;
        spawnBoss(this);
    }

    // Движение
    let vx = 0, vy = 0;
    if (cursors.left.isDown || keys.A.isDown) vx = -1;
    if (cursors.right.isDown || keys.D.isDown) vx = 1;
    if (cursors.up.isDown || keys.W.isDown) vy = -1;
    if (cursors.down.isDown || keys.S.isDown) vy = 1;

    if (joystick.active) {
        let angle = Phaser.Math.Angle.Between(joystick.startX, joystick.startY, joystick.curX, joystick.curY);
        vx = Math.cos(angle); vy = Math.sin(angle);
    }
    let length = Math.sqrt(vx * vx + vy * vy);
    player.setVelocity((length > 0) ? (vx / length) * moveSpeed : 0, (length > 0) ? (vy / length) * moveSpeed : 0);

    // Стрельба
    if (time > lastFired) {
        shoot(this);
        lastFired = time + weaponStats[currentWeapon].fireRate;
    }

    // Дрон
    if (hasDrone) {
        if (!drone) drone = this.add.circle(0, 0, 10, 0x00ffff);
        drone.setVisible(true);
        let droneAngle = time / 500;
        drone.x = player.x + Math.cos(droneAngle) * 50;
        drone.y = player.y + Math.sin(droneAngle) * 50;
        if (time > lastDroneFired) { shootFrom(this, drone.x, drone.y); lastDroneFired = time + droneFireRate; }
    } else if (drone) { drone.setVisible(false); }

    // Спутники
    satellites.forEach((sat, index) => {
        let angle = (time / 1000) + (index * (Math.PI * 2 / satellites.length));
        sat.x = player.x + Math.cos(angle) * 70;
        sat.y = player.y + Math.sin(angle) * 70;
        enemies.getChildren().forEach(enemy => {
            if (Phaser.Math.Distance.Between(sat.x, sat.y, enemy.x, enemy.y) < 30) {
                if (!enemy.lastSatHit || time > enemy.lastSatHit + 1000) {
                    enemy.lastSatHit = time; enemy.hp -= 1; 
                    enemy.setTint(0xffffff); this.time.delayedCall(100, () => { if(enemy.active) enemy.clearTint(); });
                    if (enemy.hp <= 0) killEnemy(this, enemy);
                }
            }
        });
    });

    // Метеорит
    if (hasMeteor) {
        meteorTimer += delta;
        if (meteorTimer > 5000) { meteorTimer = 0; castMeteor(this); }
    }

    // Враги
    enemies.getChildren().forEach(enemy => {
        if (enemy.active) this.physics.moveToObject(enemy, player, enemy.speed);
    });

    // Сбор опыта
    xpOrbs.getChildren().forEach(xp => {
        if (Phaser.Math.Distance.Between(player.x, player.y, xp.x, xp.y) < pickupRadius) this.physics.moveToObject(xp, player, 200);
    });
};

function shoot(scene) {
    let target = getNearestEnemy(scene, player.x, player.y);
    if (!target) return;
    let angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    let stats = weaponStats[currentWeapon];
    let actualBulletCount = stats.bulletCount + (bulletCount - 1); // Карточка доп пули добавляет пули
    
    for (let i = 0; i < actualBulletCount; i++) {
        let offset = (i - (actualBulletCount - 1) / 2) * (stats.spread > 0 ? stats.spread : 0.1); 
        let bullet = bullets.create(player.x, player.y, 'bullet');
        bullet.setTint(stats.color);
        bullet.rotation = angle + offset;
        bullet.damage = stats.damage * bulletDamage;
        scene.physics.velocityFromRotation(angle + offset, stats.speed, bullet.body.velocity);
    }
}

function shootFrom(scene, x, y) {
    let target = getNearestEnemy(scene, x, y);
    if (!target) return;
    let angle = Phaser.Math.Angle.Between(x, y, target.x, target.y);
    let bullet = bullets.create(x, y, 'bullet');
    bullet.rotation = angle;
    bullet.damage = bulletDamage;
    scene.physics.velocityFromRotation(angle, 600, bullet.body.velocity);
}

function getNearestEnemy(scene, x, y) {
    let nearest = null; let minDist = Infinity;
    enemies.getChildren().forEach(e => {
        let d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
        if (d < minDist) { minDist = d; nearest = e; }
    });
    return nearest;
}

function spawnEnemy() {
    if (gameOver || isPaused || shopOpen) return; // Не спавним при открытом магазине
    let type = 'enemy_slime'; let speed = 80; let hp = 1;
    let rand = Math.random();
    if (rand > 0.7 && gameTime > 20000) { type = 'enemy_flyer'; speed = 150; hp = 1; }
    else if (rand > 0.4 && gameTime > 40000) { type = 'enemy_tank'; speed = 50; hp = 3; }

    let cam = this.cameras.main;
    let x = Phaser.Math.Between(cam.worldView.x - 100, cam.worldView.right + 100);
    let y = Phaser.Math.Between(cam.worldView.y - 100, cam.worldView.bottom + 100);
    
    let enemy = enemies.create(x, y, type);
    enemy.speed = speed;
    enemy.hp = Math.floor(hp * enemyHpMultiplier);
}

function spawnBoss(scene) {
    let cam = scene.cameras.main;
    let x = Phaser.Math.Between(cam.worldView.x - 200, cam.worldView.right + 200);
    let y = Phaser.Math.Between(cam.worldView.y - 200, cam.worldView.bottom + 200);
    let boss = enemies.create(x, y, 'enemy_boss');
    boss.speed = 40; boss.hp = 50; boss.isBoss = true;
}

function hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.hp -= bullet.damage;
    enemy.setTint(0xffffff); this.time.delayedCall(100, () => { if(enemy.active) enemy.clearTint(); });
    if (enemy.hp <= 0) killEnemy(this, enemy);
}

function killEnemy(scene, enemy) {
    enemy.destroy();
    let xp = xpOrbs.create(enemy.x, enemy.y, 'star');
    xp.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
    
    // Шанс 25% на монету
    if (Math.random() < 0.25) {
        let coin = coins.create(enemy.x, enemy.y, 'coin');
        coin.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
    }
    if (enemy.isBoss) {
        for(let i=0; i<10; i++){
            let extraXp = xpOrbs.create(enemy.x, enemy.y, 'star');
            extraXp.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
            if(i < 5) { let c = coins.create(enemy.x, enemy.y, 'coin'); c.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100)); }
        }
    }
}

function collectXp(player, xp) {
    xp.destroy(); playerXp += 15;
    xpBar.width = (playerXp / xpToNextLevel) * 800;
    if (playerXp >= xpToNextLevel) levelUp.call(this);
}

function collectCoin(player, coin) {
    coin.destroy(); playerCoins += 1;
    coinText.setText('🪙: ' + playerCoins);
}

function playerHit(player, enemy) {
    if (gameOver || isInvulnerable) return;
    playerHealth--; hearts[playerHealth].setTint(0x000000); 
    isInvulnerable = true;
    
    let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);
    this.tweens.add({ targets: player, alpha: 0.2, duration: 100, yoyo: true, repeat: 5 });
    
    if (playerHealth <= 0) {
        gameOver = true; this.physics.pause(); player.setTint(0xff0000);
        this.add.text(400, 300, 'ИГРА ОКОНЧЕНА', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    } else {
        this.time.delayedCall(1500, () => { isInvulnerable = false; player.alpha = 1; });
    }
}

function openShop(player, shop) {
    if (!shop.getData('isOpen') || isPaused) return;
    
    isPaused = true;
    this.physics.pause();
    
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9).setScrollFactor(0).setDepth(200);
    let title = this.add.text(400, 50, 'МАГАЗИН ОРУЖИЯ', { fontSize: '40px', fill: '#00ffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    let coinDisplay = this.add.text(400, 100, 'У ВАС МОНЕТ: ' + playerCoins, { fontSize: '24px', fill: '#ffff00' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    
    let elements = [overlay, title, coinDisplay];

    let weapons = [
        { id: 'pistol', name: 'ПИСТОЛЕТ', price: 0, desc: 'Стандартное оружие' },
        { id: 'shotgun', name: 'ДРОБОВИК', price: 25, desc: '3 пули веером' },
        { id: 'rifle', name: 'АВТОМАТ', price: 50, desc: 'Очень быстрая стрельба' },
        { id: 'rpg', name: 'РПГ', price: 100, desc: 'Взрывной урон по области' }
    ];

    weapons.forEach((weapon, index) => {
        let y = 180 + index * 90;
        let btnBg = this.add.rectangle(400, y, 600, 70, 0x113355).setStrokeStyle(2, 0x00ffff).setScrollFactor(0).setDepth(200);
        let btnText = this.add.text(150, y, weapon.name, { fontSize: '24px', fill: '#fff' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(200);
        let btnDesc = this.add.text(150, y + 20, weapon.desc, { fontSize: '16px', fill: '#aaa' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(200);
        let priceText = this.add.text(650, y, ownedWeapons[weapon.id] ? 'КУПЛЕНО' : ('🪙 ' + weapon.price), { fontSize: '24px', fill: ownedWeapons[weapon.id] ? '#00ff00' : '#ffff00' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(200);
        
        let zone = this.add.zone(400, y, 600, 70).setInteractive().setScrollFactor(0).setDepth(200);
        
        zone.on('pointerdown', () => {
            if (ownedWeapons[weapon.id]) {
                currentWeapon = weapon.id;
                // Применяем текущие карточки к новому оружию
                fireRate = weaponStats[weapon.id].fireRate * (fireRate / weaponStats.pistol.fireRate); 
                this.scene.restart(); // Перезапускаем сцену для применения (или просто меняем переменные)
                return;
            }
            if (playerCoins >= weapon.price) {
                playerCoins -= weapon.price;
                ownedWeapons[weapon.id] = true;
                currentWeapon = weapon.id;
                // Обновляем UI магазина
                priceText.setText('КУПЛЕНО').setStyle({ fill: '#00ff00' });
                coinDisplay.setText('У ВАС МОНЕТ: ' + playerCoins);
            }
        });
        
        elements.push(btnBg, btnText, btnDesc, priceText, zone);
    });

    // Кнопка закрытия
    let closeBtn = this.add.text(400, 550, 'ЗАКРЫТЬ', { fontSize: '30px', fill: '#fff', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(200);
    closeBtn.on('pointerdown', () => {
        elements.forEach(e => e.destroy()); closeBtn.destroy();
        isPaused = false; this.physics.resume();
    });
    elements.push(closeBtn);
}

function levelUp() {
    isPaused = true; this.physics.pause();
    playerXp = 0; playerLevel++; xpToNextLevel += 50; xpBar.width = 0;
    levelText.setText('LVL: ' + playerLevel);

    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setScrollFactor(0).setDepth(200);
    let title = this.add.text(400, 80, 'УЛУЧШЕНИЕ', { fontSize: '40px', fill: '#00ffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    
    let pool = [
        { title: 'УРОН', desc: '+1 к урону', color: 0x113355, action: () => bulletDamage += 1 },
        { title: 'СКОРОСТЬ АТАКИ', desc: '-15% задержки', color: 0x113355, action: () => fireRate *= 0.85 },
        { title: 'СКОРОСТЬ', desc: '+20 к скорости', color: 0x333333, action: () => moveSpeed += 20 },
        { title: 'МАГНИТ', desc: 'Радиус сбора +50', color: 0x333333, action: () => pickupRadius += 50 },
        { title: 'ЛЕЧЕНИЕ', desc: 'Восстановить 1 HP', color: 0x333333, action: () => { if (playerHealth < 3) { playerHealth++; hearts[playerHealth-1].clearTint(); } } },
        { title: 'ДОП. ПУЛЯ', desc: 'Стреляем веером', color: 0x113355, action: () => bulletCount = Math.min(bulletCount + 1, 5) },
        { title: 'МАКС. HP', desc: '+1 сердечко', color: 0x551155, action: () => { if (playerHealth < 3) { playerHealth++;
