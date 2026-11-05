const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#87CEEB',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BeachScene]
};

const game = new Phaser.Game(config);

function BeachScene() { Phaser.Scene.call(this, { key: 'BeachScene' }); }
BeachScene.prototype = Object.create(Phaser.Scene.prototype);
BeachScene.prototype.constructor = BeachScene;

BeachScene.prototype.preload = function() {
  this.load.spritesheet('tiles', 'assets/beach.png', { frameWidth: 128, frameHeight: 128 });
};

BeachScene.prototype.create = function() {
    let tileSize = 128;
    // ОГРОМНАЯ КАРТА: 20 тайлов в ширину (2560 пикс), 15 в высоту (1920 пикс)
    let cols = 20; 
    let rows = 15; 

    // 1. Рисуем карту
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let tileIndex = 20; 
            let flipY = false; 

            if (y < 7) {
                tileIndex = 20; // Песок
            } else if (y === 7) {
                // ПРОБУЕМ ТАЙЛ 3 (из первого ряда твоего набора)
                tileIndex = 3; 
                // Если он смотрит не туда, попробуй убрать flipY или поставить false
                flipY = true; 
            } else {
                tileIndex = 26; // Вода
            }

            let tile = this.add.image(x * tileSize, y * tileSize, 'tiles', tileIndex).setOrigin(0);
            if (flipY) tile.setFlipY(true); 
        }
    }

    // 2. Создаем игрока (пока это зеленый квадрат)
    let g = this.make.graphics({x: 0, y: 0, add: false});
    g.fillStyle(0x00ff00, 1); // Зеленый
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('player', 32, 32);

    this.player = this.physics.add.sprite(400, 400, 'player'); // Ставим на песок
    this.player.setCollideWorldBounds(true);

    // 3. Границы мира
    this.physics.world.setBounds(0, 0, cols * tileSize, rows * tileSize);

    // 4. Камера следит за игроком
    this.cameras.main.setBounds(0, 0, cols * tileSize, rows * tileSize);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    // Убираем зум, чтобы видеть тайлы в нормальном размере
    this.cameras.main.setZoom(1); 

    // 5. Управление
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // 6. Подсказка (закреплена на экране)
    this.add.text(400, 550, 'WASD - ДВИЖЕНИЕ', { 
        fontFamily: 'Arial', fontSize: '24px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5).setScrollFactor(0);
};

BeachScene.prototype.update = function() {
    if (!this.player) return;
    let speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.keys.A.isDown) this.player.setVelocityX(-speed);
    if (this.cursors.right.isDown || this.keys.D.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown || this.keys.W.isDown) this.player.setVelocityY(-speed);
    if (this.cursors.down.isDown || this.keys.S.isDown) this.player.setVelocityY(speed);
};
