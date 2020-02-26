var canvas;
var ctx;
var game_loop;

function init() {
  canvas = document.getElementById("canvas");
  document.addEventListener("keydown", keyDown);
  ctx = canvas.getContext("2d");
  game_loop = new GameLoop();
  window.requestAnimationFrame(draw);
}

function draw() {
  game_loop.draw_all();
  window.requestAnimationFrame(draw);
}

//base class for almost everything
class Entity {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Bullet extends Entity {
  constructor(x, y) {
    super(x, y, 20, 20, "#00FF00");
    this.dmg = 1;
  }
}

//base class for different types of enemies
class Enemies extends Entity {
  constructor(x, y, w, h, color) {
    super(x, y, w, h, color);
    this.hp = 3;
  }
}

//basic enemy ship
class Hunter extends Enemies {
  constructor(x, y) {
    super(x, y, 40, 40, "#0000FF");
  }
}

//player class
class Player extends Entity {
  constructor(x, y) {
    super(x, y, 40, 40, "#FF0000");
    //Attack speed
    this.as = 500;
    this.shooting = false;
  }

  shoot() {
    //Attack speed lockout
    if (!this.shooting) {
      this.shooting = true;
      setTimeout(this.set_shooting(false), this.as);
      return new Bullet(this.x + 10, this.y - 30);
    } else {
      return null;
    }
  }

  set_shooting(state){
    this.shooting = state;
  }

  get_shooting(){
    return this.shooting;
  }
}

class Hitbox{
  constructor(x, y, w, h){
    this.x = x;
    this.h = h;
    this.y = y;
    this.w = w;
  }

  check_collision(entity_body){
    if(this.x + this.w > entity_body.x && this.x < entity_body.x + entity_body.w && this.y + this.h > entity_body.y && this.y < entity_body.y + entity_body.h){
      return true;
    }else{
      return false;
    }
  }
}

//here is where the magic happens
class GameLoop {
  constructor() {
    this.entities = [];
    this.entities.push(new Player(canvas.width / 2 - 40, canvas.height - 100));
    for (var i = 0, y = 30; i < 4; i++, y += 60) {
      for (var j = 0, x = 30; j < 9; j++, x += 60) {
        this.entities.push(new Hunter(x, y));
      }
    }
  }

  shoot() {
    if(!this.entities[0].get_shooting()){
      this.entities.push(this.entities[0].shoot());
    }
  }

  draw_all() {
    this.entities.forEach(entity => entity.draw());
  }
}

function keyDown(e) {
//  console.log(e.keyCode);

  switch (e.keyCode) {

    //Shoot
    case 32:
      game_loop.shoot();
      break;

      //rigth
    case 68:
      break;

      //left
    case 65:
      break;
  }

}
