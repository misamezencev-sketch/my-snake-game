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
    // Загружаем тайлсет. Говорим, что один кусочек = 16x16 пикселей.
    this.load.spritesheet('tiles', 'beach.png', { frameWidth: 32, frameHeight: 32 });
};

BeachScene.prototype.create = function() {
    // Просто выводим первые 100 тайлов на экран в сетку (10x10), чтобы посмотреть
    let index = 0;
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            // Ставим тайл по координатам
            this.add.image(x * 48, y * 48, 'tiles', index).setOrigin(0).setScale(3); // Увеличили в 3 раза, чтобы было видно
            index++;
        }
    }
    
    this.add.text(400, 550, 'ЭТО ТАЙЛЫ. ЕСЛИ ВИДИШЬ ПЕСОК И ВОДУ - ВСЕ ОК!', { 
        fontFamily: 'Arial', fontSize: '20px', fill: '#000', backgroundColor: '#fff' 
    }).setOrigin(0.5);
};
