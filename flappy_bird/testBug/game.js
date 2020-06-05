var game;
var roomConfig = {
    width: 400,
    height: 600
}
var gameConfig;

window.onload = function() {
    gameConfig = {
        type: Phaser.AUTO,
        //parent: 'phaser-example',
        width: this.roomConfig.width,
        height: this.roomConfig.height,
        backgroundColor: 0xecf0f1,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                     y: 900 
                },
                debug: false
            }
        },
        scene: [bootGame, playGame]
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
        this.load.image("bird", "assets/bird.png");
        this.load.image("pipe", "assets/pipe2.png");
        this.load.image("full", "assets/expand.png");
        this.load.image("mute", "assets/mute.png");
        this.load.image("explosion", "assets/explosion.png");
        this.load.image("feather", "assets/feather.png");
        this.load.image("restart", "assets/restart-button.png");
        this.load.audio("music", "assets/music2.ogg")
        this.load.audio("musicMenu", "assets/awesomeness.wav")
        this.load.audio("hit", "assets/hit.mp3")
        this.load.audio("point", "assets/point.mp3")
        this.load.audio("die", "assets/die.mp3")
        this.load.audio("wing", "assets/wing.mp3")
    }
    create(){
        this.scene.start("PlayGame");
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
        this.keyO;
        this.startText;
        this.newPipes = true;
    }
    create(){
        //Lock FPS on 60
        //this.physics.world.setFPS(60);

        //Sprites
        this.background = this.add.tileSprite(roomConfig.width/2, roomConfig.height/2, 800, 600, "background");
        this.rect = this.physics.add.sprite(200, 200, "bird");
        this.rect.body.setCollideWorldBounds();

        this.pipesDown = this.add.group();
        this.pipesUp = this.add.group();

        //this.physics.world.enable(this.pipeDown);
        //this.physics.world.enable(this.pipeUp);

        this.physics.world.addCollider(this.rect, this.pipesUp, function (rect, pipeUp) {
            rect.setTint(0xff0000);
        }, null, this);

        this.physics.world.addCollider(this.rect, this.pipesDown, function (rect, pipeDown) {
            rect.setTint(0xff0000);
        }, null, this);

        //Keyboard Input
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyO = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    }

    update(){
        this.background.tilePositionX += 2

        if (this.newPipes){
            var pipeDown = this.physics.add.sprite(502, 700, "pipe")
            var pipeUp = this.physics.add.sprite(502, 50, "pipe")

            pipeDown.body.setAllowGravity(false);
            pipeDown.body.immovable = true;

            pipeUp.body.setAllowGravity(false);
            pipeUp.body.immovable = true;

            this.pipesDown.add(pipeDown);
            this.pipesUp.add(pipeUp);

            this.newPipes = false;
        }

        this.keystrokes();

        for (var j = 0; j < this.pipesDown.getChildren().length; j++) {
            var pipeDown = this.pipesDown.getChildren()[j];
            var pipeUp = this.pipesUp.getChildren()[j];
            if (pipeDown.x <= 100 ) {
                pipeDown.destroy();
                pipeUp.destroy();
                this.newPipes = true;
            } else {
                pipeDown.x -= 2;
                pipeUp.x -= 2;
            } 
        }
    }

    render(){
        game.debug.spriteInfo(this.pipesDown, 100, 100);

    }

    keystrokes(){
        if (this.canMove == true) {
            if(Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.rect.body.velocity.y = -400;
                this.rect.angle = -30;
            }
        }
    }
}

class Beam1 extends Phaser.GameObjects.Sprite{
	constructor(scene, x, y){
      super(scene, x, y, "pipe");
      this.x = x;
      this.y = y;
      //scene.add.existing(this);
      scene.physics.add.existing(this);
      scene.pipesDown.add(this);
      this.body.setAllowGravity(false);
      this.body.immovable = true;
    }
      preUpdate(time, delta){
          super.preUpdate(time, delta)
    }
}


class Beam2 extends Phaser.GameObjects.Sprite{
	constructor(scene, x, y){
      super(scene, x, y, "pipe");
      this.x = x;
      this.y = y;
	  //scene.add.existing(this);
      scene.physics.add.existing(this);
      //game.physics.arcade.enable(this);
      scene.pipesUp.add(this);
      this.body.setAllowGravity(false);
      this.body.immovable = true;
    }
      preUpdate(time, delta){
        super.preUpdate(time, delta)
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