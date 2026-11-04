// Проверка работы GitHub Pages
console.log("Новый код загружен с GitHub!");

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000', // Черный фон
    scene: {
        create: function () {
            // Большой яркий текст
            this.add.text(100, 250, 'ОБНОВЛЕНИЕ РАБОТАЕТ!', { 
                fontSize: '50px', 
                fill: '#00ff00',
                fontWeight: 'bold'
            });
            
            // Маленький текст для проверки
            this.add.text(280, 320, 'Код взят с GitHub', { 
                fontSize: '20px', 
                fill: '#ffffff' 
            });
        }
    }
};

const game = new Phaser.Game(config);
