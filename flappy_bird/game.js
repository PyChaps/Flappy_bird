var game;
var roomConfig = {
    width: 400,
    height: 600
}
var gameConfig;
var isMuted = false;

window.onload = function() {
    gameConfig = {
        type: Phaser.AUTO,
        width: this.roomConfig.width,
        height: this.roomConfig.height,
        backgroundColor: 0xecf0f1,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                     y: 1000 
                },
                debug: false
            }
        },
        scene: [bootGame, playGame, mainMenu, sideMenu, particles, gameOver, start, resumePauseBtn]
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame);
}
class bootGame extends Phaser.Scene{
    constructor(){
        super("BootGame");
    }
    preload(){
        this.load.image("background", "assets/background.png");
        this.load.spritesheet({
            key: 'bird',
            url: 'assets/bird.png',
            frameConfig: { frameWidth: 45.5, frameHeight: 32 }
        });
        this.load.image("pipe", "assets/pipe2.png");
        this.load.image("full", "assets/expand.png");
        this.load.image("mute", "assets/mute.png");
        this.load.image("feather", "assets/feather.png");
        this.load.image("restart", "assets/restart-button.png");
        this.load.image("pause", "assets/pause-play.png")
        this.load.audio("music", "assets/music2.ogg")
        this.load.audio("musicMenu", "assets/awesomeness.wav")
        this.load.audio("hit", "assets/hit.mp3")
        this.load.audio("point", "assets/point.mp3")
        this.load.audio("die", "assets/die.mp3")
        this.load.audio("wing", "assets/wing.mp3")
    }
    create(){
        this.scene.start("MainMenu");
        this.scene.start("SideMenu");
        this.scene.sleep("SideMenu");
        this.scene.start("Start");
        this.scene.sleep("Start");
        //this.scene.launch("ResumePauseBtn");
    }
}

class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");

        this.rect;
        this.ground;
        this.cursors;
        this.pipesDown;
        this.pipesUp;
        this.background;
        this.j;
        this.i;
        this.scoreText;
        this.scoreValue = 0;
        this.musicConfig = {
            mute: false,
            volume: 0.2,
            loop: true,
        };
        this.hitConfig = {
            mute: false,
            volume: 0.2,
            loop: false,
        };
        this.pointConfig = {
            mute: false,
            volume: 0.01,
            loop: false,
        };
        this.dieConfig = {
            mute: false,
            volume: 0.2,
            loop: false,
        };
        this.wingConfig = {
            mute: false,
            volume: 0.2,
            loop: false,
        };
        this.music;
        this.hit;
        this.point;
        this.die;
        this.wing;
        this.keys;
        this.canMove = true;
        this.isDeath = false;
        this.keySpace;
        this.startText;
        this.aGrid;
    }
    create(){
        //Lock FPS on 60
        this.physics.world.setFPS(60);

        //Sprites
        this.background = this.add.tileSprite(0, 0, 800, 600, "background");
        this.scoreText = this.add.text(0, 0, this.scoreValue, { fontSize: '50px', fontFamily: 'ArialB', fill: '#fff' }).setVisible(true).setResolution(2).setDepth(20);
        this.startText = this.add.text(0, 0, "Press space or tap to start!", { fontSize: '25px', fontFamily: 'ArialB', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setResolution(2);
        this.ground = this.add.rectangle(0, 0, 800, 110, 0x076066);

        //Spritesheet
        this.rect = this.physics.add.sprite(0, 0, "bird");
        
        this.rect.body.setCollideWorldBounds();

        this.anims.create({
            key: 'wing',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.rect.anims.play('wing');

        //AlignGrid
        this.aGrid = new AlignGrid({scene: this, rows: 21, cols: 11});
        //this.aGrid.showNumbers();

        Align.center(this.background);
        this.aGrid.placeAtIndex(110, this.startText);
        this.aGrid.placeAtIndex(82, this.rect);
        this.aGrid.placeAtIndex(15.5, this.scoreText);
        this.aGrid.placeAtIndex(209, this.ground);

        Align.scaleToGameW(this.rect, .1);

        //Add physics to sprites
        this.physics.add.existing(this.ground);
        this.ground.body.setAllowGravity(false);
        this.ground.body.immovable = true;

        this.pipesDown = this.add.group()
        this.pipesUp = this.add.group()

        //Create Audio
        this.music = this.sound.add("music");
        this.hit = this.sound.add("hit");
        this.point = this.sound.add("point");
        this.die = this.sound.add("die");
        this.wing = this.sound.add("wing");

        //Play Audio
        this.music.play(this.musicConfig);

        //Keyboard Input
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.scene.launch("Start", { scene2: this });
        this.scene.pause();

        this.physics.add.collider(this.rect, this.ground, function (rect, ground) {
            rect.setTint(0xff0000);
            this.hit.play(this.hitConfig);
            console.log(this.scoreValue)
            this.scoreText.setVisible(false);
            this.scene.launch("Particles", { scene2: this });
            this.scene.launch("GameOver", { scoreValue: this.scoreValue, scene2: this, });
            this.scene.pause();
            this.isDeath = true;
            this.canMove = false;
        }, null, this);

        this.physics.add.collider(this.rect, this.pipesUp, function (rect, pipeUp) {
            rect.setTint(0xff0000);
            this.hit.play(this.hitConfig);
            this.isDeath = true;
            this.canMove = false;
        }, null, this);

        this.physics.add.collider(this.rect, this.pipesDown, function (rect, pipeDown) {
            rect.setTint(0xff0000);
            this.hit.play(this.hitConfig);
            console.log(this.scoreValue)
            this.scoreText.setVisible(false);
            this.scene.launch("Particles", { scene2: this });
            this.scene.launch("GameOver", { scoreValue: this.scoreValue, scene2: this, });
            this.scene.pause();
            this.isDeath = true;
            this.canMove = false;
        }, null, this);

        this.newPairOfPipes()

        //Tap
        this.input.on('pointerdown', function (cursor) {

            if (this.canMove == true) {
                this.rect.body.velocity.y = -400;
                this.rect.angle = -30;
                this.wing.play(this.wingConfig);
            }
    
        }, this);
    }

    update(){
        //console.log(this.rect.x)
        if (this.isDeath == false) {
            this.background.tilePositionX += 2
            this.startText.x -= 2
        }

        this.keystrokes();

        for (this.j = 0; this.j < this.pipesDown.getChildren().length; this.j++) {
            var pipeDown = this.pipesDown.getChildren()[this.j];
            pipeDown.update();
        }

        for (this.i = 0; this.i < this.pipesUp.getChildren().length; this.i++) {
            var pipeUp = this.pipesUp.getChildren()[this.i];
            pipeUp.update();
        }
    }

    keystrokes(){
        //Keyboard
        if (this.canMove == true) {
            if(Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.rect.body.velocity.y = -400;
                this.rect.angle = -30;
                this.wing.play(this.wingConfig);
            }

            console.log(this.rect.body.velocity.y)
    
            if (this.rect.body.velocity.y > -50) {
                this.rect.angle = 30;
            }

            if (this.rect.body.velocity.y > 400) {
                this.rect.angle = 90;
            }
        }
    }

    newPairOfPipes(){
        var pipeDown = new PipeDown(this, 502, 1000);
        var pipeUp = new PipeUp(this, 502, 150);
    }
}

class PipeDown extends Phaser.GameObjects.Sprite{
	constructor(scene, x, y){
  
      super(scene, x, y, "pipe");
      
      this.x = x;
      this.y = y;
      this.scene = scene;
  
	  // 3.2 add to scene
	  this.scene.add.existing(this);
  
      // 4.2 add the beam to the projectiles group
      this.scene.physics.world.enableBody(this);

      this.scene.pipesDown.add(this);

      this.flipY = false;

      this.body.setAllowGravity(false);
      this.body.immovable = true;

      Align.scaleToGameW(this, .2);
	}
  
  
	update(){
        // 3.4 Frustum culling
        if (this.scene.isDeath == false) {
            if(this.x <= 0 ) {
                this.destroy();
            } else {
                this.x -= 2
            } 
        }
	}
}

class PipeUp extends Phaser.GameObjects.Sprite{
	constructor(scene, x, y){
  
      super(scene, x, y, "pipe");

      this.x = x;
      this.y = y;
      this.scene = scene;
      //console.log(this.y)
  
	  // 3.2 add to scene
	  this.scene.add.existing(this);
  
      // 4.2 add the beam to the projectiles group 
      this.scene.physics.world.enableBody(this);

      this.scene.pipesUp.add(this);

      this.flipY = true;

      this.body.setAllowGravity(false);
      this.body.immovable = true;

      Align.scaleToGameW(this, .2);
	}
  
  
	update(){
        console.log(this.x)
        if (this.scene.isDeath == false) {
            // 3.4 Frustum culling
            if(this.x <= 0) {
                //this.scene.newPairOfPipes()
                this.destroy();
            } else {
                if (this.x >= 200 && this.x <= 201) {
                    console.log(this.y)
                    this.scene.newPairOfPipes();
                }

                if (this.x >= this.scene.rect.x && this.x <= this.scene.rect.x + 2) {
                    this.scene.scoreValue ++;
                    this.scene.point.play(this.pointConfig);
                    this.scene.scoreText.setText(this.scene.scoreValue);
                }
                
                this.x -= 2
        }
        }
	}
}

class mainMenu extends Phaser.Scene{
    constructor(){
        super("MainMenu");

        this.paused = false;
        this.play;
        this.options;
        this.background;
        this.ground;
        this.musicMenu;
        this.isFullWin;
        this.fullWinBtn;
        this.mute;
        this.grayBox;
        this.musicMenuConfig = {
            mute: false,
            volume: 0.2,
            loop: true,
        };
        this.aGrid;
    }
    create(){
        this.background = this.add.image(0, 0, "background");
        this.ground = this.add.rectangle(0, 0, 800, 110, 0x076066);
        this.play = this.add.text(0, 0, "Play", { fontSize: '60px', fontFamily: 'ArialB', fill: '#3432a8' }).setVisible(true).setResolution(2).setInteractive();
        this.options = this.add.text(0, 0, "Options", { fontSize: '60px', fontFamily: 'ArialB', fill: '#3432a8' }).setVisible(true).setResolution(2).setInteractive();
        this.back = this.add.text(0, 0, "Back", { fontSize: '60px', fontFamily: 'ArialB', fill: '#3432a8' }).setVisible(false).setResolution(2).setInteractive();
        this.grayBox = this.add.rectangle(0, 0, 300, 290, 0x000000, 0.6);
        this.mute = this.add.image(roomConfig.width/2, 250, 'mute').setVisible(false).setInteractive().setTint(0xfc0000);
        this.fullWinBtn = this.add.image(roomConfig.width/2, 150, 'full').setVisible(false).setInteractive().setTintFill(0xa11212);

        //AlignGrid
        this.aGrid = new AlignGrid({scene: this, rows: 21, cols: 11});
        //this.aGrid.showNumbers();

        Align.center(this.background);
        this.aGrid.placeAtIndex(36.2, this.play);
        this.aGrid.placeAtIndex(78.5, this.options);
        this.aGrid.placeAtIndex(209, this.ground);
        this.aGrid.placeAtIndex(60, this.grayBox);
        this.aGrid.placeAtIndex(134.6, this.back);
        this.aGrid.placeAtIndex(93, this.mute);
        this.aGrid.placeAtIndex(49, this.fullWinBtn);

        //Add physics to sprites
        this.physics.add.existing(this.grayBox);
        this.grayBox.body.setAllowGravity(false);
        this.grayBox.setVisible(false);

        //Create Audio
        this.musicMenu = this.sound.add("musicMenu");

        //Play Audio
        this.musicMenu.play(this.musicMenuConfig);

        this.scale.setGameSize(400, 600);

        this.fullWinBtn.on('pointerdown', function (event) {

            if (this.isFullWin == true) {
                this.scale.stopFullscreen();
                // On stop full screen
            } else {
                this.scale.startFullscreen();
                // On start full screen
            }

        }, this);

        this.mute.on('pointerdown', function (event) {

            if (isMuted == false) {
                this.mute.setTint(0x33ff05);
                game.sound.mute = true;
                isMuted = true
            } else {
                this.mute.setTint(0xfc0000);
                game.sound.mute = false;
                isMuted = false
            }
    
        }, this);

        this.play.on('pointerover', function (event) {

            this.setTint(0xff0000);
    
        });

        this.play.on('pointerout', function (event) {

            this.clearTint();
    
        });

        this.play.on('pointerdown', function (event) {

            this.musicMenu.stop();
            this.scene.switch("PlayGame");
    
        }, this);

        this.play.on('pointerup', function (event) {

            this.setTint(0xff0000);
    
        });

        this.options.on('pointerover', function (event) {

            this.setTint(0xff0000);
    
        });

        this.options.on('pointerout', function (event) {

            this.clearTint();
    
        });

        this.options.on('pointerdown', function (event) {

            this.play.setVisible(false);
            this.options.setVisible(false);
            this.back.setVisible(true);
            this.mute.setVisible(true);
            this.fullWinBtn.setVisible(true);
            this.grayBox.setVisible(true);
    
        }, this);

        this.options.on('pointerup', function (event) {

            this.setTint(0xff0000);
    
        });

        this.back.on('pointerover', function (event) {

            this.setTint(0xff0000);
    
        });

        this.back.on('pointerout', function (event) {

            this.clearTint();
    
        });

        this.back.on('pointerdown', function (event) {

            this.play.setVisible(true);
            this.options.setVisible(true);
            this.back.setVisible(false);
            this.mute.setVisible(false);
            this.fullWinBtn.setVisible(false);
            this.grayBox.setVisible(false);
    
        }, this);

        this.back.on('pointerup', function (event) {

            this.setTint(0xff0000);
    
        });
    }

    update(){
        if (this.scale.isFullscreen) {
            console.log(this.scale.isFullWin)
            this.isFullWin = true
            this.fullWinBtn.setTintFill(0x2c9c13);
            this.scale.setGameSize(400, 600);
        } else {
            console.log(this.scale.isFullWin)
            this.isFullWin = false
            this.fullWinBtn.setTintFill(0xa11212);
            this.scale.setGameSize(400, 600);
        }

        if (isMuted == false) {
            this.mute.setTint(0xfc0000);
        } else {
            this.mute.setTint(0x33ff05);
        }
    }
}

class sideMenu extends Phaser.Scene{
    constructor(){
        super("SideMenu");

        this.paused = false;
        this.isFullWin;
        this.fullWinBtn;
        this.mute;
        this.grayBox;
        this.aGrid;
    }

    create(){
        this.grayBox = this.add.rectangle(0, 0, 300, 290, 0x000000, 0.6);
        this.mute = this.add.image(0, 0, 'mute').setInteractive();
        this.fullWinBtn = this.add.image(0, 0, 'full').setInteractive().setTintFill(0xa11212);

        //AlignGrid
        this.aGrid = new AlignGrid({scene: this, rows: 21, cols: 11});
        //this.aGrid.showNumbers();

        //Align.center(this.grayBox);
        this.aGrid.placeAtIndex(93, this.grayBox);
        this.aGrid.placeAtIndex(126, this.mute);
        this.aGrid.placeAtIndex(93, this.fullWinBtn);

        //Add physics to sprites
        this.physics.add.existing(this.grayBox);
        this.grayBox.body.setAllowGravity(false);

        this.scale.setGameSize(400, 600);

        this.fullWinBtn.on('pointerdown', function (event) {

            if (this.isFullWin == true) {
                this.scale.stopFullscreen();
                // On stop full screen
            } else {
                this.scale.startFullscreen();
                // On start full screen
            }

        }, this);

        this.mute.on('pointerdown', function (event) {

            if (isMuted == false) {
                this.mute.setTint(0x33ff05);
                game.sound.mute = true;
                isMuted = true
            } else {
                this.mute.setTint(0xfc0000);
                game.sound.mute = false;
                isMuted = false
            }
    
        }, this);
    }

    update(){
        if (this.scale.isFullscreen) {
            console.log(this.scale.isFullWin)
            this.isFullWin = true
            this.fullWinBtn.setTintFill(0x2c9c13);
            this.scale.setGameSize(400, 600);
        } else {
            console.log(this.scale.isFullWin)
            this.isFullWin = false
            this.fullWinBtn.setTintFill(0xa11212);
            this.scale.setGameSize(400, 600);
        }

        if (isMuted == false) {
            this.mute.setTint(0xfc0000);
        } else {
            this.mute.setTint(0x33ff05);
        }
    }
}

class particles extends Phaser.Scene{
    constructor(){
        super("Particles");

        this.scene2;
        this.particle;
        this.emitter;
    }

    init(data){
        this.scene2 = data.scene2;
    }

    create(){
        //Particle Emitter
        this.particle = this.add.particles('feather');
        this.emitter = this.particle.createEmitter({
            angle: { min: 240, max: 300 },
            speed: { min: 100, max: 300 },
            quantity: { min: 10, max: 60 },
            lifespan: 4000,
            alpha: { start: 1, end: 0.5 },
            scale: { min: 0.05, max: 0.4 },
            rotate: { start: 0, end: 360, ease: 'Back.easeOut' },
            gravityY: 200,
            on: false
        });

        //Camera Flash
        this.cameras.main.flash();

        this.cameras.main.on('cameraflashcomplete', function () {

            //Start Particles
            this.particle.emitParticleAt(this.scene2.rect.x, this.scene2.rect.y);
    
        }, this);
    }
}

class gameOver extends Phaser.Scene{
    constructor(){
        super("GameOver");

        this.gameOverText;
        this.scoreText;
        this.scoreValue;
        this.scene2;
        this.restart;
        this.aGrid;
    }

    init(data){
        this.scoreValue = data.scoreValue;
        this.scene2 = data.scene2;
    }

    create(){
        this.gameOverText = this.add.text(0, 0, "Game Over", { fontSize: '60px', fontFamily: 'ArialB', fill: '#ff8400', stroke: '#000', strokeThickness: 4}).setResolution(2);
        this.restart = this.add.image(0, 0, "restart").setInteractive();
        this.scoreText = this.add.text(0, 0, "Your score: " + this.scoreValue, { fontSize: '30px', fontFamily: 'ArialB', fill: '#ab42db', stroke: '#000', strokeThickness: 3}).setResolution(2);
        this.scoreText.angle = -20;

        //AlignGrid
        this.aGrid = new AlignGrid({scene: this, rows: 21, cols: 11});
        //this.aGrid.showNumbers();

        //Align.center(this.background);
        this.aGrid.placeAtIndex(22, this.gameOverText);
        this.aGrid.placeAtIndex(115, this.restart);
        this.aGrid.placeAtIndex(77, this.scoreText);

        Align.scaleToGameW(this.restart, .3);

        this.scene.stop("ResumePauseBtn");

        this.scale.setGameSize(400, 600);

        this.restart.on('pointerover', function (event) {

            this.setTint(0xff0000);
    
        });

        this.restart.on('pointerout', function (event) {

            this.clearTint();
    
        });

        this.restart.on('pointerdown', function (event) {

            //this.setTintFill(0xf4ff2b);
            this.scene2.canMove = true;
            this.scene2.isDeath = false;
            this.scene2.scoreValue = 0;
            this.scene2.sound.removeAll();
            this.scene.stop();
            this.scene.stop("PlayGame");
            this.scene.stop("MainMenu");
            this.scene.stop("SideMenu");
            this.scene.start("SideMenu");
            this.scene.sleep("SideMenu");
            this.scene.stop("Particles");
            this.scene.stop("ResumePauseBtn");
            this.scene.start("PlayGame");
            this.scene.start("Start");
    
        }, this);

        this.restart.on('pointerup', function (event) {

            this.setTint(0xff0000);
    
        });
    }
}

class start extends Phaser.Scene{
    constructor(){
        super("Start");

        this.keySpace;
        this.scene2;
    }

    init(data){
        this.scene2 = data.scene2;
    }

    create(){
        //Keyboard Input
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //Tap
        this.input.on('pointerdown', function (pointer) {

            if (this.scene2.canMove == true) {
                this.scene.resume("PlayGame");
                this.scene.launch("ResumePauseBtn");
                this.scene.stop();
            }
    
        }, this);
    }

    update(){
        this.keystrokes();
    }

    keystrokes(){
        //Keyboard
        if (this.scene2.canMove == true) {
            if(Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.scene.resume("PlayGame");
                this.scene.launch("ResumePauseBtn");
                this.scene.stop();
            }
        }
    }
}

class resumePauseBtn extends Phaser.Scene{
    constructor(){
        super("ResumePauseBtn");

        this.paused = false;
        this.pause;
        this.aGrid;
    }
    create(){
        this.pause = this.add.sprite(0, 0, 'pause').setInteractive();

        //AlignGrid
        this.aGrid = new AlignGrid({scene: this, rows: 21, cols: 11});
        //this.aGrid.showNumbers();

        //Align.center(this.background);
        this.aGrid.placeAtIndex(20.5, this.pause);

        this.pause.on('pointerover', function (event) {

            this.setTint(0xff0000);
    
        });

        this.pause.on('pointerout', function (event) {

            this.clearTint();
    
        });

        this.pause.on('pointerdown', function (event) {

            if (this.paused == false) {
                this.pause.setTint(0xff00ff);
                this.scene.wake("SideMenu");
                this.scene.pause("PlayGame");
                this.paused = true
            } else {
                this.pause.setTint(0xff00ff);
                this.scene.sleep("SideMenu");
                this.scene.resume("PlayGame");
                this.paused = false
            }
    
        }, this);

        this.pause.on('pointerup', function (event) {

            this.setTint(0xff0000);
    
        });
    }
}

function resizeGame(){
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}