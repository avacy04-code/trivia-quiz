let questions = [];
let current = 0;
let score = 0;
let locked = false;

const $ = (id) => document.getElementById(id);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeQuestion(q) {
  // Acepta tu formato estilo OpenTDB:
  // {question, category, difficulty, type, correct_answer, incorrect_answers}
  const answers = [q.correct_answer, ...(q.incorrect_answers || [])];
  return {
    question: q.question,
    category: q.category || "Custom",
    difficulty: q.difficulty || "medium",
    type: q.type || "multiple",
    correct: q.correct_answer,
    answers: shuffle(answers.slice())
  };
}

function render() {
  const q = questions[current];
  $("q").textContent = q.question;
  $("cat").textContent = q.category;
  $("diff").textContent = q.difficulty;
  $("type").textContent = q.type;
  $("score").textContent = String(score);
  $("idx").textContent = String(current + 1);
  $("total").textContent = String(questions.length);

  const box = $("answers");
  box.innerHTML = "";
  locked = false;
  $("next").style.display = "none";

  q.answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.addEventListener("click", () => choose(btn, ans));
    box.appendChild(btn);
  });
}

function choose(btn, ans) {
  if (locked) return;
  locked = true;

  const q = questions[current];
  const buttons = Array.from($("answers").querySelectorAll("button"));

  buttons.forEach(b => {
    if (b.textContent === q.correct) b.classList.add("ok");
  });

  if (ans === q.correct) {
    score += 1;
    btn.classList.add("ok");
  } else {
    btn.classList.add("bad");
  }

  $("score").textContent = String(score);
  $("next").style.display = "block";
}

$("next").addEventListener("click", () => {
  current += 1;
  if (current >= questions.length) {
    $("q").textContent = `Fin 🎉 Puntuación: ${score}/${questions.length}`;
    $("answers").innerHTML = "";
    $("next").style.display = "none";
    return;
  }
  render();
});

async function start() {
  // IMPORTANTE: esto funciona si lo sirves con un servidor (no abriendo el HTML con doble clic)
  const res = await fetch("./questions.json");
  const raw = await res.json();

  questions = raw.map(normalizeQuestion);
  shuffle(questions);
  current = 0;
  score = 0;

  render();
}

start().catch(err => {
  $("q").textContent = "Error cargando questions.json (¿lo estás abriendo sin servidor?)";
  $("answers").innerHTML = `<pre style="white-space:pre-wrap;color:#b91c1c;">${String(err)}</pre>`;
});
