// @ts-check
'use strict';

/*
 * GUARDRAIL §3.4 — "Nei docs/ scrive SOLO il coordinatore".
 *
 * Hook PreToolUse su Edit/Write: scatta PRIMA che venga scritto un file.
 * Il trucco: quando l'hook parte dentro un SUBAGENTE, il JSON di input contiene
 * il campo `agent_id`; la sessione principale (il coordinatore) NON ce l'ha.
 *
 *   agent_id presente  +  file sotto docs/   =>  NEGA
 *   (tutto il resto)                          =>  passa
 *
 * Cosi' i subagenti non toccano i documenti condivisi: li aggiorna solo il
 * coordinatore, in serie, dopo aver ricevuto i risultati (niente scritture
 * concorrenti che si sovrascrivono).
 */

/**
 * Legge tutto lo stdin come testo (l'input dell'hook arriva su pipe).
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
 * Vero se il percorso attraversa una CARTELLA chiamata "docs".
 * Non basta cercare la parola "docs" nel testo: cosi' eviti falsi positivi come
 * "src/mydocs/x.js" o "docs-vecchi/y". Il confronto e' per SEGMENTO di percorso,
 * e "docs" deve essere una cartella (non l'ultimo pezzo, cioe' il nome del file).
 * Gestisce sia "/" (Mac/Linux) sia "\\" (Windows).
 * @param {string} percorso
 * @returns {boolean}
 */
function attraversaDocs(percorso) {
  if (!percorso) return false;
  const segmenti = percorso.split(/[\\/]+/).filter(Boolean);
  const i = segmenti.indexOf('docs');
  return i !== -1 && i < segmenti.length - 1;
}

/**
 * Il cuore della regola. Restituisce l'oggetto-decisione se deve NEGARE,
 * altrimenti null ("nessuna decisione, prosegui pure").
 * @param {Record<string, any>} input
 * @returns {object | null}
 */
function decidi(input) {
  const percorso = (input && input.tool_input && input.tool_input.file_path) || '';
  const agente = (input && input.agent_id) || '';

  if (agente && attraversaDocs(percorso)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Regola 3.4 (agentic-proof): i file in docs/ li scrive SOLO il coordinatore, ' +
          'in serie, dopo il report degli agenti. Percorso rifiutato: ' +
          percorso +
          '. Riporta il risultato al coordinatore come dato strutturato, non scriverlo tu.',
      },
    };
  }

  return null;
}

module.exports = { decidi, attraversaDocs };

if (require.main === module) {
  leggiStdin()
    .then((raw) => {
      /** @type {Record<string, any>} */
      let input = {};
      try {
        input = JSON.parse(raw) || {};
      } catch {
        // input sporco: non blocchiamo nulla.
      }
      const decisione = decidi(input);
      if (decisione) process.stdout.write(JSON.stringify(decisione));
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: un bug dell'hook non deve mai bloccare la scrittura.
      process.stderr.write('proteggi-docs: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
