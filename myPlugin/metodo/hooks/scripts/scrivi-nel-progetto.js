// @ts-check
'use strict';

/*
 * GUARDRAIL Comportamento 2 — "Non scrivere fuori dalla cartella del progetto
 * senza autorizzazione".
 *
 * Hook PreToolUse su Edit/Write: se il file da scrivere sta FUORI dalla radice
 * del progetto, non blocca ma **chiede conferma** (permissionDecision "ask") —
 * fedele al "salvo richiesta esplicita" del metodo. Dentro il progetto: nessuna
 * decisione, si prosegue.
 *
 * Eccezione: la cartella temporanea del sistema (os.tmpdir()) e' consentita
 * senza chiedere — il metodo ammette lì i file transitori / lo scratchpad.
 */

const os = require('os');
const path = require('path');

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
 * Vero se `assoluto` sta dentro `base` (o coincide con essa).
 * Usa path.relative: se il risultato "esce" (inizia con ..) o e' assoluto
 * (altro disco su Windows), allora e' fuori.
 * @param {string} base
 * @param {string} assoluto
 * @returns {boolean}
 */
function dentro(base, assoluto) {
  const rel = path.relative(base, assoluto);
  if (rel === '') return true; // e' la cartella stessa
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Decide se chiedere conferma. Restituisce l'oggetto-decisione ("ask") se il
 * percorso e' fuori dal progetto e non nella temp; altrimenti null.
 * @param {string} filePath  percorso del file (relativo o assoluto)
 * @param {string} radice    radice del progetto
 * @param {string} temp       cartella temporanea di sistema (esente)
 * @returns {object | null}
 */
function decidi(filePath, radice, temp) {
  if (!filePath) return null;
  const assoluto = path.resolve(radice, filePath);

  if (dentro(radice, assoluto)) return null; // dentro il progetto: ok
  if (dentro(temp, assoluto)) return null; //   nella temp/scratchpad: ok

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        'Comportamento 2: stai per scrivere FUORI dalla cartella del progetto (' +
        assoluto +
        '). Il metodo lo consente solo su richiesta esplicita. Confermi questa scrittura?',
    },
  };
}

module.exports = { decidi, dentro };

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
      const filePath = (input && input.tool_input && input.tool_input.file_path) || '';
      const radice = process.env.CLAUDE_PROJECT_DIR || process.cwd();
      const decisione = decidi(filePath, radice, os.tmpdir());
      if (decisione) process.stdout.write(JSON.stringify(decisione));
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: un bug dell'hook non deve bloccare la scrittura.
      process.stderr.write('scrivi-nel-progetto: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
