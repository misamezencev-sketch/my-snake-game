const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#050510',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);

// --- МЕНЮ ---
function MenuScene() { Phaser.Scene.call(this, { key: 'MenuScene' }); }
MenuScene.prototype = Object.create(Phaser.Scene.prototype);
MenuScene.prototype.constructor = MenuScene;
MenuScene.prototype.create = function() {
    this.add.text(400, 150, 'КОСМИЧЕСКИЙ ВЫЖИВШИЙ', { fontSize: '40px', fill: '#00ffff' }).setOrigin(0.5);
    let btn = this.add.rectangle(400, 400, 300, 80, 0x113355).setStrokeStyle(3, 0x00ffff).setInteractive();
    this.add.text(400, 400, 'ИГРАТЬ', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start('GameScene'));
};

// --- ИГРА ---
function GameScene() { Phaser.Scene.call(this, { key: 'GameScene' }); }
GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

let player, enemies, xpOrbs, hearts = [], playerHealth = 3, playerCoins = 0;
let gameOver = false, isPaused = false;
let cursors, keys, joystick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, base: null, thumb: null };
let xpBar, coinText, gameTime = 0, timeText, spawnTimer;

GameScene.prototype.create = function() {
    gameOver = false; isPaused = false; playerHealth = 3; hearts = []; playerCoins = 0; gameTime = 0;

    let g = this.make.graphics({x: 0, y: 0, add: false});
    
    // Текстуры
    g.fillStyle(0xffffff, 1); g.fillRect(4, 0, 20, 24);
    g.fillStyle(0x00aaff, 1); g.fillRect(16, 6, 8, 12);
    g.generateTexture('player', 24, 24); g.clear();

    g.fillStyle(0x00ff44, 1); g.fillCircle(15, 15, 15); g.generateTexture('enemy', 30, 30); g.clear();
    g.fillStyle(0x00ffff, 1); g.fillRect(0, 0, 15, 4); g.generateTexture('bullet', 15, 4); g.clear();
    
    g.fillStyle(0x00ffff, 1); g.beginPath(); g.moveTo(10, 0); g.lineTo(20, 10); g.lineTo(10, 20); g.lineTo(0, 10); g.closePath(); g.fillPath(); g.generateTexture('star', 20, 20); g.clear();
    g.fillStyle(0xffff00, 1); g.fillCircle(10, 10, 10); g.fillStyle(0xffaa00, 1); g.fillCircle(10, 10, 7); g.generateTexture('coin', 20, 20); g.clear();
    g.fillStyle(0xff0000, 1); g.fillCircle(7, 7, 7); g.fillCircle(17, 7, 7); g.fillTriangle(0, 10, 24, 10, 12, 24); g.generateTexture('heart', 24, 24); g.clear();

    // Фон (Луна)
    g.fillStyle(0x333333, 1); g.fillRect(0, 0, 800, 600);
    for (let i = 0; i < 100; i++) { g.fillStyle(0x222222, 0.5); g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(5, 30)); }
    g.generateTexture('bg_tile', 800, 600); g.destroy();

    this.add.tileSprite(-2500, -2500, 5000, 5000, 'bg_tile').setOrigin(0);
    this.physics.world.setBounds(-2500, -2500, 5000, 5000);
    this.cameras.main.setBounds(-2500, -2500, 5000, 5000);

    player = this.physics.add.sprite(0, 0, 'player');
    player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    enemies = this.physics.add.group();
    xpOrbs = this.physics.add.group();
    let coins = this.physics.add.group();
    let bullets = this.physics.add.group();

    // UI
    let ui = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    ui.add(this.add.rectangle(400, 20, 800, 40, 0x000000).setOrigin(0.5).setAlpha(0.7));
    xpBar = this.add.rectangle(0, 20, 0, 20, 0x00ffff).setOrigin(0, 0.5);
    let lvlText = this.add.text(10, 10, 'LVL: 1', { fontSize: '18px', fill: '#fff' });
    timeText = this.add.text(680, 10, '00:00', { fontSize: '18px', fill: '#fff' });
    coinText = this.add.text(680, 60, '🪙: 0', { fontSize: '24px', fill: '#ffff00' });
    ui.add([xpBar, lvlText, timeText, coinText]);

    for (let i = 0; i < 3; i++) hearts.push(this.add.image(30 + i * 30, 60, 'heart').setScrollFactor(0).setDepth(100));

    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D');

    this.input.on('pointerdown', (p) => {
        if (p.x < 400 && !isPaused && !gameOver) {
            joystick.active = true; joystick.startX = p.x; joystick.startY = p.y;
            joystick.base = this.add.circle(p.x, p.y, 40, 0xffffff, 0.2).setScrollFactor(0).setDepth(100);
            joystick.thumb = this.add.circle(p.x, p.y, 20, 0xffffff, 0.5).setScrollFactor(0).setDepth(100);
        }
    });
    this.input.on('pointermove', (p) => {
        if (joystick.active) {
            joystick.curX = p.x; joystick.curY = p.y;
            let dist = Phaser.Math.Distance.Between(joystick.startX, joystick.startY, p.x, p.y);
            let angle = Phaser.Math.Angle.Between(joystick.startX, joystick.startY, p.x, p.y);
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

    this.physics.add.overlap(bullets, enemies, (b, e) => { b.destroy(); e.destroy(); this.addXp(e.x, e.y); if(Math.random()<0.25) this.addCoin(e.x, e.y); });
    this.physics.add.overlap(player, enemies, this.onHit, null, this);
    this.physics.add.overlap(player, xpOrbs, (p, xp) => { xp.destroy(); this.addXpBar(); });
    this.physics.add.overlap(player, coins, (p, c) => { c.destroy(); playerCoins++; coinText.setText('🪙: ' + playerCoins); });

    spawnTimer = this.time.addEvent({ delay: 1500, callback: () => {
        if(gameOver || isPaused) return;
        let x = Phaser.Math.Between(0, 1) ? 0 : 800;
        let y = Phaser.Math.Between(0, 1) ? 0 : 600;
        let e = enemies.create(x, y, 'enemy');
        this.physics.moveToObject(e, player, 80);
    }, loop: true });
};

GameScene.prototype.update = function(time, delta) {
    if (gameOver || isPaused) return;
    gameTime += delta;
    timeText.setText(Math.floor(gameTime / 1000) + 's');

    let vx = (cursors.left.isDown || keys.A.isDown) ? -1 : (cursors.right.isDown || keys.D.isDown) ? 1 : 0;
    let vy = (cursors.up.isDown || keys.W.isDown) ? -1 : (cursors.down.isDown || keys.S.isDown) ? 1 : 0;
    if (joystick.active) {
        let angle = Phaser.Math.Angle.Between(joystick.startX, joystick.startY, joystick.curX, joystick.curY);
        vx = Math.cos(angle); vy = Math.sin(angle);
    }
    let len = Math.sqrt(vx*vx + vy*vy);
    player.setVelocity(len > 0 ? (vx/len)*250 : 0, len > 0 ? (vy/len)*250 : 0);
};

GameScene.prototype.addXp = function(x, y) {
    let xp = xpOrbs.create(x, y, 'star');
    xp.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
};
GameScene.prototype.addCoin = function(x, y) {
    // В реальном коде здесь была бы группа монет, но для теста просто начисляем
    playerCoins++; coinText.setText('🪙: ' + playerCoins);
};
GameScene.prototype.addXpBar = function() {
    xpBar.width += 20;
    if (xpBar.width >= 800) { xpBar.width = 0; this.levelUp(); }
};
GameScene.prototype.levelUp = function() {
    isPaused = true; this.physics.pause();
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setScrollFactor(0).setDepth(200);
    let title = this.add.text(400, 100, 'УЛУЧШЕНИЕ', { fontSize: '40px', fill: '#00ffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    let btn = this.add.text(400, 300, 'КЛИКНИ, ЧТОБЫ ПРОДОЛЖИТЬ', { fontSize: '30px', fill: '#fff', backgroundColor: '#333', padding: {x:20, y:10} }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(200);
    btn.on('pointerdown', () => { overlay.destroy(); title.destroy(); btn.destroy(); isPaused = false; this.physics.resume(); });
};
GameScene.prototype.onHit = function(p, e) {
    if (gameOver) return;
    playerHealth--; hearts[playerHealth].setTint(0x000000);
    p.setTint(0xff0000);
    if (playerHealth <= 0) {
        gameOver = true; this.physics.pause();
        this.add.text(400, 300, 'ИГРА ОКОНЧЕНА', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    }
};
