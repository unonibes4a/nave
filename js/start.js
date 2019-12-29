/**
 * @author      Shawn Hymel <@ShawnHymel>
 * @copyright   2016 Shawn Hymel
 * @license     {@link http://choosealicense.com/licenses/no-license/|No License}
 * @description This example demonstrates the VirtualGamepad plugin.
 */

 var vw=window.innerWidth;
 var vh=window.innerHeight;
 
var game = new Phaser.Game(vw, vh, Phaser.CANVAS);

var PhaserGame = function() {
    this.player = null;
}

PhaserGame.prototype = {
    
    preload: function() {
        
        // Load the gamepad spritesheet. Note that the width must equal height
        // of the sprite.
        this.load.spritesheet('gamepad', 
            'assets/gamepad/gamepad_spritesheet.png', 100, 100);
        
        this.load.image('space', 'assets/space_bg.jpg');
        this.load.image('ship', 'assets/yo.png');
        this.load.image('laser', 'assets/laser.png');
    },
    
    create: function() {
    
        game.renderer.roundPixels = true;
        
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
        
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.add.tileSprite(0, 0, game.width, game.height, 'space');
        
        this.lasers = game.add.group();
        this.lasers.enableBody = true;
        this.lasers.physicsBodyType = Phaser.Physics.ARCADE;
        
        this.lasers.createMultiple(40, 'laser');
        this.lasers.setAll('scale.x', 0.3);
        this.lasers.setAll('scale.y', 0.3);
        this.lasers.setAll('anchor.x', 0.5);
        this.lasers.setAll('anchor.y', 0.5);
        
        this.laserTime = 0;
        
        this.player = this.add.sprite(250, 250, 'ship');
        this.player.scale.setTo(0.1, 0.1);
        this.player.anchor.set(0.5);
        
        game.physics.arcade.enable(this.player);
        this.player.body.drag.set(100);
        this.player.body.maxVelocity.set(300);
        this.player.lastAngle = -90;
        
        var style = {font: '8px Arial', 
                     fill: '#ffffff', 
                     align: 'left', 
                     stroke: '#000000'};
         
        this.directionText = this.add.text(20, 20, '', style);
        this.rectangularText = this.add.text(140, 20, '', style);
        this.polarText = this.add.text(260, 20, '', style);
        this.pushText = this.add.text(380, 20, '', style);
        
        // Add the VirtualGamepad plugin to the game
        this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);
        
        // Add a joystick to the game (only one is allowed right now)
        this.joystick = this.gamepad.addJoystick(vw*0.25,vh*0.7, 0.4, 'gamepad');
        
        // Add a button to the game (only one is allowed right now)
        this.button = this.gamepad.addButton(vw*0.7, vh*0.7, 0.4, 'gamepad');
    },
    
    update: function() {
        this.updateDebugText();
        
        // Read joystick data to set ship's angle and acceleration
        if (this.joystick.properties.inUse) {
            this.player.angle = this.joystick.properties.angle;
            this.player.lastAngle = this.player.angle;
        } else {
            this.player.angle = this.player.lastAngle;
        }
        this.player.body.acceleration.x = 4 * this.joystick.properties.x;
        this.player.body.acceleration.y = 4 * this.joystick.properties.y;
        
        // Fire the lasers!
        if (this.button.isDown) {
            this.fireLaser();
        }
        
        this.screenWrap(this.player);
        this.lasers.forEachExists(this.screenWrap, this);
    },
    
    fireLaser: function() {
        if (game.time.now > this.laserTime) {
            this.laser = this.lasers.getFirstExists(false);
            if (this.laser) {
                this.laser.reset(this.player.body.x + 33, 
                    this.player.body.y + 0);
                this.laser.lifespan = 2000;
                this.laser.angle = this.player.angle;
                game.physics.arcade.velocityFromRotation(this.player.rotation,
                    400, this.laser.body.velocity);
                this.laserTime = game.time.now + 100;
            }
        }
    },
    
    screenWrap: function(sprite) {
        if (sprite.x < 0)
        {
            sprite.x = game.width;
        }
        else if (sprite.x > game.width)
        {
            sprite.x = 0;
        }

        if (sprite.y < 0)
        {
            sprite.y = game.height;
        }
        else if (sprite.y > game.height)
        {
            sprite.y = 0;
        }
    },
    
    updateDebugText: function() {
        this.directionText.setText("Giovanni Rodriguez Diaz:\n up: " );
        this.rectangularText.setText("");
        this.polarText.setText("");
        this.pushText.setText("");
    }
};

game.state.add('Game', PhaserGame, true);