# Athletic 2x — V6

PWA mobile per Allenamento A/B, timer di recupero, mobilità, storico e progressione dei carichi.

## Novità V6

- Schede A e B modificabili direttamente dall'app, senza toccare il codice.
- Puoi cambiare nome esercizio, serie, ripetizioni, recupero, nota e link guida.
- Puoi aggiungere, eliminare e riordinare gli esercizi.
- Anche mobilità e attivazione sono modificabili.
- Gli esercizi mantengono un ID stabile: rinominare un esercizio non azzera la memoria dei carichi.
- I nuovi esercizi ricevono automaticamente un ID.
- Possibilità di cancellare una singola seduta dallo Storico.
- Dopo la cancellazione di una seduta, i carichi-base vengono ricalcolati sulla seduta precedente rimasta nello storico.
- Backup JSON include anche le schede personalizzate.
- Compatibile con i dati locali delle versioni precedenti (`athletic2x_v1`).

## Aggiornamento su GitHub Pages

Carica/sostituisci nella root del repository:

- `index.html`
- `app-v6.js`
- `style-v6.css`
- `workout-data-v6.js`
- `manifest-v6.webmanifest`
- `sw.js`

La cartella `icons/` non cambia rispetto alla V5.

Dopo il commit, apri una volta dal telefono:

`https://TUOUSERNAME.github.io/athletic-2x/?v=6`

## Modificare una scheda

Nell'app vai su **Impostazioni → Le tue schede → Modifica Allenamento A/B**.

Le modifiche vengono salvate solo quando premi **Salva scheda**. Lo storico già registrato resta invariato.
