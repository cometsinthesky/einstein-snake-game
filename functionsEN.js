const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const canvasSize = { width: canvas.width, height: canvas.height };

let snake = [{ x: box * 5, y: box * 5 }];
let direction = 'RIGHT';
let food = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (canvas.height / box)) * box };
let score = 0;
let canCrossWalls = false;
let isPaused = true; // Initially paused

let lastTime = 0;
let updateTime = 80;

document.addEventListener('keydown', changeDirection);
document.getElementById('restartBtn').addEventListener('click', restartGame);

function changeDirection(event) {
    const keyPressed = event.keyCode;
    if ((keyPressed === 37 || keyPressed === 65 || keyPressed === 97) && direction !== 'RIGHT') { // 37 is the left arrow key, 65 is 'A', 97 is 'a'
        direction = 'LEFT';
        event.preventDefault();
    } else if ((keyPressed === 38 || keyPressed === 87 || keyPressed === 119) && direction !== 'DOWN') { // 38 is the up arrow key, 87 is 'W', 119 is 'w'
        direction = 'UP';
        event.preventDefault();
    } else if ((keyPressed === 39 || keyPressed === 68 || keyPressed === 100) && direction !== 'LEFT') { // 39 is the right arrow key, 68 is 'D', 100 is 'd'
        direction = 'RIGHT';
        event.preventDefault();
    } else if ((keyPressed === 40 || keyPressed === 83 || keyPressed === 115) && direction !== 'UP') { // 40 is the down arrow key, 83 is 'S', 115 is 's'
        direction = 'DOWN';
        event.preventDefault();
    } else if (keyPressed === 32) { // Space key to pause/unpause
        event.preventDefault();
        isPaused = !isPaused;
    }
}

const limitScore = 20;

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

    // Change canvas border color based on score
    canvas.style.border = score >= limitScore ? '1px solid #0074FF' : '1px solid #FF1B00';

// Show pause message
if (isPaused) {
    const message1 = '◈ Press the space bar to play or pause';
    const message2 = '◈ Use the arrow keys or W-A-S-D to control the spaceship';
    const message3  = '◈ Press F11 to play in fullscreen mode'
    ctx.fillStyle = '#FF1B00';
    ctx.font = '16px Roboto';
    
    // Measure width of each message
    const textWidth1 = ctx.measureText(message1).width;
    const textWidth2 = ctx.measureText(message2).width;
    const textWidth3 = ctx.measureText(message3).width;
    
    // Calculate the total width considering the largest width
    const maxWidth = Math.max(textWidth1, textWidth2);
    
    // Draw messages centered vertically
    ctx.fillText(message1, (canvas.width - maxWidth) / 2, canvas.height - 50);
    ctx.fillText(message2, (canvas.width - maxWidth) / 2, canvas.height - 30);
    ctx.fillText(message3, (canvas.width - maxWidth) / 2, canvas.height - 10);
}

    if (!isPaused) {
        if (currentTime - lastTime > updateTime) {
            lastTime = currentTime;

            // Update updateTime based on score
            if (score >= 50) {
                updateTime = 30;
                message = "We've reached the edge of the Observable Universe! Now do your best! 🌌";
            } else if (score >= 45) {
                updateTime = 40;
                message = "Executing evasive maneuver! Phew, that was close! 🚀";
            } else if (score >= 40) {
                updateTime = 40;
                message = "Watch out!!! We're approaching a Black Hole! 🕳️";
            } else if (score >= 35) {
                updateTime = 50;
                message = "Measuring Relativity effects, hold on tight! ⌚🛰️📡";
            } else if (score >= 30) {
                updateTime = 50;
                message = "Wow! We're traveling at the Speed of Light! 🚀💡";
            } else if (score >= 25) {
                updateTime = 60;
                message = "Approaching the Speed of Light... ⏩";
            } else if (score >= 20) {
                updateTime = 60;
                message = "We've entered the Wormhole!!! Now you can cross Space-Time! 🌐";
            } else if (score >= 15) {
                updateTime = 60;
                message = "Get ready! We're about to enter a Wormhole! 🌐";
            } else if (score >= 10) {
                updateTime = 60;
                message = "We're entering Interstellar Space 🚀🌌";
            } else if (score >= 5) {
                updateTime = 80;
                message = "Warming up the engines... 🔥";
            } else {
                updateTime = 80;
                message = "Help Einstein capture the photons! 💡";
            }

            // Display the message
            document.getElementById('messageDisplay').innerText = message;

            // Old head position
            let snakeX = snake[0].x;
            let snakeY = snake[0].y;

            // Determine direction
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
    document.getElementById('scoreBox').innerText = 'Photons: ' + score;

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
    isPaused = true; // Restart game in paused state
    lastTime = 0;
    updateTime = 80; // Reset updateTime
    requestAnimationFrame(draw);
}

// Start game
requestAnimationFrame(draw);
