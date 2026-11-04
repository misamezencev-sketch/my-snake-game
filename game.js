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
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);

// --- МЕНЮ ---
function MenuScene() {
    Phaser.Scene.call(this, { key: 'MenuScene' });
}
MenuScene.prototype = Object.create(Phaser.Scene.prototype);
MenuScene.prototype.constructor = MenuScene;

MenuScene.prototype.create = function() {
    this.add.text(400, 200, 'КОСМИЧЕСКИЙ ВЫЖИВШИЙ', { fontSize: '40px', fill: '#00ffff' }).setOrigin(0.5);
    
    let btn = this.add.rectangle(400, 400, 300, 80, 0x113355).setStrokeStyle(3, 0x00ffff).setInteractive();
    this.add.text(400, 400, 'ИГРАТЬ', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
    
    btn.on('pointerdown', () => {
        console.log("Кнопка нажата, переключаем сцену...");
        this.scene.start('GameScene');
    });
};

// --- ИГРА ---
function GameScene() {
    Phaser.Scene.call(this, { key: 'GameScene' });
}
GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

let player, enemies, bullets;
let gameTime = 0;

GameScene.prototype.create = function() {
    console.log("Сцена игры запущена!");
    
    // Простой фон
    this.cameras.main.setBackgroundColor('#050510');

    // Игрок
    player = this.physics.add.sprite(400, 300, null).setDisplaySize(30, 30);
    player.setTint(0x00ffff); // Синий кубик
    player.setCollideWorldBounds(true);

    // Враги
    enemies = this.physics.add.group();

    // Пули
    bullets = this.physics.add.group();

    // Управление
    this.cursors = this.input.keyboard.createCursorKeys();
};

GameScene.prototype.update = function(time, delta) {
    gameTime += delta;

    // Движение (простое)
    if (this.cursors.left.isDown) player.setVelocityX(-200);
    else if (this.cursors.right.isDown) player.setVelocityX(200);
    else player.setVelocityX(0);

    if (this.cursors.up.isDown) player.setVelocityY(-200);
    else if (this.cursors.down.isDown) player.setVelocityY(200);
    else player.setVelocityY(0);

    // Спавн врагов каждую секунду
    if (Math.floor(gameTime / 1000) > Math.floor((gameTime - delta) / 1000)) {
        let x = Math.random() > 0.5 ? 0 : 800;
        let y = Math.random() > 0.5 ? 0 : 600;
        let enemy = enemies.create(x, y, null).setDisplaySize(30, 30);
        enemy.setTint(0xff0000); // Красный кубик
        this.physics.moveToObject(enemy, player, 100); // Летит к игроку
    }
};
