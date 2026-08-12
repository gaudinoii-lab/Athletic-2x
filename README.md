# Athletic 2x — GitHub Pages / Mobile

Versione 3 ottimizzata per GitHub Pages e smartphone.

## Pubblicazione su GitHub Pages

1. Apri il repository GitHub (es. `athletic-2x`).
2. Carica **direttamente nella root del repository** tutti i file e la cartella `icons` contenuti in questo pacchetto. Non caricare la cartella esterna e non caricare solo lo ZIP.
3. Fai commit su `main`.
4. Vai in **Settings → Pages**.
5. Source: **Deploy from a branch**.
6. Branch: **main** — cartella **/(root)**.
7. Salva.
8. Apri `https://TUO-USERNAME.github.io/athletic-2x/`.

Se avevi già pubblicato la V2, sostituisci i vecchi file con questi mantenendo lo stesso repository/URL.


## Se il telefono continua a mostrare la V2

La V2 poteva restare bloccata nella cache del service worker. Dopo aver pubblicato la V3, apri **una volta** sul telefono l'indirizzo aggiungendo `?v=3` alla fine, ad esempio:

`https://TUO-USERNAME.github.io/athletic-2x/?v=3`

I file principali della V3 hanno nomi nuovi (`app-v3.js`, `style-v3.css`, ecc.), quindi la vecchia cache non può sostituirli. La V3 installa poi il nuovo service worker e rimuove automaticamente le vecchie cache Athletic 2x.

Se avevi aggiunto la vecchia PWA alla Home, dopo aver verificato la V3 puoi rimuovere la vecchia icona e aggiungerla di nuovo dalla pagina aggiornata.

## Installazione sul cellulare

### iPhone / Safari
Apri il link → pulsante Condividi → **Aggiungi alla schermata Home**.

### Android / Chrome
Apri il link → menu ⋮ → **Installa app** / **Aggiungi a schermata Home**.

## Perché questa versione è più robusta su GitHub Pages

- tutti i riferimenti a CSS, JS, manifest, icone e service worker sono relativi (`./...`);
- `start_url` e `scope` del manifest sono relativi e quindi funzionano anche sotto `/nome-repository/`;
- service worker registrato con scope relativo;
- cache `network-first` per ricevere più facilmente gli aggiornamenti pubblicati;
- icone PNG 192/512 + Apple Touch Icon per una migliore compatibilità mobile;
- `.nojekyll` incluso;
- campi input a 16px per evitare lo zoom automatico di Safari iOS;
- timer basato sull'orario reale, quindi recupera correttamente anche se il browser sospende temporaneamente la pagina.

## Dati e aggiornamenti

I dati sono salvati in `localStorage` con la stessa chiave usata nelle versioni precedenti. Se mantieni lo stesso dominio GitHub Pages, storico e carichi rimangono disponibili quando aggiorni i file.

In Impostazioni puoi **esportare/importare un backup JSON** prima di modifiche importanti.

## Modificare la scheda in futuro

La configurazione di Allenamento A/B è nel solo file:

`workout-data-v3.js`

Gli esercizi hanno un `id` stabile. Per mantenere la progressione dei carichi, evita di cambiare l'ID di un esercizio già esistente anche se ne modifichi il nome, l'ordine, le serie o il recupero.

## Struttura

- `index.html` — struttura dell'app
- `style-v3.css` — grafica
- `workout-data-v3.js` — schede A/B
- `app-v3.js` — logica, timer, storico, progressione e backup
- `manifest-v3.webmanifest` — installazione PWA
- `sw.js` — offline/cache
- `icons/` — icone mobile
- `.nojekyll` — compatibilità GitHub Pages
