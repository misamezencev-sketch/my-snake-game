const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#87CEEB', // Небо
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BeachScene]
};

const game = new Phaser.Game(config);

function BeachScene() { Phaser.Scene.call(this, { key: 'BeachScene' }); }
BeachScene.prototype = Object.create(Phaser.Scene.prototype);
BeachScene.prototype.constructor = BeachScene;

BeachScene.prototype.preload = function() {
    // Размер 128 подтвержден
    this.load.spritesheet('tiles', 'beach.png', { frameWidth: 128, frameHeight: 128 });
};

BeachScene.prototype.create = function() {
    let tileSize = 128;
    let startX = 64; // Отступ слева
    let startY = 0;  // Начинаем с самого верха

    // У нас 800 пикселей в ширину. Один тайл 128. Значит, влезет 6 тайлов (6*128 = 768). 
    // Остаток 32 пикселя оставим как отступ.
    
    let cols = 6;
    let rows = 4; // 4 ряда по 128 = 512 пикселей в высоту. Остальное будет небо.

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let tileIndex = 20; // По умолчанию - чистый песок

            // 1. Верхний ряд (y=0) - Чистый песок
            if (y === 0) {
                tileIndex = 20; 
            }
            // 2. Второй ряд (y=1) - Переход (Пена)
            else if (y === 1) {
                // Берем тайл с пеной, который ровный (например, 3)
                tileIndex = 3; 
            }
            // 3. Третий ряд (y=2) - Еще немного пены (чтобы волна была толще)
            else if (y === 2) {
                // Берем тайл с водой и пеной (например, 12)
                tileIndex = 12; 
            }
            // 4. Четвертый ряд (y=3) - Чистая вода
            else {
                tileIndex = 26; 
            }

            // Добавляем тайл на сцену
            this.add.image(startX + x * tileSize, startY + y * tileSize, 'tiles', tileIndex).setOrigin(0);
        }
    }
    
    // Добавим красивую надпись на "небе"
    this.add.text(400, 550, 'БЕРЕГ ГОТОВ! ТЕПЕРЬ ДОБАВИМ ПИРС', { 
        fontFamily: 'Arial', fontSize: '24px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5);
};
