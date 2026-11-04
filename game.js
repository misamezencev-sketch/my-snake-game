// 1. Инициализация VK Bridge
if (typeof vkBridge !== 'undefined') {
    vkBridge.send("VKWebAppInit", {})
        .then(() => console.log("✅ VK Bridge готов!"))
        .catch(err => console.error("❌ Ошибка VK Bridge:", err));
}

let highScore = 0;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#2d2d2d',
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

MenuScene.prototype.preload = function() {
    // Убедись, что файл называется bg.png и лежит в корне репозитория
    this.load.image('menu_bg', 'bg.png'); 
};

MenuScene.prototype.create = function() {
    // Добавляем картинку меню
    this.add.image(400, 300, 'menu_bg').setDisplaySize(800, 600);
    
    // Оставляем надпись с рекордом (в левом верхнем углу)
    this.add.text(20, 20, 'Рекорд: ' + highScore, { 
        fontSize: '32px', fill: '#ffffff', stroke: '#000000', strokeThickness: 4
    });

    // --- НЕВИДИМАЯ КНОПКА ПОВЕРХ НАДПИСИ START ---
    // Координаты (400, 520) и размер (200x80) подобраны под твою картинку.
    // Если кнопка не нажимается, поменяй Y (сейчас 520) в большую или меньшую сторону.
    let startButton = this.add.rectangle(400, 520, 200, 80, 0xffffff, 0); 
    
    startButton.setInteractive();

    startButton.on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
        startButton.setFillStyle(0xffffff, 0.2); // Легкая подсветка при наведении
    });
    
    startButton.on('pointerout', () => {
        this.input.setDefaultCursor('default');
        startButton.setFillStyle(0xffffff, 0);
    });

    startButton.on('pointerdown', () => {
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

let snake;
let direction;
let apple;
let score = 0;
let scoreText;
let moveTimer = 0;
let moveInterval = 150; 
let isGameOver = false;

GameScene.prototype.preload = function() {
    // Загружаем спрайт-лист. Размер клетки 64x64.
    this.load.spritesheet('snake_sprites', 'textures.png', { frameWidth: 64, frameHeight: 64 });
};

GameScene.prototype.create = function() {
    snake = [];
    direction = 'RIGHT';
    isGameOver = false;
    score = 0;
    moveTimer = 0;

    // Создаем голову змейки (картинка 0) и уменьшаем её
    let startSprite = this.add.image(400, 300, 'snake_sprites', 0);
    startSprite.setScale(0.3); 
    snake.push(startSprite);

    // Создаем яблоко (картинка 4) и уменьшаем его
    apple = this.add.image(100, 100, 'snake_sprites', 4);
    apple.setScale(0.3);

    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '24px', fill: '#fff' });

    this.input.keyboard.on('keydown-UP', () => { if (direction !== 'DOWN') direction = 'UP'; });
    this.input.keyboard.on('keydown-DOWN', () => { if (direction !== 'UP') direction = 'DOWN'; });
    this.input.keyboard.on('keydown-LEFT', () => { if (direction !== 'RIGHT') direction = 'LEFT'; });
    this.input.keyboard.on('keydown-RIGHT', () => { if (direction !== 'LEFT') direction = 'RIGHT'; });
};

GameScene.prototype.update = function(time, delta) {
    if (isGameOver) return; 

    moveTimer += delta;
    if (moveTimer > moveInterval) {
        moveTimer = 0;
        this.moveSnake();
    }
};

GameScene.prototype.moveSnake = function() {
    let head = snake[0];
    let newX = head.x;
    let newY = head.y;

    // Шаг движения 20 пикселей
    if (direction === 'UP') newY -= 20;
    if (direction === 'DOWN') newY += 20;
    if (direction === 'LEFT') newX -= 20;
    if (direction === 'RIGHT') newX += 20;

    // Проверка стен
    if (newX < 0 || newX >= 800 || newY < 0 || newY >= 600) {
        this.gameOver();
        return;
    }

    let tail = snake.pop();
    tail.x = newX;
    tail.y = newY;
    
    // Проверка съедания яблока
    if (tail.x === apple.x && tail.y === apple.y) {
        // Добавляем тело (картинка 1) и уменьшаем его
        let newSegment = this.add.image(head.x, head.y, 'snake_sprites', 1); 
        newSegment.setScale(0.3); 
        snake.push(newSegment);
        snake.unshift(tail); 

        score += 10;
        scoreText.setText('Score: ' + score);
        if (score > highScore) highScore = score;

        let gridX = Phaser.Math.Between(0, 39) * 20;
        let gridY = Phaser.Math.Between(0, 29) * 20;
        apple.setPosition(gridX, gridY);
    } else {
        snake.unshift(tail);
    }
};

GameScene.prototype.gameOver = function() {
    isGameOver = true;
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.add.text(400, 200, 'GAME OVER', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5);
    
    let restartButton = this.add.text(400, 400, 'ИГРАТЬ СНОВА', { 
        fontSize: '40px', fill: '#ffffff', backgroundColor: '#000000', padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerover', () => restartButton.setStyle({ fill: '#00ff00' }));
    restartButton.on('pointerout', () => restartButton.setStyle({ fill: '#ffffff' }));
    restartButton.on('pointerdown', () => {
        this.scene.start('MenuScene');
    });
};
