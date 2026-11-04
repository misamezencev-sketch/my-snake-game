// 1. Настройка игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#050510',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MenuScene, GameScene] // Две сцены: Меню и Игра
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
    // Фон меню (просто темный цвет со звездами)
    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    for (let i = 0; i < 100; i++) {
        let size = Phaser.Math.Between(1, 3);
        graphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.8));
        graphics.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size);
    }
    graphics.generateTexture('menu_bg', 800, 600);
    
    this.add.image(400, 300, 'menu_bg');

    // Заголовок
    this.add.text(400, 150, 'КОСМИЧЕСКИЙ ВЫЖИВШИЙ', { 
        fontSize: '48px', fill: '#00ffff', fontFamily: 'Arial', fontWeight: 'bold'
    }).setOrigin(0.5);

    // Кнопка Играть
    let playBtn = this.add.rectangle(400, 400, 300, 80, 0x113355).setStrokeStyle(3, 0x00ffff).setInteractive();
    this.add.text(400, 400, 'ИГРАТЬ', { fontSize: '36px', fill: '#ffffff' }).setOrigin(0.5);

    playBtn.on('pointerover', () => playBtn.setFillStyle(0x225588));
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x113355));
    playBtn.on('pointerdown', () => {
        this.scene.start('GameScene');
    });
};

// ==========================================
// СЦЕНА 2: ИГРА
// ==========================================
function GameScene() {
    Phaser.Scene.call(this, { key: 'GameScene' });
}
GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

// Глобальные переменные игры
let player;
let bullets;
let enemies;
let xpOrbs;
let craters;
let satellites = [];
let drone;

let playerXp = 0;
let playerLevel = 1;
let xpToNextLevel = 100;
let xpBar;
let levelText;
let hearts = [];
let playerHealth = 3;
let isInvulnerable = false;
let gameOver = false;
let isPaused = false;
let cursors;
let keys;

let fireRate = 800; 
let bulletDamage = 1;
let moveSpeed = 250;
let bulletCount = 1;
let pickupRadius = 100;
let hasMeteor = false;
let hasDrone = false;
let droneFireRate = 1000;
let lastFired = 0;
let lastDroneFired = 0;
let meteorTimer = 0;

let gameTime = 0;
let timeText;
let difficultyTimer = 0;
let enemyHpMultiplier = 1;
let spawnRate = 1500;
let spawnTimer;

let joystick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, base: null, thumb: null };

GameScene.prototype.preload = function() {
    // Загружаем картинку для меню (если она есть в репозитории)
    this.load.image('menu_bg_img', 'bg.png');
};

GameScene.prototype.create = function() {
    // Сброс переменных
    gameOver = false; isPaused = false; playerHealth = 3; hearts = [];
    playerXp = 0; playerLevel = 1; xpToNextLevel = 100; gameTime = 0;
    fireRate = 800; bulletDamage = 1; moveSpeed = 250; bulletCount = 1; pickupRadius = 100;
    hasMeteor = false; hasDrone = false; satellites = [];
    enemyHpMultiplier = 1; spawnRate = 1500;

    // --- ГЕНЕРАЦИЯ ТЕКСТУР ---
    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0xffffff, 1); graphics.fillRect(0, 0, 24, 24);
    graphics.fillStyle(0x00aaff, 1); graphics.fillRect(16, 4, 8, 16);
    graphics.generateTexture('player', 24, 24);
    
    graphics.fillStyle(0x00ff44, 1); graphics.fillCircle(15, 15, 15); 
    graphics.generateTexture('enemy_slime', 30, 30);
    graphics.fillStyle(0xaa00ff, 1); graphics.fillTriangle(15, 0, 30, 30, 0, 30); 
    graphics.generateTexture('enemy_flyer', 30, 30);
    graphics.fillStyle(0xff3300, 1); graphics.fillRect(0, 0, 40, 40); 
    graphics.generateTexture('enemy_tank', 40, 40);

    graphics.fillStyle(0x00ffff, 1); graphics.fillRect(0, 0, 15, 4);
    graphics.generateTexture('bullet', 15, 4);
    graphics.fillStyle(0xffff00, 1); graphics.fillStar(10, 10, 5, 10, 5);
    graphics.generateTexture('star', 20, 20);
    
    graphics.fillStyle(0xff0000, 1); 
    graphics.fillCircle(7, 7, 7); graphics.fillCircle(17, 7, 7); graphics.fillTriangle(0, 10, 24, 10, 12, 24);
    graphics.generateTexture('heart', 24, 24);

    graphics.fillStyle(0xff5500, 1); graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('meteor', 40, 40);

    graphics.fillStyle(0x1a1a1a, 1); graphics.fillCircle(40, 40, 40);
    graphics.lineStyle(4, 0x333333, 1); graphics.strokeCircle(40, 40, 40);
    graphics.generateTexture('crater', 80, 80);

    graphics.fillStyle(0x00ffff, 1); graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('satellite', 20, 20);

    // Фон (Звезды)
    for (let i = 0; i < 150; i++) {
        let size = Phaser.Math.Between(1, 3);
        graphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.8));
        graphics.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size);
    }
    graphics.generateTexture('bg_tile', 800, 600);

    // --- МИР И КАМЕРА ---
    this.add.tileSprite(-2500, -2500, 5000, 5000, 'bg_tile').setOrigin(0);
    this.physics.world.setBounds(-2500, -2500, 5000, 5000);
    this.cameras.main.setBounds(-2500, -2500, 5000, 5000);

    // --- КРАТЕРЫ ---
    craters = this.physics.add.staticGroup();
    for(let i = 0; i < 40; i++) {
        let cx = Phaser.Math.Between(-2000, 2000);
        let cy = Phaser.Math.Between(-2000, 2000);
        if (Phaser.Math.Distance.Between(0, 0, cx, cy) > 300) {
            let crater = craters.create(cx, cy, 'crater');
            crater.body.setCircle(35, 5, 5); 
        }
    }

    // --- ИГРОК ---
    player = this.physics.add.sprite(0, 0, 'player');
    player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    bullets = this.physics.add.group();
    enemies = this.physics.add.group();
    xpOrbs = this.physics.add.group();

    // UI
    let uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    let uiBg = this.add.rectangle(400, 20, 800, 40, 0x000000).setOrigin(0.5).setAlpha(0.7);
    xpBar = this.add.rectangle(0, 20, 0, 20, 0xffff00).setOrigin(0, 0.5);
    levelText = this.add.text(10, 10, 'LVL: 1', { fontSize: '18px', fill: '#fff' });
    timeText = this.add.text(700, 10, '00:00', { fontSize: '18px', fill: '#fff' });
    uiContainer.add([uiBg, xpBar, levelText, timeText]);

    for (let i = 0; i < 3; i++) {
        let h = this.add.image(30 + i * 30, 60, 'heart').setScrollFactor(0).setDepth(100);
        hearts.push(h);
    }

    // Управление
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D');

    // Джойстик
    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < 400 && !isPaused && !gameOver) {
            joystick.active = true;
            joystick.startX = pointer.x; joystick.startY = pointer.y;
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
    this.physics.add.collider(player, craters);
    this.physics.add.collider(enemies, craters);

    spawnTimer = this.time.addEvent({ delay: spawnRate, callback: spawnEnemy, callbackScope: this, loop: true });
};

GameScene.prototype.update = function(time, delta) {
    if (gameOver || isPaused) return;

    gameTime += delta;
    timeText.setText(Math.floor(gameTime / 60000).toString().padStart(2, '0') + ':' + Math.floor((gameTime % 60000) / 1000).toString().padStart(2, '0'));
    
    difficultyTimer += delta;
    if (difficultyTimer > 30000) {
        difficultyTimer = 0;
        enemyHpMultiplier += 0.2;
        spawnRate = Math.max(300, spawnRate - 100); 
        spawnTimer.delay = spawnRate;
    }

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
    if (length > 0) {
        player.setVelocity((vx / length) * moveSpeed, (vy / length) * moveSpeed);
    } else {
        player.setVelocity(0);
    }

    if (time > lastFired) {
        shoot(this);
        lastFired = time + fireRate;
    }

    if (hasDrone) {
        if (!drone) drone = this.add.circle(0, 0, 10, 0x00ffff);
        drone.setVisible(true);
        let droneAngle = time / 500;
        drone.x = player.x + Math.cos(droneAngle) * 50;
        drone.y = player.y + Math.sin(droneAngle) * 50;
        if (time > lastDroneFired) { 
            shootFrom(this, drone.x, drone.y);
            lastDroneFired = time + droneFireRate;
        }
    } else if (drone) {
        drone.setVisible(false);
    }

    satellites.forEach((sat, index) => {
        let angle = (time / 1000) + (index * (Math.PI * 2 / satellites.length));
        sat.x = player.x + Math.cos(angle) * 70;
        sat.y = player.y + Math.sin(angle) * 70;
        enemies.getChildren().forEach(enemy => {
            if (Phaser.Math.Distance.Between(sat.x, sat.y, enemy.x, enemy.y) < 30) {
                if (!enemy.lastSatHit || time > enemy.lastSatHit + 1000) {
                    enemy.lastSatHit = time;
                    enemy.hp -= 1; 
                    enemy.setTint(0xffffff);
                    this.time.delayedCall(100, () => { if(enemy.active) enemy.clearTint(); });
                    if (enemy.hp <= 0) {
                        enemy.destroy();
                        let xp = xpOrbs.create(enemy.x, enemy.y, 'star');
                        this.physics.moveToObject(xp, player, 100);
                    }
                }
            }
        });
    });

    if (hasMeteor) {
        meteorTimer += delta;
        if (meteorTimer > 3000) {
            meteorTimer = 0;
            castMeteor(this);
        }
    }

    enemies.getChildren().forEach(enemy => {
        if (enemy.active) {
            this.physics.moveToObject(enemy, player, enemy.speed);
        }
    });

    xpOrbs.getChildren().forEach(xp => {
        if (Phaser.Math.Distance.Between(player.x, player.y, xp.x, xp.y) < pickupRadius) {
            this.physics.moveToObject(xp, player, 200);
        }
    });
};

function shoot(scene) {
    let target = getNearestEnemy(scene, player.x, player.y);
    if (!target) return;
    let angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    for (let i = 0; i < bulletCount; i++) {
        let offset = (i - (bulletCount - 1) / 2) * 0.2; 
        let bullet = bullets.create(player.x, player.y, 'bullet');
        bullet.rotation = angle + offset;
        bullet.damage = bulletDamage;
        scene.physics.velocityFromRotation(angle + offset, 600, bullet.body.velocity);
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
    if (gameOver || isPaused) return;
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
    enemy.maxHp = enemy.hp;
}

function hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.hp -= bullet.damage;
    enemy.setTint(0xffffff);
    this.time.delayedCall(100, () => { if(enemy.active) enemy.clearTint(); });

    if (enemy.hp <= 0) {
        enemy.destroy();
        let xp = xpOrbs.create(enemy.x, enemy.y, 'star');
        xp.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
    }
}

function collectXp(player, xp) {
    xp.destroy();
    playerXp += 15;
    xpBar.width = (playerXp / xpToNextLevel) * 800;
    if (playerXp >= xpToNextLevel) {
        levelUp.call(this);
    }
}

function playerHit(player, enemy) {
    if (gameOver || isInvulnerable) return;
    playerHealth--;
    hearts[playerHealth].setTint(0x000000); 
    isInvulnerable = true;
    
    let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);
    this.tweens.add({ targets: player, alpha: 0.2, duration: 100, yoyo: true, repeat: 5 });
    
    if (playerHealth <= 0) {
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        this.add.text(400, 300, 'ИГРА ОКОНЧЕНА', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    } else {
        this.time.delayedCall(1500, () => { isInvulnerable = false; player.alpha = 1; });
    }
}

function levelUp() {
    isPaused = true;
    this.physics.pause();
    playerXp = 0; playerLevel++; xpToNextLevel += 50;
    xpBar.width = 0;
    levelText.setText('LVL: ' + playerLevel);

    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setScrollFactor(0).setDepth(200);
    let title = this.add.text(400, 80, 'УЛУЧШЕНИЕ', { fontSize: '40px', fill: '#00ffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    
    let pool = [
        { title: 'УРОН', desc: '+1 к урону', color: 0x113355, action: () => bulletDamage += 1 },
        { title: 'СКОРОСТЬ АТАКИ', desc: '-15% задержки', color: 0x113355, action: () => fireRate *= 0.85 },
        { title: 'СКОРОСТЬ', desc: '+20 к скорости', color: 0x333333, action: () => moveSpeed += 20 },
        { title: 'МАГНИТ', desc: 'Радиус сбора +50', color: 0x333333, action: () => pickupRadius += 50 },
        { title: 'ЛЕЧЕНИЕ', desc: 'Восстановить 1 HP', color: 0x333333, action: () => {
            if (playerHealth < 3) { playerHealth++; hearts[playerHealth-1].clearTint(); }
        }},
        { title: 'ДОП. ПУЛЯ', desc: 'Стреляем веером', color: 0x113355, action: () => bulletCount = Math.min(bulletCount + 1, 5) },
        { title: 'МАКС. HP', desc: '+1 сердечко', color: 0x551155, action: () => {
            if (playerHealth < 3) { playerHealth++; hearts[playerHealth-1].clearTint(); }
        }},
        { title: 'МЕТЕОРИТ', desc: 'Падает раз в 3 сек', color: 0x551155, action: () => hasMeteor = true },
        { title: 'ДРОН', desc: 'Летает и стреляет', color: 0x551155, action: () => hasDrone = true },
        { title: 'СПУТНИК', desc: 'Вращается и бьет', color: 0x551155, action: () => {
            if (satellites.length < 3) {
                let sat = this.add.image(player.x, player.y, 'satellite').setDepth(10);
                satellites.push(sat);
            }
        }}
    ];

    Phaser.Utils.Array.Shuffle(pool);
    let choices = pool.slice(0, 3);
    let elements = [overlay, title];

    choices.forEach((choice, index) => {
        let y = 200 + index * 130;
        let btnBg = this.add.rectangle(400, y, 500, 100, choice.color).setStrokeStyle(2, 0xffffff).setScrollFactor(0).setDepth(200);
        let btnTitle = this.add.text(400, y - 20, choice.title, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        let btnDesc = this.add.text(400, y + 20, choice.desc, { fontSize: '18px', fill: '#aaa' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        let zone = this.add.zone(400, y, 500, 100).setInteractive().setScrollFactor(0).setDepth(200);
        
        zone.on('pointerover', () => btnBg.setFillStyle(0x44aaff));
        zone.on('pointerout', () => btnBg.setFillStyle(choice.color));
        zone.on('pointerdown', () => {
            choice.action.call(this);
            elements.forEach(e => e.destroy());
            btnBg.destroy(); btnTitle.destroy(); btnDesc.destroy();
            isPaused = false;
            this.physics.resume();
        });
        elements.push(btnBg, btnTitle, btnDesc, zone);
    });
}

function castMeteor(scene) {
    let targets = enemies.getChildren();
    if (targets.length === 0) return;
    let targetsToHit = Phaser.Utils.Array.Shuffle(targets).slice(0, 3);

    targetsToHit.forEach(enemy => {
        let meteor = scene.add.image(enemy.x, enemy.y - 300, 'meteor');
        scene.tweens.add({
            targets: meteor, y: enemy.y, duration: 400,
            onComplete: () => {
                meteor.destroy();
                let explosion = scene.add.circle(enemy.x, enemy.y, 50, 0xff5500, 0.6);
                scene.time.delayedCall(200, () => explosion.destroy());
                enemies.getChildren().forEach(e => {
                    if (Phaser.Math.Distance.Between(enemy.x, enemy.y, e.x, e.y) < 60) {
                        e.hp -= 2; 
                        if (e.hp <= 0) {
                            e.destroy();
                            let xp = xpOrbs.create(e.x, e.y, 'star');
                            scene.physics.moveToObject(xp, player, 100);
                        }
                    }
                });
            }
        });
    });
}
