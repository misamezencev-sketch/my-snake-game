const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#87CEEB',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
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
    // Смещаем карту чуть выше, чтобы освободить место для UI
    let startX = -128; // Начнем чуть левее, чтобы заполнить экран
    let startY = -128; 

    // Делаем карту больше: 8 тайлов в ширину и 5 в высоту (8*128 = 1024, 5*128 = 640)
    // Это больше экрана, так что будет ощущение простора.
    let cols = 8;
    let rows = 5; 

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let tileIndex = 20; // Песок по умолчанию
            let flipY = false; // Нужно ли переворачивать тайл

            // Верхние 2 ряда (y=0, y=1) - Чистый песок
            if (y < 2) {
                tileIndex = 20; 
            }
            // 3-й ряд (y=2) - Переход (Пена), но перевернутый вниз
            else if (y === 2) {
                tileIndex = 3; // Берем тайл с пеной
                flipY = true;  // ПЕРЕВОРАЧИВАЕМ его, чтобы пена смотрела вниз!
            }
            // Остальные ряды (y=3, y=4) - Чистая вода
            else {
                tileIndex = 26; 
            }

            // Добавляем тайл на сцену
            let tile = this.add.image(startX + x * tileSize, startY + y * tileSize, 'tiles', tileIndex).setOrigin(0);
            
            if (flipY) {
                tile.setFlipY(true); // Переворачиваем по вертикали
            }
        }
    }
    
    this.add.text(400, 550, 'КАРТА СТАЛА БОЛЬШЕ! ПЕНА ПРАВИЛЬНО', { 
        fontFamily: 'Arial', fontSize: '24px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5);
};
