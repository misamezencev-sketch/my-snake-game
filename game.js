// 1. Инициализация VK Bridge
if (typeof vkBridge !== 'undefined') {
    vkBridge.send("VKWebAppInit", {})
        .then(() => console.log("✅ VK Bridge готов!"))
        .catch(err => console.error("❌ Ошибка VK Bridge:", err));
}

// Переменная для хранения рекорда (пока в памяти)
let highScore = 0;

// 2. Настройка игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#2d2d2d',
    scene: [MenuScene, GameScene] // Подключаем две сцены
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
    // Заголовок игры
    this.add.text(400, 150, 'ЗМЕЙКА', { 
        fontSize: '80px', 
        fill: '#00ff00',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    // Отображение рекорда
    this.add.text(400, 250, 'Рекорд: ' + highScore, { 
        fontSize: '32px', 
        fill: '#ffffff' 
    }).setOrigin(0.5);

    // Кнопка "Играть"
    let playButton = this.add.text(400, 400, 'ИГРАТЬ', { 
        fontSize: '50px', 
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 40, y: 20 }
    }).setOrigin(0.5).setInteractive();

    // Эффект при наведении
    playButton.on('pointerover', () => playButton.setStyle({ fill: '#00ff00' }));
    playButton.on('pointerout', () => playButton.setStyle({ fill: '#ffffff' }));

    // Клик по кнопке запускает игру
    playButton.on('pointerdown', () => {
        this.scene.start('GameScene');
    });
};

// ==========================================
// СЦЕНА 2: САМА ИГРА
// ==========================================
function GameScene() {
    Phaser.Scene.call(this, { key: 'GameScene' });
}

GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

// Переменные игры
let snake;
let direction;
let apple;
let score = 0;
let scoreText;
let moveTimer = 0;
let moveInterval = 150; 
let isGameOver = false;

GameScene.prototype.preload = function() {
    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0x00ff00, 1); 
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('head', 20, 20);
    graphics.generateTexture('body', 20, 20);
    
    graphics.fillStyle(0xff0000, 1); 
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('apple', 20, 20);
};

GameScene.prototype.create = function() {
    // Сбрасываем переменные при старте новой игры
    snake = [];
    snake.push(this.add.image(400, 300, 'head'));
    direction = 'RIGHT';
    isGameOver = false;
    score = 0;
    moveTimer = 0;

    apple = this.add.image(100, 100, 'apple');
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
        let newSegment = this.add.image(head.x, head.y, 'body');
        snake.push(newSegment);
        snake.unshift(tail); 

        score += 10;
        scoreText.setText('Score: ' + score);

        // Обновляем рекорд, если побит
        if (score > highScore) {
            highScore = score;
        }

        let gridX = Phaser.Math.Between(0, 39) * 20;
        let gridY = Phaser.Math.Between(0, 29) * 20;
        apple.setPosition(gridX, gridY);
    } else {
        snake.unshift(tail);
    }
};

GameScene.prototype.gameOver = function() {
    isGameOver = true;
    
    // Затемняем экран
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add.text(400, 200, 'GAME OVER', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5);
    
    // Кнопка "Играть снова"
    let restartButton = this.add.text(400, 400, 'ИГРАТЬ СНОВА', { 
        fontSize: '40px', 
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerover', () => restartButton.setStyle({ fill: '#00ff00' }));
    restartButton.on('pointerout', () => restartButton.setStyle({ fill: '#ffffff' }));

    // При клике перезапускаем игру (возвращаемся в меню)
    restartButton.on('pointerdown', () => {
        this.scene.start('MenuScene');
    });
};
