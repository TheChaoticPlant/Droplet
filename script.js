// Menu & Screens
const startBtn = document.getElementById("startBtn");
const donateBtn = document.getElementById("donateBtn");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("gameContainer");

const gameOverScreen = document.getElementById("gameOver");
const retryBtn = document.getElementById("retryBtn");
const donateAgainBtn = document.getElementById("donateAgainBtn");
const finalScoreText = document.getElementById("finalScore");

// Game Variables
let isJumping = false;
let score = 0;
let gameRunning = false;
let scoreEl, droplet, goop, livesEl;
let collisionInterval;
let lives = 3; // Add this line

// Start Game
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  launchGame();
});

// Confetti Burst
function confettiBurst() {
  // Simple confetti using canvas-confetti CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
  script.onload = () => {
    window.confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  document.body.appendChild(script);
}

// Donate Buttons
donateBtn.addEventListener("click", () => {
  confettiBurst();
  window.open("https://www.charitywater.org", "_blank");
});
donateAgainBtn.addEventListener("click", () => {
  confettiBurst();
  window.open("https://www.charitywater.org", "_blank");
});

// Retry Game
retryBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  gameContainer.innerHTML = "";
  score = 0;
  launchGame();
});

// Start game logic
function launchGame() {
  gameRunning = true;
  lives = 3;

  gameContainer.innerHTML = `
    <div id="game">
      <div id="lives"></div>
      <div id="droplet"></div>
      <div id="goop"></div>
      <div id="score">Score: 0</div>
    </div>
  `;

  droplet = document.getElementById("droplet");
  goop = document.getElementById("goop");
  scoreEl = document.getElementById("score");
  livesEl = document.getElementById("lives");

  updateLivesDisplay();

  goop.style.animation = "moveGoop 2s linear infinite";

  document.addEventListener("keydown", handleJump);
  document.addEventListener("touchstart", handleJump);

  collisionInterval = setInterval(checkCollision, 100);
}

function handleJump(e) {
  if ((!e.code || e.code === "Space") && !isJumping && gameRunning) {
    jump();
  }
}

function jump() {
  isJumping = true;
  let jumpHeight = 0;
  let upInterval = setInterval(() => {
    if (jumpHeight >= 150) {
      clearInterval(upInterval);
      let downInterval = setInterval(() => {
        if (jumpHeight <= 0) {
          clearInterval(downInterval);
          isJumping = false;
        } else {
          jumpHeight -= 5;
          droplet.style.bottom = jumpHeight + "px";
        }
      }, 20);
    } else {
      jumpHeight += 5;
      droplet.style.bottom = jumpHeight + "px";
    }
  }, 20);
}

function checkCollision() {
  if (!gameRunning) return;

  const dropletTop = parseInt(window.getComputedStyle(droplet).getPropertyValue("bottom"));
  const goopLeft = parseInt(window.getComputedStyle(goop).getPropertyValue("left"));

  if (goopLeft > 50 && goopLeft < 100 && dropletTop < 50) {
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
      endGame(goopLeft);
    } else {
      // Reset goop position for next round
      goop.style.animation = "none";
      goop.offsetHeight; // force reflow
      goop.style.animation = "moveGoop 2s linear infinite";
    }
  } else {
    score++;
    scoreEl.textContent = "Score: " + score;
  }
}

function updateLivesDisplay() {
  if (livesEl) {
    livesEl.innerHTML = "❤️".repeat(lives);
  }
}

function endGame(goopPosition) {
  gameRunning = false;
  clearInterval(collisionInterval);

  goop.style.animation = "none";
  goop.style.left = goopPosition + "px";

  gameOverScreen.style.display = "flex";
  finalScoreText.textContent = `Your Final Score: ${score}`;
}
