/* =========================
   ESTADO DEL JUEGO
========================= */

let state = JSON.parse(localStorage.getItem("triviaState")) || {
    score: 0,
    level: 1,
    lives: 3,
    coins: 0
};

let questionsData = [];
let currentQuestionIndex = 0;
let timer = 0;
let timerInterval = null;

/* =========================
   ELEMENTOS DEL DOM
========================= */

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("timer");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const rewardEl = document.getElementById("reward");
const restartBtn = document.getElementById("restart");

/* =========================
   CARGA DE PREGUNTAS
========================= */

fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questionsData = data.levels;
        updateUI();
        loadQuestion();
    })
    .catch(error => {
        questionEl.textContent = "❌ Error cargando preguntas";
        console.error(error);
    });

/* =========================
   FUNCIONES PRINCIPALES
========================= */

function saveState() {
    localStorage.setItem("triviaState", JSON.stringify(state));
}

function updateUI() {
    scoreEl.textContent = state.score;
    livesEl.textContent = state.lives;
    levelEl.textContent = state.level;
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    timer = seconds;
    timerEl.textContent = timer;

    timerInterval = setInterval(() => {
        timer--;
        timerEl.textContent = timer;

        if (timer <= 0) {
            loseLife();
        }
    }, 1000);
}

function loadQuestion() {
    clearInterval(timerInterval);
    answersEl.innerHTML = "";
    rewardEl.style.display = "none";

    const levelData = questionsData[state.level - 1];

    // No hay más niveles
    if (!levelData) {
        endGame(true);
        return;
    }

    // Nivel completado
    if (currentQuestionIndex >= levelData.questions.length) {
        nextLevel();
        return;
    }

    const q = levelData.questions[currentQuestionIndex];
    questionEl.textContent = q.question;

    q.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.onclick = () => checkAnswer(index, q.correct);
        answersEl.appendChild(button);
    });

    startTimer(levelData.time);
}

function checkAnswer(selected, correct) {
    clearInterval(timerInterval);

    if (selected === correct) {
        state.score += 10;
        state.coins += 5;
        currentQuestionIndex++;
    } else {
        loseLife();
        return;
    }

    saveState();
    updateUI();
    loadQuestion();
}

function loseLife() {
    clearInterval(timerInterval);
    state.lives--;

    if (state.lives <= 0) {
        endGame(false);
    } else {
        currentQuestionIndex++;
        saveState();
        updateUI();
        loadQuestion();
    }
}

function nextLevel() {
    state.level++;
    currentQuestionIndex = 0;

    // Premio por nivel
    state.coins += 50;
    rewardEl.textContent = "🎁 Premio desbloqueado: +50 monedas";
    rewardEl.style.display = "block";

    saveState();
    updateUI();
    loadQuestion();
}

function endGame(completedAllLevels) {
    clearInterval(timerInterval);
    answersEl.innerHTML = "";
    restartBtn.style.display = "block";

    if (completedAllLevels) {
        questionEl.textContent = "🏆 ¡Has completado todos los niveles!";
    } else {
        questionEl.textContent = "💀 Juego terminado";
    }

    saveState();
}

/* =========================
   REINICIAR JUEGO
========================= */

restartBtn.onclick = () => {
    localStorage.removeItem("triviaState");
    location.reload();
};
