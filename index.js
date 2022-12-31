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
let MCAngle;
const planeSpeed = 150;
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
    // EN = this.physics.add.image(400, 0+plane_height, 'character')
    // EN.body.setAllowGravity(false)

    MC.body.setAllowGravity(false)
    MC.setCollideWorldBounds(true)
    emitter.startFollow(MC)
    // x,y,speed, damage,size, rotation,bulletSprite
    
    console.log(this)

}
function update() {

  this.input.on('pointermove', function (pointer) {
    let cursor = pointer;
    let angle = Phaser.Math.Angle.Between(MC.x, MC.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
    MC.rotation = (angle + Math.PI / 2)
    MCAngle = angle;
    if(Math.abs(cursor.x - MC.x) < 20){
      return;
    }
    if(Math.abs(cursor.y - MC.y) < 20){
      return;
    }
    this.physics.moveTo(MC, cursor.x, cursor.y, planeSpeed)
  }, this); 
  const spaceButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  if(this.input.keyboard.checkDown(spaceButton, 150)) {
     let offset = Math.floor(MCAngle) > 0 ? 1:-1
    if(Math.abs(MC.rotation) > 2 || Math.abs(MC.rotation) < 1){
      // console.log(Math.floor(MC.rotation))
      let right = new Bullet(MC.x-(plane_width/4), MC.y+(10*offset), 500,10, bulletSize,MCAngle,'bubble')
      right.spawnBullet()
      
      let left = new Bullet(MC.x+(plane_width/4), MC.y+(10*offset), 500,10, bulletSize, MCAngle,'bubble')
      left.spawnBullet()
    }else{
      let right = new Bullet(MC.x-(10*offset), MC.y-(plane_width/4), 500,10, bulletSize,MCAngle,'bubble')
      right.spawnBullet()
      
      let left = new Bullet(MC.x-(10*offset), MC.y+(plane_width/4) , 500,10, bulletSize, MCAngle,'bubble')
      left.spawnBullet()
    }
   }

    // this.physics.world.on('collide', listener) 
    // gonna use this later for collision detection on enemies

}

class Enemy {
  constructor(x, y, speed, health, damage) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.health = health;
    this.damage = damage;
  }
}

class Bullet {
  constructor(x,y,speed, damage,size, rotation,bulletSprite) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.damage = damage;
    this.size = size;
    this.rotation = rotation;
    this.bulletSprite = bulletSprite;
    this.scene = game.scene.scenes[0]
  }
  spawnBullet(){
    
    let bullet =  this.scene.physics.add.image(this.x, this.y, this.bulletSprite)
    let velcoityVector = this.scene.physics.velocityFromRotation(this.rotation, this.speed)
    bullet.rotation = this.rotation
    bullet.body.setVelocity(velcoityVector.x, velcoityVector.y)
    bullet.setScale(this.size)
    bullet.body.setAllowGravity(false)
    bullet.setCollideWorldBounds(true)
    bullet.body.onWorldBounds = true;
    bullet.body.world.on('worldbounds', function(body) {
      if (body.gameObject === this) {
        this.destroy();
        // console.log("bullet destroyed")
      }
    }, bullet);
  }
}