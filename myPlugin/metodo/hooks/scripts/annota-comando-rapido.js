// @ts-check
'use strict';

/*
 * GUARDRAIL P1 + H9 — "Comandi rapidi" (annotazione e brevita').
 *
 * Hook UserPromptSubmit: scatta quando l'utente invia un messaggio. Se il
 * messaggio INIZIA con `bug:`, `miglioramento:`, `punto:` o `forse:`, e' un
 * ordine di SOLA ANNOTAZIONE. Se inizia con `breve:`, chiede la risposta nel
 * formato minimo di H9 (cosa + dove + prova). Questo hook non blocca: inietta
 * un promemoria (testo su stdout, che diventa contesto per il modello).
 *
 * E' un rinforzo, non un divieto: la regola resta prosa, ma qui la ricordiamo
 * in modo affidabile a ogni messaggio che usa un prefisso.
 */

/** Prefissi riconosciuti e dove va annotata la voce. */
const PREFISSI = [
  ['bug:', 'lista "Bug noti da correggere"'],
  ['miglioramento:', 'backlog, nel gruppo piu\' adatto'],
  ['punto:', 'backlog "Da realizzare/definire"'],
  ['forse:', 'backlog "Forse"'],
];

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
 * Riconosce il prefisso a inizio messaggio (ignora spazi iniziali e maiuscole).
 * @param {string} testo
 * @returns {[string, string] | null}  la coppia [prefisso, destinazione] o null
 */
function riconosci(testo) {
  const t = (testo || '').replace(/^\s+/, '').toLowerCase();
  for (const coppia of PREFISSI) {
    if (t.startsWith(coppia[0])) return coppia;
  }
  return null;
}

/**
 * Il promemoria da iniettare, o null se il messaggio non usa un comando rapido.
 * @param {string} testo
 * @returns {string | null}
 */
function decidi(testo) {
  const t = (testo || '').replace(/^\s+/, '').toLowerCase();

  // H9 — brevita' su richiesta: `breve:` chiede il formato minimo.
  if (t.startsWith('breve:')) {
    return (
      `[metodo · H9] Questo messaggio inizia con "breve:": rispondi nel ` +
      `FORMATO MINIMO — cosa + dove + prova, massimo 3 righe. Niente ` +
      `riepiloghi, sezioni, tabelle o ripetizione del piano. Esempio: ` +
      `"Fatto: <cosa> in <file>, <verifica> verde."`
    );
  }

  const c = riconosci(testo);
  if (!c) return null;
  return (
    `[metodo · P1] Questo messaggio inizia con "${c[0]}": e' un ordine di SOLA ` +
    `ANNOTAZIONE. Registra la voce in ${c[1]} (in docs/PIANO.md, o sulla ` +
    `piattaforma se attiva) e conferma cosa/dove. NON scrivere codice e non ` +
    `avviare implementazioni: e' solo un appunto.`
  );
}

module.exports = { decidi, riconosci };

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
      // Il nome del campo varia tra versioni: leggiamo il primo disponibile.
      const testo =
        input.user_input || input.prompt || input.user_prompt || input.message || '';
      const promemoria = decidi(testo);
      if (promemoria) process.stdout.write(promemoria);
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: mai bloccare l'invio del messaggio per un bug dell'hook.
      process.stderr.write('annota-comando-rapido: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
