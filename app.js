let gameState = JSON.parse(localStorage.getItem("triviaState")) || {
    score: 0,
    level: 1,
    lives: 3,
    coins: 0
};

let questionsData = null;
let currentQuestion = 0;
let timer = 0;
let interval = null;

// UI
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("timer");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const rewardEl = document.getElementById("reward");
const restartBtn = document.getElementById("restart");

// ====== CARGA DE PREGUNTAS ======
fetch("questions.json")
    .then(r => r.json())
    .then(data => {
        questionsData = data.levels;
        updateUI();
        loadQuestion();
    });

// ====== FUNCIONES ======
function saveState() {
    localStorage.setItem("triviaState", JSON.stringify(gameState));
}

function updateUI() {
    scoreEl.textContent = gameState.score;
    livesEl.textContent = gameState.lives;
    levelEl.textContent = gameState.level;
}

function startTimer(seconds) {
    clearInterval(interval);
    timer = seconds;
    timerEl.textContent = timer;

    interval = setInterval(() => {
        timer--;
        timerEl.textContent = timer;
        if (timer <= 0) loseLife();
    }, 1000);
}

function loadQuestion() {
    answersEl.innerHTML = "";
    rewardEl.style.display = "none";

    const levelData = questionsData[gameState.level - 1];

    if (!levelData || currentQuestion >= levelData.questions.length) {
        nextLevel();
        return;
    }

    const q = levelData.questions[currentQuestion];
    questionEl.textContent = q.question;

    q.answers.forEach((a, i) => {
        const btn = document.createElement("button");
        btn.textContent = a;
        btn.onclick = () => checkAnswer(i, q.correct);
        answersEl.appendChild(btn);
    });

    startTimer(levelData.time);
}

function checkAnswer(selected, correct) {
    clearInterval(interval);

    if (selected === correct) {
        gameState.score += 10;
        gameState.coins += 5;
        currentQuestion++;
    } else {
        loseLife();
        return;
    }

    saveState();
    updateUI();
    loadQuestion();
}

function loseLife() {
    clearInterval(interval);
    gameState.lives--;

    if (gameState.lives <= 0) {
        endGame();
    } else {
        currentQuestion++;
        saveState();
        updateUI();
        loadQuestion();
    }
}

function nextLevel() {
    gameState.level++;
    currentQuestion = 0;

    rewardEl.textContent = "🎁 Premio: +50 monedas";
    rewardEl.style.display = "block";
    gameState.coins += 50;

    saveState();
    updateUI();
    loadQuestion();
}

function endGame() {
    questionEl.textContent = "💀 Juego terminado";
    answersEl.innerHTML = "";
    restartBtn.style.display = "block";
    saveState();
}

restartBtn.onclick = () => {
    localStorage.removeItem("triviaState");
    location.reload();
};
