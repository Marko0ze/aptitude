const gameArea = document.getElementById('game-area');
const feedbackArea = document.getElementById('feedback-area');
const gameButtons = document.getElementById('game-buttons');

const state = {
  attempts: {},
};

const games = [
  { key: 'shortcuts', title: 'Shortcuts (Path Efficiency)', run: runShortcuts },
  { key: 'gridlock', title: 'Grid Lock (Flow Planning)', run: runGridLock },
  { key: 'resemble', title: 'Resemble (Pattern Matching)', run: runResemble },
  { key: 'numbubbles', title: 'Numbubbles (Number Target)', run: runNumbubbles },
  { key: 'tallyup', title: 'Tally Up (Fast Arithmetic)', run: runTallyUp },
  { key: 'proofit', title: 'Proof It (Verbal Accuracy)', run: runProofIt },
  { key: 'chartblast', title: 'Chart Blast (Numerical Reasoning)', run: runChartBlast },
  { key: 'argument', title: 'Argument Filter (Critical Reasoning)', run: runArgumentFilter },
];

function boot() {
  games.forEach((g) => {
    const btn = document.createElement('button');
    btn.textContent = g.title;
    btn.onclick = () => g.run();
    gameButtons.appendChild(btn);
  });
  renderFeedbackSummary();
}

function beginGame(title, html) {
  gameArea.classList.remove('hidden');
  gameArea.innerHTML = `<h2>${title}</h2>${html}`;
}

function markAttempt(key, correct, speedSeconds, notes = '') {
  if (!state.attempts[key]) state.attempts[key] = [];
  state.attempts[key].push({ correct, speedSeconds, notes, ts: new Date().toISOString() });
  renderFeedbackSummary();
}

function renderFeedbackSummary() {
  feedbackArea.classList.remove('hidden');
  const rows = games.map((g) => {
    const entries = state.attempts[g.key] || [];
    const done = entries.length;
    const acc = done ? Math.round((entries.filter((x) => x.correct).length / done) * 100) : 0;
    const avg = done ? (entries.reduce((a, b) => a + b.speedSeconds, 0) / done).toFixed(1) : '-';
    return `<tr><td>${g.title}</td><td>${done}</td><td>${acc}%</td><td>${avg}</td></tr>`;
  }).join('');

  feedbackArea.innerHTML = `
    <h2>Performance Dashboard</h2>
    <table class="table">
      <thead><tr><th>Game</th><th>Attempts</th><th>Accuracy</th><th>Avg Time (s)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="card">
      <h3>General evaluator signals</h3>
      <ul>
        <li><strong>Executive attention:</strong> avoid careless errors while staying fast.</li>
        <li><strong>Pattern abstraction:</strong> identify repeatable rules before acting.</li>
        <li><strong>Calibration:</strong> know when to skip/guess and when to invest time.</li>
      </ul>
      <p class="badge">Tip: run each game in 2-minute blocks and track trend, not one-off scores.</p>
    </div>
  `;
}

function resultBlock({ correct, correctAnswer, key, startedAt, tips }) {
  const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  markAttempt(key, correct, elapsed, correct ? 'correct' : `expected ${correctAnswer}`);
  return `
    <div class="card ${correct ? 'good' : 'bad'}">
      <strong>${correct ? 'Correct' : 'Not quite'}.</strong>
      ${correct ? '' : `<div>Expected: <code>${correctAnswer}</code></div>`}
      <div>Time: ${elapsed}s</div>
      <ul>${tips.map((t) => `<li>${t}</li>`).join('')}</ul>
    </div>
  `;
}

function runShortcuts() {
  const startedAt = Date.now();
  const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9);
  const d1 = a + b + c;
  const d2 = a * b - c;
  const d3 = a + c;
  beginGame('Shortcuts (Path Efficiency)', `
    <p>Choose the lowest-cost route to destination.</p>
    <div class="card">
      <div>Route A cost: ${a} + ${b} + ${c}</div>
      <div>Route B cost: ${a} × ${b} - ${c}</div>
      <div>Route C cost: ${a} + ${c}</div>
      <div class="row"><button id="sa">A</button><button id="sb">B</button><button id="sc">C</button></div>
      <div id="out"></div>
    </div>
  `);
  const min = Math.min(d1, d2, d3);
  const ans = min === d1 ? 'A' : min === d2 ? 'B' : 'C';
  ['a','b','c'].forEach((k) => {
    document.getElementById(`s${k}`).onclick = () => {
      const pick = k.toUpperCase();
      document.getElementById('out').innerHTML = resultBlock({
        correct: pick === ans,
        correctAnswer: ans,
        key: 'shortcuts',
        startedAt,
        tips: ['Pre-calc mental anchors (multiples, complements).', 'If two routes are close, verify arithmetic once.'],
      });
    };
  });
}

function runGridLock() {
  const startedAt = Date.now();
  const grid = [
    [1, 4, 3],
    [2, 8, 5],
    [6, 7, 9],
  ];
  beginGame('Grid Lock (Flow Planning)', `
    <p>From top-left to bottom-right, moving only right/down, what is the maximum sum?</p>
    <div class="card">
      ${grid.map((r) => `<div>${r.join(' | ')}</div>`).join('')}
      <div class="row">
        <input id="ans" type="number" placeholder="Max sum" />
        <button class="primary" id="check">Check</button>
      </div>
      <div id="out"></div>
    </div>
  `);
  const correct = 1 + 4 + 8 + 7 + 9;
  document.getElementById('check').onclick = () => {
    const v = Number(document.getElementById('ans').value);
    document.getElementById('out').innerHTML = resultBlock({
      correct: v === correct,
      correctAnswer: correct,
      key: 'gridlock',
      startedAt,
      tips: ['Plan path globally first; don\'t greedily pick local maximum.', 'Use quick DP framing: best-to-cell = value + max(top,left).'],
    });
  };
}

function runResemble() {
  const startedAt = Date.now();
  const base = '▲■●';
  const options = ['▲■●', '●■▲', '▲●■'];
  const ans = '▲■●';
  beginGame('Resemble (Pattern Matching)', `
    <p>Pick the option identical to the base sequence.</p>
    <div class="card">
      <div>Base: <strong>${base}</strong></div>
      <div class="row">${options.map((o, i) => `<button id="o${i}">${o}</button>`).join('')}</div>
      <div id="out"></div>
    </div>
  `);
  options.forEach((o, i) => {
    document.getElementById(`o${i}`).onclick = () => {
      document.getElementById('out').innerHTML = resultBlock({
        correct: o === ans,
        correctAnswer: ans,
        key: 'resemble',
        startedAt,
        tips: ['Scan left-to-right anchors (first + last symbol).', 'Avoid re-reading full pattern if anchors mismatch.'],
      });
    };
  });
}

function runNumbubbles() {
  const startedAt = Date.now();
  const nums = [rand(1, 9), rand(1, 9), rand(1, 9), rand(1, 9)];
  const target = nums[0] + nums[1] * nums[2] - nums[3];
  beginGame('Numbubbles (Number Target)', `
    <p>Create a formula that hits target <strong>${target}</strong> using numbers ${nums.join(', ')} once each.</p>
    <div class="card">
      <textarea id="expr" rows="2" cols="40" placeholder="Example: 3+5*2-4"></textarea>
      <div class="row"><button class="primary" id="check">Evaluate</button></div>
      <div id="out"></div>
    </div>
  `);
  document.getElementById('check').onclick = () => {
    const expr = document.getElementById('expr').value;
    let val = NaN;
    try { val = Function(`return (${expr})`)(); } catch (_) {}
    const usedOk = nums.every((n) => expr.includes(String(n)));
    document.getElementById('out').innerHTML = resultBlock({
      correct: val === target && usedOk,
      correctAnswer: `${nums[0]}+${nums[1]}*${nums[2]}-${nums[3]} = ${target}`,
      key: 'numbubbles',
      startedAt,
      tips: ['Work backwards from target parity/size.', 'Prefer * and / early; adjust with +/- at the end.'],
    });
  };
}

function runTallyUp() {
  const startedAt = Date.now();
  const left = [rand(10, 60), rand(10, 60), rand(10, 60)];
  const right = [rand(10, 60), rand(10, 60), rand(10, 60)];
  const l = left.reduce((a,b)=>a+b,0), r = right.reduce((a,b)=>a+b,0);
  const ans = l === r ? '=' : l > r ? 'L' : 'R';
  beginGame('Tally Up (Fast Arithmetic)', `
    <p>Which side has larger sum?</p>
    <div class="card">
      <div>Left: ${left.join(' + ')}</div>
      <div>Right: ${right.join(' + ')}</div>
      <div class="row"><button id="L">Left</button><button id="=">Equal</button><button id="R">Right</button></div>
      <div id="out"></div>
    </div>
  `);
  ['L','R','='].forEach((k) => {
    document.getElementById(k).onclick = () => {
      document.getElementById('out').innerHTML = resultBlock({
        correct: k === ans,
        correctAnswer: ans,
        key: 'tallyup',
        startedAt,
        tips: ['Round both sides to nearest 10 for a quick first pass.', 'Only compute exact values when rough sums are close.'],
      });
    };
  });
}

function runProofIt() {
  const startedAt = Date.now();
  const sentence = 'The project team recieve the data yesterday and validates it today.';
  beginGame('Proof It (Verbal Accuracy)', `
    <p>Identify the incorrect word in this sentence.</p>
    <div class="card">
      <blockquote>${sentence}</blockquote>
      <div class="row"><input id="word" placeholder="Type incorrect word" /><button class="primary" id="check">Check</button></div>
      <div id="out"></div>
    </div>
  `);
  document.getElementById('check').onclick = () => {
    const w = document.getElementById('word').value.trim().toLowerCase();
    document.getElementById('out').innerHTML = resultBlock({
      correct: w === 'recieve',
      correctAnswer: 'recieve (should be receive)',
      key: 'proofit',
      startedAt,
      tips: ['Scan for high-frequency traps: ie/ei, subject-verb agreement, tense drift.', 'Read once for meaning, once for mechanics.'],
    });
  };
}

function runChartBlast() {
  const startedAt = Date.now();
  const revA = rand(80, 160), revB = rand(80, 160);
  const marginA = rand(10, 40), marginB = rand(10, 40);
  const profitA = revA * marginA / 100;
  const profitB = revB * marginB / 100;
  const ans = profitA > profitB ? 'A' : profitB > profitA ? 'B' : 'E';
  beginGame('Chart Blast (Numerical Reasoning)', `
    <p>Company A revenue: ${revA}m, margin: ${marginA}%</p>
    <p>Company B revenue: ${revB}m, margin: ${marginB}%</p>
    <p>Who has higher profit?</p>
    <div class="row"><button id="A">A</button><button id="B">B</button><button id="E">Equal</button></div>
    <div id="out"></div>
  `);
  ['A','B','E'].forEach((k) => {
    document.getElementById(k).onclick = () => {
      document.getElementById('out').innerHTML = resultBlock({
        correct: k === ans,
        correctAnswer: ans,
        key: 'chartblast',
        startedAt,
        tips: ['Translate % to multipliers quickly (25%=1/4, 20%=1/5).', 'Estimate first, then compute only if close.'],
      });
    };
  });
}

function runArgumentFilter() {
  const startedAt = Date.now();
  const q = {
    claim: 'Our profits fell after remote work increased, so remote work caused the decline.',
    options: [
      'Confuses correlation with causation and ignores other factors.',
      'It is valid because events happened in that order.',
      'The statement cannot be assessed without survey data only.'
    ],
    ans: 0,
  };
  beginGame('Argument Filter (Critical Reasoning)', `
    <p><strong>Claim:</strong> ${q.claim}</p>
    <div class="row">${q.options.map((x,i)=>`<button id="k${i}">${x}</button>`).join('')}</div>
    <div id="out"></div>
  `);
  q.options.forEach((_, i) => {
    document.getElementById(`k${i}`).onclick = () => {
      document.getElementById('out').innerHTML = resultBlock({
        correct: i === q.ans,
        correctAnswer: q.options[q.ans],
        key: 'argument',
        startedAt,
        tips: ['Name the flaw type fast (causality, sampling, base rate).', 'Pick the option that directly attacks the logical structure.'],
      });
    };
  });
}

function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

boot();
