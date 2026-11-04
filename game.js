// 1. Инициализация VK Bridge
if (typeof vkBridge !== 'undefined') {
    vkBridge.send("VKWebAppInit", {})
        .then(() => console.log("✅ VK Bridge готов!"))
        .catch(err => console.error("❌ Ошибка VK Bridge:", err));
}

// 2. Настройка игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#2d2d2d',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Переменные игры
let snake;
let direction;
let apple;
let score = 0;
let scoreText;
let moveTimer = 0;
let moveInterval = 150; 
let isGameOver = false; // Флаг для окончания игры

// 3. Генерация текстур
function preload() {
    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0x00ff00, 1); // Зелёный
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('head', 20, 20);
    graphics.generateTexture('body', 20, 20);
    
    graphics.fillStyle(0xff0000, 1); // Красный
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('apple', 20, 20);
}

// 4. Создание объектов
function create() {
    snake = [];
    snake.push(this.add.image(400, 300, 'head'));
    direction = 'RIGHT';
    isGameOver = false;
    score = 0;

    apple = this.add.image(100, 100, 'apple');
    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '24px', fill: '#fff' });

    // Управление стрелками
    this.input.keyboard.on('keydown-UP', () => { if (direction !== 'DOWN') direction = 'UP'; });
    this.input.keyboard.on('keydown-DOWN', () => { if (direction !== 'UP') direction = 'DOWN'; });
    this.input.keyboard.on('keydown-LEFT', () => { if (direction !== 'RIGHT') direction = 'LEFT'; });
    this.input.keyboard.on('keydown-RIGHT', () => { if (direction !== 'LEFT') direction = 'RIGHT'; });
}

// 5. Игровой цикл
function update(time, delta) {
    if (isGameOver) return; // Если игра окончена, ничего не двигаем

    moveTimer += delta;
    if (moveTimer > moveInterval) {
        moveTimer = 0;
        moveSnake.call(this);
    }
}

// 6. Движение змейки
function moveSnake() {
    let head = snake[0];
    let newX = head.x;
    let newY = head.y;

    if (direction === 'UP') newY -= 20;
    if (direction === 'DOWN') newY += 20;
    if (direction === 'LEFT') newX -= 20;
    if (direction === 'RIGHT') newX += 20;

    // --- ПРОВЕРКА СТЕН ---
    if (newX < 0 || newX >= 800 || newY < 0 || newY >= 600) {
        gameOver.call(this);
        return;
    }

    // --- ДВИЖЕНИЕ ТЕЛА ---
    // Перемещаем хвост в начало (это создает эффект ползущей змеи)
    let tail = snake.pop();
    tail.x = newX;
    tail.y = newY;
    
    // Проверяем, съела ли змея яблоко
    if (tail.x === apple.x && tail.y === apple.y) {
        // Съели яблоко: возвращаем хвост на место (змейка растет) и добавляем его обратно в конец
        let newSegment = this.add.image(head.x, head.y, 'body');
        snake.push(newSegment);
        
        // Хвост (который мы только что двигали) встает на место головы
        snake.unshift(tail); 

        score += 10;
        scoreText.setText('Score: ' + score);

        // Новое положение яблока
        let gridX = Phaser.Math.Between(0, 39) * 20;
        let gridY = Phaser.Math.Between(0, 29) * 20;
        apple.setPosition(gridX, gridY);
    } else {
        // Не съели: просто ставим хвост на место головы
        snake.unshift(tail);
    }
}

// 7. Функция окончания игры
function gameOver() {
    isGameOver = true;
    this.add.text(250, 250, 'GAME OVER', { fontSize: '48px', fill: '#ff0000' });
    this.add.text(280, 320, 'Нажмите F5, чтобы начать заново', { fontSize: '20px', fill: '#fff' });
}
