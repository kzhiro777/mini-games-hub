class TetrisScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TetrisScene' });
    }

    init() {
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropSpeed = 1000;
        this.board = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(0));
        
        const tetrominos = [
            [[1, 1, 1, 1]],
            [[1, 1], [1, 1]],
            [[0, 1, 1], [1, 1, 0]],
            [[1, 1, 0], [0, 1, 1]],
            [[1, 0, 0], [1, 1, 1]],
            [[0, 0, 1], [1, 1, 1]],
            [[0, 1, 0], [1, 1, 1]]
        ];
        
        this.tetrominos = tetrominos;
        this.colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFF8800];
        this.currentPiece = this.createNewPiece();
        this.gameOver = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Game board background
        const boardX = 50;
        const boardY = 50;
        this.add.rectangle(
            boardX + (this.GRID_WIDTH * this.BLOCK_SIZE) / 2,
            boardY + (this.GRID_HEIGHT * this.BLOCK_SIZE) / 2,
            this.GRID_WIDTH * this.BLOCK_SIZE,
            this.GRID_HEIGHT * this.BLOCK_SIZE,
            0x0f3460
        );

        this.boardX = boardX;
        this.boardY = boardY;

        // UI
        this.scoreText = this.add.text(width - 150, 60, `Score: ${this.score}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.levelText = this.add.text(width - 150, 100, `Level: ${this.level}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.linesText = this.add.text(width - 150, 140, `Lines: ${this.lines}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        // Menu button
        this.createMenuButton(width - 150, height - 40);

        // Input
        this.input.keyboard.on('keydown-LEFT', () => this.movePiece(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.movePiece(1));
        this.input.keyboard.on('keydown-DOWN', () => this.dropPiece());
        this.input.keyboard.on('keydown-UP', () => this.rotatePiece());

        // Drop timer
        this.time.addEvent({
            delay: this.dropSpeed,
            callback: () => this.dropPiece(),
            loop: true
        });

        this.graphics = this.make.graphics({ x: 0, y: 0, add: false });
        this.draw();
    }

    createNewPiece() {
        const tetrominoIndex = Phaser.Math.Between(0, this.tetrominos.length - 1);
        return {
            shape: this.tetrominos[tetrominoIndex],
            colorIndex: tetrominoIndex,
            x: Math.floor(this.GRID_WIDTH / 2) - 1,
            y: 0,
            rotation: 0
        };
    }

    movePiece(direction) {
        if (this.gameOver) return;
        this.currentPiece.x += direction;
        if (!this.isValidPosition(this.currentPiece)) {
            this.currentPiece.x -= direction;
        }
        this.draw();
    }

    dropPiece() {
        if (this.gameOver) return;
        this.currentPiece.y += 1;
        if (!this.isValidPosition(this.currentPiece)) {
            this.currentPiece.y -= 1;
            this.placePiece();
            this.checkLines();
            this.currentPiece = this.createNewPiece();
            if (!this.isValidPosition(this.currentPiece)) {
                this.endGame();
            }
        }
        this.draw();
    }

    rotatePiece() {
        if (this.gameOver) return;
        const originalRotation = this.currentPiece.rotation;
        this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;
        const rotatedShape = this.rotateShape(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotatedShape;
        
        if (!this.isValidPosition(this.currentPiece)) {
            this.currentPiece.shape = originalShape;
            this.currentPiece.rotation = originalRotation;
        }
        this.draw();
    }

    rotateShape(shape) {
        const n = shape.length;
        const m = shape[0].length;
        const rotated = Array(m).fill().map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                rotated[j][n - 1 - i] = shape[i][j];
            }
        }
        return rotated;
    }

    isValidPosition(piece) {
        const shape = piece.shape;
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] === 0) continue;
                const x = piece.x + j;
                const y = piece.y + i;
                if (x < 0 || x >= this.GRID_WIDTH || y < 0 || y >= this.GRID_HEIGHT) {
                    return false;
                }
                if (this.board[y][x] !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    placePiece() {
        const shape = this.currentPiece.shape;
        const color = this.currentPiece.colorIndex + 1;
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] !== 0) {
                    const x = this.currentPiece.x + j;
                    const y = this.currentPiece.y + i;
                    if (y >= 0) {
                        this.board[y][x] = color;
                    }
                }
            }
        }
    }

    checkLines() {
        let linesToClear = [];
        for (let i = this.GRID_HEIGHT - 1; i >= 0; i--) {
            if (this.board[i].every(cell => cell !== 0)) {
                linesToClear.push(i);
            }
        }

        if (linesToClear.length > 0) {
            this.lines += linesToClear.length;
            this.score += linesToClear.length * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropSpeed = Math.max(200, 1000 - (this.level - 1) * 100);

            linesToClear.forEach(lineIndex => {
                this.board.splice(lineIndex, 1);
                this.board.unshift(Array(this.GRID_WIDTH).fill(0));
            });

            this.scoreText.setText(`Score: ${this.score}`);
            this.levelText.setText(`Level: ${this.level}`);
            this.linesText.setText(`Lines: ${this.lines}`);
        }
    }

    draw() {
        this.graphics.clear();
        this.graphics.fillStyle(0x333333, 1);

        // Draw board
        for (let i = 0; i < this.GRID_HEIGHT; i++) {
            for (let j = 0; j < this.GRID_WIDTH; j++) {
                const x = this.boardX + j * this.BLOCK_SIZE;
                const y = this.boardY + i * this.BLOCK_SIZE;
                this.graphics.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);

                if (this.board[i][j] !== 0) {
                    const colorIndex = this.board[i][j] - 1;
                    this.graphics.fillStyle(this.colors[colorIndex], 1);
                    this.graphics.fillRect(x + 1, y + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);
                }
            }
        }

        // Draw current piece
        const shape = this.currentPiece.shape;
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] !== 0) {
                    const x = this.boardX + (this.currentPiece.x + j) * this.BLOCK_SIZE;
                    const y = this.boardY + (this.currentPiece.y + i) * this.BLOCK_SIZE;
                    this.graphics.fillStyle(this.colors[this.currentPiece.colorIndex], 1);
                    this.graphics.fillRect(x + 1, y + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);
                }
            }
        }

        this.graphics.draw();
    }

    endGame() {
        this.gameOver = true;
        StorageManager.saveScore('tetris', this.score);
        this.add.text(400, 300, 'Game Over!', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => this.scene.start('MenuScene'));
    }

    createMenuButton(x, y) {
        const button = this.add.rectangle(x, y, 100, 40, 0xffffff);
        button.setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, 'Menu', {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}