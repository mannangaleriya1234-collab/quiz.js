// ===== quiz questions =====
// each question has 4 options, "correct" is the index of the right one
const quizData = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Transfer Markup Language",
      "HyperText Markup Language",
      "High Text Machine Language",
      "Hyperlink Markup Language",
    ],
    correct: 1,
  },
  {
    question: "Which symbol starts a single-line comment in JavaScript?",
    options: ["#", "//", "<!--", "**"],
    correct: 1,
  },
  {
    question: "What data type is `true` or `false` in JavaScript?",
    options: ["String", "Number", "Boolean", "Object"],
    correct: 2,
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Cascading Style Sheets",
      "Creative Style System",
      "Computer Styled Sections",
      "Colorful Style Syntax",
    ],
    correct: 0,
  },
  {
    question: "In C++, which keyword is used to define a class?",
    options: ["struct", "object", "class", "define"],
    correct: 2,
  },
  {
    question: "Which loop is guaranteed to run at least once?",
    options: ["for", "while", "do-while", "foreach"],
    correct: 2,
  },
  {
    question: "What's the standard file extension for a Python file?",
    options: [".py", ".pt", ".pyt", ".pyth"],
    correct: 0,
  },
  {
    question: "Which HTML tag links an external CSS file?",
    options: ["<style>", "<css>", "<script>", "<link>"],
    correct: 3,
  },
  {
    question: "What does OOP stand for?",
    options: [
      "Object-Oriented Programming",
      "Ordered Output Process",
      "Open Operation Protocol",
      "Object Output Programming",
    ],
    correct: 0,
  },
  {
    question: "Which company originally created JavaScript?",
    options: ["Microsoft", "Netscape", "Google", "Apple"],
    correct: 1,
  },
];

// ===== grab all the elements we need =====
const quizCard = document.getElementById("quizCard");
const resultCard = document.getElementById("resultCard");

const questionText = document.getElementById("questionText");
const optionsGrid = document.getElementById("optionsGrid");
const lineNo = document.getElementById("lineNo");
const qCounter = document.getElementById("qCounter");
const progressFill = document.getElementById("progressFill");
const totalTimerText = document.getElementById("totalTimer");
const questionTimerFill = document.getElementById("questionTimerFill");
const questionTimerText = document.getElementById("questionTimerText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");
const restartBtn = document.getElementById("restartBtn");

// ===== timing settings =====
const QUESTION_TIME = 30; // seconds allowed per question
const TOTAL_TIME = 300;   // 5 minutes for the whole quiz
const ADVANCE_DELAY = 600; // ms to flash correct/wrong before moving on

// ===== per-question memory =====
// each entry remembers: has it been answered yet, what was picked, and
// how many seconds were left on ITS OWN timer when we last left it
function makeFreshQuestionState() {
  return quizData.map(() => ({
    status: "unanswered", // "unanswered" | "answered" | "timeout"
    selected: null,
    timeLeft: QUESTION_TIME,
  }));
}

let questionState = makeFreshQuestionState();

// ===== state =====
let currentIndex = 0;
let score = 0;
let totalTimeLeft = TOTAL_TIME;
let questionInterval = null;
let totalInterval = null;

// ===== total quiz timer (5 min, always running, never pauses) =====

function startTotalTimer() {
  clearInterval(totalInterval);
  totalTimeLeft = TOTAL_TIME;
  updateTotalTimerDisplay();

  totalInterval = setInterval(() => {
    totalTimeLeft--;
    updateTotalTimerDisplay();

    if (totalTimeLeft <= 0) {
      clearInterval(totalInterval);
      clearInterval(questionInterval);
      endQuiz(); // ran out of overall time, stop wherever we are
    }
  }, 1000);
}

function updateTotalTimerDisplay() {
  const mins = Math.floor(totalTimeLeft / 60);
  const secs = totalTimeLeft % 60;
  totalTimerText.textContent = `⏳ ${mins}:${String(secs).padStart(2, "0")}`;
  totalTimerText.classList.toggle("urgent", totalTimeLeft <= 30);
}

// ===== per-question timer (30s, pauses/resumes per question) =====

// starts ticking down from whatever "startingTime" is left for this question
function resumeQuestionTimer(startingTime) {
  clearInterval(questionInterval);
  let timeLeft = startingTime;
  renderQuestionTimer(timeLeft, false);

  questionInterval = setInterval(() => {
    timeLeft--;
    questionState[currentIndex].timeLeft = timeLeft; // save progress every tick
    renderQuestionTimer(timeLeft, false);

    if (timeLeft <= 0) {
      clearInterval(questionInterval);
      handleTimeout();
    }
  }, 1000);
}

// draws the bar + number. "locked" = true means the question is already
// answered/timed out, so just show it frozen instead of ticking
function renderQuestionTimer(timeLeft, locked) {
  questionTimerText.textContent = `${timeLeft}s`;
  questionTimerFill.style.width = `${(timeLeft / QUESTION_TIME) * 100}%`;

  const urgent = timeLeft <= 10 && timeLeft > 0 && !locked;
  questionTimerText.classList.toggle("urgent", urgent);
  questionTimerFill.classList.toggle("urgent", urgent);
  questionTimerFill.classList.toggle("frozen", locked);

  questionTimerText.classList.remove("tick");
  if (!locked) {
    void questionTimerText.offsetWidth; // reflow trick so the pulse replays every second
    questionTimerText.classList.add("tick");
  }
}

// ===== core quiz functions =====

function loadQuestion(index) {
  currentIndex = index;
  clearInterval(questionInterval);

  const q = quizData[currentIndex];
  const state = questionState[currentIndex];

  lineNo.textContent = String(currentIndex + 1).padStart(2, "0");
  qCounter.textContent = `Question ${currentIndex + 1} / ${quizData.length}`;
  progressFill.style.width = `${(currentIndex / quizData.length) * 100}%`;

  questionText.textContent = q.question;

  optionsGrid.innerHTML = "";
  q.options.forEach((optionText, idx) => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.textContent = optionText;

    if (state.status === "unanswered") {
      btn.addEventListener("click", () => selectOption(idx, btn));
    } else {
      // revisiting an already-answered or timed-out question: show it locked
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add("correct");
      if (state.status === "answered" && idx === state.selected && idx !== q.correct) {
        btn.classList.add("wrong");
      }
    }

    optionsGrid.appendChild(btn);
  });

  if (state.status === "unanswered") {
    resumeQuestionTimer(state.timeLeft); // picks up right where it left off
  } else {
    renderQuestionTimer(state.timeLeft, true); // frozen, no ticking
  }

  updateNavButtons();
}

function selectOption(selectedIndex, selectedBtn) {
  const state = questionState[currentIndex];
  if (state.status !== "unanswered") return;

  clearInterval(questionInterval);
  state.status = "answered";
  state.selected = selectedIndex;

  const q = quizData[currentIndex];
  const allButtons = optionsGrid.querySelectorAll(".option-btn");
  allButtons.forEach((b) => (b.disabled = true));

  if (selectedIndex === q.correct) {
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("wrong");
    allButtons[q.correct].classList.add("correct");
  }

  lockNavButtons(true); // stop clicks mid-flash
  setTimeout(() => {
    advanceAfterAnswer();
  }, ADVANCE_DELAY);
}

function handleTimeout() {
  const state = questionState[currentIndex];
  if (state.status !== "unanswered") return;

  state.status = "timeout";
  state.timeLeft = 0;

  // Timeout must NOT reveal the correct answer.
  // Lock the current question and immediately move forward.
  const allButtons = optionsGrid.querySelectorAll(".option-btn");
  allButtons.forEach((b) => (b.disabled = true));

  advanceAfterAnswer();
}

// used after answering or timing out (auto-advance)
function advanceAfterAnswer() {
  if (currentIndex < quizData.length - 1) {
    loadQuestion(currentIndex + 1);
  } else {
    endQuiz();
  }
}

// ===== manual navigation (works whether answered or not) =====

function updateNavButtons() {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = false;
  nextBtn.textContent = currentIndex === quizData.length - 1 ? "finish()" : "next() →";
}

function lockNavButtons(locked) {
  prevBtn.disabled = locked || currentIndex === 0;
  nextBtn.disabled = locked;
}

prevBtn.addEventListener("click", () => {
  if (currentIndex === 0) return;
  clearInterval(questionInterval); // pauses here; timeLeft was already saved on each tick
  loadQuestion(currentIndex - 1);
});

nextBtn.addEventListener("click", () => {
  clearInterval(questionInterval); // pauses here too, whether answered or not
  if (currentIndex === quizData.length - 1) {
    endQuiz();
  } else {
    loadQuestion(currentIndex + 1);
  }
});

// ===== ending + restarting =====

function endQuiz() {
  clearInterval(questionInterval);
  clearInterval(totalInterval);

  progressFill.style.width = "100%";
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");

  resultTitle.textContent = getResultTitle();
  resultMsg.textContent = `Your score is ${score} out of ${quizData.length}`;
}

function getResultTitle() {
  const percent = (score / quizData.length) * 100;

  if (percent === 100) return "Perfect score! 🔥";
  if (percent >= 70) return "Nice work! 🎉";
  if (percent >= 40) return "Not bad! 💪";
  return "Keep practicing! 📚";
}

function restartQuiz() {
  currentIndex = 0;
  score = 0;
  questionState = makeFreshQuestionState();

  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");

  loadQuestion(0);
  startTotalTimer();
}

restartBtn.addEventListener("click", restartQuiz);

// ===== kick things off =====
loadQuestion(0);
startTotalTimer();
