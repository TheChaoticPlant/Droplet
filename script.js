// Menu & Screens
const startBtn = document.getElementById("startBtn");
const donateBtn = document.getElementById("donateBtn");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("gameContainer");

const gameOverScreen = document.getElementById("gameOver");
const retryBtn = document.getElementById("retryBtn");
const donateAgainBtn = document.getElementById("donateAgainBtn");
const finalScoreText = document.getElementById("finalScore");

// Sounds
const dropletSound = new Audio('./droplet-sound.mp3');
const splashSound = new Audio('./splash.mp3');

[dropletSound, splashSound].forEach(sound => {
  sound.onerror = () => alert('A sound file failed to load!');
  sound.volume = 1.0;
  sound.muted = false;
});

// Game Variables
let isJumping = false;
let score = 0;
let lives = 3;
let gameRunning = false;
let collisionInterval, scoreInterval;
let collisionHappened = false;

let scoreEl, droplet, goop, livesEl;

// Difficulty Settings
const difficulties = {
  Easy:   { goopSpeed: 2.5, winScore: 500, lives: 5, scoreRate: 1 },
  Normal: { goopSpeed: 2,   winScore: 1000, lives: 3, scoreRate: 2 },
  Hard:   { goopSpeed: 1.2, winScore: 1500, lives: 1, scoreRate: 3 }
};
let currentDifficulty = 'Normal';

// Start Game
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  launchGame();
});

// Confetti Burst
function confettiBurst() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  script.onload = () => {
    window.confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2196f3', '#00bcd4', '#40c4ff', '#b3e5fc'] // water blues
    });
  };
  document.body.appendChild(script);
}

// Donate Buttons
[donateBtn, donateAgainBtn].forEach(btn => {
  btn.addEventListener("click", () => {
    confettiBurst();
    window.open("https://www.charitywater.org", "_blank");
  });
});

// Retry Game
retryBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  gameContainer.innerHTML = "";
  score = 0;
  launchGame();
});

// Difficulty dropdown
menu.insertAdjacentHTML('beforeend', `
  <div id="difficultySelect" style="margin-top:10px;">
    <label for="difficulty" style="font-size:1.2rem;">Difficulty:</label>
    <select id="difficulty" style="font-size:1.1rem;">
      <option value="Easy">Easy</option>
      <option value="Normal" selected>Normal</option>
      <option value="Hard">Hard</option>
    </select>
  </div>
`);
document.getElementById('difficulty').addEventListener('change', (e) => {
  currentDifficulty = e.target.value;
});

// Launch game
function launchGame() {
  gameRunning = true;
  collisionHappened = false;

  const { goopSpeed, winScore, lives: startLives, scoreRate } = difficulties[currentDifficulty];
  lives = startLives;
  score = 0;

  gameContainer.innerHTML = `
    <div id="game">
      <div id="lives"></div>
      <div id="droplet"></div>
      <div id="goop"></div>
      <div id="score">Score: 0</div>
      <div id="goal" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.2rem;color:#222;background:#fff3;z-index:2;border-radius:8px;padding:4px 12px;">Goal: ${winScore} pts</div>
    </div>
  `;

  droplet = document.getElementById("droplet");
  goop = document.getElementById("goop");
  scoreEl = document.getElementById("score");
  livesEl = document.getElementById("lives");

  updateLivesDisplay();

  goop.style.animation = `moveGoop ${goopSpeed}s linear infinite`;
  goop.addEventListener('animationiteration', () => { collisionHappened = false; });

  document.removeEventListener("keydown", handleJump);
  document.removeEventListener("touchstart", handleJump);
  document.addEventListener("keydown", handleJump);
  document.addEventListener("touchstart", handleJump);

  collisionInterval = setInterval(() => checkCollision(winScore), 50);

  scoreInterval = setInterval(() => {
    if (gameRunning) {
      score += scoreRate;
      if (scoreEl) scoreEl.textContent = `Score: ${score}`;
      if (score >= winScore) {
        endGame(parseInt(window.getComputedStyle(goop).getPropertyValue("left")), true);
      }
    }
  }, 100);
}

function handleJump(e) {
  if ((!e.code || e.code === "Space") && !isJumping && gameRunning) {
    jump();
  }
}

function jump() {
  dropletSound.currentTime = 0;
  dropletSound.play();

  isJumping = true;
  let jumpHeight = 0;

  const up = setInterval(() => {
    if (jumpHeight >= 150) {
      clearInterval(up);
      const down = setInterval(() => {
        if (jumpHeight <= 0) {
          clearInterval(down);
          isJumping = false;
        } else {
          jumpHeight -= 5;
          droplet.style.bottom = `${jumpHeight}px`;
        }
      }, 20);
    } else {
      jumpHeight += 5;
      droplet.style.bottom = `${jumpHeight}px`;
    }
  }, 20);
}

function checkCollision(winScore) {
  if (!gameRunning) return;

  const dropletTop = parseInt(window.getComputedStyle(droplet).getPropertyValue("bottom"));
  const goopLeft = parseInt(window.getComputedStyle(goop).getPropertyValue("left"));

  if (goopLeft > 50 && goopLeft < 100 && dropletTop < 50 && !collisionHappened) {
    splashSound.currentTime = 0;
    splashSound.play();

    lives--;
    updateLivesDisplay();
    collisionHappened = true;

    // Start flashing effect for invulnerability
    droplet.classList.add("invulnerable");
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      droplet.style.visibility = (droplet.style.visibility === "hidden") ? "visible" : "hidden";
      flashCount++;
      if (flashCount > 9) { // 5 flashes (500ms)
        clearInterval(flashInterval);
        droplet.style.visibility = "visible";
        droplet.classList.remove("invulnerable");
      }
    }, 50);

    setTimeout(() => {
      collisionHappened = false;
    }, 500); // 500ms of invulnerability

    if (lives <= 0) {
      endGame(goopLeft, false);
    } else {
      goop.style.animation = "none";
      goop.offsetHeight;
      goop.style.animation = `moveGoop ${difficulties[currentDifficulty].goopSpeed}s linear infinite`;
    }
  }
}

function updateLivesDisplay() {
  if (livesEl) {
    livesEl.innerHTML = "❤️".repeat(lives);
  }
}

function endGame(goopPosition, isWin = false) {
  gameRunning = false;
  clearInterval(collisionInterval);
  clearInterval(scoreInterval);

  if (goop) {
    goop.style.animation = "none";
    goop.style.left = goopPosition + "px";
  }

  gameOverScreen.style.display = "flex";
  if (isWin) {
    finalScoreText.textContent = `You Win! Final Score: ${score} (${currentDifficulty})`;
    confettiBurst(); // Show water confetti on win
  } else {
    finalScoreText.textContent = `Your Final Score: ${score} (${currentDifficulty})`;
  }
}

// After DOMContentLoaded or at the end of your script:
document.getElementById("mainMenuBtn").onclick = () => {
  gameOverScreen.style.display = "none";
  gameContainer.innerHTML = "";
  menu.style.display = "flex";
};
