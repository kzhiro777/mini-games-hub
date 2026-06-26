class AngryBirdScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AngryBirdScene' });
    }

    init() {
        this.score = 0;
        this.level = 1;
        this.maxLevels = 5;
        this.enemiesDefeated = 0;
        this.totalEnemies = 0;
        this.turn = 1;
        this.selectedSkill = null;
        this.gameState = 'skillSelect'; // skillSelect, moving, waiting
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);
        this.add.rectangle(width / 2, height - 50, width, 100, 0x90ee90);

        // Player character
        this.player = this.physics.add.sprite(100, height - 100, null);
        this.player.displayWidth = 40;
        this.player.displayHeight = 40;
        this.player.setFillStyle(0xff0000);
        this.playerSkills = [
            { name: 'Walk', icon: '🚶', range: 150 },
            { name: 'Spread Shot', icon: '💥', range: 200 },
            { name: 'Explosion', icon: '💣', range: 150 },
            { name: 'Pierce', icon: '🔫', range: 250 },
            { name: 'Flame', icon: '🔥', range: 120 }
        ];

        // Enemy group
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();

        // Setup level
        this.setupLevel();

        // UI
        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
            fontSize: '20px',
            color: '#000000'
        });

        this.levelText = this.add.text(20, 50, `Level: ${this.level}/${this.maxLevels}`, {
            fontSize: '20px',
            color: '#000000'
        });

        this.turnText = this.add.text(20, 80, `Turn: ${this.turn}`, {
            fontSize: '20px',
            color: '#000000'
        });

        this.enemyCountText = this.add.text(width - 200, 20, `Enemies: ${this.enemiesDefeated}/${this.totalEnemies}`, {
            fontSize: '16px',
            color: '#000000'
        });

        // Skill panel
        this.createSkillPanel();

        // Menu button
        this.createMenuButton(width - 100, 20);

        // Collisions - use arrow function to preserve 'this' context
        this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => {
            this.hitEnemy(projectile, enemy);
        });
    }

    setupLevel() {
        this.enemies.clear(true, true);
        this.enemiesDefeated = 0;
        this.totalEnemies = 3 + this.level;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const levelEnemyPositions = [
            [
                { x: width - 100, y: 200 },
                { x: width - 200, y: 150 },
                { x: width - 150, y: 300 }
            ],
            [
                { x: width - 80, y: 180 },
                { x: width - 180, y: 200 },
                { x: width - 250, y: 150 },
                { x: width - 150, y: 280 }
            ],
            [
                { x: width - 100, y: 160 },
                { x: width - 200, y: 200 },
                { x: width - 150, y: 280 },
                { x: width - 280, y: 150 },
                { x: width - 180, y: 320 }
            ],
            [
                { x: width - 120, y: 140 },
                { x: width - 220, y: 190 },
                { x: width - 160, y: 260 },
                { x: width - 300, y: 200 },
                { x: width - 200, y: 350 },
                { x: width - 120, y: 280 }
            ],
            [
                { x: width - 100, y: 150 },
                { x: width - 200, y: 210 },
                { x: width - 150, y: 300 },
                { x: width - 280, y: 180 },
                { x: width - 220, y: 320 },
                { x: width - 100, y: 400 },
                { x: width - 260, y: 100 }
            ]
        ];

        const positions = levelEnemyPositions[Math.min(this.level - 1, levelEnemyPositions.length - 1)];
        positions.forEach(pos => {
            const enemy = this.enemies.create(pos.x, pos.y, null);
            enemy.displayWidth = 30;
            enemy.displayHeight = 30;
            enemy.setFillStyle(0x0000ff);
            enemy.health = 1 + Math.floor(this.level / 2);
            enemy.maxHealth = enemy.health;
        });
    }

    createSkillPanel() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(20, height - 140, 'Skills:', {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#000000'
        });

        this.skillButtons = [];
        this.playerSkills.forEach((skill, index) => {
            const x = 20 + (index % 3) * 110;
            const y = height - 110 + Math.floor(index / 3) * 45;

            const button = this.add.rectangle(x, y, 100, 40, 0xdddddd);
            button.setInteractive({ useHandCursor: true });
            button.setStrokeStyle(2, 0x000000);

            const text = this.add.text(x - 30, y, `${skill.icon}\n${skill.name}`, {
                fontSize: '11px',
                color: '#000000'
            });

            button.on('pointerover', () => {
                button.setFillStyle(0xffff00);
            });

            button.on('pointerout', () => {
                button.setFillStyle(this.selectedSkill === skill.name ? 0x00ff00 : 0xdddddd);
            });

            button.on('pointerdown', () => {
                this.selectSkill(skill, button);
            });

            this.skillButtons.push(button);
        });
    }

    selectSkill(skill, button) {
        if (this.gameState !== 'skillSelect') return;

        // Deselect previous
        this.skillButtons.forEach(btn => {
            if (btn === button) return;
            btn.setFillStyle(0xdddddd);
        });

        this.selectedSkill = skill.name;
        button.setFillStyle(0x00ff00);

        // Execute skill
        this.time.delayedCall(300, () => this.executeSkill(skill));
    }

    executeSkill(skill) {
        this.gameState = 'moving';

        if (skill.name === 'Walk') {
            this.walkPhase();
        } else {
            this.playerWalk(() => {
                this.shootPhase(skill);
            });
        }
    }

    walkPhase() {
        const duration = 800;
        const distance = 80;

        this.tweens.add({
            targets: this.player,
            x: this.player.x + distance,
            duration: duration,
            onComplete: () => {
                this.gameState = 'waiting';
                this.time.delayedCall(1500, () => this.nextTurn());
            }
        });
    }

    playerWalk(onComplete) {
        const duration = 500;
        const distance = 50;

        this.tweens.add({
            targets: this.player,
            x: this.player.x + distance,
            duration: duration,
            onComplete: onComplete
        });
    }

    shootPhase(skill) {
        const range = skill.range;

        if (skill.name === 'Spread Shot') {
            this.createProjectile(15, this.player.x, this.player.y);
            this.createProjectile(0, this.player.x, this.player.y);
            this.createProjectile(-15, this.player.x, this.player.y);
        } else if (skill.name === 'Explosion') {
            const projectile = this.createProjectile(0, this.player.x, this.player.y);
            projectile.skillType = 'explosion';
            projectile.explosionRadius = 100;
        } else if (skill.name === 'Pierce') {
            const projectile = this.createProjectile(0, this.player.x, this.player.y);
            projectile.skillType = 'pierce';
            projectile.pierceCount = 0;
            projectile.setVelocityX(400);
        } else if (skill.name === 'Flame') {
            const projectile = this.createProjectile(0, this.player.x, this.player.y);
            projectile.skillType = 'flame';
            projectile.setVelocityX(300);
        }

        this.gameState = 'waiting';
        this.time.delayedCall(2000, () => this.nextTurn());
    }

    createProjectile(angleOffset, x, y) {
        const projectile = this.projectiles.create(x + 30, y, null);
        projectile.displayWidth = 8;
        projectile.displayHeight = 8;
        projectile.setFillStyle(0xffff00);
        projectile.setVelocity(300, -200 + angleOffset * 5);
        projectile.skillType = 'normal';
        return projectile;
    }

    hitEnemy(projectile, enemy) {
        let damage = 1;

        if (projectile.skillType === 'explosion') {
            this.createExplosion(projectile.x, projectile.y, projectile.explosionRadius);
            projectile.destroy();
        } else if (projectile.skillType === 'pierce') {
            projectile.pierceCount++;
            if (projectile.pierceCount > 2) {
                projectile.destroy();
            }
            damage = 1;
        } else if (projectile.skillType === 'flame') {
            this.createFlameEffect(projectile.x, projectile.y);
            projectile.destroy();
            damage = 1;
        } else {
            projectile.destroy();
        }

        enemy.health -= damage;
        if (enemy.health <= 0) {
            enemy.destroy();
            this.enemiesDefeated++;
            this.score += 10 * this.level;
            this.enemyCountText.setText(`Enemies: ${this.enemiesDefeated}/${this.totalEnemies}`);
            this.scoreText.setText(`Score: ${this.score}`);

            if (this.enemiesDefeated >= Math.ceil(this.totalEnemies * 0.8)) {
                this.gameState = 'waiting';
                this.add.text(400, 300, 'Level Complete!', {
                    fontSize: '32px',
                    fontStyle: 'bold',
                    color: '#00ff00',
                    align: 'center'
                }).setOrigin(0.5);
                this.time.delayedCall(2000, () => this.nextLevel());
            }
        }
    }

    createExplosion(x, y, radius) {
        const circle = this.make.graphics({ x: x, y: y, add: false });
        circle.fillStyle(0xff6600, 0.6);
        circle.fillCircle(0, 0, radius);

        this.enemies.children.entries.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (distance < radius) {
                enemy.health -= 2;
                if (enemy.health <= 0) {
                    enemy.destroy();
                    this.enemiesDefeated++;
                    this.score += 10 * this.level;
                    this.enemyCountText.setText(`Enemies: ${this.enemiesDefeated}/${this.totalEnemies}`);
                    this.scoreText.setText(`Score: ${this.score}`);
                }
            }
        });

        this.time.delayedCall(200, () => circle.destroy());
    }

    createFlameEffect(x, y) {
        const flame = this.make.graphics({ x: x, y: y, add: false });
        flame.fillStyle(0xff4400, 0.7);
        flame.fillRect(-20, -20, 40, 40);

        this.time.delayedCall(300, () => flame.destroy());
    }

    nextTurn() {
        this.turn++;
        this.turnText.setText(`Turn: ${this.turn}`);
        this.selectedSkill = null;
        this.gameState = 'skillSelect';
        this.skillButtons.forEach(btn => btn.setFillStyle(0xdddddd));
    }

    nextLevel() {
        if (this.level < this.maxLevels) {
            this.level++;
            this.levelText.setText(`Level: ${this.level}/${this.maxLevels}`);
            this.turn = 1;
            this.turnText.setText(`Turn: ${this.turn}`);
            this.setupLevel();
            this.gameState = 'skillSelect';
        } else {
            StorageManager.saveScore('angryBird', this.score);
            this.add.text(400, 300, 'You Win!', {
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#00ff00',
                align: 'center'
            }).setOrigin(0.5);
            this.time.delayedCall(2000, () => this.scene.start('MenuScene'));
        }
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
            StorageManager.saveScore('angryBird', this.score);
            this.scene.start('MenuScene');
        });
    }

    update() {
        // Clean up off-screen projectiles
        this.projectiles.children.entries.forEach(projectile => {
            if (projectile.x > 850 || projectile.y > 650 || projectile.x < -50) {
                projectile.destroy();
            }
        });
    }
}
