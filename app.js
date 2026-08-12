const WORKOUTS = {
  A: {
    title: 'Allenamento A',
    subtitle: 'Full body · base + controllo',
    mobility: [
      ['Mobilità caviglia contro parete', '8-10 per lato · prepara la Leg press'],
      ['Squat profondo assistito', '5 × 5 sec · anche + caviglie'],
      ['Rotazioni toraciche in quadrupedia', '6 per lato · mobilità toracica'],
      ['Extrarotazioni spalla con elastico', '12 per lato · cuffia dei rotatori, elastico leggero'],
      ['Band pull-apart', '12-15 · controllo scapole'],
      ['Wall slide', '8-10 · spalla + scapole']
    ],
    exercises: [
      { name: 'Leg press', sets: 3, reps: '8-12', rest: 120 },
      { name: 'Lat machine', sets: 3, reps: '8-12', rest: 120 },
      { name: 'Chest press', sets: 3, reps: '8-12', rest: 120 },
      { name: 'Leg curl', sets: 3, reps: '10-12', rest: 90 },
      { name: 'Rematore machine / pulley', sets: 2, reps: '10-12', rest: 90 },
      { name: 'Alzate laterali', sets: 2, reps: '12-15', rest: 75 },
      { name: 'Plank', sets: 2, reps: '30-45 sec', rest: 60, timeBased: true }
    ]
  },
  B: {
    title: 'Allenamento B',
    subtitle: 'Full body · base + atletico',
    mobility: [
      ['90/90 dinamico per le anche', '6 per lato · rotazione dell’anca'],
      ['Mobilità caviglia contro parete', '8-10 per lato · squat / pressa'],
      ['Adductor rock-back', '6-8 per lato · adduttori + anche'],
      ['Open book', '6 per lato · rotazione toracica'],
      ['Extrarotazioni spalla con elastico', '12 per lato · cuffia dei rotatori'],
      ['Band pull-apart', '12-15 · controllo scapolare'],
      ['Face pull leggero con elastico', '10-12 · scapole + rotatori esterni']
    ],
    exercises: [
      { name: 'Hack squat / Leg press', sets: 3, reps: '8-12', rest: 120 },
      { name: 'Lat machine', sets: 3, reps: '8-12', rest: 120 },
      { name: 'Chest press inclinata', sets: 3, reps: '8-12', rest: 120 },
      { name: 'Leg curl', sets: 3, reps: '10-15', rest: 90 },
      { name: 'Shoulder press machine', sets: 2, reps: '8-12', rest: 90 },
      { name: 'Rematore machine', sets: 2, reps: '10-12', rest: 90 },
      { name: 'Plank laterale', sets: 2, reps: '20-30 sec/lato', rest: 60, timeBased: true },
      { name: 'Farmer walk', sets: 3, reps: '20-30 m', rest: 90 }
    ]
  }
};

const STORAGE_KEY = 'athletic2x_v1';
let state = loadState();
let currentView = 'home';
let currentWorkout = null;
let activeSession = null;
let timerInterval = null;
let timerRemaining = 0;

function defaultState() {
  return {
    history: [],
    loads: { A: {}, B: {} },
    settings: { defaultRest: 90, sound: true, vibration: true }
  };
}

function loadState() {
  try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return defaultState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

const app = document.getElementById('app');
const timerSheet = document.getElementById('timerSheet');
const timerValue = document.getElementById('timerValue');
const timerTitle = document.getElementById('timerTitle');

document.getElementById('homeBtn').addEventListener('click', () => navigate('home'));
document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.nav)));
document.getElementById('add30Btn').addEventListener('click', () => { timerRemaining += 30; updateTimerUI(); });
document.getElementById('skipTimerBtn').addEventListener('click', stopTimer);

function navigate(view) {
  currentView = view;
  currentWorkout = null;
  activeSession = null;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === view));
  if (view === 'home') renderHome();
  if (view === 'history') renderHistory();
  if (view === 'settings') renderSettings();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHome() {
  const last = state.history[0];
  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow" style="color:rgba(255,255,255,.62)">OBIETTIVO</p>
      <h2>Forza, mobilità, atletismo.</h2>
      <p>Due sedute semplici. Tecnica pulita, 2-3 ripetizioni in riserva e progressione senza fretta.</p>
    </section>
    <div class="workout-choice">
      <button class="workout-btn" onclick="startWorkout('A')"><strong>A</strong><span>Full body · base + controllo</span></button>
      <button class="workout-btn" onclick="startWorkout('B')"><strong>B</strong><span>Full body · base + atletico</span></button>
    </div>
    <section class="card" style="margin-top:14px">
      <h3>Ultima seduta</h3>
      ${last ? `<p><strong>${escapeHtml(last.workoutTitle)}</strong><br><span class="note">${formatDate(last.finishedAt)} · ${last.durationMin} min</span></p>` : '<p class="note">Ancora nessun allenamento registrato.</p>'}
    </section>
    <section class="card">
      <h3>Regola del giorno</h3>
      <p class="note">Se la tecnica si sporca o arrivi al cedimento, il peso è troppo alto. Obiettivo: finire quasi sempre con circa 2-3 ripetizioni possibili.</p>
    </section>`;
}

window.startWorkout = function(type) {
  currentWorkout = type;
  const w = WORKOUTS[type];
  activeSession = {
    id: Date.now(), workout: type, startedAt: Date.now(), mobility: w.mobility.map(() => false),
    exercises: w.exercises.map(ex => {
      const savedLoads = getSavedLoads(type, ex.name, ex.sets);
      return {
        name: ex.name,
        repsTarget: ex.reps,
        sets: Array.from({ length: ex.sets }, (_, si) => ({
          kg: savedLoads[si] || '',
          reps: '',
          done: false,
          rir: ''
        }))
      };
    })
  };
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  renderWorkout();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderWorkout() {
  const w = WORKOUTS[currentWorkout];
  const completed = activeSession.exercises.flatMap(e => e.sets).filter(s => s.done).length;
  const total = activeSession.exercises.flatMap(e => e.sets).length;
  const mobilityDone = activeSession.mobility.filter(Boolean).length;
  const progress = Math.round(((completed + mobilityDone) / (total + w.mobility.length)) * 100);

  app.innerHTML = `
    <div class="section-title"><div><p class="eyebrow">SEDUTA ATTIVA</p><h2>${w.title}</h2></div><span class="badge">${progress}%</span></div>
    <div class="progress"><span style="width:${progress}%"></span></div>

    <section class="card">
      <div class="section-title"><h2>Mobilità & attivazione</h2><span class="badge">8-10 min</span></div>
      ${w.mobility.map((m,i) => `
        <div class="check-row">
          <input id="mob-${i}" type="checkbox" ${activeSession.mobility[i] ? 'checked' : ''} onchange="toggleMobility(${i}, this.checked)">
          <label for="mob-${i}"><strong>${escapeHtml(m[0])}</strong><small>${escapeHtml(m[1])}</small></label>
        </div>`).join('')}
    </section>

    <section class="card">
      <div class="section-title"><h2>Allenamento</h2><span class="badge">${completed}/${total} serie</span></div>
      <p class="note">Prima del primo esercizio fai 1-2 serie leggere di avvicinamento. Non contarle come serie allenanti.</p>
      ${w.exercises.map((ex,ei) => exerciseHtml(ex, ei)).join('')}
      <button class="primary-btn full-btn" onclick="finishWorkout()">Completa allenamento</button>
    </section>`;
}

window.toggleMobility = function(i, checked) { activeSession.mobility[i] = checked; renderWorkout(); }

function exerciseHtml(ex, ei) {
  const last = findLastExercise(currentWorkout, ex.name);
  const current = activeSession.exercises[ei];
  const minMax = ex.reps.match(/(\d+)\s*-\s*(\d+)/);
  let suggestion = '';
  const doneSets = current.sets.filter(s => s.done && s.rir);
  if (doneSets.length === current.sets.length) {
    const allEasy = doneSets.every(s => Number(s.rir) >= 2);
    const allAtTop = minMax ? current.sets.every(s => Number(s.reps) >= Number(minMax[2])) : false;
    const tooHard = doneSets.some(s => Number(s.rir) === 0);
    if (allEasy && allAtTop) suggestion = '↑ Prossima volta puoi provare un piccolo aumento di carico.';
    else if (tooHard) suggestion = '→ Meglio mantenere o ridurre leggermente il carico.';
    else suggestion = '✓ Carico coerente: mantienilo finché non raggiungi il limite alto con buona tecnica.';
  }
  return `
    <article class="exercise-card">
      <div class="exercise-head"><div><h3>${escapeHtml(ex.name)}</h3><p>${ex.sets} × ${escapeHtml(ex.reps)} · recupero ${formatRest(ex.rest)}</p></div></div>
      ${last ? `<div class="last-time"><strong>Base dalla precedente ${currentWorkout}:</strong> ${escapeHtml(last)}<br><span>Il carico nei campi qui sotto è già stato riportato automaticamente.</span></div>` : ''}
      <div class="series-grid">
        ${current.sets.map((set,si) => `
          <div>
            <div class="series-row">
              <span class="set-num">${si+1}</span>
              <input inputmode="decimal" placeholder="${ex.timeBased ? 'sec' : 'kg'}" value="${escapeAttr(set.kg)}" oninput="updateSet(${ei},${si},'kg',this.value)" aria-label="${ex.timeBased ? 'secondi' : 'kg'} serie ${si+1}">
              <input inputmode="numeric" placeholder="${ex.timeBased ? 'nota' : 'reps'}" value="${escapeAttr(set.reps)}" oninput="updateSet(${ei},${si},'reps',this.value)" aria-label="ripetizioni serie ${si+1}">
              <button class="complete-set ${set.done ? 'done' : ''}" onclick="completeSet(${ei},${si},${ex.rest})" aria-label="Completa serie ${si+1}">${set.done ? '✓' : '○'}</button>
            </div>
            ${set.done ? `<div class="rir"><span class="note">RIR:</span>${['3','2','1','0'].map(r => `<button class="${set.rir===r?'selected':''}" onclick="setRir(${ei},${si},'${r}')">${r}</button>`).join('')}</div>` : ''}
          </div>`).join('')}
      </div>
      ${suggestion ? `<div class="suggestion">${suggestion}</div>` : ''}
    </article>`;
}

window.updateSet = function(ei, si, field, value) { activeSession.exercises[ei].sets[si][field] = value; }
window.setRir = function(ei, si, rir) { activeSession.exercises[ei].sets[si].rir = rir; renderWorkout(); }
window.completeSet = function(ei, si, rest) {
  const set = activeSession.exercises[ei].sets[si];
  set.done = !set.done;
  if (set.done) startTimer(rest, activeSession.exercises[ei].name);
  renderWorkout();
}

function startTimer(seconds, title) {
  clearInterval(timerInterval);
  timerRemaining = seconds || state.settings.defaultRest;
  timerTitle.textContent = title;
  updateTimerUI();
  timerSheet.classList.remove('hidden');
  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerUI();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      if (state.settings.vibration && navigator.vibrate) navigator.vibrate([180,100,180]);
      if (state.settings.sound) beep();
      setTimeout(stopTimer, 900);
    }
  }, 1000);
}
function stopTimer() { clearInterval(timerInterval); timerSheet.classList.add('hidden'); }
function updateTimerUI() {
  const m = Math.floor(Math.max(0,timerRemaining)/60).toString().padStart(2,'0');
  const s = (Math.max(0,timerRemaining)%60).toString().padStart(2,'0');
  timerValue.textContent = `${m}:${s}`;
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 740; gain.gain.value = .08;
    osc.start(); osc.stop(ctx.currentTime + .18);
  } catch {}
}

window.finishWorkout = function() {
  if (!activeSession) return;
  const w = WORKOUTS[currentWorkout];
  const totalSets = activeSession.exercises.flatMap(e => e.sets).length;
  const doneSets = activeSession.exercises.flatMap(e => e.sets).filter(s => s.done).length;
  if (doneSets === 0 && !confirm('Non hai ancora segnato serie completate. Salvare comunque?')) return;
  const finishedAt = Date.now();
  updateLoadMemory(currentWorkout, activeSession.exercises);
  state.history.unshift({ ...activeSession, workoutTitle: w.title, finishedAt, durationMin: Math.max(1, Math.round((finishedAt - activeSession.startedAt)/60000)), doneSets, totalSets });
  state.history = state.history.slice(0, 100);
  saveState();
  stopTimer();
  currentWorkout = null; activeSession = null;
  navigate('history');
}


function getSavedLoads(workoutType, exerciseName, setCount) {
  const memory = state.loads?.[workoutType]?.[exerciseName];
  if (Array.isArray(memory) && memory.some(v => v !== '')) {
    return Array.from({ length: setCount }, (_, i) => memory[i] ?? memory[memory.length - 1] ?? '');
  }

  // Migrazione automatica per chi ha già usato la V1: ricava i carichi
  // dall'ultima seduta dello stesso tipo senza perdere lo storico esistente.
  const previous = state.history.find(h => h.workout === workoutType && h.exercises?.some(e => e.name === exerciseName));
  if (!previous) return Array(setCount).fill('');
  const ex = previous.exercises.find(e => e.name === exerciseName);
  const oldLoads = ex?.sets?.map(s => s.kg || '') || [];
  return Array.from({ length: setCount }, (_, i) => oldLoads[i] ?? oldLoads[oldLoads.length - 1] ?? '');
}

function updateLoadMemory(workoutType, exercises) {
  state.loads ||= { A: {}, B: {} };
  state.loads[workoutType] ||= {};

  exercises.forEach(ex => {
    const previous = state.loads[workoutType][ex.name] || [];
    const next = ex.sets.map((set, i) => {
      const value = String(set.kg ?? '').trim();
      return value !== '' ? value : (previous[i] ?? '');
    });
    if (next.some(v => v !== '')) state.loads[workoutType][ex.name] = next;
  });
}

function findLastExercise(workoutType, exerciseName) {
  const h = state.history.find(h => h.workout === workoutType && h.exercises?.some(e => e.name === exerciseName));
  if (!h) return '';
  const ex = h.exercises.find(e => e.name === exerciseName);
  return ex.sets.map(s => {
    const left = s.kg ? `${s.kg}${exerciseName.toLowerCase().includes('plank') ? ' sec' : ' kg'}` : '—';
    return s.reps ? `${left} × ${s.reps}` : left;
  }).join(' · ');
}

function renderHistory() {
  app.innerHTML = `
    <div class="section-title"><h2>Storico</h2><span class="badge">${state.history.length} sedute</span></div>
    <section class="card">
      ${state.history.length ? state.history.map((h,i) => `
        <div class="history-item">
          <strong>${escapeHtml(h.workoutTitle)}</strong>
          <small>${formatDate(h.finishedAt)} · ${h.durationMin} min · ${h.doneSets}/${h.totalSets} serie</small>
          <button class="secondary-btn" style="margin-top:8px" onclick="toggleHistory(${i})">Dettagli</button>
          <div id="hist-${i}" class="hidden" style="margin-top:10px">${historyDetails(h)}</div>
        </div>`).join('') : '<div class="empty">Completa il primo allenamento per vedere qui i tuoi progressi.</div>'}
    </section>`;
}

window.toggleHistory = function(i) { document.getElementById(`hist-${i}`).classList.toggle('hidden'); }
function historyDetails(h) {
  return h.exercises.map(e => `<p class="note"><strong style="color:var(--text)">${escapeHtml(e.name)}</strong><br>${e.sets.map((s,idx)=>`S${idx+1}: ${escapeHtml(s.kg||'—')} ${s.kg?'kg':''} · ${escapeHtml(s.reps||'—')} reps${s.rir!==''?` · RIR ${s.rir}`:''}`).join('<br>')}</p>`).join('');
}

function renderSettings() {
  app.innerHTML = `
    <div class="section-title"><h2>Impostazioni</h2></div>
    <section class="card">
      <div class="setting-row"><div><strong>Recupero predefinito</strong><div class="note">Usato solo se un esercizio non ha un timer specifico.</div></div><input id="restSetting" type="number" min="30" max="300" step="15" value="${state.settings.defaultRest}"></div>
      <div class="setting-row"><div><strong>Suono fine timer</strong></div><input id="soundSetting" type="checkbox" ${state.settings.sound?'checked':''}></div>
      <div class="setting-row"><div><strong>Vibrazione fine timer</strong></div><input id="vibrationSetting" type="checkbox" ${state.settings.vibration?'checked':''}></div>
      <button class="primary-btn full-btn" onclick="saveSettings()">Salva impostazioni</button>
    </section>
    <section class="card">
      <h3>Dati</h3>
      <p class="note">Tutto viene salvato solo su questo dispositivo tramite localStorage. Nessun account e nessun server.</p>
      <button class="danger-btn full-btn" onclick="clearHistory()">Cancella storico</button>
    </section>`;
}

window.saveSettings = function() {
  state.settings.defaultRest = Number(document.getElementById('restSetting').value) || 90;
  state.settings.sound = document.getElementById('soundSetting').checked;
  state.settings.vibration = document.getElementById('vibrationSetting').checked;
  saveState(); alert('Impostazioni salvate.');
}
window.clearHistory = function() {
  if (!confirm('Vuoi davvero cancellare tutto lo storico?')) return;
  state.history = [];
  state.loads = { A: {}, B: {} };
  saveState(); renderSettings();
}

function formatRest(sec) { return sec >= 60 ? `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} min` : `${sec} sec`; }
function formatDate(ts) { return new Intl.DateTimeFormat('it-IT', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(ts)); }
function escapeHtml(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function escapeAttr(v='') { return escapeHtml(v); }

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
renderHome();
