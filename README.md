# CMPE Exam Quiz App

A single-page quiz application for practicing **CMPE 260 (Reinforcement Learning)** and **CMPE 256 (Recommender Systems)** exam questions.

## Features

- **200 questions** — 100 per course, embedded directly in the HTML
- **Three quiz modes** — All 100 (shuffled), Quick 25, Quick 10
- **Instant feedback** — correct/wrong highlighting with explanations
- **LaTeX rendering** — equations rendered via MathJax CDN
- **Progress tracking** — live score and progress bar
- **End-of-quiz summary** — score breakdown, filterable review of all answers
- **Dark/light mode** — toggle with persistent preference
- **Mobile-friendly** — responsive design for phone screens
- **Zero dependencies** — single HTML file (only external: MathJax CDN)

## Deploying to GitHub Pages

### Option 1: From this repo

1. Push the `plans/quiz/` directory to your GitHub repository
2. Go to **Settings → Pages**
3. Under **Source**, select the branch (e.g., `main`) and folder (`/plans/quiz`)
4. Click **Save**
5. Your quiz will be live at `https://<username>.github.io/<repo>/plans/quiz/`

### Option 2: Standalone deployment

1. Create a new GitHub repository (e.g., `cmpe-quiz`)
2. Copy `index.html` to the root of the repository
3. Push to GitHub
4. Go to **Settings → Pages → Source → Deploy from branch → `main` / `/ (root)`**
5. Your quiz will be live at `https://<username>.github.io/cmpe-quiz/`

### Option 3: Open locally

Simply open `index.html` in any modern browser — it works offline (except LaTeX rendering requires internet for MathJax CDN).

## Rebuilding the Question Data

If you update the source question files, you can regenerate the HTML:

```bash
# 1. Parse questions from markdown to JSON
python3 parse_questions.py > questions.json

# 2. Build the HTML with embedded data
python3 build_html.py
```

### Source files
- `../../plans/CMPE260_TOP100_Predicted_Exam_Questions.md`
- `../../plans/CMPE256_TOP100_Predicted_Exam_Questions.md`

## Tech Stack

- **HTML/CSS/JS** — vanilla, no frameworks
- **MathJax 3** — CDN-loaded for LaTeX `$$...$$` rendering
- **LocalStorage** — persists dark/light mode preference

