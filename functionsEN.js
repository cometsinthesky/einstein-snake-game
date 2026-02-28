const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 24;
const swipeThreshold = 24;

let columns = 23;
let rows = 40;
let pointerStart = null;

let snake = [{ x: box * 5, y: box * 5 }];
let direction = 'RIGHT';
let food = randomFoodPosition();
let score = 0;
let canCrossWalls = false;
let isPaused = true;

let lastTime = 0;
let updateTime = 80;
let message = 'Tap the game to start and help Einstein capture the photons! 💡';
let gameHasEnded = false;

const limitScore = 20;
const scoreBox = document.getElementById('scoreBox');
const messageDisplay = document.getElementById('messageDisplay');
const restartBtn = document.getElementById('restartBtn');
const controlButtons = document.querySelectorAll('.control-btn');

applyCanvasSettings();

document.addEventListener('keydown', changeDirection);
restartBtn.addEventListener('click', restartGame);
canvas.addEventListener('pointerdown', startOnTap);
document.addEventListener('pointerdown', handleSwipeStart, { passive: true });
document.addEventListener('pointerup', handleSwipeEnd, { passive: true });
canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
window.addEventListener('resize', applyCanvasSettings);
controlButtons.forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        applyDirection(button.dataset.direction);
        startOnTap();
    });
});

function randomFoodPosition() {
    return {
        x: Math.floor(Math.random() * columns) * box,
        y: Math.floor(Math.random() * rows) * box
    };
}

function applyCanvasSettings() {
    const mobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;
    const widthLimit = mobileOrTablet ? window.innerWidth * 0.92 : Math.min(window.innerWidth * 0.88, 860);
    const heightLimit = mobileOrTablet ? window.innerHeight * 0.6 : window.innerHeight * 0.62;

    if (mobileOrTablet) {
        columns = 18;
        rows = 32;
    } else {
        columns = 23;
        rows = 40;
    }

    canvas.width = columns * box;
    canvas.height = rows * box;

    const cellInPixels = Math.floor(Math.min(widthLimit / columns, heightLimit / rows));
    canvas.style.width = `${cellInPixels * columns}px`;
    canvas.style.height = `${cellInPixels * rows}px`;
}

function isMobileOrTabletTouch(event) {
    return window.matchMedia('(max-width: 1024px)').matches && event.pointerType === 'touch';
}

function handleSwipeStart(event) {
    if (!isMobileOrTabletTouch(event)) {
        return;
    }

    pointerStart = { x: event.clientX, y: event.clientY };
}

function handleSwipeEnd(event) {
    if (!pointerStart || !isMobileOrTabletTouch(event)) {
        return;
    }

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;

    if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
        pointerStart = null;
        return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        applyDirection(deltaX > 0 ? 'RIGHT' : 'LEFT');
    } else {
        applyDirection(deltaY > 0 ? 'DOWN' : 'UP');
    }

    startOnTap();
    pointerStart = null;
}

function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    if (!touch) {
        return;
    }

    pointerStart = { x: touch.clientX, y: touch.clientY };
}

function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    if (!pointerStart || !touch) {
        return;
    }

    const deltaX = touch.clientX - pointerStart.x;
    const deltaY = touch.clientY - pointerStart.y;

    if (Math.abs(deltaX) >= swipeThreshold || Math.abs(deltaY) >= swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            applyDirection(deltaX > 0 ? 'RIGHT' : 'LEFT');
        } else {
            applyDirection(deltaY > 0 ? 'DOWN' : 'UP');
        }

        startOnTap();
    }

    pointerStart = null;
}

function normalizeHeadPosition(nextX, nextY) {
    let snakeX = nextX;
    let snakeY = nextY;

    if (canCrossWalls) {
        if (snakeX < 0) snakeX = columns * box - box;
        if (snakeY < 0) snakeY = rows * box - box;
        if (snakeX >= columns * box) snakeX = 0;
        if (snakeY >= rows * box) snakeY = 0;
    }

    return { x: snakeX, y: snakeY };
}

function startOnTap() {
    if (isPaused && !gameHasEnded) {
        isPaused = false;
    }
}

function endGame() {
    gameHasEnded = true;
    alert('The ship broke apart due to structural damage! ☠️ Your score: ' + score);
}

function applyDirection(nextDirection) {
    if (nextDirection === 'LEFT' && direction !== 'RIGHT') direction = 'LEFT';
    if (nextDirection === 'UP' && direction !== 'DOWN') direction = 'UP';
    if (nextDirection === 'RIGHT' && direction !== 'LEFT') direction = 'RIGHT';
    if (nextDirection === 'DOWN' && direction !== 'UP') direction = 'DOWN';
}

function changeDirection(event) {
    const keyPressed = event.keyCode;

    if (keyPressed === 37 || keyPressed === 65 || keyPressed === 97) {
        applyDirection('LEFT');
        event.preventDefault();
    } else if (keyPressed === 38 || keyPressed === 87 || keyPressed === 119) {
        applyDirection('UP');
        event.preventDefault();
    } else if (keyPressed === 39 || keyPressed === 68 || keyPressed === 100) {
        applyDirection('RIGHT');
        event.preventDefault();
    } else if (keyPressed === 40 || keyPressed === 83 || keyPressed === 115) {
        applyDirection('DOWN');
        event.preventDefault();
    } else if (keyPressed === 32) {
        event.preventDefault();
        isPaused = !isPaused;
    }
}

function draw(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? (score >= limitScore ? '#3333FF' : 'lime') : (score >= limitScore ? 'blue' : 'green');
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = score >= limitScore ? 'darkblue' : 'darkgreen';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = 'yellow';
    ctx.fillRect(food.x, food.y, box, box);

    canvas.style.border = score >= limitScore ? '1px solid #0074FF' : '1px solid #FF1B00';

    if (isPaused) {
        const message1 = '◈ Tap the screen to start';
        const message2 = '◈ Arrows / W-A-S-D / touch buttons to move';
        const message3 = '◈ Space bar pauses the game';
        ctx.fillStyle = '#FF1B00';
        ctx.font = '16px Roboto';

        const textWidth1 = ctx.measureText(message1).width;
        const textWidth2 = ctx.measureText(message2).width;
        const textWidth3 = ctx.measureText(message3).width;
        const maxWidth = Math.max(textWidth1, textWidth2, textWidth3);

        ctx.fillText(message1, (canvas.width - maxWidth) / 2, canvas.height - 58);
        ctx.fillText(message2, (canvas.width - maxWidth) / 2, canvas.height - 36);
        ctx.fillText(message3, (canvas.width - maxWidth) / 2, canvas.height - 14);
    }

    if (!isPaused && currentTime - lastTime > updateTime) {
        lastTime = currentTime;

        if (score >= 50) {
            updateTime = 30;
            message = "We've reached the edge of the Observable Universe! Now do your best! 🌌";
        } else if (score >= 45) {
            updateTime = 40;
            message = 'Executing evasive maneuver! Phew, that was close! 🚀';
        } else if (score >= 40) {
            updateTime = 40;
            message = "Watch out!!! We're approaching a Black Hole! 🕳️";
        } else if (score >= 35) {
            updateTime = 50;
            message = 'Measuring Relativity effects, hold on tight! ⌚🛰️📡';
        } else if (score >= 30) {
            updateTime = 50;
            message = "Wow! We're traveling at the Speed of Light! 🚀💡";
        } else if (score >= 25) {
            updateTime = 60;
            message = 'Approaching the Speed of Light... ⏩';
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
            message = 'Warming up the engines... 🔥';
        } else {
            updateTime = 80;
            message = 'Help Einstein capture the photons! 💡';
        }

        messageDisplay.innerText = message;

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if (direction === 'LEFT') snakeX -= box;
        if (direction === 'UP') snakeY -= box;
        if (direction === 'RIGHT') snakeX += box;
        if (direction === 'DOWN') snakeY += box;

        const normalizedHead = normalizeHeadPosition(snakeX, snakeY);
        snakeX = normalizedHead.x;
        snakeY = normalizedHead.y;

        if (snakeX === food.x && snakeY === food.y) {
            score++;
            food = randomFoodPosition();
            if (score >= limitScore) {
                canCrossWalls = true;
            }
        } else {
            snake.pop();
        }

        const newHead = { x: snakeX, y: snakeY };

        if (!canCrossWalls && (snakeX < 0 || snakeY < 0 || snakeX >= columns * box || snakeY >= rows * box || collision(newHead, snake))) {
            endGame();
            return;
        }

        if (collision(newHead, snake)) {
            endGame();
            return;
        }

        snake.unshift(newHead);
    }

    scoreBox.innerText = 'Photons: ' + score;
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
    const shouldResumeLoop = gameHasEnded;
    snake = [{ x: box * 5, y: box * 5 }];
    direction = 'RIGHT';
    food = randomFoodPosition();
    score = 0;
    canCrossWalls = false;
    isPaused = true;
    lastTime = 0;
    updateTime = 80;
    gameHasEnded = false;
    message = 'Tap the game to start and help Einstein capture the photons! 💡';
    messageDisplay.innerText = message;

    if (shouldResumeLoop) {
        requestAnimationFrame(draw);
    }
}

requestAnimationFrame(draw);
