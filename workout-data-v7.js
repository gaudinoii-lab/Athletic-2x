/*
  ATHLETIC 2X - CONFIGURAZIONE ALLENAMENTI
  ----------------------------------------
  Questo file contiene la scheda, i recuperi e i link alle guide.
  Per modifiche future a esercizi, serie, ripetizioni, recuperi o guide,
  nella maggior parte dei casi basta intervenire qui.

  IMPORTANTE: non cambiare gli "id" degli esercizi già esistenti se vuoi
  mantenere collegata la progressione dei carichi salvata nel tempo.
*/
window.ATHLETIC_CONFIG = {
  version: '7.0.0',

  progressionBirds: [
    { min: 0,  emoji: '🥚', name: 'Uovo' },
    { min: 1,  emoji: '🐣', name: 'Schiusa' },
    { min: 3,  emoji: '🐥', name: 'Pulcino' },
    { min: 6,  emoji: '🐔', name: 'Gallina' },
    { min: 12, emoji: '🪿', name: 'Oca' },
    { min: 20, emoji: '🦢', name: 'Cigno' },
    { min: 30, emoji: '🦚', name: 'Pavone' },
    { min: 45, emoji: '🦤', name: 'Dodo' }
  ],

  workouts: {
    A: {
      title: 'Allenamento A',
      subtitle: 'Forza generale · catena posteriore',
      accent: 'teal',
      mobilityDuration: '10-12 min',
      mobility: [
        { id: 'ankle_wall', name: 'Mobilità caviglia al muro', detail: '10 per lato · caviglie per pressa e squat' },
        { id: 'hip_90_90_a', name: '90/90 dinamico', detail: '6-8 per lato · rotazione interna/esterna dell’anca', guide: 'https://smartworkout.app/it/libreria-esercizi/gambe/stretching-90-90' },
        { id: 'adductor_rockback_a', name: 'Adductor rock-back', detail: '8 per lato · adduttori + apertura dell’anca', guide: 'https://smartworkout.app/it/libreria-esercizi/gambe/allungamento-della-rana-a-meta-con-dondolio' },
        { id: 'deep_squat_assisted', name: 'Squat profondo assistito', detail: '5 × 5 sec · anche + caviglie' },
        { id: 'glute_bridge_warmup', name: 'Glute bridge a corpo libero', detail: '10-12 · attivazione glutei prima dell’hip thrust', guide: 'https://smartworkout.app/it/libreria-esercizi/glutei/ponte-per-i-glutei' },
        { id: 'thoracic_rotation', name: 'Rotazioni toraciche', detail: '6 per lato · mobilità parte alta', guide: 'https://smartworkout.app/it/libreria-esercizi/petto/allungamento-rotazionale-della-schiena-in-ginocchio' },
        { id: 'band_external_rotation', name: 'Extrarotazioni spalla con elastico a cavo', detail: '12 per lato · cuffia dei rotatori · resistenza leggera', guide: 'https://smartworkout.app/it/libreria-esercizi/spalle/rotazione-esterna-della-spalla-da-seduti' },
        { id: 'band_horizontal_opening', name: 'Aperture orizzontali con elastico', detail: '12-15 · controllo scapolare' }
      ],
      exercises: [
        { id: 'leg_press', name: 'Leg press', sets: 3, reps: '8-12', rest: 120, guide: 'https://smartworkout.app/it/libreria-esercizi/gambe/pressa-per-le-gambe' },
        { id: 'bench_press_barbell', name: 'Panca piana bilanciere', sets: 3, reps: '8-10', rest: 120, guide: 'https://smartworkout.app/it/libreria-esercizi/petto/panca-con-bilanciere' },
        { id: 'lat_machine_a', name: 'Lat machine', sets: 3, reps: '8-12', rest: 120, guide: 'https://smartworkout.app/it/libreria-esercizi/schiena/macchina-per-lat-pulldown' },
        { id: 'hip_thrust_machine', name: 'Hip thrust machine', sets: 3, reps: '8-12', rest: 120, guide: 'https://smartworkout.app/it/libreria-esercizi/glutei/spinta-dell%27anca' },
        { id: 'row_machine_a', name: 'Rematore machine / pulley', sets: 2, reps: '10-12', rest: 90, guide: 'https://smartworkout.app/it/libreria-esercizi/schiena/rematore-al-cavo-da-seduto' },
        { id: 'lateral_raise', name: 'Alzate laterali', sets: 2, reps: '12-15', rest: 75, guide: 'https://smartworkout.app/it/libreria-esercizi/spalle/alzate-laterali-con-manubri' },
        { id: 'dumbbell_curl', name: 'Curl manubri', sets: 2, reps: '10-12', rest: 75, guide: 'https://smartworkout.app/it/libreria-esercizi/bicipiti/curl-con-manubri-per-bicipiti' },
        { id: 'plank', name: 'Plank', sets: 2, reps: '30-45 sec', rest: 60, metric: 'seconds', guide: 'https://smartworkout.app/it/libreria-esercizi/addominali/plank' }
      ]
    },

    B: {
      title: 'Allenamento B',
      subtitle: 'Unilaterale · stabilità · atletismo',
      accent: 'blue',
      mobilityDuration: '10-12 min',
      mobility: [
        { id: 'ankle_wall', name: 'Mobilità caviglia al muro', detail: '10 per lato · prepara hack squat e pressa' },
        { id: 'hip_90_90_b', name: '90/90 dinamico', detail: '8 per lato · rotazione dell’anca', guide: 'https://smartworkout.app/it/libreria-esercizi/gambe/stretching-90-90' },
        { id: 'adductor_rockback_b', name: 'Adductor rock-back', detail: '8 per lato · adduttori + anche', guide: 'https://smartworkout.app/it/libreria-esercizi/gambe/allungamento-della-rana-a-meta-con-dondolio' },
        { id: 'reverse_lunge_assisted', name: 'Affondo inverso assistito a corpo libero', detail: '5-6 per lato · preparazione al lavoro unilaterale', guide: 'https://smartworkout.app/it/libreria-esercizi/glutei/affondo-posteriore-con-manubri' },
        { id: 'standing_hip_abduction', name: 'Abduzioni dell’anca a corpo libero', detail: '10 per lato · gluteo medio + stabilità del bacino', guide: 'https://smartworkout.app/it/libreria-esercizi/glutei/abduzione-dell%27anca-in-piedi' },
        { id: 'deep_squat_assisted', name: 'Squat profondo assistito', detail: '5 × 5 sec · anche + caviglie' },
        { id: 'band_external_rotation', name: 'Extrarotazioni spalla con elastico a cavo', detail: '12 per lato · cuffia dei rotatori', guide: 'https://smartworkout.app/it/libreria-esercizi/spalle/rotazione-esterna-della-spalla-da-seduti' },
        { id: 'band_horizontal_opening', name: 'Aperture orizzontali con elastico', detail: '12-15 · controllo scapolare' },
        { id: 'band_face_pull', name: 'Face pull con elastico a cavo', detail: '10-12 · leggero · scapole + rotatori esterni', guide: 'https://smartworkout.app/it/libreria-esercizi/spalle/tirata-al-viso-con-elastico' }
      ],
      exercises: [
        { id: 'hack_or_leg_press', name: 'Hack squat / Leg press', sets: 3, reps: '8-12', rest: 120, guide: 'https://smartworkout.app/it/libreria-esercizi/gambe/squat-alla-pressa-orizzontale', note: 'Guida: Hack squat. Se usi la Leg press, eseguila come nel Giorno A.' },
        { id: 'single_leg_press', name: 'Leg press monopodalica', sets: 2, reps: '8-10/lato', rest: 90, guide: 'https://smartworkout.app/it/libreria-esercizi/gambe/pressa-a-gamba-singola' },
        { id: 'incline_dumbbell_press', name: 'Panca inclinata con manubri', sets: 2, reps: '8-12', rest: 120, note: 'Panca 20-30°', guide: 'https://smartworkout.app/it/libreria-esercizi/petto/panca-inclinata-con-manubri' },
        { id: 'lat_machine_b', name: 'Lat machine', sets: 3, reps: '8-12', rest: 120, guide: 'https://smartworkout.app/it/libreria-esercizi/schiena/macchina-per-lat-pulldown' },
        { id: 'landmine_press', name: 'Landmine press a un braccio', sets: 2, reps: '8-12/lato', rest: 90, guide: 'https://smartworkout.app/it/libreria-esercizi/spalle/pressa-con-bilanciere-a-terra' },
        { id: 'row_machine_b', name: 'Rematore machine / pulley', sets: 2, reps: '10-12', rest: 90, guide: 'https://smartworkout.app/it/libreria-esercizi/schiena/rematore-al-cavo-da-seduto' },
        { id: 'triceps_pushdown', name: 'Pushdown tricipiti al cavo', sets: 2, reps: '10-12', rest: 75, guide: 'https://smartworkout.app/it/libreria-esercizi/tricipiti/pushdown-con-barra' },
        { id: 'pallof_press', name: 'Pallof press al cavo', sets: 2, reps: '10/lato', rest: 60, guide: 'https://smartworkout.app/it/libreria-esercizi/addominali/pressa-pallof-orizzontale-ai-cavi' },
        { id: 'farmer_walk', name: 'Farmer walk', sets: 3, reps: '20-30 m', rest: 90, metric: 'kg', guide: 'https://smartworkout.app/en/exercise-library/forearms/farmer-walk' }
      ]
    }
  }
};
