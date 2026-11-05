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
    // Загружаем тайлы карты
    this.load.spritesheet('tiles', 'assets/beach.png', { frameWidth: 128, frameHeight: 128 });
    // Загружаем персонажа. Размер кадра 64x64 (если съедет - попробуй 128 или 32)
    this.load.spritesheet('player_sheet', 'assets/player.png', { frameWidth: 64, frameHeight: 64 });
};

BeachScene.prototype.create = function() {
    let tileSize = 128;
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
                tileIndex = 3;  // Пена
                flipY = true; 
            } else {
                tileIndex = 26; // Вода
            }

            let tile = this.add.image(x * tileSize, y * tileSize, 'tiles', tileIndex).setOrigin(0);
            if (flipY) tile.setFlipY(true); 
        }
    }

    // 2. Создаем анимации для персонажа
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player_sheet', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player_sheet', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    // 3. Создаем игрока
    this.player = this.physics.add.sprite(400, 400, 'player_sheet');
    this.player.setScale(1.5); // Увеличиваем масштаб (можно поменять)
    this.player.setCollideWorldBounds(true);
    this.player.play('idle'); // Включаем анимацию покоя

    // Делаем хитбокс меньше, чтобы он не застревал в стене
    this.player.body.setSize(30, 30);
    this.player.body.setOffset(17, 30);

    // 4. Невидимая стена у воды (чтобы нельзя было зайти)
    this.wall = this.add.rectangle(1280, 1010, 2560, 32, 0xff0000, 0); 
    this.physics.add.existing(this.wall, true); 
    this.physics.add.collider(this.player, this.wall);

    // 5. Границы мира и камера
    this.physics.world.setBounds(0, 0, cols * tileSize, rows * tileSize);
    this.cameras.main.setBounds(0, 0, cols * tileSize, rows * tileSize);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(0.7); // Отдаляем камеру

    // 6. Управление
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // 7. Подсказка
    this.add.text(400, 550, 'WASD - ДВИЖЕНИЕ', { 
        fontFamily: 'Arial', fontSize: '24px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5).setScrollFactor(0);
};

BeachScene.prototype.update = function() {
    if (!this.player) return;
    let speed = 300;
    this.player.setVelocity(0);
    let isMoving = false;

    // Движение и поворот
    if (this.cursors.left.isDown || this.keys.A.isDown) { 
        this.player.setVelocityX(-speed); 
        this.player.setFlipX(true); 
        isMoving = true; 
    }
    if (this.cursors.right.isDown || this.keys.D.isDown) { 
        this.player.setVelocityX(speed); 
        this.player.setFlipX(false); 
        isMoving = true; 
    }
    if (this.cursors.up.isDown || this.keys.W.isDown) { 
        this.player.setVelocityY(-speed); 
        isMoving = true; 
    }
    if (this.cursors.down.isDown || this.keys.S.isDown) { 
        this.player.setVelocityY(speed); 
        isMoving = true; 
    }

    // Переключение анимаций
    if (isMoving) {
        if (this.player.anims.currentAnim.key !== 'walk') this.player.play('walk');
    } else {
        if (this.player.anims.currentAnim.key !== 'idle') this.player.play('idle');
    }
};
