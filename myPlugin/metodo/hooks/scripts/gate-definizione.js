// @ts-check
'use strict';

/*
 * GUARDRAIL F1.5 — "Nessuna implementazione sostanziale prima della definizione".
 *
 * Hook PreToolUse su Edit/Write: se si sta per modificare un file di CODICE ma
 * non risulta un punto aperto, chiede conferma (permissionDecision "ask").
 *
 * Il contratto del "punto aperto" e' un file di stato:
 *   .metodo/punto-aperto.md
 * Lo crea il coordinatore al passo F1.5 (quando il punto e' descritto "a dovere"
 * e migrato a task/milestone) con dentro il riferimento al punto; lo cancella
 * alla chiusura (F4.11) — vedi l'hook chiudi-punto, che a sua volta pretende
 * l'aggiornamento di STORICO prima della cancellazione.
 *
 * Perche' "ask" e non "deny": il metodo esenta le micro-iterazioni di stile
 * (un colore, un testo) da tutto il ciclo — l'hook non puo' distinguerle, quindi
 * lascia decidere l'utente. E per non diventare un tormento, chiede UNA volta
 * per sessione: se l'utente conferma di procedere senza punto, non riappare.
 *
 * Esenzioni (nessuna domanda):
 *   - il metodo non e' inizializzato (manca docs/PROGETTO.md);
 *   - file in docs/ o .metodo/ (documenti e stato, non implementazione);
 *   - file .md/.txt (prosa, non codice);
 *   - un punto e' aperto (.metodo/punto-aperto.md esiste).
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

/** @returns {string} la radice del progetto */
function radiceProgetto() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

/**
 * File-ricordo "ho gia' chiesto in questa sessione", per non tormentare.
 * @param {string} sessione
 * @returns {string}
 */
function fileGiaChiesto(sessione) {
  return path.join(os.tmpdir(), `metodo-f15-${sessione}`);
}

/**
 * Vero se il percorso e' esente dal lucchetto: documenti, stato del metodo,
 * o prosa (.md/.txt) — non sono "implementazione".
 * @param {string} percorso
 * @returns {boolean}
 */
function esente(percorso) {
  if (!percorso) return true;
  const segmenti = percorso.split(/[\\/]+/).filter(Boolean);
  if (segmenti.includes('docs') || segmenti.includes('.metodo')) return true;
  return /\.(md|txt)$/i.test(percorso);
}

/**
 * Il cuore della regola. Restituisce l'oggetto-decisione ("ask") o null.
 * @param {string} filePath        file che si sta per scrivere
 * @param {boolean} inizializzato  esiste docs/PROGETTO.md
 * @param {boolean} puntoAperto    esiste .metodo/punto-aperto.md
 * @param {boolean} giaChiesto     abbiamo gia' chiesto in questa sessione
 * @returns {object | null}
 */
function decidi(filePath, inizializzato, puntoAperto, giaChiesto) {
  if (!inizializzato) return null; // metodo non attivo in questo progetto
  if (esente(filePath)) return null;
  if (puntoAperto) return null; // c'e' un punto in lavorazione: via libera
  if (giaChiesto) return null; // l'utente ha gia' deciso per questa sessione

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        'F1.5: non risulta un punto aperto (.metodo/punto-aperto.md non esiste). ' +
        'Il metodo chiede di definire e migrare il punto PRIMA di implementare. ' +
        'Se e\' una micro-iterazione di stile conferma pure; altrimenti apri prima ' +
        'il punto (consulta DOCUMENTAZIONE.md e docs/adr/ per non riproporre ' +
        'soluzioni scartate, descrizione "a dovere" + task/milestone, poi crea ' +
        '.metodo/punto-aperto.md). Non lo richiedero\' piu\' in questa sessione.',
    },
  };
}

module.exports = { decidi, esente, fileGiaChiesto };

if (require.main === module) {
  leggiStdin()
    .then((raw) => {
      /** @type {Record<string, any>} */
      let input = {};
      try {
        input = JSON.parse(raw) || {};
      } catch {
        /* input sporco: ignora */
      }
      const sessione = input.session_id || 'nosession';
      const filePath = (input && input.tool_input && input.tool_input.file_path) || '';
      const radice = radiceProgetto();

      const inizializzato = fs.existsSync(path.join(radice, 'docs', 'PROGETTO.md'));
      const puntoAperto = fs.existsSync(path.join(radice, '.metodo', 'punto-aperto.md'));
      const giaChiesto = fs.existsSync(fileGiaChiesto(sessione));

      const decisione = decidi(filePath, inizializzato, puntoAperto, giaChiesto);
      if (decisione) {
        // Ricorda che abbiamo chiesto: una sola domanda per sessione.
        fs.writeFileSync(fileGiaChiesto(sessione), '');
        process.stdout.write(JSON.stringify(decisione));
      }
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: un bug dell'hook non deve mai bloccare il lavoro.
      process.stderr.write('gate-definizione: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
