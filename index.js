import Phaser from 'phaser'
import ActionCable from 'actioncable'
let USERDATA = {};
let cable = ActionCable.createConsumer('ws://localhost:3001/cable')
cable.subscriptions.create({
  channel: "RoomsChannel",
  room: 1,
},);
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
let loaded = false;
const FetchData = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const username = urlParams.get('username')
  const password = urlParams.get('password')
  const req = await fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  })
  const res = await req.json()
  USERDATA = res
  loaded = true;
  console.log(USERDATA)
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
  let progressBar = this.add.graphics();
  let progressBox = this.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(240, 270, 320, 50);

  let width = this.cameras.main.width;
  let height = this.cameras.main.height;
  let loadingText = this.make.text({
    x: width / 2,
    y: height / 2 - 50,
    text: 'Loading...',
    style: {
      font: '20px monospace',
      fill: '#ffffff'
    }
  });
  loadingText.setOrigin(0.5, 0.5);

  let percentText = this.make.text({
    x: width / 2,
    y: height / 2 - 5,
    text: '0%',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  percentText.setOrigin(0.5, 0.5);

  let assetText = this.make.text({
    x: width / 2,
    y: height / 2 + 50,
    text: '',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  assetText.setOrigin(0.5, 0.5);

  this.load.on('progress', function (value) {
    percentText.setText(parseInt(value * 100) + '%');
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(250, 280, 300 * value, 30);
  });

  this.load.on('fileprogress', function (file) {
    assetText.setText('Loading asset: ' + file.key);
  });
  this.load.on('complete', function () {
    progressBar.destroy();
    progressBox.destroy();
    loadingText.destroy();
    percentText.destroy();
    assetText.destroy();
  });

  FetchData()
  this.load.setBaseURL('http://labs.phaser.io')
  this.load.image('sky', 'assets/skies/pixelback1.jpg')
  this.load.image('character', 'assets/sprites/ww2plane.png')
  this.load.image('flame', 'assets/particles/blue.png')
  this.load.image('thrust', 'assets/particles/flame1.png')
  this.load.image('bubble', 'assets/sprites/bullets/bullet5.png')
}

function create() {
  this.add.image(400, 300, 'sky')

  
  // x,y,speed, damage,size, rotation,bulletSprite


}
function update() {
  if(loaded){
    const particles = this.add.particles('flame')

    const emitter = particles.createEmitter({
      speed: 10,
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD'
    })
    const emitter2 = particles.createEmitter({
      speed: 10,
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD'
    })
  
  
    MC = this.physics.add.image(USERDATA.x, USERDATA.y - plane_height, 'character')
    // EN = this.physics.add.image(400, 0+plane_height, 'character')
    // EN.body.setAllowGravity(false)
  
    MC.body.setAllowGravity(false)
    MC.setCollideWorldBounds(true)
    emitter.startFollow(MC)
    emitter2.startFollow(MC)
    emitter.followOffset = { x: 10, y: 0 }
    emitter2.followOffset = { x: -10, y: 0 }
    loaded =false
  }
  this.input.on('pointermove', function (pointer) {
    let cursor = pointer;
    let angle = Phaser.Math.Angle.Between(MC.x, MC.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
    MC.rotation = (angle + Math.PI / 2)
    MCAngle = angle;
    if (Math.abs(cursor.x - MC.x) < 20) {
      return;
    }
    if (Math.abs(cursor.y - MC.y) < 20) {
      return;
    }
    this.physics.moveTo(MC, cursor.x, cursor.y, planeSpeed)
  }, this);
  const spaceButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  if (this.input.keyboard.checkDown(spaceButton, 150)) {
    let offset = Math.floor(MCAngle) > 0 ? 1 : -1
    let left;
    let right;
    if (Math.abs(MC.rotation) > 2 || Math.abs(MC.rotation) < 1) {
      // console.log(Math.floor(MC.rotation))
      right = new Bullet(MC.x - (plane_width / 4), MC.y + (10 * offset), 500, 10, bulletSize, MCAngle, 'bubble')
      right.spawnBullet()

      left = new Bullet(MC.x + (plane_width / 4), MC.y + (10 * offset), 500, 10, bulletSize, MCAngle, 'bubble')
      left.spawnBullet()
    } else {
      right = new Bullet(MC.x - (10 * offset), MC.y - (plane_width / 4), 500, 10, bulletSize, MCAngle, 'bubble')
      right.spawnBullet()

      left = new Bullet(MC.x - (10 * offset), MC.y + (plane_width / 4), 500, 10, bulletSize, MCAngle, 'bubble')
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
  constructor(x, y, speed, damage, size, rotation, bulletSprite) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.damage = damage;
    this.size = size;
    this.rotation = rotation;
    this.bulletSprite = bulletSprite;
    this.scene = game.scene.scenes[0]
  }
  spawnBullet() {

    let bullet = this.scene.physics.add.image(this.x, this.y, this.bulletSprite)
    let velcoityVector = this.scene.physics.velocityFromRotation(this.rotation, this.speed)
    const particles = this.scene.add.particles('thrust')

    const flame = particles.createEmitter({
      speed: 10,
      scale: { start: 0.05, end: 0 },
      blendMode: 'ADD'
    })

    flame.startFollow(bullet)
    bullet.rotation = this.rotation
    bullet.body.setVelocity(velcoityVector.x, velcoityVector.y)
    bullet.setScale(this.size)
    bullet.body.setAllowGravity(false)
    bullet.setCollideWorldBounds(true)
    bullet.body.onWorldBounds = true;
    bullet.body.world.on('worldbounds', function (body) {
      if (body.gameObject === this) {
        flame.stopFollow(bullet)
        this.destroy();
        // console.log("bullet destroyed")
      }
    }, bullet);
  }
}