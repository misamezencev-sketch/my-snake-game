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
    // Загружаем тайлсет. 32x32 - скорее всего, правильный размер для этого набора.
    // Если тайлы смещены, попробуй поменять на 64.
    this.load.spritesheet('tiles', 'beach.png', { frameWidth: 32, frameHeight: 32 });
};

BeachScene.prototype.create = function() {
    // Наш "пляж" будет сеткой 15x10 тайлов (15*32 = 480 пикселей в ширину, 10*32 = 320 в высоту)
    // Чтобы заполнить экран 800x600, мы растянем их. Но для теста хватит и этого.
    
    let tileSize = 32;
    let offsetX = 160; // Чтобы пляж был по центру
    let offsetY = 100;

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 15; x++) {
            
            let tileIndex = 0; // По умолчанию - пустой тайл
            
            // Верхняя половина (y < 5) - это песок
            if (y < 5) {
                // Берем тайл песка (например, индекс 0 или 1, если он есть в наборе)
                // В твоем наборе верхний левый угол - это песок.
                tileIndex = 0; 
            } 
            // Нижняя половина (y >= 5) - это вода
            else {
                // Берем тайл воды (например, индекс 4, если считать слева направо)
                // Я ставлю 4, но тебе, возможно, придется подобрать другой номер.
                tileIndex = 4; 
            }

            // Ставим тайл
            let tile = this.add.image(offsetX + x * tileSize, offsetY + y * tileSize, 'tiles', tileIndex);
            tile.setOrigin(0);
        }
    }
    
    this.add.text(400, 550, 'ЭТО УЖЕ ПОХОЖЕ НА ПЛЯЖ!', { 
        fontFamily: 'Arial', fontSize: '20px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5);
};
