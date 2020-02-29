var canvas;
var ctx;
var game_loop;
var interval;

function init() {
  canvas = document.getElementById("canvas");
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);
  ctx = canvas.getContext("2d");
  game_loop = new GameLoop();
  window.requestAnimationFrame(draw);
  interval = setInterval(function(){
    draw();
  }, 20);
}

function clear_canvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  clear_canvas();
  game_loop.draw_all();
}

//base class for almost everything
class Entity {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.vy = 0;
    this.vx = 0;
    this.hitbox = new Hitbox(this.x, this.y, this.w, this.h);
  }

  set_vx(vx){
    this.vx = vx;
  }

  set_x(x){
    this.x = x;
  }

  set_y(y){
    this.y = y;
  }

  get_vx(){
    return this.vx;
  }

  get_x(){
    return this.x;
  }

  get_y(){
    return this.y;
  }

  get_width(){
    return this.w;
  }

  get_heigth(){
    return this.h;
  }

  //abstract function for entity movement
  update(){
    throw new Error('You have to implement the method update!');
  }

  draw() {
    this.update();
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
    this.vy = 1;
  }

  update(){
    this.y -= this.vy;
    this.hitbox.y = this.y;
  }
}

//base class for different types of enemies
class Enemies extends Entity {
  constructor(x, y, w, h, color) {
    super(x, y, w, h, color);
    this.hp = 3;
    this.vx = 0;
  }

  update(){
    this.x += this.vx;
    this.hitbox.x = this.x;
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
    this.vx = 0;
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

  update(){
    //checks if player are trying to go right after hitting left wall
    if(this.x <= 0 && this.vx > 0)
      this.x += this.vx;
    //checks if player are trying to go left after hitting right wall
    else if(this.x + this.w >= canvas.width && this.vx < 0)
      this.x += this.vx;
    //if player is not hitting any walls
    else if(this.x > 0 && this.x + this.w < canvas.width)
      this.x += this.vx;
    //stops player from going past the wall
    else
      this.vx = 0;

    this.hitbox.x = this.x;
  }
}

class Cover extends Entity{

  constructor(x,y){
    super(x, y, 60, 20, "#FF69B4");
    this.hp = 5;
  }

  update(){

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
    this.mode = 0; // mode = 0 makes enemies go right, mode = 1 makes enemies go left
    this.alive = true;
    this.entities.push(new Player(canvas.width / 2 - 40, canvas.height - 50));
    for(var i = 0, x = 25; i < 5; i++, x += 120){
      this.entities.push(new Cover(x, canvas.height - 100));
    }
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
    var change = false;
    var no_enemies = true;
    this.entities.forEach((entity, index) => {
      entity.draw();
      if(entity instanceof Bullet){
        //if bullet goes of screen remove it from the array
        if(entity.get_y() < 0){
          this.entities.splice(index, 1);
        }else{
          //if bullet hits an enemy remove the enemy and the bullet
          this.entities.forEach((temp, j) =>{
            if(temp instanceof Enemies){
              if(entity.hitbox.check_collision(temp.hitbox)){
                this.entities.splice(index, 1);
                this.entities.splice(j, 1);
              }
            //if bullets hits a cover make it lose 1 hp
            }else if(temp instanceof Cover){
              if(entity.hitbox.check_collision(temp.hitbox)){
                this.entities.splice(index, 1);
                temp.hp -= entity.dmg;
                //if cover
                if(temp.hp <= 0){
                  this.entities.splice(j, 1);
                }
              }
            }
          });
        }
      }else if(entity instanceof Enemies){
        //checks if all enemies are dead
        if(no_enemies)
          no_enemies = false;

        //checks if enemies are going of screen, if they do change direction
        if(entity.get_x() <= 0 && !change){
          change = true;
        }else if(entity.get_x() + entity.get_width() >= canvas.width && !change){
          change = true;
        }
      }
    });

    //Restart if all enemies are dead (change later for levels)
    if(no_enemies)
      init();

    //change direction on enemies
    if(change){
      //go left
      if(this.mode === 0){
        this.mode = 1;
        this.entities.forEach(entity => {
          if(entity instanceof Enemies){
            entity.set_vx(-1);
            entity.set_y(entity.get_y() + 30);
            entity.hitbox.y = entity.get_y();
          }
        });
      //go right
      }else{
        this.mode = 0;
        this.entities.forEach(entity => {
          if(entity instanceof Enemies){
            entity.set_vx(1);
            entity.set_y(entity.get_y() + 30);
            entity.hitbox.y = entity.get_y();
          }
        });
      }
    }
  }

  set_player_speed(vx){
    this.entities[0].set_vx(vx);
  }

  get_player_speed(){
    return this.entities[0].get_vx();
  }

  get_player_x(){
    return this.entities[0].get_x();
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
        game_loop.set_player_speed(2);
      break;

      //left
    case 65:
      game_loop.set_player_speed(-2);
      break;
  }
}

function keyUp(e){
  switch (e.keyCode) {

    //rigth
    case 68:
      if(game_loop.get_player_speed() < 0){

      }else{
        game_loop.set_player_speed(0);
      }
      break;

    //left
    case 65:

      if(game_loop.get_player_speed() > 0){

      }else{
        game_loop.set_player_speed(0);
      }
      break;
  }
}
