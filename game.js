
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
let gameSpeed = 3; // Slower start (Mario-like pace)
let frameCount = 0;
let level = 1;

// Image Assets (Procedurally drawn for now to keep it single-file)
// Mario-like palette
const PALETTE = {
    sky: '#87CEEB', // Sky Blue
    ground: '#5C3317', // Earth Brown
    groundTop: '#1EBC31', // Grass Green
    brick: '#B23A12',
    block: '#FFD700', // Question block gold
    player: '#E52521', // Mario Red
    playerDungarees: '#0433FF' // Mario Blue
};

// Canvas Size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const player = {
    x: 100,
    y: 200,
    w: 30, // Hitbox width
    h: 40, // Hitbox height
    dy: 0,
    gravity: 0.5,
    jumpPower: -11,
    grounded: false,
    doubleJump: false, // Mario usually doesn't double jump, but we can keep it for "Super" feel or remove it for purism. Let's keep it restricted.
    canDoubleJump: true,
    state: 'idle' // idle, run, jump
};

let entities = []; // Platforms, obstacles, coins combined or separate lists?
let platforms = [];
let particles = [];
let pickups = [];
let mobs = []; // Enemies

class Platform {
    constructor(x, y, w, type = 'BRICK') {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = 30;
        this.type = type; // BRICK, QUESTION, GROUND
        this.markedForDeletion = false;
    }

    update() {
        this.x -= gameSpeed;
        if (this.x + this.w < 0) this.markedForDeletion = true;
    }

    draw() {
        if (this.type === 'GROUND') {
            // Drawn globally mostly, but for chunks:
            return;
        }

        // Draw Brick/Block
        ctx.fillStyle = this.type === 'BRICK' ? PALETTE.brick : PALETTE.block;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Detail
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(this.x, this.y + this.h - 5, this.w, 3); // shadow

        // Brick texture
        if (this.type === 'BRICK') {
            ctx.fillStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        } else {
            // Question Block Dots
            ctx.fillStyle = '#C28800';
            ctx.fillRect(this.x + 5, this.y + 5, 4, 4);
            ctx.fillRect(this.x + this.w - 9, this.y + 5, 4, 4);
            ctx.fillRect(this.x + 5, this.y + this.h - 9, 4, 4);
            ctx.fillRect(this.x + this.w - 9, this.y + this.h - 9, 4, 4);
        }
    }
}

class Mob {
    constructor() {
        this.w = 30;
        this.h = 30;
        this.x = canvas.width + Math.random() * 500;
        this.y = canvas.height - 40 - this.h; // On ground
        this.markedForDeletion = false;
        this.speedOffset = -1; // Moves slightly towards player
        this.animationFrame = 0;
    }

    update() {
        this.x -= (gameSpeed + 1); // Moves left faster than ground
        this.animationFrame++;
        if (this.x + this.w < 0) this.markedForDeletion = true;
    }

    draw() {
        // Goomba-like Smog Monster
        let bounce = Math.sin(this.animationFrame * 0.2) * 3;

        ctx.fillStyle = '#5D3C31'; // Brownish/Dark
        if (this.animationFrame % 20 < 10) {
            // Step 1
        }

        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15 - bounce, 15, 0, Math.PI, true); // Head
        ctx.lineTo(this.x + 30, this.y + 30);
        ctx.lineTo(this.x, this.y + 30);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 5, this.y + 5 - bounce, 8, 8);
        ctx.fillRect(this.x + 17, this.y + 5 - bounce, 8, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 7, this.y + 7 - bounce, 3, 3);
        ctx.fillRect(this.x + 19, this.y + 7 - bounce, 3, 3);
    }
}

class Pickup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.markedForDeletion = false;
        this.baseY = y;
        this.floatOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x -= gameSpeed;
        this.y = this.baseY + Math.sin(frameCount * 0.1 + this.floatOffset) * 5;
        if (this.x + this.size < 0) this.markedForDeletion = true;
    }

    draw() {
        // Coin / Battery
        ctx.fillStyle = '#F59E0B'; // Amber coin
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y + 10, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FCD34D'; // Shine
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y + 10, 5, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F59E0B'; // Text
        ctx.font = '12px "Outfit"';
        ctx.fillText('⚡', this.x + 4, this.y + 14);
    }
}

function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
    if (e.type === 'touchstart') e.preventDefault();

    if (!gameRunning) return;

    if (player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
        player.canDoubleJump = true;
    } else if (player.canDoubleJump) {
        player.dy = player.jumpPower * 0.9;
        player.canDoubleJump = false;
    }
}

window.addEventListener('keydown', handleInput);
canvas.addEventListener('mousedown', () => handleInput({ type: 'keydown', code: 'Space' }));
canvas.addEventListener('touchstart', handleInput);

function spawnLevelChunks() {
    // Progressive Generation
    // Every 1000px distance approx (gameSpeed * frames)

    // Platforms high
    if (frameCount % 150 === 0) {
        if (Math.random() > 0.3) {
            let height = canvas.height - 120 - Math.random() * 80;
            platforms.push(new Platform(canvas.width, height, 100 + Math.random() * 60, 'BRICK'));

            // Put pickups on platform
            if (Math.random() > 0.3) {
                pickups.push(new Pickup(canvas.width + 40, height - 40));
                pickups.push(new Pickup(canvas.width + 80, height - 40));
            }
        }
    }

    // Mobs (Goombas)
    if (frameCount % (200 - Math.min(level * 10, 100)) === 0) {
        mobs.push(new Mob());
    }
}

function updatePhysics() {
    player.dy += player.gravity;
    player.y += player.dy;

    // Ground Check
    const groundLevel = canvas.height - 40;

    // Reset grounded for this frame until proven otherwise
    let onGround = false;

    // 1. Check Main Floor
    if (player.y + player.h > groundLevel) {
        player.y = groundLevel - player.h;
        player.dy = 0;
        onGround = true;
    }

    // 2. Check Platforms
    platforms.forEach(plat => {
        // AABB Collision (simplified for landing on top)
        // Only land if falling (dy > 0) and previous frame was above
        if (player.dy >= 0 &&
            player.y + player.h - player.dy <= plat.y + 10 && // Was above-ish
            player.y + player.h > plat.y && // Is intersecting
            player.x + player.w > plat.x && // Horizontal Overlap
            player.x < plat.x + plat.w
        ) {
            player.y = plat.y - player.h;
            player.dy = 0;
            onGround = true;
        }
    });

    player.grounded = onGround;
    if (onGround) player.canDoubleJump = true;
}

function checkCollisions() {
    // Mobs
    mobs.forEach(mob => {
        if (
            player.x < mob.x + mob.w &&
            player.x + player.w > mob.x &&
            player.y < mob.y + mob.h &&
            player.y + player.h > mob.y
        ) {
            // Mario Logic: Jump ON TOP = Kill, Touch Side = Die
            const falling = player.dy > 0;
            const hitFromAbove = (player.y + player.h) - (mob.y + mob.h / 2) < 0;

            if (falling && hitFromAbove) {
                // Kill mob
                mob.markedForDeletion = true;
                player.dy = -6; // Bounce
                score += 50;
                createExplosion(mob.x + mob.w / 2, mob.y + mob.h / 2, '#555');
            } else {
                // Hit player
                energy -= 20;
                createExplosion(player.x, player.y, '#f00');
                mob.markedForDeletion = true; // Remove mob anyway to prevent install-kill
                if (energy <= 0) gameOver();
            }
        }
    });

    // Pickups
    pickups.forEach(p => {
        let dx = (player.x + player.w / 2) - (p.x + 10);
        let dy = (player.y + player.h / 2) - (p.y + 10);
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 30) {
            score += 20;
            energy = Math.min(energy + 10, 100);
            p.markedForDeletion = true;
        }
    });
}

function createExplosion(x, y, color) {
    // Simple particles
}

function drawPlayer() {
    // "Mario" style box
    ctx.fillStyle = PALETTE.player; // Red Texture
    ctx.fillRect(player.x, player.y, player.w, player.h); // Shirt

    // Dungarees
    ctx.fillStyle = PALETTE.playerDungarees;
    ctx.fillRect(player.x, player.y + 25, player.w, 15);

    // Hat (Visor for Battery man)
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(player.x - 2, player.y - 5, player.w + 4, 10);

    // Face (Pale)
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(player.x + 5, player.y + 5, 20, 15);

    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 18, player.y + 8, 4, 4);
}

function drawEnvironment() {
    // Sky
    ctx.fillStyle = PALETTE.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = '#fff';
    const cloudOffset = (frameCount * 0.5) % (canvas.width + 200);
    drawCloud(100 - cloudOffset, 80);
    drawCloud(600 - cloudOffset, 50);
    drawCloud(900 - cloudOffset, 120);

    // Mountains (Parallax ish)
    ctx.fillStyle = '#1e3a8a'; // Dark blue hills
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= canvas.width + 100; i += 150) {
        let h = 100 + Math.sin(i * 0.01 + frameCount * 0.002) * 50;
        ctx.lineTo(i, canvas.height - h);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Ground
    const groundLevel = canvas.height - 40;
    ctx.fillStyle = PALETTE.ground;
    ctx.fillRect(0, groundLevel, canvas.width, 40);

    // Grass Top
    ctx.fillStyle = PALETTE.groundTop;
    ctx.fillRect(0, groundLevel, canvas.width, 10);

    // Ground Scroll Effect (Stripes)
    let groundOffset = (frameCount * gameSpeed) % 40;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = -groundOffset; i < canvas.width; i += 40) {
        ctx.fillRect(i, groundLevel + 10, 20, 30);
    }
}

function drawCloud(x, y) {
    if (x < -100) x += canvas.width + 200;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 35, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    ctx.fill();
}

function update() {
    // Clear handled by drawEnvironment's full rect fill
    drawEnvironment();

    // Game Logic
    updatePhysics();
    checkCollisions();
    spawnLevelChunks();

    // Player
    drawPlayer();

    // Entities
    platforms.forEach((p, i) => { p.update(); p.draw(); if (p.markedForDeletion) platforms.splice(i, 1); });
    mobs.forEach((m, i) => { m.update(); m.draw(); if (m.markedForDeletion) mobs.splice(i, 1); });
    pickups.forEach((p, i) => { p.update(); p.draw(); if (p.markedForDeletion) pickups.splice(i, 1); });

    // Level & HUD
    score++;
    if (score % 1000 === 0) {
        level++;
        gameSpeed += 0.5; // Progressive speed up
        // Energy refill on level up
        energy = Math.min(energy + 20, 100);
    }

    // UI
    scoreEl.innerText = score.toString().padStart(6, '0');
    energyEl.style.width = `${energy}%`;

    // Draw Level Text temporarily
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`LEVEL ${level}`, 20, 40);

    // Energy drain
    energy -= 0.02; // Slower drain
    if (energy <= 0) gameOver();

    if (gameRunning) {
        frameCount++;
        frameId = requestAnimationFrame(update);
    }
}

function startGame() {
    gameRunning = true;
    score = 0;
    energy = 100;
    gameSpeed = 3;
    level = 1;
    frameCount = 0;

    platforms = [];
    mobs = [];
    pickups = [];

    player.y = 200;
    player.dy = 0;
    player.grounded = false;

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
