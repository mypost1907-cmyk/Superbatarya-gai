
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('gameScore');
const energyEl = document.getElementById('gameEnergy');
const startScreen = document.getElementById('gameStartScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

// Game State
let gameRunning = false;
let frameId;
let score = 0;
let energy = 100;
let gameSpeed = 5;
let frameCount = 0;

// Canvas Size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game Objects
const player = {
    x: 100,
    y: 200,
    radius: 15,
    dy: 0,
    gravity: 0.6,
    jumpPower: -12,
    grounded: false,
    color: '#f59e0b',
    glow: 20,
    doubleJump: true
};

let obstacles = [];
let particles = [];
let pickups = [];

class Obstacle {
    constructor() {
        this.w = 40;
        this.h = 60 + Math.random() * 80;
        this.x = canvas.width;
        this.y = canvas.height - this.h;
        this.markedForDeletion = false;
        this.type = Math.random() > 0.5 ? 'SMOG' : 'RESISTOR';
    }

    update() {
        this.x -= gameSpeed;
        if (this.x + this.w < 0) this.markedForDeletion = true;
    }

    draw() {
        if (this.type === 'SMOG') {
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y + 20, 30, 0, Math.PI * 2);
            ctx.arc(this.x + 40, this.y + 10, 25, 0, Math.PI * 2);
            ctx.arc(this.x + 10, this.y + 50, 20, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            // Resistor stripes
            ctx.fillStyle = '#fca5a5';
            ctx.fillRect(this.x + 5, this.y + 10, 30, 5);
            ctx.fillRect(this.x + 5, this.y + 30, 30, 5);
        }
    }
}

class Pickup {
    constructor() {
        this.radius = 10;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 150) + 50;
        this.markedForDeletion = false;
        this.type = Math.random() > 0.6 ? 'SUN' : 'WIND'; // 40% Wind, 60% Sun
    }

    update() {
        this.x -= gameSpeed;
        // Float effect
        this.y += Math.sin(frameCount * 0.05) * 0.5;
        if (this.x + this.radius < 0) this.markedForDeletion = true;
    }

    draw() {
        ctx.beginPath();
        if (this.type === 'SUN') {
            ctx.fillStyle = '#fbbf24';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fbbf24';
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            // Rays
            for (let i = 0; i < 8; i++) {
                let angle = (frameCount * 0.05) + (i * Math.PI / 4);
                let rx = this.x + Math.cos(angle) * 18;
                let ry = this.y + Math.sin(angle) * 18;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(rx, ry);
                ctx.strokeStyle = '#fbbf24';
                ctx.stroke();
            }
        } else {
            ctx.fillStyle = '#22d3ee'; // Cyan/Blue
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#22d3ee';
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            // Swirl
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6, 0, Math.PI * 1.5);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = color;
        this.life = 60;
    }
    update() {
        this.x -= gameSpeed + this.speedX;
        this.y += this.speedY;
        this.life--;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 60;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Input Handling
function jump() {
    if (!gameRunning) return;

    if (player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
        createParticles(player.x, player.y + player.radius, '#f59e0b', 5);
    } else if (player.doubleJump) {
        player.dy = player.jumpPower * 0.8;
        player.doubleJump = false;
        createParticles(player.x, player.y, '#fff', 5);
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
});
canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function spawnEntities() {
    // Obstacles
    if (frameCount % 120 === 0) { // Every ~2 seconds
        obstacles.push(new Obstacle());
    }
    // Pickups
    if (frameCount % 80 === 0) {
        pickups.push(new Pickup());
    }
}

function update() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background (Moving grid lines)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    let gridOffset = (frameCount * gameSpeed) % 50;
    for (let i = 0; i < canvas.width + 50; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i - gridOffset, 0);
        ctx.lineTo(i - gridOffset, canvas.height);
        ctx.stroke();
    }
    // Horizon
    ctx.fillStyle = '#111';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Player Physics
    player.dy += player.gravity;
    player.y += player.dy;

    // Ground Collision
    if (player.y + player.radius > canvas.height - 20) {
        player.y = canvas.height - 20 - player.radius;
        player.dy = 0;
        player.grounded = true;
        player.doubleJump = true;
        // Run particles
        if (frameCount % 5 === 0) createParticles(player.x - 10, player.y + player.radius, '#f59e0b', 1);
    } else {
        player.grounded = false;
    }

    // Draw Player
    ctx.shadowBlur = player.glow;
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Entities
    spawnEntities();

    // Obstacles
    obstacles.forEach((obs, index) => {
        obs.update();
        obs.draw();

        // Collision
        // Simple AABB/Circle check approximation
        let dx = player.x - (obs.x + obs.w / 2);
        let dy = player.y - (obs.y + obs.h / 2);
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < player.radius + 30) { // Hit
            energy -= 1; // Drain energy fast on contact
            createParticles(player.x, player.y, '#555', 2);
            if (energy <= 0) gameOver();
        }

        if (obs.markedForDeletion) obstacles.splice(index, 1);
    });

    // Pickups
    pickups.forEach((p, index) => {
        p.update();
        p.draw();

        let dx = player.x - p.x;
        let dy = player.y - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < player.radius + p.radius) {
            // Collect
            score += 100;
            energy = Math.min(energy + 15, 100);
            createParticles(p.x, p.y, p.type === 'SUN' ? '#fbbf24' : '#22d3ee', 10);
            p.markedForDeletion = true;
        }

        if (p.markedForDeletion) pickups.splice(index, 1);
    });

    // Particles
    particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(index, 1);
    });

    // Stats
    energy -= 0.05; // Passive drain
    if (energy <= 0) gameOver();

    score += 1;
    scoreEl.innerText = score;
    energyEl.style.width = `${energy}%`;
    if (energy < 20) energyEl.classList.replace('bg-amber-500', 'bg-red-500');
    else energyEl.classList.replace('bg-red-500', 'bg-amber-500');

    gameSpeed += 0.001; // Accelerate
    frameCount++;

    if (gameRunning) frameId = requestAnimationFrame(update);
}

function startGame() {
    gameRunning = true;
    score = 0;
    energy = 100;
    gameSpeed = 5;
    obstacles = [];
    pickups = [];
    particles = [];
    player.y = 200;
    player.dy = 0;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    update();
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(frameId);
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
