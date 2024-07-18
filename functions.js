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
    if ((keyPressed === 37 || keyPressed === 65 || keyPressed === 97) && direction !== 'RIGHT') { // 37 é a tecla esquerda, 65 é a tecla 'A', 97 é a tecla 'a'
        direction = 'LEFT';
        event.preventDefault();
    } else if ((keyPressed === 38 || keyPressed === 87 || keyPressed === 119) && direction !== 'DOWN') { // 38 é a tecla para cima, 87 é a tecla 'W', 119 é a tecla 'w'
        direction = 'UP';
        event.preventDefault();
    } else if ((keyPressed === 39 || keyPressed === 68 || keyPressed === 100) && direction !== 'LEFT') { // 39 é a tecla direita, 68 é a tecla 'D', 100 é a tecla 'd'
        direction = 'RIGHT';
        event.preventDefault();
    } else if ((keyPressed === 40 || keyPressed === 83 || keyPressed === 115) && direction !== 'UP') { // 40 é a tecla para baixo, 83 é a tecla 'S', 115 é a tecla 's'
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
    const message1 = 'Pressione a barra de espaço para jogar!';
    const message2 = 'Use as setas ou as teclas W-A-S-D para controlar a espaçonave.';
    const message3  = 'Pressione F11 para jogar em tela cheia.'
    ctx.fillStyle = '#FF1B00';
    ctx.font = '16px Roboto';
    
    // Medir largura de cada mensagem
    const textWidth1 = ctx.measureText(message1).width;
    const textWidth2 = ctx.measureText(message2).width;
    const textWidth3 = ctx.measureText(message3).width;
    
    // Calcular a largura total considerando a maior largura
    const maxWidth = Math.max(textWidth1, textWidth2);
    
    // Desenhar as mensagens centralizadas verticalmente
    ctx.fillText(message1, (canvas.width - maxWidth) / 2, canvas.height - 30);
    ctx.fillText(message2, (canvas.width - maxWidth) / 2, canvas.height - 10);
    ctx.fillText(message3, (canvas.width - maxWidth) / 2, canvas.height - 10);
}

    if (!isPaused) {
        if (currentTime - lastTime > updateTime) {
            lastTime = currentTime;

            // Update updateTime based on score
            if (score >= 50) {
                updateTime = 30;
                message = "Chegamos no limite do Universo Observável! Agora dê o seu melhor! 🌌";
            } else if (score >= 45) {
                updateTime = 40;
                message = "Executando manobra evasiva! Ufa, essa foi por pouco! 🚀";
            } else if (score >= 40) {
                updateTime = 40;
                message = "Cuidado!!! Estamos nos aproximando de um Buraco Negro! 🕳️";
            } else if (score >= 35) {
                updateTime = 50;
                message = "Medindo os efeitos da Relatividade, aguente firme! ⌚🛰️📡";
            } else if (score >= 30) {
                updateTime = 50;
                message = "Uau! Estamos viajando na Velocidade da Luz! 🚀💡";
            } else if (score >= 25) {
                updateTime = 60;
                message = "Se aproximando da Velocidade da Luz... ⏩";
            } else if (score >= 20) {
                updateTime = 60;
                message = "Entramos no Buraco de Minhoca!!! Agora você pode atravessar o Espaço-Tempo! 🌐";
            } else if (score >= 15) {
                updateTime = 60;
                message = "Se prepare! Vamos entrar em um Buraco de Minhoca! 🌐";
            } else if (score >= 10) {
                updateTime = 60;
                message = "Estamos entrando em Espaço Interestelar 🚀🌌";
            } else if (score >= 5) {
                updateTime = 80;
                message = "Aquecendo os motores... 🔥";
            } else {
                updateTime = 80;
                message = "Ajude o Einstein a capturar os fótons! 💡";
            }

            // Display the message
            document.getElementById('messageDisplay').innerText = message;

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
                alert("☠️ Game Over! Seu score: " + score);
                return;
            }

            if (collision(newHead, snake)) {
                alert("☠️ Game Over! Seu score: " + score);
                return;
            }

            snake.unshift(newHead);
        }
    }

    // Display score
    document.getElementById('scoreBox').innerText = 'Fótons: ' + score;

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
