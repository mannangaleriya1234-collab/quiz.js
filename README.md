# 🎨 Code Quiz (ColourMix)

## About
This is a little multiple-choice quiz I made to test basic programming knowledge (HTML, CSS, JS, C++, Python, OOP, that kind of stuff). It's styled to look like a fake code editor window, with a title bar, colored dots, a "filename" tab, and a glowing gradient background — figured a plain quiz was kinda boring so I gave it a coding theme instead.

No frameworks, no build tools, just plain HTML/CSS/JS.

## Features
- 10 multiple-choice questions on general programming basics
- 30 second timer per question (auto-skips if time runs out — doesn't reveal the answer)
- 5 minute timer for the whole quiz (ends the quiz if it hits zero, wherever you are)
- progress bar + question counter (`Question X / 10`)
- `prev()` / `next()` buttons so you can move around without answering
- your progress per question is remembered if you navigate back and forth (timer picks up where it left off)
- correct/wrong highlighting after you answer
- result screen at the end with a score-based message

## How to run it
No installing or compiling anything, it's just static files.

1. Unzip the folder (if it isn't already)
2. Open `index.html` in your browser (double-click it, or right click → open with browser)

That's it. If the fonts look off, it's probably because it pulls JetBrains Mono / Inter from Google Fonts, so you need internet for those — the quiz itself still works fine offline either way.

## Files
```
index.html   → page structure / layout
style.css    → all the styling (dark "code editor" theme)
script.js    → all the quiz logic (questions, timers, scoring, navigation)
```

## How it works (quick rundown)
- `quizData` in `script.js` is just an array of question objects (question text, 4 options, index of the correct one) — this is where you'd add/edit questions
- `questionState` keeps track of each question's status (`unanswered` / `answered` / `timeout`) plus what was picked and how much time was left, so jumping between questions with prev/next doesn't lose anything
- two timers run independently: `totalInterval` for the 5 min overall countdown, and `questionInterval` for the 30s per-question one (pauses when you leave a question, resumes from where it stopped)
- picking an option locks all the buttons, flashes correct/wrong colors, then auto-advances after a short delay

## Todo / ideas for later
- [ ] add more questions
- [ ] randomize question order each attempt
- [ ] save high score with localStorage
- [ ] maybe a dark/light theme toggle

## Author
Mannan
