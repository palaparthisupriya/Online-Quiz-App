// ----- Sample questions (editable) -----
const QUESTIONS = [
    {
      id: 1,
      q: "Which HTML tag is used to create a hyperlink?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      answer: 1,
      time: 15
    },
    {
      id: 2,
      q: "Which CSS property controls the text size?",
      options: ["font-style", "text-size", "font-size", "text-style"],
      answer: 2,
      time: 12
    }
  ];
  
  // demo-generator used if QUESTIONS array is too small/invalid
  function makeDemoQuestions() {
    return [
      {id:1,q:"What does 'MCQ' stand for?",options:["Multiple Choice Question","Multiple Correct Query","Main Choice Quiz","Multi Course Quiz"],answer:0,time:12},
      {id:2,q:"Ideal feature for instant learning is:",options:["Delayed grading","Instant feedback","No timers","Paper-only tests"],answer:1,time:10},
      {id:3,q:"A lightweight quiz app should prioritize:",options:["Large downloads","Minimal UI","Complex setup","Heavy analytics"],answer:1,time:10},
      {id:4,q:"Which of these improves engagement?",options:["Long forms","Timers and badges","Slow feedback","Manual scoring only"],answer:1,time:12},
      {id:5,q:"The primary audience for this app is:",options:["Only admins","Students & educators","Only developers","Only parents"],answer:1,time:10}
    ];
  }
  
  // Validate user QUESTIONS
  let qset = [];
  try {
    if (Array.isArray(QUESTIONS) && QUESTIONS.length >= 3 && QUESTIONS.every(q => q.q && Array.isArray(q.options))) {
      qset = QUESTIONS.filter(q => typeof q.time === 'number' && q.options.length >= 2);
      if (qset.length < 3) qset = makeDemoQuestions();
    } else {
      qset = makeDemoQuestions();
    }
  } catch(e) {
    qset = makeDemoQuestions();
  }
  
  let current = 0;
  let score = 0;
  const userAnswers = new Array(qset.length).fill(null);
  
  const qtext = document.getElementById('qtext');
  const optionsEl = document.getElementById('options');
  const timerEl = document.getElementById('timer');
  const progressEl = document.getElementById('progress');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const resultEl = document.getElementById('result');
  const scoreText = document.getElementById('scoreText');
  const feedback = document.getElementById('feedback');
  const restartBtn = document.getElementById('restartBtn');
  const reviewBtn = document.getElementById('reviewBtn');
  
  let countdown = null;
  let timeLeft = 0;
  
  function renderQuestion(index) {
    const q = qset[index];
    progressEl.textContent = `Question ${index+1} / ${qset.length}`;
    qtext.textContent = q.q;
    optionsEl.innerHTML = '';
    q.options.forEach((opt,i) => {
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.innerHTML = opt;
      btn.dataset.index = i;
      btn.addEventListener('click', ()=>selectOption(i));
      optionsEl.appendChild(btn);
    });
  
    // highlight previously selected
    if (userAnswers[index] !== null && userAnswers[index] !== -1) {
      const opts = optionsEl.querySelectorAll('.opt');
      const picked = userAnswers[index];
      opts.forEach((el, idx) => {
        if (idx === q.answer) el.classList.add('correct');
        if (idx === picked && picked !== q.answer) el.classList.add('wrong');
      });
    }
  
    // timer
    resetTimer(q.time || 12);
    resultEl.classList.remove('show');
  }
  
  function selectOption(i) {
    if (userAnswers[current] !== null) return; // already answered
    clearInterval(countdown);
    const q = qset[current];
    userAnswers[current] = i;
    const opts = optionsEl.querySelectorAll('.opt');
    opts.forEach((el, idx) => { el.classList.remove('correct','wrong'); if (idx === q.answer) el.classList.add('correct'); });
    if (i === q.answer) { score++; feedback.textContent = 'Correct! +1'; }
    else { opts[i].classList.add('wrong'); feedback.textContent = 'Wrong. Correct answer highlighted.'; }
    scoreText.textContent = `Score: ${score} / ${qset.length}`;
    resultEl.classList.add('show');
  }
  
  function resetTimer(seconds) {
    clearInterval(countdown);
    timeLeft = seconds;
    updateTimerDisplay();
    countdown = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(countdown);
        if (userAnswers[current] === null) {
          userAnswers[current] = -1; // timed out
          const opts = optionsEl.querySelectorAll('.opt');
          const q = qset[current];
          opts.forEach((el, idx) => { if (idx === q.answer) el.classList.add('correct'); });
          feedback.textContent = 'Time up! Correct answer highlighted.';
          resultEl.classList.add('show');
        }
      }
    }, 1000);
  }
  
  function updateTimerDisplay() {
    const mm = String(Math.floor(timeLeft/60)).padStart(2,'0');
    const ss = String(timeLeft%60).padStart(2,'0');
    timerEl.textContent = `${mm}:${ss}`;
  }
  
  prevBtn.addEventListener('click', ()=> {
    if (current > 0) { current--; renderQuestion(current); }
  });
  
  nextBtn.addEventListener('click', ()=> {
    if (current < qset.length - 1) { current++; renderQuestion(current); }
    else showFinal();
  });
  
  restartBtn.addEventListener('click', ()=> { resetAll(); renderQuestion(0); });
  
  reviewBtn.addEventListener('click', ()=> { showReview(); });
  
  function showFinal() {
    clearInterval(countdown);
    qtext.textContent = 'Quiz completed!';
    optionsEl.innerHTML = '';
    progressEl.textContent = `Completed`;
    resultEl.classList.add('show');
    scoreText.textContent = `Score: ${score} / ${qset.length}`;
    feedback.textContent = `You answered ${userAnswers.filter(x => x !== null && x !== -1).length} questions. ${score} correct.`;
  }
  
  function showReview() {
    clearInterval(countdown);
    qtext.textContent = 'Review Answers';
    optionsEl.innerHTML = '';
    qset.forEach((q, qi) => {
      const wrap = document.createElement('div');
      wrap.style.marginBottom = '12px';
      const title = document.createElement('div');
      title.style.fontWeight = 700; title.style.marginBottom = '6px';
      title.textContent = `${qi+1}. ${q.q}`;
      wrap.appendChild(title);
      q.options.forEach((opt, oi) => {
        const el = document.createElement('div');
        el.style.padding = '8px'; el.style.borderRadius = '8px'; el.style.marginBottom = '6px';
        el.style.border = '1px solid rgba(255,255,255,0.04)';
        if (oi === q.answer) el.style.background = 'rgba(34,197,94,0.06)';
        if (userAnswers[qi] === oi && oi !== q.answer) el.style.background = 'rgba(239,68,68,0.06)';
        // timed-out marker
        if (userAnswers[qi] === -1 && oi === q.answer) el.style.outline = '2px dashed rgba(255,200,0,0.12)';
        el.textContent = opt;
        wrap.appendChild(el);
      });
      optionsEl.appendChild(wrap);
    });
    progressEl.textContent = 'Reviewing';
    resultEl.classList.add('show');
  }
  
  function resetAll() {
    current = 0; score = 0;
    for (let i = 0; i < userAnswers.length; i++) userAnswers[i] = null;
    resultEl.classList.remove('show');
  }
  
  // initialize
  resetAll();
  renderQuestion(0);

  // ----------- Create Quiz Feature -------------
const toggleCreateBtn = document.getElementById('toggleCreateBtn');
const createQuizSection = document.getElementById('createQuiz');
const questionInputs = document.getElementById('questionInputs');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const startCustomQuizBtn = document.getElementById('startCustomQuizBtn');

let customQuestions = [];

toggleCreateBtn.addEventListener('click', () => {
  createQuizSection.style.display =
    createQuizSection.style.display === 'none' ? 'block' : 'none';
});

// Add new question input block
addQuestionBtn.addEventListener('click', () => {
  const block = document.createElement('div');
  block.className = 'q-block';
  block.innerHTML = `
    <textarea placeholder="Enter your question"></textarea>
    <input type="text" placeholder="Option 1" />
    <input type="text" placeholder="Option 2" />
    <input type="text" placeholder="Option 3" />
    <input type="text" placeholder="Option 4" />
    <input type="number" placeholder="Correct Option (1-4)" min="1" max="4" />
    <input type="number" placeholder="Time in seconds" value="15" min="5" />
  `;
  questionInputs.appendChild(block);
});

// Start quiz with custom questions
startCustomQuizBtn.addEventListener('click', () => {
  customQuestions = [];
  const blocks = questionInputs.querySelectorAll('.q-block');
  blocks.forEach((b, idx) => {
    const inputs = b.querySelectorAll('input, textarea');
    const qText = inputs[0].value.trim();
    const opts = [inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value].filter(o => o.trim() !== '');
    const ans = parseInt(inputs[5].value) - 1; // convert to 0-index
    const time = parseInt(inputs[6].value);
    if (qText && opts.length >= 2 && ans >= 0 && ans < opts.length) {
      customQuestions.push({
        id: idx + 1,
        q: qText,
        options: opts,
        answer: ans,
        time: isNaN(time) ? 15 : time
      });
    }
  });

  if (customQuestions.length > 0) {
    qset = customQuestions;
    resetAll();
    renderQuestion(0);
    createQuizSection.style.display = 'none';
    toggleCreateBtn.textContent = "Switch Back to Default Quiz";
  } else {
    alert("Please add at least one valid question!");
  }
});

  