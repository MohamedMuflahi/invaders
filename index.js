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
const planeSpeed = 250;
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

}
function update() {
  let cursor;
  this.input.on('pointermove', function (pointer) {
    cursor = pointer;
    let angle = Phaser.Math.Angle.Between(MC.x, MC.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
    MC.rotation = (angle + 1.5)
    // console.log(cursor.y - MC.y)
    if(Math.abs(cursor.x - MC.x) < 20){
      return;
    }
    if(Math.abs(cursor.y - MC.y) < 20){
      return;
    }
      this.physics.moveTo(MC, cursor.x, cursor.y, planeSpeed)
}, this);

    // if(this.input.keyboard.checkDown(spaceButton, 150)) {
    //   // spawns bullet on top of MC
    //   // set speed of bullet
    //   let rightBullet = this.physics.add.image(MC.x+(plane_width/4), MC.y - 5, 'bubble')
    //   let leftBullet = this.physics.add.image(MC.x-(plane_width/4), MC.y -5, 'bubble')  
    //   if(MC.rotation == 0){
    //     let right = new Bullet(-bulletVelocity,10, bulletSize, bulletRotation,rightBullet,true)
    //     let left = new Bullet(-bulletVelocity,10, bulletSize, bulletRotation,leftBullet,true)
    //     right.spawnBullet()
    //     left.spawnBullet()
    //   }else if(MC.rotation == 3.1400000000000006){
    //     let right = new Bullet(bulletVelocity,10, bulletSize, -bulletRotation,rightBullet,true)
    //     let left = new Bullet(bulletVelocity,10, bulletSize, -bulletRotation,leftBullet,true)
    //     right.spawnBullet()
    //     left.spawnBullet()
    //   }else if(MC.rotation == 1.5700000000000003){
    //     let right = new Bullet(bulletVelocity,10, bulletSize, null,rightBullet, false)
    //     let left = new Bullet(bulletVelocity,10, bulletSize, null,leftBullet, false)
    //     right.spawnBullet()
    //     left.spawnBullet()
    //   }else if(MC.rotation == -1.5700000000000003){
    //     let right = new Bullet(-bulletVelocity,10, bulletSize, 3.14,rightBullet, false)
    //     let left = new Bullet(-bulletVelocity,10, bulletSize, 3.14,leftBullet, false)
    //     right.spawnBullet()
    //     left.spawnBullet()
    //   } 
    // }

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
  constructor(speed, damage,size, rotation,bullet,vertical) {
    this.speed = speed;
    this.damage = damage;
    this.size = size;
    this.rotation = rotation;
    this.bullet = bullet;
    this.vertical = vertical;
  }
  spawnBullet(){
    this.bullet.setScale(this.size)
    if(this.rotation != null){
      this.bullet.setRotation(this.rotation) 
    }
    if(this.vertical == true){
      this.bullet.setVelocityY(this.speed)
    }else{
      this.bullet.setVelocityX(this.speed)
    }
    this.bullet.body.setAllowGravity(false)
    this.bullet.setCollideWorldBounds(true)
    this.bullet.body.onWorldBounds = true;
    this.bullet.body.world.on('worldbounds', function(body) {
      if (body.gameObject === this) {
        this.destroy();
        console.log("bullet destroyed")
      }
    }, this.bullet);
  }
}