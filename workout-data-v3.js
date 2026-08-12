/*
  ATHLETIC 2X - CONFIGURAZIONE ALLENAMENTI
  ----------------------------------------
  Questo file contiene SOLO la scheda. Per modifiche future a esercizi,
  serie, ripetizioni o recuperi, nella maggior parte dei casi basta intervenire qui.

  IMPORTANTE: non cambiare gli "id" degli esercizi già esistenti se vuoi
  mantenere collegata la progressione dei carichi salvata nel tempo.
*/
window.ATHLETIC_CONFIG = {
  version: '3.0.0',
  workouts: {
    A: {
      title: 'Allenamento A',
      subtitle: 'Full body · base + controllo',
      accent: 'teal',
      mobility: [
        { id: 'ankle_wall', name: 'Mobilità caviglia contro parete', detail: '8-10 per lato · prepara la Leg press' },
        { id: 'deep_squat_assisted', name: 'Squat profondo assistito', detail: '5 × 5 sec · anche + caviglie' },
        { id: 'thoracic_rotation', name: 'Rotazioni toraciche in quadrupedia', detail: '6 per lato · mobilità toracica' },
        { id: 'band_external_rotation', name: 'Extrarotazioni spalla con elastico', detail: '12 per lato · cuffia dei rotatori · elastico leggero' },
        { id: 'band_pull_apart', name: 'Band pull-apart', detail: '12-15 · controllo scapole' },
        { id: 'wall_slide', name: 'Wall slide', detail: '8-10 · spalla + scapole' }
      ],
      exercises: [
        { id: 'leg_press', name: 'Leg press', sets: 3, reps: '8-12', rest: 120 },
        { id: 'lat_machine_a', name: 'Lat machine', sets: 3, reps: '8-12', rest: 120 },
        { id: 'chest_press', name: 'Chest press', sets: 3, reps: '8-12', rest: 120 },
        { id: 'leg_curl_a', name: 'Leg curl', sets: 3, reps: '10-12', rest: 90 },
        { id: 'row_machine_a', name: 'Rematore machine / pulley', sets: 2, reps: '10-12', rest: 90 },
        { id: 'lateral_raise', name: 'Alzate laterali', sets: 2, reps: '12-15', rest: 75 },
        { id: 'plank', name: 'Plank', sets: 2, reps: '30-45 sec', rest: 60, metric: 'seconds' }
      ]
    },
    B: {
      title: 'Allenamento B',
      subtitle: 'Full body · base + atletico',
      accent: 'blue',
      mobility: [
        { id: 'hip_90_90', name: '90/90 dinamico per le anche', detail: '6 per lato · rotazione dell’anca' },
        { id: 'ankle_wall', name: 'Mobilità caviglia contro parete', detail: '8-10 per lato · squat / pressa' },
        { id: 'adductor_rockback', name: 'Adductor rock-back', detail: '6-8 per lato · adduttori + anche' },
        { id: 'open_book', name: 'Open book', detail: '6 per lato · rotazione toracica' },
        { id: 'band_external_rotation', name: 'Extrarotazioni spalla con elastico', detail: '12 per lato · cuffia dei rotatori' },
        { id: 'band_pull_apart', name: 'Band pull-apart', detail: '12-15 · controllo scapolare' },
        { id: 'band_face_pull', name: 'Face pull leggero con elastico', detail: '10-12 · scapole + rotatori esterni' }
      ],
      exercises: [
        { id: 'hack_or_leg_press', name: 'Hack squat / Leg press', sets: 3, reps: '8-12', rest: 120 },
        { id: 'lat_machine_b', name: 'Lat machine', sets: 3, reps: '8-12', rest: 120 },
        { id: 'incline_chest_press', name: 'Chest press inclinata', sets: 3, reps: '8-12', rest: 120 },
        { id: 'leg_curl_b', name: 'Leg curl', sets: 3, reps: '10-15', rest: 90 },
        { id: 'shoulder_press', name: 'Shoulder press machine', sets: 2, reps: '8-12', rest: 90 },
        { id: 'row_machine_b', name: 'Rematore machine', sets: 2, reps: '10-12', rest: 90 },
        { id: 'side_plank', name: 'Plank laterale', sets: 2, reps: '20-30 sec/lato', rest: 60, metric: 'seconds' },
        { id: 'farmer_walk', name: 'Farmer walk', sets: 3, reps: '20-30 m', rest: 90, metric: 'kg' }
      ]
    }
  }
};
