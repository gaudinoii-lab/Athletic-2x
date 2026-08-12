(() => {
  'use strict';

  const CONFIG = window.ATHLETIC_CONFIG;
  const WORKOUTS = CONFIG.workouts;
  const STORAGE_KEY = 'athletic2x_v1'; // invariato: conserva i dati delle versioni precedenti
  const MAX_HISTORY = 200;

  let state = loadState();
  let currentView = 'home';
  let currentWorkout = null;
  let activeSession = state.draftSession || null;
  let timerInterval = null;
  let timerEndsAt = 0;
  let timerTotal = 0;

  const app = document.getElementById('app');
  const timerSheet = document.getElementById('timerSheet');
  const timerValue = document.getElementById('timerValue');
  const timerTitle = document.getElementById('timerTitle');
  const timerProgress = document.getElementById('timerProgress');
  const toast = document.getElementById('toast');
  const importFile = document.getElementById('importFile');
  document.getElementById('versionBadge').textContent = `v${CONFIG.version}`;

  function defaultState() {
    return {
      history: [],
      loads: { A: {}, B: {} },
      settings: { defaultRest: 90, sound: true, vibration: true },
      draftSession: null,
      dataVersion: 3
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const base = defaultState();
      return {
        ...base,
        ...saved,
        settings: { ...base.settings, ...(saved.settings || {}) },
        loads: { A: {}, B: {}, ...(saved.loads || {}) },
        history: Array.isArray(saved.history) ? saved.history : []
      };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    state.draftSession = activeSession;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add('hidden'), 2600);
  }

  document.getElementById('brandBtn').addEventListener('click', () => navigate('home'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.nav)));
  document.getElementById('add30Btn').addEventListener('click', addThirtySeconds);
  document.getElementById('skipTimerBtn').addEventListener('click', stopTimer);
  importFile.addEventListener('change', importBackupFile);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && timerEndsAt) tickTimer(); });

  function navigate(view) {
    currentView = view;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === view));
    if (view === 'home') renderHome();
    if (view === 'history') renderHistory();
    if (view === 'settings') renderSettings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderHome() {
    const last = state.history[0];
    const nextSuggested = last?.workout === 'A' ? 'B' : last?.workout === 'B' ? 'A' : null;
    const draftWorkout = activeSession?.workout && WORKOUTS[activeSession.workout] ? WORKOUTS[activeSession.workout] : null;
    const bird = getBirdProgress(state.history.length);

    app.innerHTML = `
      <section class="hero">
        <p class="eyebrow">OBIETTIVO</p>
        <h1 class="animal-goal" aria-label="Forza, mobilità e atletismo">🐘 🐒 🦌</h1>
        <p>Due sedute. Movimento, respiro, continuità. Senza fretta.</p>
      </section>

      <section class="home-section">
        ${birdProgressHtml(bird, state.history.length)}
      </section>

      ${draftWorkout ? `
        <section class="home-section">
          <div class="card resume-card">
            <div class="mini-stat">
              <div><strong>Allenamento in corso</strong><small>${escapeHtml(draftWorkout.title)} · iniziato ${formatTime(activeSession.startedAt)}</small></div>
              <span class="pill">salvato</span>
            </div>
            <div class="resume-actions">
              <button class="primary-btn" onclick="resumeWorkout()">Riprendi</button>
              <button class="ghost-btn" onclick="discardDraft()">Annulla</button>
            </div>
          </div>
        </section>` : ''}

      <section class="home-section">
        <div class="home-section-title"><h2>Scegli la seduta</h2><span>${nextSuggested ? `Prossima suggerita: ${nextSuggested}` : '2× settimana'}</span></div>
        <div class="workout-choice">
          ${['A','B'].map(type => workoutButtonHtml(type, nextSuggested === type)).join('')}
        </div>
      </section>

      <section class="home-section">
        <div class="card">
          <div class="mini-stat">
            <div>
              <strong>${last ? escapeHtml(last.workoutTitle || WORKOUTS[last.workout]?.title || 'Ultima seduta') : 'Nessuna seduta registrata'}</strong>
              <small>${last ? `${formatDate(last.finishedAt)} · ${last.durationMin} min` : 'Il tuo storico inizierà dal primo allenamento completato.'}</small>
            </div>
            ${last ? `<span class="pill">${last.doneSets}/${last.totalSets}</span>` : ''}
          </div>
        </div>
      </section>`;
  }

  const BIRD_STAGES = CONFIG.progressionBirds || [{ min: 0, emoji: '🥚', name: 'Uovo' }];

  function getBirdProgress(count) {
    let index = 0;
    for (let i = 0; i < BIRD_STAGES.length; i++) {
      if (count >= BIRD_STAGES[i].min) index = i;
      else break;
    }
    const current = BIRD_STAGES[index];
    const next = BIRD_STAGES[index + 1] || null;
    const floor = current.min;
    const ceiling = next?.min ?? floor;
    const pct = next ? Math.max(0, Math.min(100, ((count - floor) / (ceiling - floor)) * 100)) : 100;
    return { ...current, next, pct, remaining: next ? next.min - count : 0 };
  }

  function birdProgressHtml(bird, count) {
    return `<div class="bird-card card">
      <div class="bird-main">
        <div class="bird-emoji" aria-hidden="true">${bird.emoji}</div>
        <div class="bird-copy">
          <span class="bird-count">${count} ${count === 1 ? 'seduta' : 'sedute'}</span>
          <small>${bird.next ? `Tra ${bird.remaining} ${bird.remaining === 1 ? 'seduta' : 'sedute'} → ${bird.next.emoji}` : 'Percorso in corso'}</small>
        </div>
      </div>
      <div class="bird-track" aria-label="Progressione verso il prossimo uccello"><span style="width:${bird.pct}%"></span></div>
    </div>`;
  }

  function workoutButtonHtml(type, suggested) {
    const w = WORKOUTS[type];
    return `<button class="workout-btn" data-accent="${w.accent || 'teal'}" onclick="startWorkout('${type}')">
      <span class="letter">${type}</span>
      <div><strong>${escapeHtml(w.title)}</strong><small>${escapeHtml(w.subtitle)}</small></div>
      <span class="arrow">${suggested ? '★' : '→'}</span>
    </button>`;
  }

  window.startWorkout = function(type) {
    if (activeSession && activeSession.workout !== type) {
      if (!confirm(`Hai già ${WORKOUTS[activeSession.workout]?.title || 'un allenamento'} in corso. Vuoi sostituirlo?`)) return;
    } else if (activeSession && activeSession.workout === type) {
      currentWorkout = type;
      renderWorkout();
      return;
    }

    const w = WORKOUTS[type];
    currentWorkout = type;
    activeSession = {
      id: Date.now(),
      workout: type,
      startedAt: Date.now(),
      mobility: w.mobility.map(item => ({ id: item.id, done: false })),
      exercises: w.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        repsTarget: ex.reps,
        sets: Array.from({ length: ex.sets }, (_, si) => ({
          kg: getSavedLoads(type, ex, ex.sets)[si] || '',
          reps: '', done: false, rir: ''
        }))
      }))
    };
    saveState();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    renderWorkout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.resumeWorkout = function() {
    if (!activeSession?.workout || !WORKOUTS[activeSession.workout]) return;
    currentWorkout = activeSession.workout;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    renderWorkout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.discardDraft = function() {
    if (!activeSession || !confirm('Annullare l’allenamento in corso? I dati non completati verranno eliminati.')) return;
    activeSession = null;
    currentWorkout = null;
    saveState();
    renderHome();
  };

  function renderWorkout() {
    currentWorkout = currentWorkout || activeSession?.workout;
    if (!activeSession || !WORKOUTS[currentWorkout]) { navigate('home'); return; }
    const w = WORKOUTS[currentWorkout];
    syncDraftWithConfig(w);

    const allSets = activeSession.exercises.flatMap(e => e.sets);
    const completed = allSets.filter(s => s.done).length;
    const total = allSets.length;
    const mobilityDone = activeSession.mobility.filter(m => m.done).length;
    const progress = Math.round(((completed + mobilityDone) / Math.max(1, total + w.mobility.length)) * 100);

    app.innerHTML = `
      <div class="progress-shell">
        <div class="section-title">
          <div><p class="eyebrow">SEDUTA ATTIVA</p><h2>${escapeHtml(w.title)}</h2></div>
          <span class="badge ${w.accent || ''}">${progress}%</span>
        </div>
        <div class="progress"><span style="width:${progress}%"></span></div>
      </div>

      <section class="card">
        <div class="section-title"><h2>Mobilità & attivazione</h2><span class="badge">8-10 min</span></div>
        ${w.mobility.map((m,i) => {
          const checked = !!activeSession.mobility.find(x => x.id === m.id)?.done;
          return `<div class="check-row">
            <input id="mob-${i}" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleMobility('${escapeAttr(m.id)}', this.checked)">
            <label for="mob-${i}"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.detail)}</small></label>
          </div>`;
        }).join('')}
      </section>

      <section class="card">
        <div class="section-title"><h2>Allenamento</h2><span class="badge">${completed}/${total} serie</span></div>
        <p class="note">Sul primo esercizio fai 1-2 serie leggere di avvicinamento. Non contarle come serie allenanti.</p>
        ${w.exercises.map((ex,ei) => exerciseHtml(ex, ei)).join('')}
        <button class="primary-btn full-btn" onclick="finishWorkout()">Completa e salva allenamento</button>
      </section>`;
    saveState();
  }

  function syncDraftWithConfig(workout) {
    // Permette modifiche future alla scheda senza rompere una bozza esistente.
    const oldExercises = activeSession.exercises || [];
    activeSession.exercises = workout.exercises.map(ex => {
      const old = oldExercises.find(o => o.id === ex.id || (!o.id && o.name === ex.name));
      if (old) {
        old.id = ex.id; old.name = ex.name; old.repsTarget = ex.reps;
        while (old.sets.length < ex.sets) old.sets.push({ kg: '', reps: '', done: false, rir: '' });
        old.sets = old.sets.slice(0, ex.sets);
        return old;
      }
      const loads = getSavedLoads(activeSession.workout, ex, ex.sets);
      return { id: ex.id, name: ex.name, repsTarget: ex.reps, sets: Array.from({ length: ex.sets }, (_, i) => ({ kg: loads[i] || '', reps: '', done: false, rir: '' })) };
    });
    const oldMobility = activeSession.mobility || [];
    activeSession.mobility = workout.mobility.map(m => ({ id: m.id, done: !!oldMobility.find(o => o.id === m.id)?.done }));
  }

  window.toggleMobility = function(id, checked) {
    const item = activeSession.mobility.find(m => m.id === id);
    if (item) item.done = checked;
    saveState();
    renderWorkout();
  };

  function exerciseHtml(ex, ei) {
    const current = activeSession.exercises[ei];
    const doneCount = current.sets.filter(s => s.done).length;
    const last = findLastExercise(currentWorkout, ex);
    const suggestion = progressionSuggestion(ex, current);
    const metricPlaceholder = ex.metric === 'seconds' ? 'sec' : 'kg';
    const secondPlaceholder = ex.metric === 'seconds' ? 'nota' : 'reps';

    return `<article class="exercise-card ${doneCount === ex.sets ? 'completed' : ''}">
      <div class="exercise-head">
        <div><h3>${escapeHtml(ex.name)}</h3><p>${ex.sets} × ${escapeHtml(ex.reps)} · recupero ${formatRest(ex.rest)}</p></div>
        <span class="exercise-status">${doneCount}/${ex.sets}</span>
      </div>
      ${last ? `<div class="last-time"><strong>Ultima ${currentWorkout}:</strong> ${escapeHtml(last)}<br>Il carico è già riportato nei campi.</div>` : ''}
      <div class="series-head"><span></span><span>${metricPlaceholder.toUpperCase()}</span><span>${secondPlaceholder.toUpperCase()}</span><span>OK</span></div>
      <div class="series-grid">
        ${current.sets.map((set,si) => `<div>
          <div class="series-row">
            <span class="set-num">${si+1}</span>
            <input inputmode="decimal" autocomplete="off" placeholder="${metricPlaceholder}" value="${escapeAttr(set.kg)}" oninput="updateSet(${ei},${si},'kg',this.value)" aria-label="${metricPlaceholder} serie ${si+1}">
            <input inputmode="numeric" autocomplete="off" placeholder="${secondPlaceholder}" value="${escapeAttr(set.reps)}" oninput="updateSet(${ei},${si},'reps',this.value)" aria-label="${secondPlaceholder} serie ${si+1}">
            <button class="complete-set ${set.done ? 'done' : ''}" onclick="completeSet(${ei},${si},${ex.rest})" aria-label="Completa serie ${si+1}">${set.done ? '✓' : '○'}</button>
          </div>
          ${set.done ? `<div class="rir"><span class="rir-label">RIR</span>${['3','2','1','0'].map(r => `<button class="${set.rir===r?'selected':''}" onclick="setRir(${ei},${si},'${r}')">${r}</button>`).join('')}</div>` : ''}
        </div>`).join('')}
      </div>
      ${suggestion ? `<div class="suggestion">${escapeHtml(suggestion)}</div>` : ''}
    </article>`;
  }

  function progressionSuggestion(ex, current) {
    const doneSets = current.sets.filter(s => s.done && s.rir !== '');
    if (doneSets.length !== current.sets.length) return '';
    const match = String(ex.reps).match(/(\d+)\s*-\s*(\d+)/);
    const allEasyEnough = doneSets.every(s => Number(s.rir) >= 2);
    const allAtTop = match ? current.sets.every(s => Number(s.reps) >= Number(match[2])) : false;
    const anyFailure = doneSets.some(s => Number(s.rir) === 0);
    if (allEasyEnough && allAtTop) return 'Prossima volta puoi provare un piccolo aumento di carico.';
    if (anyFailure) return 'Meglio mantenere o ridurre leggermente il carico.';
    return 'Carico coerente: mantienilo finché non raggiungi il limite alto con buona tecnica.';
  }

  window.updateSet = function(ei, si, field, value) {
    if (!activeSession?.exercises?.[ei]?.sets?.[si]) return;
    activeSession.exercises[ei].sets[si][field] = value;
    saveState();
  };

  window.setRir = function(ei, si, rir) {
    activeSession.exercises[ei].sets[si].rir = rir;
    saveState();
    renderWorkout();
  };

  window.completeSet = function(ei, si, rest) {
    const set = activeSession.exercises[ei].sets[si];
    set.done = !set.done;
    saveState();
    if (set.done) startTimer(rest, activeSession.exercises[ei].name);
    renderWorkout();
  };

  function startTimer(seconds, title) {
    clearInterval(timerInterval);
    timerTotal = Number(seconds || state.settings.defaultRest || 90);
    timerEndsAt = Date.now() + timerTotal * 1000;
    timerTitle.textContent = title;
    timerSheet.classList.remove('hidden');
    tickTimer();
    timerInterval = setInterval(tickTimer, 250);
  }

  function addThirtySeconds() {
    if (!timerEndsAt) return;
    timerEndsAt += 30000;
    timerTotal += 30;
    tickTimer();
  }

  function tickTimer() {
    if (!timerEndsAt) return;
    const remaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
    const m = Math.floor(remaining / 60).toString().padStart(2,'0');
    const s = (remaining % 60).toString().padStart(2,'0');
    timerValue.textContent = `${m}:${s}`;
    timerProgress.style.width = `${Math.max(0, Math.min(100, (remaining / Math.max(1,timerTotal)) * 100))}%`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerEndsAt = 0;
      if (state.settings.vibration && navigator.vibrate) navigator.vibrate([180,100,180]);
      if (state.settings.sound) beep();
      showToast('Recupero completato');
      setTimeout(() => timerSheet.classList.add('hidden'), 650);
    }
  }

  function stopTimer() {
    clearInterval(timerInterval); timerInterval = null; timerEndsAt = 0; timerTotal = 0;
    timerSheet.classList.add('hidden');
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 740; gain.gain.value = .07;
      osc.start(); osc.stop(ctx.currentTime + .18);
    } catch {}
  }

  window.finishWorkout = function() {
    if (!activeSession) return;
    const w = WORKOUTS[currentWorkout];
    const sets = activeSession.exercises.flatMap(e => e.sets);
    const doneSets = sets.filter(s => s.done).length;
    if (doneSets === 0 && !confirm('Non hai segnato serie completate. Salvare comunque?')) return;
    const finishedAt = Date.now();
    updateLoadMemory(currentWorkout, activeSession.exercises);
    const savedSession = {
      ...activeSession,
      workoutTitle: w.title,
      finishedAt,
      durationMin: Math.max(1, Math.round((finishedAt - activeSession.startedAt)/60000)),
      doneSets,
      totalSets: sets.length,
      appVersion: CONFIG.version
    };
    state.history.unshift(savedSession);
    state.history = state.history.slice(0, MAX_HISTORY);
    activeSession = null;
    state.draftSession = null;
    saveState();
    stopTimer();
    currentWorkout = null;
    showToast('Allenamento salvato');
    navigate('history');
  };

  function getSavedLoads(workoutType, ex, setCount) {
    const bucket = state.loads?.[workoutType] || {};
    const memory = bucket[ex.id] || bucket[ex.name]; // fallback V2
    if (Array.isArray(memory) && memory.some(v => String(v ?? '').trim() !== '')) {
      return Array.from({ length: setCount }, (_, i) => memory[i] ?? memory[memory.length - 1] ?? '');
    }

    const previous = state.history.find(h => h.workout === workoutType && h.exercises?.some(e => e.id === ex.id || e.name === ex.name));
    if (!previous) return Array(setCount).fill('');
    const oldEx = previous.exercises.find(e => e.id === ex.id || e.name === ex.name);
    const oldLoads = oldEx?.sets?.map(s => s.kg || '') || [];
    return Array.from({ length: setCount }, (_, i) => oldLoads[i] ?? oldLoads[oldLoads.length - 1] ?? '');
  }

  function updateLoadMemory(workoutType, exercises) {
    state.loads ||= { A: {}, B: {} };
    state.loads[workoutType] ||= {};
    exercises.forEach(ex => {
      const key = ex.id || ex.name;
      const previous = state.loads[workoutType][key] || state.loads[workoutType][ex.name] || [];
      const next = ex.sets.map((set, i) => {
        const value = String(set.kg ?? '').trim();
        return value !== '' ? value : (previous[i] ?? '');
      });
      if (next.some(v => v !== '')) state.loads[workoutType][key] = next;
    });
  }

  function findLastExercise(workoutType, ex) {
    const h = state.history.find(h => h.workout === workoutType && h.exercises?.some(e => e.id === ex.id || e.name === ex.name));
    if (!h) return '';
    const old = h.exercises.find(e => e.id === ex.id || e.name === ex.name);
    return old.sets.map(s => {
      const unit = ex.metric === 'seconds' ? ' sec' : ' kg';
      const left = s.kg ? `${s.kg}${unit}` : '—';
      return s.reps ? `${left} × ${s.reps}` : left;
    }).join(' · ');
  }

  function renderHistory() {
    const bird = getBirdProgress(state.history.length);
    app.innerHTML = `
      <div class="section-title"><div><p class="eyebrow">PROGRESSIONE</p><h2>Storico</h2></div><span class="badge bird-badge">${bird.emoji} ${state.history.length} sedute</span></div>
      ${birdProgressHtml(bird, state.history.length)}
      <section class="card">
        ${state.history.length ? state.history.map((h,i) => `<div class="history-item">
          <div class="history-main">
            <div><strong>${escapeHtml(h.workoutTitle || WORKOUTS[h.workout]?.title || `Allenamento ${h.workout}`)}</strong><small>${formatDate(h.finishedAt)} · ${h.durationMin} min · ${h.doneSets}/${h.totalSets} serie</small></div>
            <button class="secondary-btn details-toggle" onclick="toggleHistory(${i})">Dettagli</button>
          </div>
          <div id="hist-${i}" class="history-details hidden">${historyDetails(h)}</div>
        </div>`).join('') : '<div class="empty">Completa il primo allenamento per iniziare a vedere qui la tua progressione.</div>'}
      </section>`;
  }

  window.toggleHistory = function(i) {
    document.getElementById(`hist-${i}`)?.classList.toggle('hidden');
  };

  function historyDetails(h) {
    return (h.exercises || []).map(e => `<p class="note"><strong style="color:var(--text)">${escapeHtml(e.name)}</strong><br>${(e.sets || []).map((s,idx) => `S${idx+1}: ${escapeHtml(s.kg||'—')}${s.kg ? ' kg' : ''} · ${escapeHtml(s.reps||'—')} reps${s.rir!=='' ? ` · RIR ${s.rir}` : ''}`).join('<br>')}</p>`).join('');
  }

  function renderSettings() {
    app.innerHTML = `
      <div class="section-title"><div><p class="eyebrow">APP</p><h2>Impostazioni</h2></div><span class="badge">v${CONFIG.version}</span></div>
      <section class="card">
        <div class="setting-row"><div><strong>Recupero predefinito</strong><div class="note">Usato solo se un esercizio non ha un recupero specifico.</div></div><input id="restSetting" type="number" min="30" max="300" step="15" value="${state.settings.defaultRest}"></div>
        <div class="setting-row"><div><strong>Suono fine timer</strong></div><input id="soundSetting" type="checkbox" ${state.settings.sound?'checked':''}></div>
        <div class="setting-row"><div><strong>Vibrazione fine timer</strong></div><input id="vibrationSetting" type="checkbox" ${state.settings.vibration?'checked':''}></div>
        <button class="primary-btn full-btn" style="margin-top:12px" onclick="saveSettings()">Salva impostazioni</button>
      </section>
      <section class="card">
        <h3>Backup dati</h3>
        <p class="note">Carichi e storico restano sul dispositivo. Prima di modifiche importanti puoi esportare un backup e reimportarlo in seguito.</p>
        <div class="button-grid">
          <button class="secondary-btn" onclick="exportBackup()">Esporta backup</button>
          <button class="secondary-btn" onclick="chooseImport()">Importa backup</button>
        </div>
      </section>
      <section class="card">
        <h3>Aggiornamenti futuri</h3>
        <p class="note">La scheda è separata dal motore dell’app nel file <strong>workout-data-v4.js</strong>. Gli ID stabili degli esercizi mantengono collegati i carichi anche se in futuro cambiamo nomi, serie o ordine.</p>
      </section>
      <section class="card">
        <h3>Reset</h3>
        <p class="note">Cancella storico, carichi e allenamento in corso da questo dispositivo.</p>
        <button class="danger-btn full-btn" onclick="clearAllData()">Cancella tutti i dati</button>
      </section>`;
  }

  window.saveSettings = function() {
    state.settings.defaultRest = Number(document.getElementById('restSetting').value) || 90;
    state.settings.sound = document.getElementById('soundSetting').checked;
    state.settings.vibration = document.getElementById('vibrationSetting').checked;
    saveState(); showToast('Impostazioni salvate');
  };

  window.exportBackup = function() {
    const payload = { exportedAt: new Date().toISOString(), app: 'Athletic 2x', appVersion: CONFIG.version, storageKey: STORAGE_KEY, state: { ...state, draftSession: activeSession } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `athletic-2x-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  window.chooseImport = function() { importFile.value = ''; importFile.click(); };

  async function importBackupFile(event) {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const imported = data.state || data;
      if (!Array.isArray(imported.history) || !imported.loads) throw new Error('Formato non valido');
      if (!confirm('Importare questo backup? I dati attuali verranno sostituiti.')) return;
      const base = defaultState();
      state = { ...base, ...imported, settings: { ...base.settings, ...(imported.settings || {}) }, loads: { A:{}, B:{}, ...(imported.loads || {}) } };
      activeSession = state.draftSession || null;
      saveState();
      showToast('Backup importato');
      renderSettings();
    } catch {
      alert('Non riesco a leggere questo backup. Controlla che sia un file esportato da Athletic 2x.');
    }
  }

  window.clearAllData = function() {
    if (!confirm('Vuoi davvero cancellare storico, carichi e allenamento in corso?')) return;
    state = defaultState(); activeSession = null; currentWorkout = null;
    saveState(); showToast('Dati cancellati'); renderSettings();
  };

  function formatRest(sec) { return sec >= 60 ? `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} min` : `${sec} sec`; }
  function formatDate(ts) { return new Intl.DateTimeFormat('it-IT', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(ts)); }
  function formatTime(ts) { return new Intl.DateTimeFormat('it-IT', { hour:'2-digit', minute:'2-digit' }).format(new Date(ts)); }
  function escapeHtml(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function escapeAttr(v='') { return escapeHtml(v); }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      // Percorso relativo: funziona sia su dominio root sia su GitHub Pages /nome-repo/.
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      registration.update().catch(() => {});
    } catch (err) {
      console.warn('Service worker non disponibile:', err);
    }
  }

  registerServiceWorker();
  renderHome();
})();
