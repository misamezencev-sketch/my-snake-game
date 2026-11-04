// 1. Настройка игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Глобальные переменные
let player;
let bullets;
let enemies;
let xpOrbs;
let playerXp = 0;
let playerLevel = 1;
let xpToNextLevel = 100;
let xpBar;
let levelText;
let lastFired = 0;
let fireRate = 500; // Скорость стрельбы (мс)
let gameOver = false;
let isPaused = false;
let cursors;
let keys;

function preload() {
    // Здесь мы ничего не загружаем, всё рисуем кодом для теста
}

function create() {
    gameOver = false;
    isPaused = false;

    // Создаем текстуры программно
    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    
    // Игрок (Синий квадрат)
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillRect(0, 0, 30, 30);
    graphics.generateTexture('player', 30, 30);
    
    // Враг (Красный круг)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(15, 15, 15);
    graphics.generateTexture('enemy', 30, 30);
    
    // Пуля (Желтый круг)
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(5, 5, 5);
    graphics.generateTexture('bullet', 10, 10);
    
    // Опыт (Зеленый ромб)
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(10, 0, 20, 20, 0, 20);
    graphics.generateTexture('xp', 20, 20);

    // Создаем игрока
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Группы объектов
    bullets = this.physics.add.group();
    enemies = this.physics.add.group();
    xpOrbs = this.physics.add.group();

    // Управление
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D');

    // Интерфейс (Полоска опыта и уровень)
    this.add.rectangle(400, 20, 800, 40, 0x000000).setOrigin(0.5);
    xpBar = this.add.rectangle(0, 20, 0, 20, 0x00ff00).setOrigin(0, 0.5);
    levelText = this.add.text(10, 10, 'УРОВЕНЬ: 1', { fontSize: '20px', fill: '#fff', fontFamily: 'Arial' });

    // Таймеры
    this.time.addEvent({
        delay: 1000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });

    // Проверка столкновений
    this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, enemies, playerHit, null, this);
    this.physics.add.overlap(player, xpOrbs, collectXp, null, this);
}

function update(time, delta) {
    if (gameOver || isPaused) return;

    // Движение игрока
    let speed = 200;
    player.setVelocity(0);
    if (cursors.left.isDown || keys.A.isDown) player.setVelocityX(-speed);
    if (cursors.right.isDown || keys.D.isDown) player.setVelocityX(speed);
    if (cursors.up.isDown || keys.W.isDown) player.setVelocityY(-speed);
    if (cursors.down.isDown || keys.S.isDown) player.setVelocityY(speed);

    // Автоматическая стрельба
    if (time > lastFired) {
        shootAtNearestEnemy(this);
        lastFired = time + fireRate;
    }

    // Враги двигаются к игроку (логика внутри функции создания врага)
}

// Функция стрельбы
function shootAtNearestEnemy(scene) {
    if (enemies.getChildren().length === 0) return;

    let nearestEnemy = null;
    let minDistance = Infinity;

    enemies.getChildren().forEach(enemy => {
        let distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
        if (distance < minDistance) {
            minDistance = distance;
            nearestEnemy = enemy;
        }
    });

    if (nearestEnemy) {
        let bullet = bullets.create(player.x, player.y, 'bullet');
        scene.physics.moveToObject(bullet, nearestEnemy, 400); // Скорость пули
    }
}

// Создание врага
function spawnEnemy() {
    if (gameOver || isPaused) return;

    // Спавн по краям экрана
    let x = Phaser.Math.Between(0, 1) ? Phaser.Math.Between(0, 800) : (Phaser.Math.Between(0, 1) ? 0 : 800);
    let y = x === 0 || x === 800 ? Phaser.Math.Between(0, 600) : (Phaser.Math.Between(0, 1) ? 0 : 600);
    
    let enemy = enemies.create(x, y, 'enemy');
    
    // Логика преследования игрока (обновляется в update)
    enemy.update = function() {
        if (gameOver || isPaused) return;
        this.physics.moveToObject(this, player, 80); // Скорость врага
    };
}

// Столкновение пули и врага
function hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    
    // Спавн опыта
    let xp = xpOrbs.create(enemy.x, enemy.y, 'xp');
    xp.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
}

// Сбор опыта
function collectXp(player, xp) {
    xp.destroy();
    playerXp += 20;
    
    // Обновляем полоску
    let barWidth = (playerXp / xpToNextLevel) * 800;
    xpBar.width = barWidth;

    // Проверка уровня
    if (playerXp >= xpToNextLevel) {
        levelUp();
    }
}

// Столкновение игрока и врага
function playerHit(player, enemy) {
    if (gameOver) return;
    gameOver = true;
    this.physics.pause();
    player.setTint(0xff0000);
    this.add.text(400, 300, 'ИГРА ОКОНЧЕНА', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5);
}

// Повышение уровня
function levelUp() {
    isPaused = true;
    this.physics.pause();
    playerXp = 0;
    playerLevel++;
    xpToNextLevel += 50;
    xpBar.width = 0;
    levelText.setText('УРОВЕНЬ: ' + playerLevel);

    // Окно выбора
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    this.add.text(400, 100, 'ВЫБЕРИТЕ УЛУЧШЕНИЕ', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);

    // Кнопка 1: Урон
    let btn1 = this.add.text(400, 250, 'БОЛЬШЕ УРОНА', { fontSize: '30px', fill: '#fff', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
    btn1.on('pointerdown', () => {
        fireRate -= 100; // Ускоряем стрельбу
        closeLevelUp(this, [overlay, btn1, btn2, btn3, title]);
    });

    // Кнопка 2: Скорость
    let btn2 = this.add.text(400, 350, 'СКОРОСТЬ ПЕРЕДВИЖЕНИЯ', { fontSize: '30px', fill: '#fff', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
    btn2.on('pointerdown', () => {
        // Увеличиваем скорость игрока (глобальная переменная speed в update)
        closeLevelUp(this, [overlay, btn1, btn2, btn3, title]);
    });

    // Кнопка 3: Лечение
    let btn3 = this.add.text(400, 450, 'ВОССТАНОВИТЬ ЗДОРОВЬЕ', { fontSize: '30px', fill: '#fff', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
    btn3.on('pointerdown', () => {
        closeLevelUp(this, [overlay, btn1, btn2, btn3, title]);
    });
}

// Закрытие меню улучшений
function closeLevelUp(scene, elements) {
    elements.forEach(el => el.destroy());
    isPaused = false;
    scene.physics.resume();
}
