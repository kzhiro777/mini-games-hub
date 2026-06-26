class BlockBreakerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BlockBreakerScene' });
    }

    init() {
        this.score = 0;
        this.ballsLost = 0;
        this.blocksDestroyed = 0;
        this.gameOver = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Physics groups
        this.blocks = this.physics.add.staticGroup();
        this.balls = this.physics.add.group();

        // Paddle
        this.paddle = this.physics.add.image(width / 2, height - 30, null);
        this.paddle.displayWidth = 100;
        this.paddle.displayHeight = 20;
        this.paddle.setCollideWorldBounds(true);
        this.paddle.setImmovable(true);
        this.paddle.setFillStyle(0x00ff00);

        // Create blocks
        this.createBlocks();

        // Ball
        this.createBall(width / 2, height - 80);

        // UI
        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.ballsText = this.add.text(20, 50, `Balls Lost: ${this.ballsLost}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.blocksText = this.add.text(width - 200, 20, `Blocks: ${this.blocks.children.entries.length}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        // Menu button
        this.createMenuButton(width - 100, height - 30);

        // Input
        this.input.on('pointermove', (pointer) => {
            this.paddle.x = Phaser.Math.Clamp(pointer.x, this.paddle.displayWidth / 2, width - this.paddle.displayWidth / 2);
        });

        // Collisions
        this.physics.add.collider(this.balls, this.blocks, this.hitBlock, null, this);
        this.physics.add.collider(this.balls, this.paddle, this.hitPaddle, null, this);
    }

    createBlocks() {
        const blockWidth = 60;
        const blockHeight = 20;
        const cols = 10;
        const rows = 4;
        const startX = 40;
        const startY = 40;
        const colors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (blockWidth + 10);
                const y = startY + row * (blockHeight + 10);
                const block = this.blocks.create(x, y, null);
                block.displayWidth = blockWidth;
                block.displayHeight = blockHeight;
                block.setFillStyle(colors[row]);
                block.health = rows - row;
            }
        }
    }

    createBall(x, y) {
        const ball = this.balls.create(x, y, null);
        ball.displayWidth = 10;
        ball.displayHeight = 10;
        ball.setFillStyle(0xffffff);
        ball.setBounce(1, 1);
        ball.setCollideWorldBounds(true);
        ball.setVelocity(Phaser.Math.Between(-300, 300), -300);
    }

    hitBlock(ball, block) {
        block.health--;
        if (block.health <= 0) {
            block.destroy();
            this.score += 10;
            this.blocksDestroyed++;
            this.scoreText.setText(`Score: ${this.score}`);
            this.blocksText.setText(`Blocks: ${this.blocks.children.entries.length}`);
        } else {
            block.setFillStyle(Phaser.Display.Color.ValueToColor(block.fillColor).darken(20).color);
        }

        // Bounce
        if (Math.abs(ball.body.velocity.x) < 200) {
            ball.setVelocityX(Phaser.Math.Between(-300, 300));
        }
    }

    hitPaddle(ball, paddle) {
        const diff = ball.x - paddle.x;
        ball.setVelocityX(diff * 8);
    }

    createMenuButton(x, y) {
        const button = this.add.rectangle(x, y, 80, 30, 0xffffff);
        button.setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, 'Menu', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
            StorageManager.saveScore('blockBreaker', this.score);
            this.scene.start('MenuScene');
        });
    }

    update() {
        // Check if ball is lost
        if (!this.gameOver && this.balls.children.entries.length > 0) {
            const ball = this.balls.children.entries[0];
            if (ball.y > 600) {
                ball.destroy();
                this.ballsLost++;
                this.ballsText.setText(`Balls Lost: ${this.ballsLost}`);

                if (this.ballsLost >= 3) {
                    this.gameOver = true;
                    StorageManager.saveScore('blockBreaker', this.score);
                    this.add.text(400, 300, 'Game Over!', {
                        fontSize: '48px',
                        fontStyle: 'bold',
                        color: '#ff0000',
                        align: 'center'
                    }).setOrigin(0.5);
                    this.time.delayedCall(2000, () => this.scene.start('MenuScene'));
                } else if (this.blocks.children.entries.length === 0) {
                    this.gameOver = true;
                    StorageManager.saveScore('blockBreaker', this.score);
                    this.add.text(400, 300, 'You Win!', {
                        fontSize: '48px',
                        fontStyle: 'bold',
                        color: '#00ff00',
                        align: 'center'
                    }).setOrigin(0.5);
                    this.time.delayedCall(2000, () => this.scene.start('MenuScene'));
                } else {
                    this.createBall(400, 500);
                }
            }
        }
    }
}
