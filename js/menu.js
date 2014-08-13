var menuState = {
    create: function() {
        // Add a background image
        game.add.image(0, 0, 'background');
        

        // If 'bestScore' is not defined
        // It means that this is the first time the game is played
        if (!localStorage.getItem('bestScore')) {
            // Then set the best score to 0
            localStorage.setItem('bestScore', 0);
        }
        // If the score is higher than the best score
        if (game.global.score > localStorage.getItem('bestScore')) {
            // Then update the best score
            localStorage.setItem('bestScore', game.global.score);
        }

        // NAME LABEL
        var nameLabel = game.add.text(game.world.centerX, -50, 'Super Coin Box', { font: '70px Geo', fill: '#ffffff' });
        nameLabel.anchor.setTo(0.5, 0.5);        
        var tween = game.add.tween(nameLabel);        
        game.add.tween(nameLabel).to({ y: 100 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

        // Show the score at the center of the screen
        var textScore = 'score: ' + game.global.score + '\nbest score: ' + localStorage.getItem('bestScore');
        var scoreLabel = game.add.text(game.world.centerX, game.world.centerY, textScore,
        { font: '25px Arial', fill: '#ffffff', align: 'center'});
        scoreLabel.anchor.setTo(0.5, 0.5);
        
        //START LABEL
        var startLabel = game.add.text(game.world.centerX, game.world.height - 80,'press the up arrow key to start',
            { font: '25px Arial', fill: '#ffffff' });
        game.add.tween(startLabel).to({ angle: -2 }, 500).to({ angle: 2 }, 500).loop().start();

        startLabel.anchor.setTo(0.5, 0.5);
        // Create a new Phaser keyboard variable: the up arrow key
        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        // When the 'upKey' is pressed, it will call the 'start' function once
        upKey.onDown.addOnce(this.start, this);

        this.muteButton = game.add.button(20, 20, 'mute', this.toggleSound, this);
        this.muteButton.input.useHandCursor = true;
        // If the game is already muted
        if (!game.global.sound) {
            // Change the frame to display the speaker with no sound
            this.muteButton.frame = 1;
        }

    },
    start: function () {
        // Start the actual game
        game.state.start('play');
    },    
    toggleSound: function () {      
        game.global.sound = !game.global.sound;        
        this.muteButton.frame = game.global.sound ? 0 : 1;
    },
};