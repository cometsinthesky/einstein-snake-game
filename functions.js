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
let message = 'Toque no jogo para iniciar e ajudar o Einstein a capturar os fótons! 💡';
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

    if (mobileOrTablet) {
        columns = 18;
        rows = 32;
    } else {
        columns = 23;
        rows = 40;
    }

    const widthLimit = Math.max(window.innerWidth - 20, columns * box);
    const heightLimit = mobileOrTablet ? window.innerHeight * 0.6 : window.innerHeight * 0.86;

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
    alert('A nave quebrou por danos estrutuais! ☠️ Seu placar: ' + score);
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
        ctx.fillRect(snake[i].x + 1, snake[i].y + 1, box - 2, box - 2);
        ctx.strokeStyle = score >= limitScore ? 'darkblue' : 'darkgreen';
        ctx.strokeRect(snake[i].x + 1, snake[i].y + 1, box - 2, box - 2);
    }

    ctx.fillStyle = 'yellow';
    ctx.fillRect(food.x + 1, food.y + 1, box - 2, box - 2);

    canvas.style.border = score >= limitScore ? '1px solid #0074FF' : '1px solid #FF1B00';

    if (isPaused) {
        const message1 = '◈ Toque na tela para iniciar';
        const message2 = window.matchMedia('(max-width: 1024px)').matches
            ? '◈ Arraste o dedo (ou use botões) para controlar'
            : '◈ Setas / W-A-S-D / botões para controlar';
        const message3 = '◈ Barra de espaço pausa o jogo';
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
            message = 'Chegamos no limite do Universo Observável! Agora dê o seu melhor! 🌌';
        } else if (score >= 45) {
            updateTime = 40;
            message = 'Executando manobra evasiva! Ufa, essa foi por pouco! 🚀';
        } else if (score >= 40) {
            updateTime = 40;
            message = 'Cuidado!!! Estamos nos aproximando de um Buraco Negro! 🕳️';
        } else if (score >= 35) {
            updateTime = 50;
            message = 'Medindo os efeitos da Relatividade, aguente firme! ⌚🛰️📡';
        } else if (score >= 30) {
            updateTime = 50;
            message = 'Uau! Estamos viajando na Velocidade da Luz! 🚀💡';
        } else if (score >= 25) {
            updateTime = 60;
            message = 'Se aproximando da Velocidade da Luz... ⏩';
        } else if (score >= 20) {
            updateTime = 60;
            message = 'Entramos no Buraco de Minhoca!!! Agora você pode atravessar o Espaço-Tempo! 🌐';
        } else if (score >= 15) {
            updateTime = 60;
            message = 'Se prepare! Vamos entrar em um Buraco de Minhoca! 🌐';
        } else if (score >= 10) {
            updateTime = 60;
            message = 'Estamos entrando em Espaço Interestelar 🚀🌌';
        } else if (score >= 5) {
            updateTime = 80;
            message = 'Aquecendo os motores... 🔥';
        } else {
            updateTime = 80;
            message = 'Ajude o Einstein a capturar os fótons! 💡';
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

    scoreBox.innerText = 'Fótons: ' + score;
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
    message = 'Toque no jogo para iniciar e ajudar o Einstein a capturar os fótons! 💡';
    messageDisplay.innerText = message;

    if (shouldResumeLoop) {
        requestAnimationFrame(draw);
    }
}

requestAnimationFrame(draw);
