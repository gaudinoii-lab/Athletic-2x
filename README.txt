ATHLETIC 2x - PWA

Funzioni incluse:
- Allenamento A e B
- Mobilità specifica per le due sedute
- Checklist di riscaldamento
- Serie con kg, reps e RIR
- Timer automatico di recupero
- +30 secondi / salta timer
- Vibrazione e suono opzionali
- Storico sedute
- Ultimi carichi mostrati per esercizio
- Suggerimento semplice di progressione
- Salvataggio solo sul dispositivo (localStorage)
- Funzionamento offline tramite service worker

COME PROVARLA SU PC
1. Apri un terminale dentro questa cartella.
2. Avvia un piccolo server locale, ad esempio:
   python -m http.server 8000
3. Apri nel browser: http://localhost:8000

NOTA
Per installarla davvero sulla schermata Home del telefono, la PWA deve essere servita da un indirizzo HTTPS (oppure localhost durante lo sviluppo). Caricarla su GitHub Pages, Netlify, Vercel o un hosting statico va bene.

DATI
I dati restano nel browser del dispositivo. Se cancelli i dati del sito/browser, lo storico viene perso.


PROGRESSIONE DEI CARICHI
------------------------
- Allenamento A e Allenamento B mantengono memorie dei carichi separate.
- Quando inizi una nuova seduta A, ogni esercizio parte automaticamente con i carichi usati nell'ultima A.
- Se durante quella seduta aumenti o riduci il peso e completi/salvi l'allenamento, i nuovi valori diventano la base della successiva A.
- La stessa logica vale indipendentemente per B.
- I carichi vengono ricordati per singola serie, quindi e' possibile usare pesi diversi tra serie.
- Se avevi gia' dati nella V1, l'app prova a ricavare automaticamente i carichi dall'ultima seduta dello stesso tipo.
