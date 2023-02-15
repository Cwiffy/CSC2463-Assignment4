let spriteSheet;
let chronoSheet;

let walkingAnimation;
let walkingAnimation2;
let chronoAnimation;

let animations = [];

let roachSheet;

const GameState = {
  Start: "Start",
  Playing: "Playing",
  GameOver: "GameOver"
};

// Set 'game' numerical variables
let game = { score: 0, maxScore: 0, maxTime: 30, elapsedTime: 0, totalSprites: 15, state: GameState.Start };

// Loads & Compiles all sprite assets before start of program
function preload() {
  // Defines the Roach sprite specifically
  roachSheet = loadImage("assets/RoachieBoi.png");
}

// Starts game & canvas; 'reset' starts the game itself
function setup() {
  createCanvas(400, 400);
  imageMode(CENTER);
  angleMode(DEGREES);

  reset();
}

// Begins the game & respawns all assets upon being called
function reset() {
  game.elapsedTime = 0;
  game.score = 0;

  // THIS LOADS NUMBER OF SPRITES IN GAME!!!
  game.totalSprites = 100;

  animations = [];
  for(let i=0; i < game.totalSprites; i++) {
    // animations[i] = new WalkingAnimation(random(spriteSheets),80,80,random(100,300),random(100,300),9,random(0.5,1),6,random([0,1]));
    animations[i] = new WalkingAnimation(roachSheet,48,48,random(10,390),random(10,390),3,random(0.5,1),4,random([0,1]))
  }
}

// Called autimatically after 'setup(),' and loops constantly
function draw() {

  // Constantly checks gamestate immediately when 'draw()' is called; Constantly checks in a loop
  switch(game.state) {

    // Called when game state changed to 'Playing;' In this state when being played
    case GameState.Playing:
      background(220);
  
      for(let i=0; i < animations.length; i++) {
        animations[i].draw();
      }
      fill(0);
      textSize(40);
      text(game.score,20,40);
      let currentTime = game.maxTime - game.elapsedTime;
      text(ceil(currentTime), 300,40);
      game.elapsedTime += deltaTime / 1000;

      if (currentTime < 0)
        game.state = GameState.GameOver;
      break;

    // Called when game state changed to 'Game Over'
    case GameState.GameOver:
      game.maxScore = max(game.score,game.maxScore);

      background(0);
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text("Game Over!",200,200);
      textSize(35);
      text("Score: " + game.score,200,270);
      text("Max Score: " + game.maxScore,200,320);
      break;

    // Called when game state changed to 'Start'
    case GameState.Start:
      background(0);
      fill(255);
      textSize(50);
      textAlign(CENTER);
      text("Cyclops Game",200,200);
      textSize(30);
      text("Press Any Key to Start",200,300);
      break;
  }
  
}

function keyPressed() {
  switch(game.state) {
    case GameState.Start:
      game.state = GameState.Playing;
      break;
    case GameState.GameOver:
      reset();
      game.state = GameState.Playing;
      break;
  }
}

function mousePressed() {
  switch(game.state) {
    case GameState.Playing:
      for (let i=0; i < animations.length; i++) {
        let contains = animations[i].contains(mouseX,mouseY);
        if (contains) {
          if (animations[i].moving != 0) {
            animations[i].stop();
            game.score += 1;

            // Hopefully increases speed of every mob upon one death
            for(let i=0; i < game.totalSprites; i++) {
              animations[i].speedBoost();
            }

          }
          // else {
          //   if (animations[i].xDirection === 1)
          //     animations[i].moveRight();
          //   else
          //     animations[i].moveLeft();
          // }

          // ABOVE CODE BLOCK ALLOWS MOBS TO COME BACK ALIVE WHEN PRESSED!!!
        }
      }
      break;
  }
  
}



/*
*
* Sprite mobile assets ("Mobs")
*
*/
class WalkingAnimation {
  constructor(spritesheet, sw, sh, dx, dy, animationLength, speed, framerate, vertical = false, offsetX = 0, offsetY = 0) {
    this.spritesheet = spritesheet;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0; //concerns X-Axis; Sets sprite "block"
    this.v = 0; //concerns Y-Axis; Sets sprite "block"
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.moving = 1;
    this.xDirection = 1;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.speed = speed;
    this.framerate = framerate*speed;
    this.vertical = vertical;
  }

  draw() {
    this.u = (this.moving != 0) ? this.currentFrame % this.animationLength : this.u;
    push();
    translate(this.dx,this.dy);

    if (this.vertical)
      rotate(90);
    scale(this.xDirection,1);
    
    image(this.spritesheet,0,0,this.sw,this.sh,this.u*this.sw+this.offsetX,0,this.sw,this.sh);
    pop();
    
    let proportionalFramerate = round(frameRate() / this.framerate);
    if (frameCount % proportionalFramerate == 0) {
      this.currentFrame++;
    }
  
    if (this.vertical) {
      this.dy += this.moving*this.speed;
      this.move(this.dy,this.sw / 4,height - this.sw / 4);
    }
    else {
      this.dx += this.moving*this.speed;
      this.move(this.dx,this.sw / 4,width - this.sw / 4);
    }

    
  }

  move(position,lowerBounds,upperBounds) {
    if (position > upperBounds) {
      this.moveLeft();
    } else if (position < lowerBounds) {
      this.moveRight();
    }
  }

  moveRight() {
    this.moving = 1;
    this.xDirection = 1;
    this.v = 0;
  }

  moveLeft() {
    this.moving = -1;
    this.xDirection = -1;
    this.v = 0;
  }

  contains(x,y) {
    //rect(-26,-35,50,70);
    let insideX = x >= this.dx - 26 && x <= this.dx + 25;
    let insideY = y >= this.dy - 35 && y <= this.dy + 35;
    return insideX && insideY;
  }

  speedBoost() {
    this.speed = this.speed + (game.score / 1000);
  }

  stop() {
    this.moving = 0;
    this.u = 3; //sets "death" animation
  }
}
