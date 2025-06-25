// AGROCAT - Jogo de Colheita Completo e Corrigido
// Controles: Setas ou WASD para mover, Espaço para dash

// Variáveis globais
let agroCat;
let plantacoes = [];
let pragas = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let pragaBaseSpeed = 1.5;
let lastPragaSpawn = 0;
let pragaBaseSpawnInterval = 3500;

// Variáveis de tempo
let tempoInicial = 60;
let tempoRestante = tempoInicial;
let ultimoTempo = 0;

// Variáveis de dificuldade
let nivelDificuldade = 1;
let tempoAumentoDificuldade = 15000;
let ultimoAumentoDificuldade = 0;

// CLASSE PRINCIPAL DO JOGADOR
class AgroCat {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    this.size = 30;
    this.maxSpeed = 3;
  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
  }
  
  applyForce(force) {
    this.acc.add(force.mult(0.8));
  }
  
  dash() {
    this.vel.mult(2.0);
  }
  
  show() {
    // Chapéu de palha
    fill(210, 180, 140);
    arc(this.pos.x, this.pos.y - 10, this.size, this.size, PI, TWO_PI);
    
    // Rosto do gato
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
    
    // Bigodes
    line(this.pos.x - 10, this.pos.y, this.pos.x - 20, this.pos.y - 5);
    line(this.pos.x - 10, this.pos.y, this.pos.x - 20, this.pos.y);
    line(this.pos.x - 10, this.pos.y, this.pos.x - 20, this.pos.y + 5);
    line(this.pos.x + 10, this.pos.y, this.pos.x + 20, this.pos.y - 5);
    line(this.pos.x + 10, this.pos.y, this.pos.x + 20, this.pos.y);
    line(this.pos.x + 10, this.pos.y, this.pos.x + 20, this.pos.y + 5);
    
    // Cesto de colheita
    fill(139, 69, 19);
    arc(this.pos.x, this.pos.y + 15, 20, 10, 0, PI);
  }
}

// CLASSE DAS PLANTAÇÕES
class Plantacao {
  constructor(x, y, tipo) {
    this.pos = createVector(x, y);
    this.tipo = tipo;
    this.tamanho = 5;
    this.tamanhoMaximo = 20;
    this.prontoParaColher = false;
    this.tempoCrescimento = 0;
    this.tempoParaColher = floor(random(80, 150));
    this.saude = 100;
    this.cor = this.getCorPorTipo();
  }
  
  getCorPorTipo() {
    return [
      color(255, 165, 0), // Cenoura
      color(255, 50, 50),  // Tomate
      color(255, 255, 0)   // Milho
    ][this.tipo];
  }
  
  crescer() {
    if (!this.prontoParaColher) {
      this.tempoCrescimento++;
      this.tamanho = map(this.tempoCrescimento, 0, this.tempoParaColher, 5, this.tamanhoMaximo);
      if (this.tempoCrescimento >= this.tempoParaColher) {
        this.prontoParaColher = true;
      }
    }
  }
  
  colher() {
    this.prontoParaColher = false;
    this.tempoCrescimento = 0;
    this.tamanho = 5;
    this.tempoParaColher = floor(random(80, 150));
  }
  
  danificar() {
    this.saude -= 25;
    if (this.prontoParaColher) {
      this.prontoParaColher = false;
      this.tempoCrescimento = this.tempoParaColher * 0.6;
    }
  }
  
  show() {
    // Solo/base
    fill(101, 67, 33);
    rect(this.pos.x - 15, this.pos.y + 5, 30, 5);
    
    // Planta
    fill(this.cor);
    if (this.tipo === 0) {
      ellipse(this.pos.x, this.pos.y - this.tamanho/2, this.tamanho/2, this.tamanho);
    } else if (this.tipo === 1) {
      ellipse(this.pos.x, this.pos.y - this.tamanho/2, this.tamanho);
    } else {
      rect(this.pos.x - this.tamanho/4, this.pos.y - this.tamanho, this.tamanho/2, this.tamanho);
    }
    
    // Folhagem
    fill(50, 200, 50);
    if (this.tipo === 0 || this.tipo === 2) {
      triangle(
        this.pos.x, this.pos.y - this.tamanho,
        this.pos.x - 5, this.pos.y - this.tamanho - 10,
        this.pos.x + 5, this.pos.y - this.tamanho - 10
      );
    } else {
      rect(this.pos.x - 2, this.pos.y - this.tamanho - 5, 4, 10);
    }
    
    // Barra de saúde
    if (this.saude < 100) {
      fill(255, 0, 0);
      rect(this.pos.x - 15, this.pos.y + 12, map(this.saude, 0, 100, 0, 30), 3);
    }
    
    // Pronto para colher
    if (this.prontoParaColher) {
      fill(255, 255, 0);
      ellipse(this.pos.x, this.pos.y - this.tamanho - 15, 8);
    }
  }
  
  hits(agroCat) {
    let d = dist(this.pos.x, this.pos.y, agroCat.pos.x, agroCat.pos.y);
    return d < 20 + agroCat.size/2;
  }
}

// CLASSE DAS PRAGAS
class Praga {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 1.5);
    this.size = 20;
    this.tipo = floor(random(3));
    this.cor = this.getCorPorTipo();
    this.rotacao = 0;
    this.velRotacao = random(-0.1, 0.1);
  }
  
  getCorPorTipo() {
    return [
      color(200, 50, 50),   // Gafanhoto
      color(50, 200, 50),   // Lagarta
      color(150, 100, 50)   // Besouro
    ][this.tipo];
  }
  
  update(velocidade) {
    this.vel.y = velocidade;
    this.pos.add(this.vel);
    this.rotacao += this.velRotacao;
    
    if (this.pos.y > height + this.size) {
      this.pos.y = -this.size;
      this.pos.x = random(width);
    }
  }
  
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotacao);
    
    fill(this.cor);
    ellipse(0, 0, this.size, this.size/1.5);
    
    if (this.tipo === 0) {
      fill(0);
      ellipse(-this.size/3, -this.size/6, this.size/4);
      line(this.size/2, 0, this.size, -this.size/4);
      line(this.size/2, 0, this.size, this.size/4);
    } 
    else if (this.tipo === 1) {
      for (let i = -2; i <= 2; i++) {
        ellipse(i * this.size/5, 0, this.size/3);
      }
      fill(0);
      ellipse(-this.size/3, -this.size/8, this.size/6);
    } 
    else {
      fill(50);
      ellipse(0, -this.size/4, this.size, this.size/3);
      fill(this.cor);
      ellipse(0, 0, this.size, this.size/2);
    }
    
    pop();
  }
  
  hits(alvo) {
    let d = dist(this.pos.x, this.pos.y, alvo.pos.x, alvo.pos.y);
    return d < this.size/2 + (alvo.size ? alvo.size/2 : 10);
  }
}

// FUNÇÕES PRINCIPAIS
function setup() {
  createCanvas(800, 600);
  agroCat = new AgroCat(width/2, height/2);
  criarPlantacao();
  ultimoTempo = millis();
  ultimoAumentoDificuldade = millis();
}

function draw() {
  background(34, 139, 34);
  
  if (!gameStarted) {
    telaInicio();
    return;
  }
  
  if (gameOver) {
    gameOverScreen();
    return;
  }
  
  drawFieldDetails();
  atualizarTempo();
  aumentarDificuldadeProgressiva();
  handleInput();
  updateGame();
  mostrarInfo();
  
  if (millis() - lastPragaSpawn > getPragaSpawnInterval()) {
    spawnPraga();
    lastPragaSpawn = millis();
  }
}

// FUNÇÕES AUXILIARES
function criarPlantacao() {
  const linhas = 4;
  const colunas = 6;
  const espacamentoX = width / (colunas + 1);
  const espacamentoY = height / (linhas + 1);
  
  plantacoes = [];
  
  for (let i = 1; i <= colunas; i++) {
    for (let j = 1; j <= linhas; j++) {
      let x = i * espacamentoX;
      let y = j * espacamentoY + 50;
      let tipo = floor(random(3));
      plantacoes.push(new Plantacao(x, y, tipo));
    }
  }
}

function reporPlantacoes() {
  const linhas = 4;
  const colunas = 6;
  const espacamentoX = width / (colunas + 1);
  const espacamentoY = height / (linhas + 1);
  
  for (let i = 1; i <= colunas; i++) {
    for (let j = 1; j <= linhas; j++) {
      let x = i * espacamentoX;
      let y = j * espacamentoY + 50;
      
      let existe = false;
      for (let p of plantacoes) {
        if (dist(p.pos.x, p.pos.y, x, y) < 30) {
          existe = true;
          break;
        }
      }
      
      if (!existe) {
        let tipo = floor(random(3));
        plantacoes.push(new Plantacao(x, y, tipo));
      }
    }
  }
}

function drawFieldDetails() {
  stroke(50, 205, 50);
  for (let i = 0; i < width; i += 40) {
    line(i, 0, i, height);
  }
  
  noStroke();
  fill(34, 139, 34);
  for (let i = 0; i < 20; i++) {
    let x = random(width);
    let y = random(height);
    triangle(x, y, x-5, y+15, x+5, y+15);
  }
}

function telaInicio() {
  drawFieldDetails();
  
  fill(255, 215, 0);
  textSize(64);
  textAlign(CENTER);
  text("AGROCAT", width/2, height/2 - 60);
  
  fill(255);
  textSize(24);
  text("Use as setas ou WASD para mover", width/2, height/2 + 20);
  text("Espaço para dash", width/2, height/2 + 50);
  
  fill(50, 205, 50);
  rect(width/2 - 100, height/2 + 100, 200, 50, 10);
  fill(255);
  textSize(28);
  text("JOGAR", width/2, height/2 + 130);
  
  push();
  translate(width/2, height/2 - 150);
  fill(255, 165, 0);
  ellipse(0, 0, 60);
  fill(210, 180, 140);
  arc(0, -10, 60, 60, PI, TWO_PI);
  fill(255);
  ellipse(-15, -10, 15);
  ellipse(15, -10, 15);
  fill(0);
  ellipse(-15, -10, 5);
  ellipse(15, -10, 5);
  noFill();
  stroke(0);
  arc(0, 10, 20, 20, 0, PI);
  pop();
}

function gameOverScreen() {
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER);
  text("FIM DO DIA", width/2, height/2);
  
  textSize(32);
  if (tempoRestante <= 0) {
    fill(255, 100, 100);
    text("TEMPO ESGOTADO!", width/2, height/2 + 40);
  }
  
  fill(255);
  textSize(24);
  text("Colheita total: " + score, width/2, height/2 + 80);
  text("Clique para recomeçar", width/2, height/2 + 120);
}

function getPragaSpeed() {
  return pragaBaseSpeed * (1 + nivelDificuldade * 0.15);
}

function getPragaSpawnInterval() {
  return max(1000, pragaBaseSpawnInterval - nivelDificuldade * 150);
}

function aumentarDificuldadeProgressiva() {
  if (millis() - ultimoAumentoDificuldade > tempoAumentoDificuldade) {
    nivelDificuldade++;
    ultimoAumentoDificuldade = millis();
    tempoAumentoDificuldade = max(8000, tempoAumentoDificuldade - 300);
  }
}

function atualizarTempo() {
  if (millis() - ultimoTempo > 1000) {
    tempoRestante--;
    ultimoTempo = millis();
  }
}

function mostrarInfo() {
  fill(255);
  textSize(24);
  text("Colheita: " + score, 20, 40);
  
  let tempoCor = color(255, map(tempoRestante, 0, tempoInicial, 0, 255), 0);
  fill(tempoCor);
  text("Tempo: " + tempoRestante + "s", 20, 70);
  
  fill(200, 200, 255);
  text("Nível: " + nivelDificuldade, 20, 100);
  
  noStroke();
  fill(50);
  rect(20, 80, 200, 10);
  fill(tempoCor);
  rect(20, 80, map(tempoRestante, 0, tempoInicial, 0, 200), 10);
}

function handleInput() {
  if (!gameStarted || gameOver) return;
  
  let force = createVector(0, 0);
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) force.x = -0.15;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) force.x = 0.15;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) force.y = -0.15;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) force.y = 0.15;
  agroCat.applyForce(force);
}

function updateGame() {
  agroCat.update();
  agroCat.show();
  
  if (plantacoes.length < 24) {
    reporPlantacoes();
  }
  
  for (let i = plantacoes.length - 1; i >= 0; i--) {
    plantacoes[i].show();
    if (plantacoes[i].hits(agroCat) && plantacoes[i].prontoParaColher) {
      score++;
      plantacoes[i].colher();
      tempoRestante = min(tempoInicial, tempoRestante + 0.75);
    }
    
    plantacoes[i].crescer();
    
    if (plantacoes[i].saude <= 0) {
      plantacoes.splice(i, 1);
    }
  }
  
  for (let i = pragas.length - 1; i >= 0; i--) {
    pragas[i].update(getPragaSpeed());
    pragas[i].show();
    
    if (pragas[i].hits(agroCat)) {
      gameOver = true;
    }
    
    for (let j = plantacoes.length - 1; j >= 0; j--) {
      if (pragas[i].hits(plantacoes[j])) {
        plantacoes[j].danificar();
      }
    }
  }
}

function spawnPraga() {
  let x = random(width);
  let y = -30;
  let praga = new Praga(x, y);
  praga.vel.y = getPragaSpeed();
  pragas.push(praga);
  
  if (random() < 0.1 + nivelDificuldade * 0.03) {
    let x2 = random(width);
    let y2 = -30;
    let praga2 = new Praga(x2, y2);
    praga2.vel.y = getPragaSpeed();
    pragas.push(praga2);
  }
}

function keyPressed() {
  if (key === ' ' && gameStarted && !gameOver) {
    agroCat.dash();
  }
}

function mousePressed() {
  if (!gameStarted) {
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
        mouseY > height/2 + 100 && mouseY < height/2 + 150) {
      gameStarted = true;
    }
    return;
  }
  
  if (gameOver) {
    resetGame();
  }
}

function resetGame() {
  score = 0;
  gameOver = false;
  gameStarted = true;
  plantacoes = [];
  pragas = [];
  pragaBaseSpeed = 1.5;
  pragaBaseSpawnInterval = 3500;
  tempoRestante = tempoInicial;
  ultimoTempo = millis();
  nivelDificuldade = 1;
  tempoAumentoDificuldade = 15000;
  ultimoAumentoDificuldade = millis();
  agroCat = new AgroCat(width/2, height/2);
  criarPlantacao();
}
