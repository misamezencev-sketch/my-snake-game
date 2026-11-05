const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BeachScene]
};

const game = new Phaser.Game(config);

function BeachScene() { Phaser.Scene.call(this, { key: 'BeachScene' }); }
BeachScene.prototype = Object.create(Phaser.Scene.prototype);
BeachScene.prototype.constructor = BeachScene;

BeachScene.prototype.preload = function() {
    // Нарезаем твой тайлсет. Предположим, что тайл 32x32 (если съедет, попробуй 16)
    this.load.spritesheet('tiles', 'beach.png', { frameWidth: 32, frameHeight: 32 });
};

BeachScene.prototype.create = function() {
    let tileSize = 48; // Размер для отрисовки на экране (чтобы было видно)
    let cols = 10; // 10 тайлов в ряд
    
    // Выводим первые 60 тайлов (6 рядов по 10)
    for (let i = 0; i < 60; i++) {
        let x = (i % cols) * tileSize + 50;
        let y = Math.floor(i / cols) * tileSize + 50;
        
        // Выводим тайл
        this.add.image(x, y, 'tiles', i).setOrigin(0);
        
        // Пишем его номер сверху
        this.add.text(x + 5, y + 5, i.toString(), { 
            fontFamily: 'Arial', fontSize: '14px', fill: '#ff0000', backgroundColor: '#ffffff' 
        }).setOrigin(0);
    }
    
    this.add.text(400, 550, 'НАЙДИ НОМЕРА ПЕСКА И ВОДЫ', { 
        fontFamily: 'Arial', fontSize: '20px', fill: '#fff', backgroundColor: '#000' 
    }).setOrigin(0.5);
};
