var playState = {
    // Removed the preload function
    create: function () {

        this.jumpSound = game.add.audio('jump');
        this.coinSound = game.add.audio('coin');
        this.deadSound = game.add.audio('dead');

        if (game.global.sound) {
            this.music = game.add.audio('music'); // Add the music
            this.music.loop = true; // Make it loop
            this.music.volume = 0.2;
            this.music.play(); // Start the music
        }      
        
        //KEYS
        this.cursor = game.input.keyboard.createCursorKeys();
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);

        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };


        this.player = game.add.sprite(game.world.centerX, game.world.centerY,'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);

        this.player.body.gravity.y = 500;
        // Create the 'right' animation by looping the frames 1 and 2
        this.player.animations.add('right', [1, 2], 8, true);
        // Create the 'left' animation by looping the frames 3 and 4
        this.player.animations.add('left', [3, 4], 8, true);
        
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin);
        this.coin.anchor.setTo(0.5, 0.5);

        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });         
               
        this.timeLabel = game.add.text(330, 30, '0', { font: '18px Arial', fill: '#ffffff' });

        game.global.score = 0; // New score variable
        this.createWorld();
        game.time.events.loop(2200, this.addEnemy, this);


        // Create the emitter with 15 particles. We don't need to set the x and y
        // Since we don't know where to do the explosion yet
        this.emitter = game.add.emitter(0, 0, 15);        
        this.emitter.makeParticles('pixel');        
        this.emitter.setYSpeed(-150, 150);        
        this.emitter.setXSpeed(-150, 150);        
        this.emitter.gravity = 0;
    },
    update: function () {

        this.timeLabel.text = game.time.now / 1000;
        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin,null, this);
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
        this.movePlayer();
        if (!this.player.inWorld) {
            this.playerDie();
        }
    },
    movePlayer: function() {
        if (this.cursor.left.isDown || this.wasd.left.isDown) {
            this.player.body.velocity.x = -200;
            this.player.animations.play('left');
        }
        else if (this.cursor.right.isDown || this.wasd.right.isDown) {
            this.player.body.velocity.x = 200;
            this.player.animations.play('right');
        }
        else {
            this.player.body.velocity.x = 0;
            this.player.animations.stop(); 
            this.player.frame = 0; 
        }
        if ((this.cursor.up.isDown || this.wasd.up.isDown) && this.player.body.touching.down) {
            if (game.global.sound) this.jumpSound.play();
            this.player.body.velocity.y = -320;
        }
    },
    takeCoin: function(player, coin) {        
        if (game.global.sound) this.coinSound.play();

        game.add.tween(this.player.scale).to({ x: 1.3, y: 1.3 }, 50).to({ x: 1, y: 1 }).start();


        game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;
        this.updateCoinPosition();        
    },
    updateCoinPosition: function() {
        var coinPosition = [
        {x: 140, y: 60}, {x: 360, y: 60},
        {x: 60, y: 140}, {x: 440, y: 140},
        {x: 130, y: 300}, {x: 370, y: 300}
        ];
        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x === this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }
        var newPosition = coinPosition[game.rnd.integerInRange(0,
        coinPosition.length-1)];
        this.coin.reset(newPosition.x, newPosition.y);
    },
    addEnemy: function() {
        var enemy = this.enemies.getFirstDead();
        if (!enemy) {
            return;
        }
        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.world.centerX, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },
    createWorld: function() {
        this.walls = game.add.group();
        this.walls.enableBody = true;
        game.add.sprite(0, 0, 'wallV', 0, this.walls);
        game.add.sprite(480, 0, 'wallV', 0, this.walls);
        game.add.sprite(0, 0, 'wallH', 0, this.walls);
        game.add.sprite(300, 0, 'wallH', 0, this.walls);
        game.add.sprite(0, 320, 'wallH', 0, this.walls);
        game.add.sprite(300, 320, 'wallH', 0, this.walls);
        game.add.sprite(-100, 160, 'wallH', 0, this.walls);
        game.add.sprite(400, 160, 'wallH', 0, this.walls);
        var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);
        this.walls.setAll('body.immovable', true);
    },
    playerDie: function () {

        // If the player is already dead, do nothing
        if (!this.player.alive) {
            return;
        }

        this.player.kill();
        // Start the sound and the particles
        if (game.global.sound) this.deadSound.play();
        this.emitter.x = this.player.x;
        this.emitter.y = this.player.y;
        this.emitter.start(true, 600, null, 15);
        this.music.stop();
        // Call the 'startMenu' function in 1000ms
        game.time.events.add(1000, this.startMenu, this);                
    },
    startMenu: function () {
        game.state.start('menu');
    },
};