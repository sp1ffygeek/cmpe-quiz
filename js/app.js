// ===== QUESTION DATA =====
let QUESTIONS = {};
let FORMULAS = {};

const QUESTION_FILES = {
  cmpe260: 'data/cmpe260.json',
  cmpe256: 'data/cmpe256.json'
};

const FORMULA_FILES = {
  cmpe260: 'data/formulas-cmpe260.json',
  cmpe256: 'data/formulas-cmpe256.json'
};

async function loadQuestions() {
  try {
    const entries = Object.entries(QUESTION_FILES);
    const results = await Promise.all(
      entries.map(async ([key, file]) => {
        const resp = await fetch(file);
        if (!resp.ok) throw new Error('Failed to load ' + file);
        return [key, await resp.json()];
      })
    );
    results.forEach(([key, data]) => { QUESTIONS[key] = data; });
    console.log('✅ Loaded', Object.keys(QUESTIONS).map(k => k + ':' + QUESTIONS[k].length).join(', '));
  } catch (err) {
    console.error('Failed to load questions:', err);
    document.getElementById('screen-course').innerHTML = `
      <div class="card" style="text-align:center;padding:40px">
        <h2>⚠️ Failed to load questions</h2>
        <p style="color:var(--text2);margin-top:12px">Make sure <code>data/*.json</code> files exist.<br>
        This app must be served via HTTP (not file://).</p>
        <p style="color:var(--wrong);margin-top:8px;font-size:0.85rem">${err.message}</p>
      </div>`;
  }
}

async function loadFormulas() {
  try {
    const entries = Object.entries(FORMULA_FILES);
    const results = await Promise.all(
      entries.map(async ([key, file]) => {
        const resp = await fetch(file);
        if (!resp.ok) throw new Error('Failed to load ' + file);
        return [key, await resp.json()];
      })
    );
    results.forEach(([key, data]) => { FORMULAS[key] = data; });
    console.log('📐 Formulas loaded:', Object.keys(FORMULAS).join(', '));
  } catch (err) {
    console.warn('Formula sheets not loaded:', err.message);
  }
}

// ===== STATE =====
let state = {
  course: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: 0,
  answers: [], // {qIndex, selected, correct, isCorrect, timeSpent}
  theme: localStorage.getItem('quiz-theme') || 'light',
  totalStartTime: null,
  questionStartTime: null,
  timerInterval: null,
  totalElapsed: 0
};

// ===== THEME =====
function initTheme() {
  // Check system preference if no saved preference
  if (!localStorage.getItem('quiz-theme')) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
    }
  }
  if (state.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '☀️';
  }
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('quiz-theme')) {
      state.theme = e.matches ? 'dark' : 'light';
      applyTheme();
    }
  });
}
function applyTheme() {
  if (state.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('.theme-toggle').textContent = '🌙';
  }
}
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('quiz-theme', state.theme);
  if (state.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('.theme-toggle').textContent = '🌙';
  }
}

// ===== NAVIGATION =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-course') {
    document.getElementById('header-title').textContent = '📝 CMPE Exam Prep';
    document.getElementById('timer-display').style.display = 'none';
    if (state.timerInterval) clearInterval(state.timerInterval);
  }
}

// ===== TIMER =====
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
  }
  if (m > 0) {
    return m + 'm ' + String(s).padStart(2, '0') + 's';
  }
  return s + 's';
}
function startTimer() {
  state.totalStartTime = Date.now();
  state.questionStartTime = Date.now();
  document.getElementById('timer-display').style.display = 'inline-block';
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const totalSec = Math.floor((Date.now() - state.totalStartTime) / 1000);
    const qSec = Math.floor((Date.now() - state.questionStartTime) / 1000);
    document.getElementById('total-timer').textContent = formatTime(totalSec);
    document.getElementById('q-timer').textContent = 'Q: ' + formatTime(qSec);
  }, 1000);
}
function stopTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.totalElapsed = Math.floor((Date.now() - state.totalStartTime) / 1000);
  document.getElementById('timer-display').style.display = 'none';
}
function resetQuestionTimer() {
  state.questionStartTime = Date.now();
}
function getQuestionTime() {
  return Math.floor((Date.now() - state.questionStartTime) / 1000);
}

// ===== COURSE SELECTION =====
const COURSE_TITLES = {
  cmpe260: 'CMPE 260 — Reinforcement Learning',
  cmpe256: 'CMPE 256 — Recommender Systems'
};
function selectCourse(course) {
  state.course = course;
  document.getElementById('mode-title').textContent = COURSE_TITLES[course];
  const qCount = QUESTIONS[course] ? QUESTIONS[course].length : 0;
  document.getElementById('mode-subtitle').textContent = qCount + ' questions available';
  document.getElementById('header-title').textContent = COURSE_TITLES[course];
  showScreen('screen-mode');
}

// ===== SHUFFLE =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== START QUIZ =====
function startQuiz(count) {
  const allQ = QUESTIONS[state.course];
  const shuffled = shuffle(allQ);
  state.questions = shuffled.slice(0, Math.min(count, shuffled.length));
  state.currentIndex = 0;
  state.score = 0;
  state.answered = 0;
  state.answers = [];
  const total = state.questions.length;
  const modeLabel = count >= allQ.length ? `All ${total}` : `Quick ${total}`;
  document.getElementById('header-title').textContent = `${COURSE_TITLES[state.course]} · ${modeLabel}`;
  showScreen('screen-quiz');
  startTimer();
  renderQuestion();
}

// ===== RENDER QUESTION =====
function renderQuestion() {
  const q = state.questions[state.currentIndex];
  const total = state.questions.length;
  const idx = state.currentIndex;

  // Check if this question was already answered
  const prevAnswer = state.answers.find(a => a.qIndex === idx);

  // Progress
  document.getElementById('progress-bar').style.width = ((idx / total) * 100) + '%';
  document.getElementById('progress-label').textContent = `Question ${idx + 1} of ${total}`;
  document.getElementById('score-label').textContent = `Score: ${state.score}/${state.answered}`;

  // Previous button visibility
  const prevBtn = document.getElementById('prev-btn');
  prevBtn.style.display = 'inline-block';
  if (idx > 0) {
    prevBtn.style.opacity = '1';
    prevBtn.style.pointerEvents = 'auto';
  } else {
    prevBtn.style.opacity = '0.3';
    prevBtn.style.pointerEvents = 'none';
  }

  // Question
  document.getElementById('q-tier').textContent = q.tier;
  document.getElementById('q-number').textContent = `Q${q.num}`;
  document.getElementById('q-text').innerHTML = q.question.replace(/\n/g, '<br>');

  // Options
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<div class="option-content"><span class="option-letter">${letter}</span><span class="option-text">${q.options[letter]}</span></div>`;
    btn.dataset.letter = letter;

    if (prevAnswer) {
      // Already answered — show in review mode
      btn.classList.add('disabled');
      btn.onclick = null;
      if (letter === prevAnswer.correct) btn.classList.add('correct');
      if (letter === prevAnswer.selected && !prevAnswer.isCorrect) btn.classList.add('wrong');
    } else {
      btn.onclick = () => selectAnswer(letter);
    }
    container.appendChild(btn);
  });

  // Feedback
  const fb = document.getElementById('feedback');
  const nextBtn = document.getElementById('next-btn');
  if (prevAnswer) {
    // Show feedback for previously answered question
    fb.style.display = 'block';
    if (prevAnswer.isCorrect) {
      fb.className = 'feedback correct-fb';
      document.getElementById('fb-title').textContent = '✅ Correct!';
    } else {
      fb.className = 'feedback wrong-fb';
      document.getElementById('fb-title').textContent = `❌ Wrong — Correct answer is ${prevAnswer.correct}`;
    }
    document.getElementById('fb-explanation').innerHTML = q.explanation.replace(/\n/g, '<br>');
    // Show next button
    if (idx < total - 1) {
      nextBtn.textContent = 'Next Question →';
      nextBtn.style.display = 'block';
    } else {
      nextBtn.textContent = 'View Results →';
      nextBtn.style.display = 'block';
    }
  } else {
    fb.style.display = 'none';
    fb.className = 'feedback';
    nextBtn.style.display = 'none';
  }

  // Re-render MathJax
  typesetMath();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function typesetMath() {
  if (window.MathJax && MathJax.typesetPromise) {
    // Clear MathJax's internal cache of processed elements so re-inserted
    // content (feedback, review list, study guide) gets re-typeset correctly.
    if (MathJax.startup && MathJax.startup.document) {
      MathJax.startup.document.clear();
      MathJax.startup.document.updateDocument();
    }
    MathJax.typesetPromise().catch(err => console.log('MathJax typeset:', err));
  }
}

// ===== SELECT ANSWER =====
function selectAnswer(selected) {
  const q = state.questions[state.currentIndex];
  const correct = q.answer;
  const isCorrect = selected === correct;

  state.answered++;
  if (isCorrect) state.score++;

  const timeSpent = getQuestionTime();
  state.answers.push({
    qIndex: state.currentIndex,
    question: q,
    selected,
    correct,
    isCorrect,
    timeSpent
  });

  // Disable all options
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(btn => {
    btn.classList.add('disabled');
    btn.onclick = null;
    const letter = btn.dataset.letter;
    if (letter === correct) btn.classList.add('correct');
    if (letter === selected && !isCorrect) btn.classList.add('wrong');
  });

  // Show feedback
  const fb = document.getElementById('feedback');
  fb.style.display = 'block';
  if (isCorrect) {
    fb.className = 'feedback correct-fb';
    document.getElementById('fb-title').textContent = '✅ Correct!';
  } else {
    fb.className = 'feedback wrong-fb';
    document.getElementById('fb-title').textContent = `❌ Wrong — Correct answer is ${correct}`;
  }
  document.getElementById('fb-explanation').innerHTML = q.explanation.replace(/\n/g, '<br>');

  // Update score display
  document.getElementById('score-label').textContent = `Score: ${state.score}/${state.answered}`;

  // Show next button
  const nextBtn = document.getElementById('next-btn');
  if (state.currentIndex < state.questions.length - 1) {
    nextBtn.textContent = 'Next Question →';
  } else {
    nextBtn.textContent = 'View Results →';
  }
  nextBtn.style.display = 'block';

  typesetMath();
}

// ===== PREVIOUS QUESTION =====
function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ===== NEXT QUESTION =====
function nextQuestion() {
  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) {
    showSummary();
  } else {
    resetQuestionTimer();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ===== SUMMARY =====
function showSummary() {
  stopTimer();
  showScreen('screen-summary');
  const total = state.questions.length;
  const pct = Math.round((state.score / total) * 100);

  document.getElementById('final-score').textContent = `${state.score} / ${total}`;
  document.getElementById('final-pct').textContent = `${pct}% correct · ${formatTime(state.totalElapsed)} total`;

  const bar = document.getElementById('score-bar');
  bar.style.width = '0%';
  bar.style.background = pct >= 70 ? 'var(--correct)' : pct >= 50 ? '#ff9f0a' : 'var(--wrong)';
  setTimeout(() => { bar.style.width = pct + '%'; }, 100);

  document.getElementById('header-title').textContent = `${COURSE_TITLES[state.course]} · Results`;
  renderReviewList('all');
}

function renderReviewList(filter) {
  const list = document.getElementById('review-list');
  list.innerHTML = '';

  state.answers.forEach((a, i) => {
    if (filter === 'wrong' && a.isCorrect) return;
    if (filter === 'correct' && !a.isCorrect) return;

    const item = document.createElement('div');
    item.className = `review-item ${a.isCorrect ? 'review-correct' : 'review-wrong'}`;

    let detail = '';
    if (!a.isCorrect) {
      detail = `<div class="review-detail">
        Your answer: <strong>${a.selected}) ${a.question.options[a.selected]}</strong><br>
        Correct: <strong>${a.correct}) ${a.question.options[a.correct]}</strong>
        <span style="color:var(--text2);font-size:0.8rem;margin-left:8px">⏱ ${formatTime(a.timeSpent)}</span><br>
        <em>${a.question.explanation}</em>
      </div>`;
    } else {
      detail = `<div class="review-detail">✅ Answered: ${a.correct} <span style="color:var(--text2);font-size:0.8rem;margin-left:8px">⏱ ${formatTime(a.timeSpent)}</span></div>`;
    }

    item.innerHTML = `
      <div class="review-q">${a.isCorrect ? '✅' : '❌'} Q${a.question.num}. ${a.question.question.substring(0, 120)}${a.question.question.length > 120 ? '...' : ''}</div>
      ${detail}
    `;
    list.appendChild(item);
  });

  typesetMath();
}

function filterReview(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderReviewList(filter);
}

// ===== EXIT QUIZ =====
function exitQuiz() {
  if (state.answered === 0) {
    // No questions answered, just go back to mode selection
    stopTimer();
    showScreen('screen-mode');
    return;
  }
  if (confirm(`Exit quiz? You've answered ${state.answered} of ${state.questions.length} questions. View your results?`)) {
    showSummary();
  }
}

// ===== RESTART =====
function restartQuiz() {
  startQuiz(state.questions.length);
}

// ===== STUDY GUIDE =====
const STUDY_GUIDE_MODULES = {
  cmpe260: [
    { id: 'all', file: 'guides/cmpe260/overview.md', label: '📋 All Modules (Overview)' },
    { id: 'm09', file: 'guides/cmpe260/m09-policy-gradient.md', label: 'M09 · Policy Gradient' },
    { id: 'm10', file: 'guides/cmpe260/m10-trpo-ppo-acktr.md', label: 'M10 · TRPO, PPO, ACKTR' },
    { id: 'm11', file: 'guides/cmpe260/m11-ddpg-td3-sac.md', label: 'M11 · DDPG, TD3, SAC' },
    { id: 'm12', file: 'guides/cmpe260/m12-a2c-a3c.md', label: 'M12 · A2C / A3C' },
    { id: 'm13', file: 'guides/cmpe260/m13-bc-her-gail.md', label: 'M13 · BC, HER, GAIL' },
    { id: 'm15', file: 'guides/cmpe260/m15-mbrl-offline.md', label: 'M15-17 · MBRL & Offline RL' },
  ],
  cmpe256: [
    { id: 'all', file: 'guides/cmpe256/overview.md', label: '📋 All Modules (Overview)' },
    { id: 'm1', file: 'guides/cmpe256/m1-similarity-evaluation.md', label: 'M1 · Similarity & Evaluation' },
    { id: 'm2', file: 'guides/cmpe256/m2-content-cf.md', label: 'M2 · Content-Based & CF' },
    { id: 'm3', file: 'guides/cmpe256/m3-matrix-factorization.md', label: 'M3 · Matrix Factorization' },
    { id: 'm4', file: 'guides/cmpe256/m4-neural-cf-bandits.md', label: 'M4 · Neural CF & Bandits' },
    { id: 'm5', file: 'guides/cmpe256/m5-graphs-pagerank.md', label: 'M5 · Graphs, SNA, PageRank' },
    { id: 'm6', file: 'guides/cmpe256/m6-communities-fairness.md', label: 'M6 · Communities & Fairness' },
  ]
};

function openStudyGuide() {
  const modules = STUDY_GUIDE_MODULES[state.course];
  if (!modules) return;
  const el = document.getElementById('sg-content');
  // Show module picker
  let html = '<h2>📖 Study Guide — ' + COURSE_TITLES[state.course] + '</h2>';
  html += '<p style="color:var(--text2);margin-bottom:16px">Select a module to review:</p>';
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  modules.forEach(m => {
    const isAll = m.id === 'all';
    const style = isAll
      ? 'background:var(--accent);color:#fff;font-weight:700'
      : 'background:var(--bg2);color:var(--text);border:1px solid var(--border)';
    html += `<button onclick="loadStudyModule('${m.file}')" style="${style};padding:12px 18px;border-radius:10px;cursor:pointer;font-size:0.95rem;text-align:left;transition:all 0.15s;border:${isAll ? 'none' : '1px solid var(--border)'}">${m.label}</button>`;
  });
  html += '</div>';
  el.innerHTML = html;
  document.getElementById('sg-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderMarkdown(md) {
  // Protect LaTeX blocks from marked.js processing:
  // 1. Extract $$...$$ (display) and $...$ (inline) blocks
  // 2. Replace with placeholders
  // 3. Run marked
  // 4. Restore LaTeX blocks
  const latexBlocks = [];
  // Protect display math $$...$$
  md = md.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
    latexBlocks.push(match);
    return `%%LATEX_BLOCK_${latexBlocks.length - 1}%%`;
  });
  // Protect inline math $...$  (but not $$)
  md = md.replace(/\$([^\$\n]+?)\$/g, (match) => {
    latexBlocks.push(match);
    return `%%LATEX_BLOCK_${latexBlocks.length - 1}%%`;
  });

  // Render markdown to HTML
  let html = marked.parse(md);

  // Restore LaTeX blocks
  html = html.replace(/%%LATEX_BLOCK_(\d+)%%/g, (_, idx) => latexBlocks[parseInt(idx)]);

  return html;
}

async function loadStudyModule(file) {
  const el = document.getElementById('sg-content');
  el.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text2)">Loading…</p>';
  try {
    const resp = await fetch(file);
    if (!resp.ok) throw new Error('Failed to load ' + file);
    const text = await resp.text();
    // Render markdown or raw HTML based on file extension
    let html;
    if (file.endsWith('.md')) {
      html = renderMarkdown(text);
    } else {
      html = text;
    }
    // Add back button
    html = '<button onclick="openStudyGuide()" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:0.9rem;margin-bottom:12px;text-decoration:underline">← Back to module list</button>' + html;
    el.innerHTML = html;
    el.parentElement.scrollTop = 0;
    typesetMath();
  } catch (err) {
    el.innerHTML = '<p style="text-align:center;padding:40px;color:var(--wrong)">⚠️ ' + err.message + '</p>';
  }
}

function closeStudyGuide() {
  document.getElementById('sg-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== FORMULA SHEET =====
function openFormulaSheet() {
  const formulas = FORMULAS[state.course];
  if (!formulas || formulas.length === 0) return;

  const el = document.getElementById('fs-content');
  let html = '<h2>📐 Formula Sheet</h2>';
  html += '<p style="color:var(--text2);margin-bottom:18px;font-size:0.9rem">Reference formulas — just like on exam day</p>';

  formulas.forEach(section => {
    html += `<div class="fs-section">`;
    html += `<h3>${section.module}</h3>`;
    section.formulas.forEach(f => {
      html += `<div class="fs-formula">`;
      html += `<span class="fs-name">${f.name}</span>`;
      html += `<span class="fs-latex">${f.latex}</span>`;
      html += `</div>`;
    });
    html += `</div>`;
  });

  el.innerHTML = html;
  document.getElementById('fs-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  typesetMath();
}

function closeFormulaSheet() {
  document.getElementById('fs-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('fs-overlay').classList.contains('active')) {
      closeFormulaSheet();
    } else if (document.getElementById('sg-overlay').classList.contains('active')) {
      closeStudyGuide();
    }
  }
});

// ===== INIT =====
initTheme();
loadQuestions();
loadFormulas();
