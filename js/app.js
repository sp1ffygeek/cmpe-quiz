// ===== CONFIG-DRIVEN QUIZ APP =====
let CONFIG = {};
let QUESTIONS = {};
let FORMULAS = {};

// ===== LOAD CONFIG =====
async function loadConfig() {
  try {
    const resp = await fetch('data/config.json');
    if (!resp.ok) throw new Error('Failed to load config.json');
    CONFIG = await resp.json();
    console.log('⚙️ Config loaded:', CONFIG.title);
    renderCourseSelection();
    await Promise.all([loadQuestions(), loadFormulas()]);
  } catch (err) {
    console.error('Failed to load config:', err);
    document.getElementById('screen-course').innerHTML = `
      <div class="card" style="text-align:center;padding:40px">
        <h2>⚠️ Failed to load configuration</h2>
        <p style="color:var(--text2);margin-top:12px">Make sure <code>data/config.json</code> exists.<br>
        This app must be served via HTTP (not file://).</p>
        <p style="color:var(--wrong);margin-top:8px;font-size:0.85rem">${err.message}</p>
      </div>`;
  }
}

// ===== RENDER COURSE SELECTION (from config) =====
function renderCourseSelection() {
  document.getElementById('header-title').textContent = '📝 ' + CONFIG.title;

  // Populate heading and subtitle
  const card = document.querySelector('#screen-course .course-select');
  const h2 = card.querySelector('h2');
  const p = card.querySelector('p');
  h2.textContent = 'Choose Your Course';
  p.textContent = CONFIG.subtitle || 'Select a course to start practicing';

  // Populate course buttons
  const container = document.getElementById('course-list');
  container.innerHTML = '';

  CONFIG.courses.forEach(course => {
    const qCount = QUESTIONS[course.id] ? QUESTIONS[course.id].length : 0;
    const desc = qCount > 0
      ? `${qCount} questions · ${course.description}`
      : course.description;
    const btn = document.createElement('button');
    btn.className = 'course-btn';
    btn.onclick = () => selectCourse(course.id);
    btn.innerHTML = `
      <span class="course-code">${course.code}</span> — ${course.name}
      <span class="course-desc">${desc}</span>
    `;
    container.appendChild(btn);
  });
}

// ===== LOAD QUESTIONS =====
async function loadQuestions() {
  try {
    const results = await Promise.all(
      CONFIG.courses.map(async (course) => {
        const resp = await fetch(course.questionFile);
        if (!resp.ok) throw new Error('Failed to load ' + course.questionFile);
        return [course.id, await resp.json()];
      })
    );
    results.forEach(([key, data]) => { QUESTIONS[key] = data; });
    console.log('✅ Loaded', Object.keys(QUESTIONS).map(k => k + ':' + QUESTIONS[k].length).join(', '));
    // Re-render course selection with question counts
    renderCourseSelection();
  } catch (err) {
    console.error('Failed to load questions:', err);
  }
}

// ===== LOAD FORMULAS =====
async function loadFormulas() {
  try {
    const results = await Promise.all(
      CONFIG.courses.filter(c => c.formulaFile).map(async (course) => {
        const resp = await fetch(course.formulaFile);
        if (!resp.ok) throw new Error('Failed to load ' + course.formulaFile);
        return [course.id, await resp.json()];
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
  answers: [],
  theme: localStorage.getItem('quiz-theme') || 'light',
  totalStartTime: null,
  questionStartTime: null,
  timerInterval: null,
  totalElapsed: 0
};

// ===== HELPERS =====
function getCourseConfig(courseId) {
  return CONFIG.courses.find(c => c.id === courseId);
}

function getCourseTitle(courseId) {
  const c = getCourseConfig(courseId);
  return c ? `${c.code} — ${c.name}` : courseId;
}

// ===== THEME =====
function initTheme() {
  if (!localStorage.getItem('quiz-theme')) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
    }
  }
  applyTheme();
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
  applyTheme();
}

// ===== NAVIGATION =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-course') {
    document.getElementById('header-title').textContent = '📝 ' + (CONFIG.title || 'CMPE Exam Prep');
    document.getElementById('timer-display').style.display = 'none';
    if (state.timerInterval) clearInterval(state.timerInterval);
  }
}

// ===== TIMER =====
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
  if (m > 0) return m + 'm ' + String(s).padStart(2, '0') + 's';
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
function resetQuestionTimer() { state.questionStartTime = Date.now(); }
function getQuestionTime() { return Math.floor((Date.now() - state.questionStartTime) / 1000); }

// ===== COURSE SELECTION =====
function selectCourse(courseId) {
  state.course = courseId;
  const courseTitle = getCourseTitle(courseId);
  document.getElementById('mode-title').textContent = courseTitle;
  const qCount = QUESTIONS[courseId] ? QUESTIONS[courseId].length : 0;
  document.getElementById('mode-subtitle').textContent = qCount + ' questions available';
  document.getElementById('header-title').textContent = courseTitle;

  // Dynamically generate mode buttons from config presets
  // Only show presets that are strictly less than total question count
  const container = document.getElementById('mode-buttons');
  container.innerHTML = '';
  const presets = CONFIG.quizPresets || [];
  const shownPresets = presets.filter(p => p.count < qCount);
  shownPresets.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = 'mode-btn secondary';
    btn.textContent = `${preset.icon} ${preset.label} (Random)`;
    btn.onclick = () => startQuiz(preset.count);
    container.appendChild(btn);
  });
  // "All" button — always shown
  const allBtn = document.createElement('button');
  allBtn.className = 'mode-btn';
  allBtn.textContent = `📋 All ${qCount} Questions (Shuffled)`;
  allBtn.onclick = () => startQuiz(qCount);
  container.appendChild(allBtn);
  // "Custom Random" input — only if there are enough questions to make it useful
  if (qCount > 10) {
    const defaultCustom = Math.min(30, Math.floor(qCount / 2));
    const customDiv = document.createElement('div');
    customDiv.className = 'custom-random';
    customDiv.innerHTML = `
      <label for="custom-count">🎲 Custom:</label>
      <input type="number" id="custom-count" min="1" max="${qCount}" value="${defaultCustom}" class="custom-input">
      <button class="mode-btn secondary custom-go" onclick="startQuiz(Math.min(parseInt(document.getElementById('custom-count').value)||10, ${qCount}))">Go</button>
    `;
    container.appendChild(customDiv);
  }

  showScreen('screen-mode');
}

// ===== SHUFFLE (3-pass Fisher-Yates for thorough randomization) =====
function shuffle(arr) {
  const a = [...arr];
  for (let pass = 0; pass < 3; pass++) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  return a;
}

// ===== START QUIZ =====
function startQuiz(count) {
  const allQ = QUESTIONS[state.course];
  if (!allQ || allQ.length === 0) return;
  const shuffled = shuffle(allQ);
  state.questions = shuffled.slice(0, Math.min(count, shuffled.length));
  state.currentIndex = 0;
  state.score = 0;
  state.answered = 0;
  state.answers = [];
  const total = state.questions.length;
  const modeLabel = count >= allQ.length ? `All ${total}` : `Quick ${total}`;
  document.getElementById('header-title').textContent = `${getCourseTitle(state.course)} · ${modeLabel}`;

  // Show/hide formula button based on config flag + formula data availability
  const formulaBtn = document.getElementById('formula-btn');
  if (formulaBtn) {
    const showFormulas = CONFIG.showFormulas !== false; // default true
    const hasFormulas = FORMULAS[state.course] && FORMULAS[state.course].length > 0;
    formulaBtn.style.display = (showFormulas && hasFormulas) ? 'inline-block' : 'none';
  }

  showScreen('screen-quiz');
  startTimer();
  renderQuestion();
}

// ===== RENDER QUESTION =====
function renderQuestion() {
  const q = state.questions[state.currentIndex];
  const total = state.questions.length;
  const idx = state.currentIndex;
  const prevAnswer = state.answers.find(a => a.qIndex === idx);

  // Progress
  document.getElementById('progress-bar').style.width = ((idx / total) * 100) + '%';
  document.getElementById('progress-label').textContent = `Question ${idx + 1} of ${total}`;
  document.getElementById('score-label').textContent = `Score: ${state.score}/${state.answered}`;

  // Previous button visibility (controlled by config.enableBackButton)
  const prevBtn = document.getElementById('prev-btn');
  const backEnabled = CONFIG.enableBackButton !== false; // default true
  if (backEnabled) {
    prevBtn.style.display = 'inline-block';
    if (idx > 0) {
      prevBtn.style.opacity = '1';
      prevBtn.style.pointerEvents = 'auto';
    } else {
      prevBtn.style.opacity = '0.3';
      prevBtn.style.pointerEvents = 'none';
    }
  } else {
    prevBtn.style.display = 'none';
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
    fb.style.display = 'block';
    if (prevAnswer.isCorrect) {
      fb.className = 'feedback correct-fb';
      document.getElementById('fb-title').textContent = '✅ Correct!';
    } else {
      fb.className = 'feedback wrong-fb';
      document.getElementById('fb-title').textContent = `❌ Wrong — Correct answer is ${prevAnswer.correct}`;
    }
    document.getElementById('fb-explanation').innerHTML = q.explanation.replace(/\n/g, '<br>');
    nextBtn.textContent = idx < total - 1 ? 'Next Question →' : 'View Results →';
    nextBtn.style.display = 'block';
  } else {
    fb.style.display = 'none';
    fb.className = 'feedback';
    nextBtn.style.display = 'none';
  }

  typesetMath();
}

function typesetMath() {
  if (window.MathJax && MathJax.typesetPromise) {
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

  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(btn => {
    btn.classList.add('disabled');
    btn.onclick = null;
    const letter = btn.dataset.letter;
    if (letter === correct) btn.classList.add('correct');
    if (letter === selected && !isCorrect) btn.classList.add('wrong');
  });

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
  document.getElementById('score-label').textContent = `Score: ${state.score}/${state.answered}`;

  const nextBtn = document.getElementById('next-btn');
  nextBtn.textContent = state.currentIndex < state.questions.length - 1 ? 'Next Question →' : 'View Results →';
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

  document.getElementById('header-title').textContent = `${getCourseTitle(state.course)} · Results`;
  renderReviewList('all');
}

function renderReviewList(filter) {
  const list = document.getElementById('review-list');
  list.innerHTML = '';

  state.answers.forEach((a) => {
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

// ===== STUDY GUIDE (config-driven) =====
function openStudyGuide() {
  const courseConfig = getCourseConfig(state.course);
  if (!courseConfig || !courseConfig.studyGuides) return;
  const modules = courseConfig.studyGuides;
  const el = document.getElementById('sg-content');
  let html = '<h2>📖 Study Guide — ' + getCourseTitle(state.course) + '</h2>';
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
  const latexBlocks = [];
  md = md.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
    latexBlocks.push(match);
    return `%%LATEX_BLOCK_${latexBlocks.length - 1}%%`;
  });
  md = md.replace(/\$([^\$\n]+?)\$/g, (match) => {
    latexBlocks.push(match);
    return `%%LATEX_BLOCK_${latexBlocks.length - 1}%%`;
  });
  let html = marked.parse(md);
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
    let html;
    if (file.endsWith('.md')) {
      html = renderMarkdown(text);
    } else {
      html = text;
    }
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
loadConfig();
