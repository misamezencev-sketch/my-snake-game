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
    // Размер 128, как мы выяснили
    this.load.spritesheet('tiles', 'beach.png', { frameWidth: 128, frameHeight: 128 });
};

BeachScene.prototype.create = function() {
    // Выведем первые 30 тайлов сеткой
    let tileSize = 64; // Рисуем их поменьше (64), чтобы влезло больше
    let cols = 8; // 8 тайлов в ряд
    
    for (let i = 0; i < 30; i++) {
        let x = (i % cols) * (tileSize + 10) + 50;
        let y = Math.floor(i / cols) * (tileSize + 10) + 50;
        
        // Выводим тайл (уменьшенный)
        let t = this.add.image(x, y, 'tiles', i).setOrigin(0);
        t.setDisplaySize(tileSize, tileSize); // Уменьшаем до 64x64 для отображения
        
        // Пишем номер сверху
        this.add.text(x + 2, y + 2, i.toString(), { 
            fontFamily: 'Arial', fontSize: '16px', fill: '#ff0000', backgroundColor: '#ffffff' 
        }).setOrigin(0);
    }
    
    this.add.text(400, 560, 'СКАЖИ НОМЕРА: ПЕСОК, ПЕНА, ВОДА', { 
        fontFamily: 'Arial', fontSize: '20px', fill: '#fff', backgroundColor: '#000' 
    }).setOrigin(0.5);
};
