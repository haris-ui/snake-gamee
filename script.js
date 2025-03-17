const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const stageDisplay = document.getElementById("stage");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 }; // Initial food position away from snake
let obstacles = [];
let dx = 0;
let dy = 0;
let score = 0;
let stage = 1;
let gameSpeed = 100; // Initial speed in ms
let lastTime = 0;
let gameActive = true;

// Stage settings
const stages = [
    { speed: 100, obstacleCount: 0 }, // Stage 1
    { speed: 80, obstacleCount: 3 },  // Stage 2
    { speed: 60, obstacleCount: 5 }   // Stage 3
];

function drawGame(timestamp) {
    if (!gameActive) return;

    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (elapsed > gameSpeed) {
        lastTime = timestamp;
        updateGame();
        renderGame();
    }

    requestAnimationFrame(drawGame);
}

function updateGame() {
    // Only update if snake is moving
    if (dx === 0 && dy === 0) return;

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        generateFood();
        checkStageProgression();
    } else {
        snake.pop();
    }

    // Check collisions
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y) ||
        obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        gameOver();
        return;
    }
}

function renderGame() {
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#32CD32");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    const snakeGradient = ctx.createLinearGradient(snake[0].x * gridSize, snake[0].y * gridSize, 
        snake[snake.length - 1].x * gridSize, snake[snake.length - 1].y * gridSize);
    snakeGradient.addColorStop(0, "#228B22");
    snakeGradient.addColorStop(1, "#98FB98");
    ctx.fillStyle = snakeGradient;
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Draw food
    ctx.fillStyle = "#FF4500";
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw obstacles
    ctx.fillStyle = "#808080";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function generateFood() {
    let attempts = 0;
    const maxAttempts = 100;
    do {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        attempts++;
    } while (isOccupied(food.x, food.y) && attempts < maxAttempts);
    if (attempts >= maxAttempts) {
        console.log("No space for food, but continuing game...");
    }
}

function generateObstacles(count) {
    obstacles = [];
    let attempts = 0;
    const maxAttempts = 100;
    while (obstacles.length < count && attempts < maxAttempts) {
        const obstacle = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        if (!isOccupied(obstacle.x, obstacle.y)) {
            obstacles.push(obstacle);
        }
        attempts++;
    }
}

function isOccupied(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y) ||
           obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
}

function checkStageProgression() {
    if (score >= 30 && stage === 1) {
        stage = 2;
        gameSpeed = stages[1].speed;
        generateObstacles(stages[1].obstacleCount);
        stageDisplay.textContent = `Stage: ${stage}`;
    } else if (score >= 60 && stage === 2) {
        stage = 3;
        gameSpeed = stages[2].speed;
        generateObstacles(stages[2].obstacleCount);
        stageDisplay.textContent = `Stage: ${stage}`;
    }
}

function gameOver() {
    gameActive = false;
    alert(`Game Over! Score: ${score} | Stage: ${stage}`);
    resetGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    stage = 1;
    gameSpeed = stages[0].speed;
    obstacles = [];
    food = { x: 15, y: 15 }; // Reset food to a safe position
    scoreDisplay.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;
    gameActive = true;
    requestAnimationFrame(drawGame);
}

document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case "ArrowDown":
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case "ArrowLeft":
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case "ArrowRight":
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

// Start game
food = { x: 15, y: 15 }; // Ensure food starts at a safe position
requestAnimationFrame(drawGame);