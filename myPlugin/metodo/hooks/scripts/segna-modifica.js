// @ts-check
'use strict';

/*
 * SUPPORTO al gate-e2e — "segna che questa sessione ha modificato dei file".
 *
 * Hook PostToolUse su Edit/Write/NotebookEdit: quando Claude scrive un file,
 * lascia un segnaposto (file vuoto in temp, uno per sessione). Il gate-e2e
 * (hook Stop) lancia build/test SOLO se il segnaposto esiste: cosi' un turno
 * puramente conversazionale non paga minuti di build per niente.
 *
 * Il segnaposto lo rimuove il gate-e2e quando la verifica torna verde.
 *
 * SECONDO COMPITO: se il file scritto e' docs/STORICO.md, lascia anche il
 * segnaposto "storico aggiornato in questa sessione". Lo usa chiudi-punto.js:
 * un punto si puo' chiudere (cancellare .metodo/punto-aperto.md) solo se lo
 * STORICO e' stato aggiornato (F4.12).
 */

const os = require('os');
const path = require('path');
const fs = require('fs');

/**
 * Legge tutto lo stdin come testo.
 * @returns {Promise<string>}
 */
function leggiStdin() {
  return new Promise((resolve) => {
    let dati = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (pezzo) => (dati += pezzo));
    process.stdin.on('end', () => resolve(dati));
  });
}

/**
 * Il file-segnaposto "ci sono modifiche non ancora verificate", uno per sessione.
 * @param {string} sessione
 * @returns {string}
 */
function fileModifiche(sessione) {
  return path.join(os.tmpdir(), `metodo-modifiche-${sessione}`);
}

/**
 * Il file-segnaposto "STORICO.md aggiornato in questa sessione".
 * @param {string} sessione
 * @returns {string}
 */
function fileStorico(sessione) {
  return path.join(os.tmpdir(), `metodo-storico-${sessione}`);
}

/**
 * Vero se il percorso e' docs/STORICO.md (a qualsiasi profondita', / o \).
 * @param {string} percorso
 * @returns {boolean}
 */
function eStorico(percorso) {
  return /(^|[\\/])docs[\\/]STORICO\.md$/i.test(percorso || '');
}

module.exports = { fileModifiche, fileStorico, eStorico };

if (require.main === module) {
  leggiStdin()
    .then((raw) => {
      let input = {};
      try {
        input = JSON.parse(raw) || {};
      } catch {
        /* input sporco: ignora */
      }
      const sessione = input.session_id || 'nosession';
      fs.writeFileSync(fileModifiche(sessione), '');
      const percorso = (input && input.tool_input && input.tool_input.file_path) || '';
      if (eStorico(percorso)) fs.writeFileSync(fileStorico(sessione), '');
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: mai disturbare il lavoro per un bug del segnaposto.
      process.stderr.write('segna-modifica: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
