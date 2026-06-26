class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x667eea);

        // Title
        this.add.text(width / 2, 60, 'Mini Games Hub', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Game buttons
        const games = [
            { name: 'テトリス', scene: 'TetrisScene', y: 180 },
            { name: 'ブロック崩し', scene: 'BlockBreakerScene', y: 280 },
            { name: 'アングリーバード風', scene: 'AngryBirdScene', y: 380 }
        ];

        games.forEach(game => {
            this.createGameButton(width / 2, game.y, game.name, game.scene);
        });

        // High scores
        this.displayHighScores(width / 2, 500);
    }

    createGameButton(x, y, text, sceneName) {
        const button = this.add.rectangle(x, y, 300, 60, 0xffffff);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#333333'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setFillStyle(0xffff00);
            this.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200
            });
        });

        button.on('pointerout', () => {
            button.setFillStyle(0xffffff);
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });

        button.on('pointerdown', () => {
            this.scene.start(sceneName);
        });
    }

    displayHighScores(x, y) {
        const tetrisHigh = StorageManager.getHighScore('tetris');
        const breakerHigh = StorageManager.getHighScore('blockBreaker');
        const angryHigh = StorageManager.getHighScore('angryBird');

        const scoresText = `ハイスコア\nテトリス: ${tetrisHigh} | ブロック崩し: ${breakerHigh} | アングリーバード: ${angryHigh}`;
        this.add.text(x, y, scoresText, {
            fontSize: '14px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
}