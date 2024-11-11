const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = 750;
canvas.height = 750;

let player = { x: 50, y: 50, size: 35 };
let berries = [];
let powerUps = [];
let chasers = [];
let wanderers = [];
let obstacles = [];
let dangerAreas = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameInterval;
let difficultyLevel = 1;
let isGameOver = false;
let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;

const backgroundMusic = new Audio('Game/Pan Sever.mp3');
const gameOverSound = new Audio('Game/gamover.mp3');
gameOverSound.volume = 0.4;
backgroundMusic.loop = true;  
backgroundMusic.volume = 0.5; 

const playerImg = new Image();
const berryImg = new Image();
const chaserImg = new Image();
const wandererImg = new Image();
const obstacleImg = new Image();
const powerUpImg = new Image();

playerImg.src = 'Game/zlato.png';
berryImg.src = 'Game/body.png';
chaserImg.src = 'Game/severa.png';
wandererImg.src = "Game/pavlik.png"
obstacleImg.src = 'Game/zed.png';
powerUpImg.src = 'Game/slowtime.png';

const startButton = document.getElementById("start-button");
const gameOverScreen = document.getElementById("game-over");
const scoreDisplay = document.getElementById("score-display");
const restartButton = document.getElementById("restart-button");
const highScoreDisplay = document.getElementById("high-score");
const toggleMusicButton = document.getElementById("toggle-music");
const volumeControl = document.getElementById("volume-control");
const currentScoreDisplay = document.getElementById("current-score");
const joystickBase = document.getElementById('joystick-base');
const joystickThumb = document.getElementById('joystick-thumb');

highScoreDisplay.textContent = highScore;

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
toggleMusicButton.addEventListener("click", toggleMusic);
volumeControl.addEventListener("input", adjustVolume);

let slowEffectActive = false;
let slowEffectDuration = 4000; 
let slowEffectTimeout;

function startGame() {
  startButton.style.display = "none";
  canvas.style.display = "block";
  isGameOver = false;
  score = 0;
  currentScoreDisplay.textContent = score;
  difficultyLevel = 1;
  player = { x: 50, y: 50, size: 30 };
  berries = []
  powerUps = [];
  chasers = [];
  wanderers = [];
  chaserCount = 0;
  obstacles = [];
  dangerAreas = [];
  
  slowEffectActive = false;
  clearTimeout(slowEffectTimeout);
  
  spawnBerry();
  spawnChaser();
  gameInterval = setInterval(updateGame, 1000 / 60);
  backgroundMusic.play();
}

function spawnChaser() {
  if (chaserCount >= 4) {
    spawnWanderer();
    return;
  }

  const minDistanceFromPlayer = 100;
  let chaser = { x: 0, y: 0, speed: difficultyLevel };

  do {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0:
        chaser.x = Math.random() * canvas.width;
        chaser.y = 0;
        break;
      case 1:
        chaser.x = canvas.width - 20;
        chaser.y = Math.random() * canvas.height;
        break;
      case 2:
        chaser.x = Math.random() * canvas.width;
        chaser.y = canvas.height - 20;
        break;
      case 3:
        chaser.x = 0;
        chaser.y = Math.random() * canvas.height;
        break;
    }
  } while (distance(chaser, player) < minDistanceFromPlayer);

  chasers.push(chaser);
  chaserCount++;
}

function spawnWanderer() {
  const buffer = 10;
  
  let wanderer = {
    x: Math.random() * (canvas.width - 2 * buffer) + buffer,
    y: Math.random() * (canvas.height - 2 * buffer) + buffer,
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 2,
    size: 35
  };
  wanderers.push(wanderer);
}

function restartGame() {
  gameOverScreen.style.display = "none";
  startGame();
}

function spawnBerry() {
  let berry;
  do {
    berry = {
      x: Math.random() * (canvas.width - 20),
      y: Math.random() * (canvas.height - 20),
      size: 30
    };
  } while (obstacles.some(obstacle => distance(berry, obstacle) < 50));
  
  berries.push(berry);
}

function spawnPowerUp() {
  powerUps.push({
    x: Math.random() * (canvas.width - 20),
    y: Math.random() * (canvas.height - 20),
    size: 30
  });
}

function spawnObstacle() {
  let safeDistance = 150;
  let obstacle;

  do {
    obstacle = {
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * (canvas.height - 30),
      size: 40
    };
  } while (Math.hypot(obstacle.x - player.x, obstacle.y - player.y) < safeDistance);

  obstacles.push(obstacle);
}


function spawnDangerArea() {
  const dangerArea = {
    x: Math.random() * (canvas.width - 100) + 50,
    y: Math.random() * (canvas.height - 100) + 50,
    size: 18,
    maxSize: 100, 
    growing: true 
  };
  dangerAreas.push(dangerArea);
}

function drawCursor() {
  ctx.beginPath();
  ctx.arc(cursorX + player.size / 2, cursorY + player.size / 2, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.closePath();
}
document.body.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });
joystickBase.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  joystickStartX = touch.clientX;
  joystickStartY = touch.clientY;
  joystickActive = true;
});

joystickBase.addEventListener('touchmove', (e) => {
  if (!joystickActive) return;

  const touch = e.touches[0];
  const deltaX = touch.clientX - joystickStartX;
  const deltaY = touch.clientY - joystickStartY;

  const distance = Math.min(30, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
  const angle = Math.atan2(deltaY, deltaX);

  const thumbX = distance * Math.cos(angle);
  const thumbY = distance * Math.sin(angle);

  joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

  const speedMultiplier = 7;
  player.x += Math.cos(angle) * speedMultiplier;
  player.y += Math.sin(angle) * speedMultiplier;

  constrainPlayerPosition();
});

joystickBase.addEventListener('touchend', () => {
  joystickActive = false;
  joystickThumb.style.transform = 'translate(0px, 0px)';
});

function constrainPlayerPosition() {
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.size));
  player.y = Math.max(0, Math.min(player.y, canvas.height - player.size));
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isGameOver) return;

  updateChasers();
  updateWanderers();
  drawObstacles();
  checkCollisions();

  if (score > 0 && score % 50 === 0 && difficultyLevel === score / 50) {
    difficultyLevel++;
    spawnChaser();
    spawnObstacle();
  }

  drawPlayer();
  drawBerries();
  drawChasers();
  drawWanderers();
  drawPowerUps(); 
  updateDangerAreas();
  drawCursor();
}

canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);

function handleTouch(event) {
  event.preventDefault();

  if (isGameOver) return; 

  const rect = canvas.getBoundingClientRect();
  let touch = event.touches[0];
  let newX = touch.clientX - rect.left - player.size / 2;
  let newY = touch.clientY - rect.top - player.size / 2;

  newX = Math.max(0, Math.min(newX, canvas.width - player.size));
  newY = Math.max(0, Math.min(newY, canvas.height - player.size));

  player.x = newX;
  player.y = newY;
}
canvas.addEventListener("mousemove", (event) => {
  if (isGameOver) return; 

  const rect = canvas.getBoundingClientRect();
  let newX = event.clientX - rect.left - player.size / 2;
  let newY = event.clientY - rect.top - player.size / 2;

  if (!isGameOver) {
    newX = Math.max(0, Math.min(newX, canvas.width - player.size));
    newY = Math.max(0, Math.min(newY, canvas.height - player.size));
  }

  player.x = newX;
  player.y = newY;
});

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

function drawBerries() {
  berries.forEach((berry) => {
    ctx.drawImage(berryImg, berry.x, berry.y, berry.size, berry.size);
  });
}

function drawPowerUps() {
  powerUps.forEach((powerUp) => {
    ctx.drawImage(powerUpImg, powerUp.x, powerUp.y, powerUp.size, powerUp.size);
  });
}

function drawChasers() {
  chasers.forEach((chaser) => {
    ctx.drawImage(chaserImg, chaser.x, chaser.y, 30, 30);
  });
}

function updateChasers() {
  chasers.forEach((chaser) => {
    let effectiveSpeed = slowEffectActive ? chaser.speed * 0.5 : chaser.speed;
    if (chaser.x < player.x) chaser.x += effectiveSpeed;
    if (chaser.x > player.x) chaser.x -= effectiveSpeed;
    if (chaser.y < player.y) chaser.y += effectiveSpeed;
    if (chaser.y > player.y) chaser.y -= effectiveSpeed;
  });
}
function drawWanderers() {
  wanderers.forEach((wanderer) => {
    ctx.drawImage(wandererImg, wanderer.x, wanderer.y, wanderer.size, wanderer.size);
  });
}
function updateWanderers() {
  wanderers.forEach((wanderer) => {
    wanderer.x += wanderer.speedX * difficultyLevel;
    wanderer.y += wanderer.speedY * difficultyLevel;

    if (wanderer.x <= 0 || wanderer.x >= canvas.width - wanderer.size) {
      wanderer.speedX *= -1;
      wanderer.x = Math.max(0, Math.min(wanderer.x, canvas.width - wanderer.size));
    }
    if (wanderer.y <= 0 || wanderer.y >= canvas.height - wanderer.size) {
      wanderer.speedY *= -1;
      wanderer.y = Math.max(0, Math.min(wanderer.y, canvas.height - wanderer.size));
    }
  });
}

setInterval(spawnDangerArea, 6500);

function updateDangerAreas() {
  dangerAreas.forEach((dangerArea, index) => {
    if (dangerArea.growing) {
      dangerArea.size += 1.5;

      if (dangerArea.size >= dangerArea.maxSize) {
        dangerArea.growing = false;
        
        const dx = player.x - dangerArea.x;
        const dy = player.y - dangerArea.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < dangerArea.size + player.size / 2) {
          endGame();
        }

        dangerAreas.splice(index, 1);
        return; 
      }
    }

    const fillOpacity = Math.min(0.75, dangerArea.size / dangerArea.maxSize);

    ctx.beginPath();
    ctx.arc(dangerArea.x, dangerArea.y, dangerArea.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${fillOpacity})`;
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "bold 35px Arial"; 
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", dangerArea.x, dangerArea.y);
  });
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.size, obstacle.size);
  });
}

function checkCollisions() {
  berries.forEach((berry, index) => {
    if (
      player.x < berry.x + berry.size &&
      player.x + player.size > berry.x &&
      player.y < berry.y + berry.size &&
      player.y + player.size > berry.y
    ) {
      berries.splice(index, 1);
      score += 10;
      currentScoreDisplay.textContent = score;
      spawnBerry();

      if (Math.random() < 0.10) {
        spawnPowerUp();
      }
    }
  });

  powerUps.forEach((powerUp, index) => {
    if (
      player.x < powerUp.x + powerUp.size &&
      player.x + player.size > powerUp.x &&
      player.y < powerUp.y + powerUp.size &&
      player.y + player.size > powerUp.y
    ) {
      powerUps.splice(index, 1);
      activateSlowEffect();
    }
  });

  chasers.forEach((chaser) => {
    if (
      player.x < chaser.x + 20 &&
      player.x + player.size > chaser.x &&
      player.y < chaser.y + 20 &&
      player.y + player.size > chaser.y
    ) {
      endGame();
    }
  });

  obstacles.forEach((obstacle) => {
    if (
      player.x < obstacle.x + obstacle.size &&
      player.x + player.size > obstacle.x &&
      player.y < obstacle.y + obstacle.size &&
      player.y + player.size > obstacle.y
    ) {
      endGame();
    }
  });
  wanderers.forEach((wanderer) => {
    if (
      player.x < wanderer.x + wanderer.size &&
      player.x + player.size > wanderer.x &&
      player.y < wanderer.y + wanderer.size &&
      player.y + player.size > wanderer.y
    ) {
      endGame();
    }
  });
}

function activateSlowEffect() {
  slowEffectActive = true;
  
  clearTimeout(slowEffectTimeout);
  
  slowEffectTimeout = setTimeout(() => {
    slowEffectActive = false;
  }, slowEffectDuration);
}

function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  gameOverSound.play();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreDisplay.textContent = highScore;
  }

  gameOverScreen.style.display = "block";
  scoreDisplay.textContent = `Your Score: ${score}`;
}

function toggleMusic() {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    toggleMusicButton.textContent = "Pause Music";
  } else {
    backgroundMusic.pause();
    toggleMusicButton.textContent = "Play Music";
  }
}

function adjustVolume() {
  backgroundMusic.volume = volumeControl.value;
}

function distance(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
