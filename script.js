const GRID_SIZE = 20;
const CELL_SIZE = 20;
const TICK_RATE = 120;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const statusText = document.getElementById("status-text");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const controlButtons = document.querySelectorAll("[data-direction]");

const state = {
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  direction: "right",
  nextDirection: "right",
  food: { x: 15, y: 10 },
  score: 0,
  running: false,
  gameOver: false,
};

let timerId = null;
let highScore = 0;

const isOpposite = (current, next) => {
  const currentDir = DIRECTIONS[current];
  const nextDir = DIRECTIONS[next];
  return currentDir.x + nextDir.x === 0 && currentDir.y + nextDir.y === 0;
};

const positionsEqual = (a, b) => a.x === b.x && a.y === b.y;

const getSnakeSet = (snake) => new Set(snake.map((segment) => `${segment.x}:${segment.y}`));

const randomFood = (snake) => {
  const occupied = getSnakeSet(snake);
  const openCells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x}:${y}`;
      if (!occupied.has(key)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return { x: 0, y: 0 };
  }

  const index = Math.floor(Math.random() * openCells.length);
  return openCells[index];
};

const resetState = () => {
  state.snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  state.direction = "right";
  state.nextDirection = "right";
  state.food = randomFood(state.snake);
  state.score = 0;
  state.running = false;
  state.gameOver = false;
  updateScore();
  updateStatus("Press any arrow key or tap Start.");
};

const updateScore = () => {
  scoreEl.textContent = state.score.toString();
  if (state.score > highScore) {
    highScore = state.score;
    highScoreEl.textContent = highScore.toString();
  }
};

const updateStatus = (message) => {
  statusText.textContent = message;
};

const drawCell = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};

const render = () => {
  ctx.clearRect(0, 0, board.width, board.height);
  ctx.fillStyle = "#f2ede6";
  ctx.fillRect(0, 0, board.width, board.height);

  drawCell(state.food.x, state.food.y, "#d97752");

  state.snake.forEach((segment, index) => {
    const color = index === 0 ? "#1c1b1a" : "#6f6b66";
    drawCell(segment.x, segment.y, color);
  });
};

const nextState = () => {
  if (!state.running || state.gameOver) {
    return;
  }

  if (!isOpposite(state.direction, state.nextDirection)) {
    state.direction = state.nextDirection;
  }

  const direction = DIRECTIONS[state.direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  if (
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= GRID_SIZE ||
    nextHead.y >= GRID_SIZE
  ) {
    state.gameOver = true;
    state.running = false;
    updateStatus("Game over! Tap Restart to play again.");
    restartBtn.disabled = false;
    return;
  }

  const snakeSet = getSnakeSet(state.snake.slice(0, -1));
  if (snakeSet.has(`${nextHead.x}:${nextHead.y}`)) {
    state.gameOver = true;
    state.running = false;
    updateStatus("Game over! Tap Restart to play again.");
    restartBtn.disabled = false;
    return;
  }

  state.snake.unshift(nextHead);

  if (positionsEqual(nextHead, state.food)) {
    state.score += 10;
    updateScore();
    state.food = randomFood(state.snake);
  } else {
    state.snake.pop();
  }
};

const tick = () => {
  nextState();
  render();
};

const startGame = () => {
  if (state.running) {
    return;
  }
  if (state.gameOver) {
    resetState();
  }
  state.running = true;
  updateStatus("Good luck!");
  restartBtn.disabled = false;

  if (timerId) {
    clearInterval(timerId);
  }
  timerId = setInterval(tick, TICK_RATE);
};

const restartGame = () => {
  resetState();
  render();
};

const setDirection = (direction) => {
  if (DIRECTIONS[direction]) {
    state.nextDirection = direction;
    if (!state.running && !state.gameOver) {
      startGame();
    }
  }
};

const handleKeydown = (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") {
    setDirection("up");
  } else if (key === "arrowdown" || key === "s") {
    setDirection("down");
  } else if (key === "arrowleft" || key === "a") {
    setDirection("left");
  } else if (key === "arrowright" || key === "d") {
    setDirection("right");
  }
};

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.direction);
  });
});

window.addEventListener("keydown", handleKeydown);
window.addEventListener("blur", () => {
  if (state.running && !state.gameOver) {
    state.running = false;
    updateStatus("Paused. Tap Start to resume.");
  }
});

resetState();
render();
