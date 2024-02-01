// main
document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");
    const scoreLabel = document.getElementById("scoreLabel");
    const timerLabel = document.getElementById("timerLabel");
    const GRID_SIZE = 50;
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const UP = { x: 0, y: -1 };
    const DOWN = { x: 0, y: 1 };
    const LEFT = { x: -1, y: 0 };
    const RIGHT = { x: 1, y: 0 };
    const startOverlay = document.getElementById("startOverlay");
    startOverlay.style.display = "flex";

    let snake = {
        length: 1,
        positions: [{ x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) }],
        direction: getRandomDirection(),
        color: getRandomColor(),
        SCORE: 0,
    };

    let timer = 0;
    let timerInterval;
    let FPS = 10;

    let food = {
        position: getRandomFoodPosition(),
        color: "red",
    };

    function updateScore() {
        scoreLabel.textContent = `${snake.SCORE}`;
    }

    function updateTimer() {
        timerLabel.textContent = `Time: ${timer}s`;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            updateTimer();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function getRandomDirection() {
        const directions = [UP, DOWN, LEFT, RIGHT];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    function getRandomColor() {
        const excludedColors = [
            [255, 0, 0],    // Red
            [128, 128, 128], // Gray
            [0, 0, 0],       // Black
        ];
    
        const minColorDistance = 50; // Adjust the minimum distance as needed
    
        let color;
        do {
            color = [
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
            ];
        } while (excludedColors.some(excludedColor => isColorTooClose(color, excludedColor, minColorDistance)));
    
        return color;
    }
    
    function isColorTooClose(color1, color2, minDistance) {
        const squaredDistance = (color1[0] - color2[0]) ** 2 + (color1[1] - color2[1]) ** 2 + (color1[2] - color2[2]) ** 2;
        return squaredDistance < minDistance ** 2;
    }
    

    function getRandomFoodPosition() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * (WIDTH / GRID_SIZE)) * GRID_SIZE,
                y: Math.floor(Math.random() * (HEIGHT / GRID_SIZE)) * GRID_SIZE,
            };
        } while (isFoodOnSnake(position));

        return position;
    }

    function isFoodOnSnake(position) {
        return snake.positions.some(segment => segment.x === position.x && segment.y === position.y);
    }

    function drawSnake() {
        snake.positions.forEach((segment, index) => {
            ctx.fillStyle = `rgba(${snake.color[0]}, ${snake.color[1]}, ${snake.color[2]}, ${1 - index / snake.length})`;
            ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        });
    }

    function drawFood() {
        ctx.fillStyle = food.color;
        ctx.fillRect(food.position.x, food.position.y, GRID_SIZE, GRID_SIZE);
    }

    function drawGrid() {
        ctx.strokeStyle = "gray";
        for (let x = 0; x < WIDTH; x += GRID_SIZE) {
            for (let y = 0; y < HEIGHT; y += GRID_SIZE) {
                ctx.strokeRect(x, y, GRID_SIZE, GRID_SIZE);
            }
        }
    }

    function update() {
        const currentHead = { ...snake.positions[0] };
        snake.positions.unshift({
            x: (currentHead.x + snake.direction.x * GRID_SIZE + WIDTH) % WIDTH,
            y: (currentHead.y + snake.direction.y * GRID_SIZE + HEIGHT) % HEIGHT,
        });

        if (snake.positions.length > snake.length) {
            snake.positions.pop();
        }

        if (detectCollision()) {
            stopTimer();
            resetGame();
        }

        if (isFoodEaten()) {
            snake.length++;
            snake.SCORE++;
            food.position = getRandomFoodPosition();
            updateScore();
        }
    }

    function detectCollision() {
        const head = snake.positions[0];
        return (
            snake.positions.slice(1).some((segment) => segment.x === head.x && segment.y === head.y) ||
            head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT
        );
    }

    function isFoodEaten() {
        return snake.positions[0].x === food.position.x && snake.positions[0].y === food.position.y;
    }

    function resetGame() {
        snake = {
            length: 1,
            positions: [{ x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) }],
            direction: getRandomDirection(),
            color: getRandomColor(),
            SCORE: 0,
        };
        food.position = getRandomFoodPosition();
        updateScore();
        timer = 0;
        updateTimer();
        startTimer();
    }

    function render() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        drawGrid();
        drawSnake();
        drawFood();
    }

    function mainLoop() {
        update();
        render();
    }

    document.addEventListener("keydown", (event) => {
        switch (event.key.toLowerCase()) {
            case "w":
                if (snake.direction !== DOWN) {
                    snake.direction = UP;
                }
                break;
            case "s":
                if (snake.direction !== UP) {
                    snake.direction = DOWN;
                }
                break;
            case "a":
                if (snake.direction !== RIGHT) {
                    snake.direction = LEFT;
                }
                break;
            case "d":
                if (snake.direction !== LEFT) {
                    snake.direction = RIGHT;
                }
                break;
        }
    });
    
    window.startGame = function () {
        startOverlay.style.display = "none";
        startTimer();
        setInterval(mainLoop, 1000 / FPS);
    }
});
