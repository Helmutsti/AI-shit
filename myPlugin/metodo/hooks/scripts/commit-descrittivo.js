// @ts-check
'use strict';

/*
 * GUARDRAIL H5 — "Il commit spiega il PERCHE', non solo il cosa".
 *
 * Questo e' un hook di tipo PreToolUse: Claude Code lo esegue PRIMA di lasciar
 * partire un comando. Se il comando e' un `git commit -m "..."` con un
 * messaggio troppo corto, l'hook dice "nega" e Claude non puo' committare
 * finche' non scrive un messaggio decente.
 *
 * Come parla un hook con Claude Code:
 *   - riceve su stdin un JSON che descrive cosa Claude sta per fare;
 *   - risponde stampando su stdout un JSON con la decisione;
 *   - esce SEMPRE con codice 0 (la decisione viaggia nel JSON, non nell'exit).
 */

const MIN = 40; // lunghezza minima del messaggio, in caratteri

/**
 * Legge tutto lo stdin come testo. Gli hook ricevono l'input su stdin (pipe).
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
 * Estrae il messaggio passato con -m "..." oppure -m '...'.
 * Se non c'e' un -m con testo tra apici, restituisce null (non giudichiamo:
 * es. `git commit` senza -m apre l'editor, non ha un messaggio da misurare).
 * @param {string} comando
 * @returns {string | null}
 */
function estraiMessaggio(comando) {
  let m = /-m\s+"([^"]*)"/.exec(comando); // -m "doppi apici"
  if (m) return m[1];
  m = /-m\s+'([^']*)'/.exec(comando); //     -m 'apici singoli'
  if (m) return m[1];
  return null;
}

/**
 * Il cuore della regola. Ricevuto l'input dell'hook, decide se bloccare.
 * Restituisce l'oggetto-decisione se deve NEGARE, oppure null se va tutto bene
 * (null = "nessuna decisione, prosegui pure").
 * @param {Record<string, any>} input
 * @param {number} [min]
 * @returns {object | null}
 */
function decidi(input, min = MIN) {
  const comando = (input && input.tool_input && input.tool_input.command) || '';

  // Ci interessa solo `git commit`. Qualsiasi altro comando: prosegui.
  if (!comando.includes('git commit')) return null;

  const messaggio = estraiMessaggio(comando);
  if (messaggio === null) return null; // niente -m: non c'e' nulla da misurare

  if (messaggio.length < min) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          "H5: il messaggio di commit deve spiegare il PERCHE', non solo il cosa " +
          `(minimo ${min} caratteri). Ricevuto: "${messaggio}". ` +
          'Riscrivilo indicando la ragione della modifica.',
      },
    };
  }

  return null; // messaggio abbastanza lungo: prosegui
}

// Esporta le funzioni cosi' potremo testarle senza lanciare il processo.
module.exports = { decidi, estraiMessaggio, MIN };

// Se il file viene eseguito direttamente (e' il caso quando lo lancia Claude
// Code), leggi stdin, decidi, stampa l'eventuale decisione ed esci con 0.
if (require.main === module) {
  leggiStdin()
    .then((raw) => {
      /** @type {Record<string, any>} */
      let input = {};
      try {
        input = JSON.parse(raw) || {};
      } catch {
        // input sporco: non e' colpa nostra, non blocchiamo nulla.
      }
      const decisione = decidi(input);
      if (decisione) process.stdout.write(JSON.stringify(decisione));
      process.exit(0);
    })
    .catch((err) => {
      // Se qualcosa va storto, NON blocchiamo il commit (fail-open): un bug
      // dell'hook non deve mai impedire di lavorare. Logghiamo e basta.
      process.stderr.write('commit-descrittivo: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
