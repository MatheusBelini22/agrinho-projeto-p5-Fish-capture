// ASTROCAT - Versão Simplificada (Garantido que funciona)
// Controles: Setas ou WASD para mover, Espaço para dash

let astroCat;
let peixes = [];
let meteoros = [];
let score = 0;
let gameOver = false;

function setup() {
  createCanvas(800, 600);
  astroCat = new AstroCat(width/2, height/2);
  spawnPeixe();
  spawnMeteoro();
}

function draw() {
  background(10, 5, 30);
  
  // Desenha estrelas de fundo
  for (let i = 0; i < 100; i++) {
    fill(255);
    noStroke();
    ellipse(random(width), random(height), random(1, 3));
  }
  
  if (!gameOver) {
    // Controles
    handleInput();
    
    // Atualiza elementos
    updateGame();
    
    // Mostra pontuação
    fill(255);
    textSize(24);
    text("Peixes: " + score, 20, 40);
  } else {
    gameOverScreen();
  }
}

function handleInput() {
  let force = createVector(0, 0);
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) force.x = -0.2;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) force.x = 0.2;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) force.y = -0.2;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) force.y = 0.2;
  astroCat.applyForce(force);
}

function updateGame() {
  astroCat.update();
  astroCat.show();
  
  for (let i = peixes.length - 1; i >= 0; i--) {
    peixes[i].update();
    peixes[i].show();
    if (peixes[i].hits(astroCat)) {
      score++;
      peixes.splice(i, 1);
      spawnPeixe();
    }
  }
  
  for (let i = meteoros.length - 1; i >= 0; i--) {
    meteoros[i].update();
    meteoros[i].show();
    if (meteoros[i].hits(astroCat)) {
      gameOver = true;
    }
  }
}

function gameOverScreen() {
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER);
  text("GAME OVER", width/2, height/2);
  textSize(24);
  text("Clique para recomeçar", width/2, height/2 + 50);
}

function keyPressed() {
  if (key === ' ' && !gameOver) {
    astroCat.dash();
  }
}

function mouseClicked() {
  if (gameOver) {
    resetGame();
  }
}

function resetGame() {
  score = 0;
  gameOver = false;
  peixes = [];
  meteoros = [];
  astroCat = new AstroCat(width/2, height/2);
  spawnPeixe();
  spawnMeteoro();
}

function spawnPeixe() {
  let x = random(width);
  let y = random(height);
  peixes.push(new Peixe(x, y));
}

function spawnMeteoro() {
  let x = random(width);
  let y = -50;
  meteoros.push(new Meteoro(x, y));
}

// Classes dos objetos do jogo
class AstroCat {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    this.size = 30;
  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(5);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  dash() {
    this.vel.mult(2.5);
  }
  
  show() {
    fill(255, 165, 0);
    ellipse(this.pos.x, this.pos.y, this.size);
    // Olhos
    fill(255);
    ellipse(this.pos.x - 8, this.pos.y - 5, 8);
    ellipse(this.pos.x + 8, this.pos.y - 5, 8);
    fill(0);
    ellipse(this.pos.x - 8, this.pos.y - 5, 3);
    ellipse(this.pos.x + 8, this.pos.y - 5, 3);
    // Boca
    noFill();
    stroke(0);
    arc(this.pos.x, this.pos.y + 5, 10, 10, 0, PI);
  }
}

class Peixe {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(2);
    this.size = 20;
  }
  
  update() {
    this.pos.add(this.vel);
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
  }
  
  show() {
    fill(100, 200, 255);
    ellipse(this.pos.x, this.pos.y, this.size, this.size/2);
    triangle(
      this.pos.x + this.size/2, this.pos.y,
      this.pos.x + this.size/2 + 10, this.pos.y - 5,
      this.pos.x + this.size/2 + 10, this.pos.y + 5
    );
    fill(0);
    ellipse(this.pos.x - 5, this.pos.y - 2, 3);
  }
  
  hits(astroCat) {
    let d = dist(this.pos.x, this.pos.y, astroCat.pos.x, astroCat.pos.y);
    return d < this.size/2 + astroCat.size/2;
  }
}

class Meteoro {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 3);
    this.size = 30;
  }
  
  update() {
    this.pos.add(this.vel);
    if (this.pos.y > height + this.size) {
      this.pos.y = -this.size;
      this.pos.x = random(width);
    }
  }
  
  show() {
    fill(150);
    ellipse(this.pos.x, this.pos.y, this.size);
    fill(100);
    ellipse(this.pos.x - 5, this.pos.y - 5, 5);
    ellipse(this.pos.x + 8, this.pos.y + 3, 7);
  }
  
  hits(astroCat) {
    let d = dist(this.pos.x, this.pos.y, astroCat.pos.x, astroCat.pos.y);
    return d < this.size/2 + astroCat.size/2;
  }
}