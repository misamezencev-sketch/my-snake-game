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
    this.load.spritesheet('tiles', 'beach.png', { frameWidth: 128, frameHeight: 128 });
};

BeachScene.prototype.create = function() {
    let tileSize = 128;
    let startX = 0; 
    let startY = 0; 

    // УВЕЛИЧИЛИ КАРТУ: 12 тайлов в ширину (1536 пикс) и 8 в высоту (1024 пикс)
    let cols = 12;
    let rows = 8; 

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let tileIndex = 20; // Песок
            let flipY = false; 

            // Верхняя половина карты (y < 4) - Песок
            if (y < 4) {
                tileIndex = 20; 
            }
            // Линия перехода (y === 4) - Пена
            else if (y === 4) {
                // Пробуем тайл 10 (должен быть ровным)
                tileIndex = 10; 
                // Если он смотрит не туда, мы попробуем 11 или 18. 
                // Если пена должна смотреть вниз, а она смотрит вверх, оставляем flipY = true.
                flipY = true; 
            }
            // Нижняя часть (y > 4) - Вода
            else {
                tileIndex = 26; 
            }

            let tile = this.add.image(startX + x * tileSize, startY + y * tileSize, 'tiles', tileIndex).setOrigin(0);
            
            if (flipY) {
                tile.setFlipY(true); 
            }
        }
    }
    
    // --- УСТАНАВЛИВАЕМ ГРАНИЦЫ МИРА И КАМЕРУ ---
    this.physics.world.setBounds(0, 0, cols * tileSize, rows * tileSize);
    this.cameras.main.setBounds(0, 0, cols * tileSize, rows * tileSize);

    // Создаем невидимого игрока (пока просто точку), чтобы камера за ним следила
    let player = this.physics.add.sprite(300, 200, null); // Поставили на песок
    player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    // Включаем управление для игрока (WASD)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // Чтобы игрок был виден, нарисуем на нем кружок (временно)
    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player_dot', 32, 32);
    player.setTexture('player_dot');

    this.add.text(400, 550, 'ИСПОЛЬЗУЙ WASD ДЛЯ ДВИЖЕНИЯ', { 
        fontFamily: 'Arial', fontSize: '20px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5).setScrollFactor(0); // setScrollFactor(0) оставляет текст на месте
};

BeachScene.prototype.update = function() {
    // Простое движение "игрока", чтобы камера ездила
    let speed = 300;
    if (this.cursors.left.isDown || this.keys.A.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown || this.keys.D.isDown) this.player.setVelocityX(speed);
    else this.player.setVelocityX(0);

    if (this.cursors.up.isDown || this.keys.W.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown || this.keys.S.isDown) this.player.setVelocityY(speed);
    else this.player.setVelocityY(0);
};
