import Phaser from 'phaser'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

const game = new Phaser.Game(config)
let MC;
let EN;
const horizontalSpeed = 2;
const verticalSpeed = 2;
const bulletVelocity = 200;
const plane_width = 63;
const plane_height = 48;
const waves = 5;
const bulletSize = 1;
const bulletRotation = 4.7;
function preload() {
    this.load.setBaseURL('http://labs.phaser.io')
    this.load.image('sky', 'assets/skies/pixelback1.jpg')
    this.load.image('character', 'assets/sprites/ww2plane.png')
    this.load.image('flame', 'assets/particles/flame1.png')
    this.load.image('bubble', 'assets/sprites/bullets/bullet5.png')
}

function create() {
    this.add.image(400, 300, 'sky')

    const particles = this.add.particles('flame')

    const emitter = particles.createEmitter({
      speed: 10,
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD'
    })
    

    MC = this.physics.add.image(400, 600-plane_height, 'character')
    EN = this.physics.add.image(400, 0+plane_height, 'character')
    EN.body.setAllowGravity(false)

    MC.body.setAllowGravity(false)
    MC.setCollideWorldBounds(true)
    emitter.startFollow(MC)

}
function update() {
    const leftButton  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const upButton    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downButton  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const spaceButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if(this.input.keyboard.checkDown(leftButton, 1)) {
        MC.x -= horizontalSpeed;
    }
    if(this.input.keyboard.checkDown(rightButton, 1)) {
        MC.x += horizontalSpeed;
    }
    if(this.input.keyboard.checkDown(upButton, 1)) {
        MC.y -= verticalSpeed;
    }
    if(this.input.keyboard.checkDown(downButton, 1)) {
        MC.y += verticalSpeed;
    }
    if(this.input.keyboard.checkDown(spaceButton, 150)) {
      // spawns bullet on top of MC
      let bullet = this.physics.add.image(MC.x+(plane_width/4), MC.y - 5, 'bubble')
      bullet.setScale(bulletSize)
      bullet.setRotation(bulletRotation) 

      // set speed of bullet
      bullet.setVelocityY(-bulletVelocity) 
      // set bullet to not fall
      bullet.body.setAllowGravity(false)
      // set bullet to collide with world bounds 
      //and delete itself when it does hit the bounds
      bullet.setCollideWorldBounds(true)
      bullet.body.onWorldBounds = true;
      bullet.body.world.on('worldbounds', function(body) {
        if (body.gameObject === this) {
          this.destroy();
        }
      }, bullet);
      
      let bullet2 = this.physics.add.image(MC.x -(plane_width/4), MC.y - 5, 'bubble')
      bullet2.setScale(bulletSize)
      bullet2.setRotation(bulletRotation) 
      // set speed of bullet2
      bullet2.setVelocityY(-bulletVelocity) 
      // set bullet2 to not fall
      bullet2.body.setAllowGravity(false)
      // set bullet2 to collide with world bounds 
      //and delete itself when it does hit the bounds
      bullet2.setCollideWorldBounds(true)
      bullet2.body.onWorldBounds = true;
      bullet2.body.world.on('worldbounds', function(body) {
        if (body.gameObject === this) {
          this.destroy();
        }
      }, bullet2);
    }

    // this.physics.world.on('collide', listener) 
    // gonna use this later for collision detection on enemies

}

