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
    // УВЕЛИЧИЛИ РАЗМЕР ДО 128! 
    // Если не сработает, попробуй 64.
    this.load.spritesheet('tiles', 'beach.png', { frameWidth: 128, frameHeight: 128 });
};

BeachScene.prototype.create = function() {
    // Мы не будем растягивать на весь экран, а сделаем красивый уголок пляжа
    // 4 тайла в ширину и 3 в высоту (4*128 = 512, 3*128 = 384)
    let startX = 150;
    let startY = 100;
    let tileSize = 128;

    // Ручная расстановка тайлов для красивого берега:
    // Сверху - чистый песок, посередине - пена (переход), снизу - чистая вода.
    
    // 1. Верхний ряд (Песок). 
    // Судя по твоему файлу, чистый песок - это где-то в нижней части картинки (индексы 50+).
    // Пока ставим 50 (если это не он, мы подберем).
    this.add.image(startX + 0 * tileSize, startY + 0 * tileSize, 'tiles', 50).setOrigin(0);
    this.add.image(startX + 1 * tileSize, startY + 0 * tileSize, 'tiles', 50).setOrigin(0);
    this.add.image(startX + 2 * tileSize, startY + 0 * tileSize, 'tiles', 50).setOrigin(0);
    this.add.image(startX + 3 * tileSize, startY + 0 * tileSize, 'tiles', 50).setOrigin(0);

    // 2. Средний ряд (Пена/Переход).
    // Берем тайл с пеной. В твоем наборе это где-то в районе 20-30.
    this.add.image(startX + 0 * tileSize, startY + 1 * tileSize, 'tiles', 20).setOrigin(0);
    this.add.image(startX + 1 * tileSize, startY + 1 * tileSize, 'tiles', 20).setOrigin(0);
    this.add.image(startX + 2 * tileSize, startY + 1 * tileSize, 'tiles', 20).setOrigin(0);
    this.add.image(startX + 3 * tileSize, startY + 1 * tileSize, 'tiles', 20).setOrigin(0);

    // 3. Нижний ряд (Вода).
    // Чистая вода в твоем файле - это правый верхний угол (индексы 4, 5...).
    this.add.image(startX + 0 * tileSize, startY + 2 * tileSize, 'tiles', 4).setOrigin(0);
    this.add.image(startX + 1 * tileSize, startY + 2 * tileSize, 'tiles', 4).setOrigin(0);
    this.add.image(startX + 2 * tileSize, startY + 2 * tileSize, 'tiles', 4).setOrigin(0);
    this.add.image(startX + 3 * tileSize, startY + 2 * tileSize, 'tiles', 4).setOrigin(0);

    this.add.text(400, 550, 'ЭТО НАСТОЯЩИЙ ПЛЯЖ!', { 
        fontFamily: 'Arial', fontSize: '24px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5);
};
