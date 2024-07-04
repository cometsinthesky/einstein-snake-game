const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const canvasSize = { width: canvas.width, height: canvas.height };

let snake = [{ x: box * 5, y: box * 5 }];
let direction = 'RIGHT';
let food = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };
let score = 0;
let canCrossWalls = false;
let isPaused = false;

let lastTime = 0;
let updateTime = 80;

document.addEventListener('keydown', changeDirection);
document.getElementById('restartBtn').addEventListener('click', restartGame);

function changeDirection(event) {
    const keyPressed = event.keyCode;
    if (keyPressed === 37 && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (keyPressed === 38 && direction !== 'DOWN') {
        direction = 'UP';
    } else if (keyPressed === 39 && direction !== 'LEFT') {
        direction = 'RIGHT';
    } else if (keyPressed === 40 && direction !== 'UP') {
        direction = 'DOWN';
    } else if (keyPressed === 32) {
        event.preventDefault();
        isPaused = !isPaused;
    }
}

const limitScore = 3;

function draw(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? (score >= limitScore ? '#3333FF' : 'lime') : (score >= limitScore ? 'blue' : 'green');
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = score >= limitScore ? 'darkblue' : 'darkgreen';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = 'yellow';
    ctx.fillRect(food.x, food.y, box, box);

    if (!isPaused) {
        if (currentTime - lastTime > updateTime) {
            lastTime = currentTime;

            // Old head position
            let snakeX = snake[0].x;
            let snakeY = snake[0].y;

            // Which direction
            if (direction === 'LEFT') snakeX -= box;
            if (direction === 'UP') snakeY -= box;
            if (direction === 'RIGHT') snakeX += box;
            if (direction === 'DOWN') snakeY += box;

            // Check if snake ate the food
            if (snakeX === food.x && snakeY === food.y) {
                score++;
                food = {
                    x: Math.floor(Math.random() * (canvas.width / box)) * box,
                    y: Math.floor(Math.random() * (canvas.height / box)) * box
                };
                if (score >= limitScore) {
                    canCrossWalls = true;
                }
            } else {
                // Remove the tail
                snake.pop();
            }

            // Handle crossing walls
            if (canCrossWalls) {
                if (snakeX < 0) snakeX = canvas.width - box;
                if (snakeY < 0) snakeY = canvas.height - box;
                if (snakeX >= canvas.width) snakeX = 0;
                if (snakeY >= canvas.height) snakeY = 0;
            }

            // Add new head
            let newHead = {
                x: snakeX,
                y: snakeY
            };

            // Game over
            if (!canCrossWalls && (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake))) {
                alert("☠️ Game Over! Your score: " + score);
                return;
            }

            if (collision(newHead, snake)) {
                alert("☠️ Game Over! Your score: " + score);
                return;
            }

            snake.unshift(newHead);
        }
    }

    // Display score
    document.getElementById('scoreBox').innerText = 'Score: ' + score;

    requestAnimationFrame(draw);
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function restartGame() {
    snake = [{ x: box * 5, y: box * 5 }];
    direction = 'RIGHT';
    food = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };
    score = 0;
    canCrossWalls = false;
    isPaused = false;
    lastTime = 0;
    requestAnimationFrame(draw);
}

// Start game
requestAnimationFrame(draw);
