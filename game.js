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
    // ОГРОМНАЯ КАРТА: 20 тайлов в ширину, 15 в высоту
    let cols = 20; 
    let rows = 15; 

    // Верхняя половина (7 рядов) - это огромное поле песка
    // 8-й ряд - пена
    // Остальные - вода

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let tileIndex = 20; 
            let flipY = false; 

            if (y < 7) {
                tileIndex = 20; // Чистый песок
            } else if (y === 7) {
                tileIndex = 10; // Пена (переход)
                flipY = true; 
            } else {
                tileIndex = 26; // Вода
            }

            let tile = this.add.image(x * tileSize, y * tileSize, 'tiles', tileIndex).setOrigin(0);
            if (flipY) tile.setFlipY(true); 
        }
    }
    
    // --- НАСТРОЙКА КАМЕРЫ ---
    // Мы не даем камере летать по всей карте, а фиксируем её на центре (чтобы увидеть масштаб)
    // Но чтобы было видно, что карта большая, мы отдалим камеру (зум 0.5)
    this.cameras.main.setZoom(0.5); 
    
    // Ставим камеру в центр карты (20*128/2 = 1280, 15*128/2 = 960)
    this.cameras.main.centerOn(1280, 960);

    this.add.text(400, 550, 'ОГРОМНЫЙ ПЛЯЖ ДЛЯ ДОМА И ПИРСА', { 
        fontFamily: 'Arial', fontSize: '24px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5).setScrollFactor(0); // Текст остается на экране
};
