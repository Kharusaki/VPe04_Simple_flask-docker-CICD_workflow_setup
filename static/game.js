const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");

const W = canvas.width;
const H = canvas.height;
const GROUND_Y = H - 36;

const GRAVITY = 2600;
const JUMP_VELOCITY = -950;

const dino = {
  x: 70,
  w: 46,
  h: 50,
  y: GROUND_Y,
  vy: 0,
  onGround: true,
  legFrame: 0,
  legTimer: 0,
};

let ferns = [];
let speed = 330;
let spawnTimer = 0;
let spawnInterval = 1.3;
let score = 0;
let best = 0;
let state = "ready";
let lastTime = 0;

function start() {
  ferns = [];
  speed = 330;
  spawnTimer = 0;
  spawnInterval = 1.3;
  score = 0;
  dino.y = GROUND_Y;
  dino.vy = 0;
  dino.onGround = true;
  state = "playing";
  overlay.classList.add("hidden");
  lastTime = performance.now();
}

function jump() {
  if (state === "ready" || state === "over") {
    start();
    return;
  }
  if (dino.onGround) {
    dino.vy = JUMP_VELOCITY;
    dino.onGround = false;
  }
}

function gameOver() {
  state = "over";
  best = Math.max(best, Math.floor(score));
  bestEl.textContent = best;
  overlay.querySelector(".overlay-title").textContent = "Игра окончена";
  overlay.querySelector(".overlay-sub").textContent = "Пробел или клик — заново";
  overlay.classList.remove("hidden");
}

function collides(fern) {
  const pad = 6;
  const dx = dino.x + pad;
  const dw = dino.w - pad * 2;
  const dTop = dino.y - dino.h + pad;
  const dH = dino.h - pad;
  const fTop = GROUND_Y - fern.h + pad;
  const fH = fern.h - pad;
  return (
    dx < fern.x + fern.w - pad &&
    dx + dw > fern.x + pad &&
    dTop < fTop + fH &&
    dTop + dH > fTop
  );
}

function update(dt) {
  speed += 6 * dt;
  score += speed * dt * 0.08;

  dino.legTimer += dt;
  if (dino.legTimer > 0.09) {
    dino.legTimer = 0;
    dino.legFrame = 1 - dino.legFrame;
  }

  dino.vy += GRAVITY * dt;
  dino.y += dino.vy * dt;
  if (dino.y >= GROUND_Y) {
    dino.y = GROUND_Y;
    dino.vy = 0;
    dino.onGround = true;
  }

  spawnTimer += dt;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnInterval = Math.max(0.55, 1.3 - speed / 2500);
    const h = 34 + Math.random() * 34;
    ferns.push({ x: W + 24, w: 28, h });
  }

  for (const fern of ferns) {
    fern.x -= speed * dt;
  }
  ferns = ferns.filter((fern) => fern.x + fern.w > -30);

  for (const fern of ferns) {
    if (collides(fern)) {
      gameOver();
      break;
    }
  }

  scoreEl.textContent = Math.floor(score);
}

function drawDino() {
  const x = dino.x;
  const feet = dino.y;
  const top = feet - dino.h;
  ctx.fillStyle = "#535353";

  ctx.fillRect(x + 8, top + 10, dino.w - 16, dino.h - 24);
  ctx.fillRect(x + dino.w - 20, top, 20, 18);
  ctx.fillRect(x + dino.w - 2, top + 11, 8, 5);
  ctx.fillRect(x - 6, top + 13, 8, 6);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + dino.w - 11, top + 4, 4, 4);

  const moving = dino.onGround && state === "playing";
  const lift = moving && dino.legFrame ? 5 : 0;
  const lift2 = moving && !dino.legFrame ? 5 : 0;
  ctx.fillStyle = "#535353";
  ctx.fillRect(x + 8, feet - 12 + lift, 6, 12 - lift);
  ctx.fillRect(x + dino.w - 18, feet - 12 + lift2, 6, 12 - lift2);
}

function drawFern(fern) {
  const cx = fern.x + fern.w / 2;
  const topY = GROUND_Y - fern.h;

  ctx.strokeStyle = "#2e7d32";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, GROUND_Y);
  ctx.lineTo(cx, topY);
  ctx.stroke();

  ctx.fillStyle = "#43a047";
  const leaves = 4;
  for (let i = 0; i < leaves; i++) {
    const ly = topY + (fern.h / leaves) * i + 5;
    const lw = (fern.w / 2) * (1 - i / (leaves + 1));
    ctx.beginPath();
    ctx.ellipse(cx - lw, ly, lw, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + lw, ly, lw, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = "#cfd8cf";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 1);
  ctx.lineTo(W, GROUND_Y + 1);
  ctx.stroke();

  for (const fern of ferns) {
    drawFern(fern);
  }
  drawDino();
}

function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  if (state === "playing") {
    update(dt);
  }
  render();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  jump();
});

bestEl.textContent = best;
requestAnimationFrame((now) => {
  lastTime = now;
  requestAnimationFrame(frame);
});
