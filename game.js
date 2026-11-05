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
const pixelFont = { fontFamily: '"Press Start 2P"', fontSize: '16px', fill: '#ffffff' };
let highScore = 0;

// --- СЦЕНА ЗАГРУЗКИ ---
function BootScene() { Phaser.Scene.call(this, { key: 'BootScene' }); }
BootScene.prototype = Object.create(Phaser.Scene.prototype);
BootScene.prototype.constructor = BootScene;
BootScene.prototype.create = function() {
    let g = this.make.graphics({x: 0, y: 0, add: false});
    let p = 4;

    // 1. ДРОН (Треугольник с двигателем)
    g.clear();
    g.fillStyle(0xffffff, 1); // Корпус
    g.fillTriangle(16, 0, 32, 32, 0, 32); 
    g.fillStyle(0x00ffff, 1); // Кабина
    g.fillTriangle(16, 10, 22, 24, 10, 24);
    g.fillStyle(0xff8800, 1); // Двигатель (огонь)
    g.fillRect(12, 32, 8, 8);
    g.generateTexture('drone', 32, 40);

    // 2. АСТЕРОИД (Серый камень)
    g.clear();
    g.fillStyle(0x666666, 1); g.fillCircle(24, 24, 22);
    g.fillStyle(0x444444, 1); g.fillCircle(15, 15, 6); g.fillCircle(30, 25, 8);
    g.generateTexture('asteroid', 48, 48);

    // 3. СТАНЦИЯ (Зеленый квадрат с огоньком)
    g.clear();
    g.fillStyle(0x00ff00, 1); g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x004400, 1); g.fillRect(10, 10, 44, 44); // Внутренняя часть
    g.fillStyle(0xffff00, 1); g.fillCircle(32, 32, 8); // Мигающий огонь
    g.generateTexture('station', 64, 64);

    // 4. ФОН (Космос)
    g.clear();
    g.fillStyle(0x050510, 1); g.fillRect(0, 0, 800, 600);
    for(let i=0; i<200; i++) { g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.8)); g.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), Phaser.Math.Between(1, 2)); }
    g.generateTexture('bg', 800, 600); 
    g.destroy();

    this.scene.start('MenuScene');
};

// --- МЕНЮ ---
function MenuScene() { Phaser.Scene.call(this, { key: 'MenuScene' }); }
MenuScene.prototype = Object.create(Phaser.Scene.prototype);
MenuScene.prototype.constructor = MenuScene;
MenuScene.prototype.create = function() {
    this.add.image(400, 300, 'bg');
    this.add.sprite(400, 200, 'drone').setScale(3);
    
    this.add.text(400, 100, 'КОСМИЧЕСКИЙ КУРЬЕР', { ...pixelFont, fontSize: '28px', fill: '#00ffff', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);
    this.add.text(400, 300, 'ДОСТАВЛЕНО ГРУЗОВ: ' + highScore, { ...pixelFont, fontSize: '18px', fill: '#ffff00' }).setOrigin(0.5);

    let playBtn = this.add.rectangle(400, 400, 300, 60, 0x113355).setStrokeStyle(3, 0x00ffff).setInteractive();
    this.add.text(400, 400, 'СТАРТ', { ...pixelFont, fontSize: '24px' }).setOrigin(0.5);
    playBtn.on('pointerover', () => playBtn.setFillStyle(0x225588));
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x113355));
    playBtn.on('pointerdown', () => this.scene.start('GameScene'));

    this.add.text(400, 500, 'WASD - Вращение | Стрелки - Тяга', { ...pixelFont, fontSize: '12px', fill: '#aaa' }).setOrigin(0.5);
};

// --- ИГРА ---
function GameScene() { Phaser.Scene.call(this, { key: 'GameScene' }); }
GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

let drone, asteroids, station;
let cursors, keys;
let score = 0;
let scoreText, speedText;
let gameOver = false;
let currentSpeed = 0;
let maxSpeed = 400;
let rotationSpeed = 0.05;

GameScene.prototype.create = function() {
    gameOver = false; score = 0; currentSpeed = 0;
    
    this.add.image(400, 300, 'bg');
    this.physics.world.setBounds(0, 0, 800, 600);

    // Дрон
    drone = this.physics.add.sprite(400, 300, 'drone');
    drone.setCollideWorldBounds(true);
    drone.body.setCircle(16, 0, 0); 
    drone.setAngularVelocity(0);

    // Астероиды (группа)
    asteroids = this.physics.add.group();
    for(let i=0; i<5; i++) {
        let x = Phaser.Math.Between(100, 700);
        let y = Phaser.Math.Between(100, 500);
        let ast = asteroids.create(x, y, 'asteroid');
        ast.setCircle(24, 0, 0);
        ast.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
        ast.setBounce(1, 1);
        ast.setCollideWorldBounds(true);
    }

    // Станция (цель)
    station = this.physics.add.staticImage(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500), 'station');
    station.setScale(1.5);

    // Интерфейс
    scoreText = this.add.text(20, 20, 'ГРУЗЫ: 0', { ...pixelFont, fontSize: '20px', fill: '#fff' }).setScrollFactor(0);
    speedText = this.add.text(780, 20, 'СКОРОСТЬ: 0', { ...pixelFont, fontSize: '16px', fill: '#00ffff' }).setOrigin(1, 0).setScrollFactor(0);

    // Управление
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D');

    // Коллизии
    this.physics.add.collider(drone, asteroids, hitAsteroid, null, this);
    this.physics.add.overlap(drone, station, reachStation, null, this);
};

GameScene.prototype.update = function(time, delta) {
    if (gameOver) return;

    // Вращение (WASD)
    if (keys.A.isDown || cursors.left.isDown) drone.rotation -= rotationSpeed;
    if (keys.D.isDown || cursors.right.isDown) drone.rotation += rotationSpeed;

    // Тяга (Стрелки)
    if (keys.W.isDown || cursors.up.isDown) {
        currentSpeed = Math.min(currentSpeed + 5, maxSpeed);
    } else if (keys.S.isDown || cursors.down.isDown) {
        currentSpeed = Math.max(currentSpeed - 5, 0);
    } else {
        currentSpeed = Math.max(currentSpeed - 2, 0); // Инерция
    }

    // Движение дрона
    this.physics.velocityFromRotation(drone.rotation - Math.PI/2, currentSpeed, drone.body.velocity);
    
    speedText.setText('СКОРОСТЬ: ' + Math.floor(currentSpeed));

    // Если вылетел за экран (для бесконечности можно телепортировать, но пока не будем)
    if (drone.x < -50 || drone.x > 850 || drone.y < -50 || drone.y > 650) {
        resetDrone();
    }
};

function hitAsteroid(drone, asteroid) {
    if (gameOver) return;
    gameOver = true;
    this.physics.pause();
    drone.setTint(0xff0000);
    
    if (score > highScore) highScore = score;

    this.add.text(400, 250, 'КРУШЕНИЕ!', { ...pixelFont, fontSize: '40px', fill: '#ff0000', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    let restartBtn = this.add.text(400, 350, 'ЗАНОВО', { ...pixelFont, fontSize: '20px', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(200);
    restartBtn.on('pointerdown', () => this.scene.start('MenuScene'));
}

function reachStation(drone, station) {
    if (gameOver) return;
    score++;
    scoreText.setText('ГРУЗЫ: ' + score);
    
    // Перемещаем станцию в новое место
    station.setPosition(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500));
    
    // Добавляем новый астероид для сложности
    let ast = asteroids.create(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500), 'asteroid');
    ast.setCircle(24, 0, 0);
    ast.setVelocity(Phaser.Math.Between(-60, 60), Phaser.Math.Between(-60, 60));
    ast.setBounce(1, 1);
    ast.setCollideWorldBounds(true);
}

function resetDrone() {
    drone.setPosition(400, 300);
    drone.rotation = 0;
    currentSpeed = 0;
    this.physics.pause();
    this.time.delayedCall(500, () => { this.physics.resume(); });
}
