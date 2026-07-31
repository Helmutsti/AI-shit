// @ts-check
'use strict';

/*
 * GUARDRAIL F4.11/F4.12 — "Un punto si chiude solo dopo l'append a STORICO".
 *
 * Hook PreToolUse su Bash: la chiusura di un punto, nel contratto del metodo,
 * e' la cancellazione di `.metodo/punto-aperto.md` (vedi gate-definizione.js).
 * Questo hook intercetta i comandi che cancellano quel file e NEGA se in questa
 * sessione `docs/STORICO.md` non risulta aggiornato (segnaposto lasciato da
 * segna-modifica.js). Cosi' la sequenza di chiusura ha un ordine obbligato:
 *
 *   1. append dell'esito a docs/STORICO.md   (F4.12)
 *   2. rm .metodo/punto-aperto.md            (F4.11 — solo ora passa)
 *
 * Limite dichiarato: se lo STORICO e' stato aggiornato in una sessione
 * precedente, il segnaposto non c'e' e l'hook chiede comunque l'append — e'
 * il comportamento voluto: l'esito va scritto quando il punto si chiude.
 */

const fs = require('fs');

const { fileStorico } = require('./segna-modifica.js');

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
 * Vero se il comando cancella .metodo/punto-aperto.md (rm/del/Remove-Item,
 * percorso con / o \, eventualmente quotato o assoluto).
 * @param {string} comando
 * @returns {boolean}
 */
function cancellaPuntoAperto(comando) {
  const c = comando || '';
  if (!/punto-aperto\.md/i.test(c)) return false;
  return /\b(rm|del|Remove-Item|ri)\b/i.test(c);
}

/**
 * Decide se negare la chiusura. Oggetto-decisione se STORICO non aggiornato,
 * altrimenti null.
 * @param {string} comando
 * @param {boolean} storicoAggiornato
 * @returns {object | null}
 */
function decidi(comando, storicoAggiornato) {
  if (!cancellaPuntoAperto(comando)) return null;
  if (storicoAggiornato) return null;

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        'F4.12: stai chiudendo il punto (.metodo/punto-aperto.md) ma in questa ' +
        'sessione docs/STORICO.md non risulta aggiornato. Prima fai l\'append ' +
        'dell\'esito integrale (implementazione, scoperte impreviste, bug risolti) ' +
        'in STORICO.md — e in DOCUMENTAZIONE.md se il punto cambia il presente — ' +
        'poi richiudi il punto.',
    },
  };
}

module.exports = { decidi, cancellaPuntoAperto };

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
      const comando = (input && input.tool_input && input.tool_input.command) || '';
      const storicoAggiornato = fs.existsSync(fileStorico(sessione));

      const decisione = decidi(comando, storicoAggiornato);
      if (decisione) process.stdout.write(JSON.stringify(decisione));
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: un bug dell'hook non deve bloccare i comandi.
      process.stderr.write('chiudi-punto: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
