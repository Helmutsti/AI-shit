// @ts-check
'use strict';

/*
 * GUARDRAIL Comportamento 2 (lato Bash) — "Non scrivere fuori dal progetto".
 *
 * scrivi-nel-progetto.js copre Edit/Write, ma un comando shell puo' scrivere
 * ovunque (`echo x > C:\...`, `cp a %USERPROFILE%\Desktop`, `Out-File ...`).
 * Questo hook PreToolUse su Bash chiude quel buco con un'EURISTICA dichiarata:
 *
 *   comando con INDICATORE DI SCRITTURA  +  PERCORSO ASSOLUTO fuori dal
 *   progetto (e fuori dalla temp)  =>  chiedi conferma ("ask")
 *
 * Non e' un parser di shell: i percorsi relativi restano fuori (vivono nella
 * cwd del progetto), e un comando di sola lettura su un percorso esterno
 * (cat, node, git -C) passa perche' manca l'indicatore di scrittura.
 * Fedele al metodo: fuori progetto si scrive solo su richiesta esplicita,
 * quindi "ask", non "deny".
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
 * Vero se il comando contiene un indicatore di scrittura su file: redirezioni
 * o comandi di copia/spostamento/creazione (Unix e PowerShell).
 * @param {string} comando
 * @returns {boolean}
 */
function indicaScrittura(comando) {
  const c = comando || '';
  if (/(^|[^>])>{1,2}(?!\s*&)/.test(c)) return true; // > e >>, non 2>&1
  return /\b(tee|cp|mv|install|rsync|touch|mkdir|Copy-Item|Move-Item|Out-File|Set-Content|Add-Content|New-Item)\b/i.test(
    c
  );
}

/**
 * Estrae i percorsi ASSOLUTI presenti nel comando: stile Windows (C:\... o
 * C:/...) e stile Unix (/...). Ignora le opzioni (--x=/y non e' un percorso
 * di scrittura affidabile, ma /y da solo si': meglio un falso "ask" in piu').
 * @param {string} comando
 * @returns {string[]}
 */
function percorsiAssoluti(comando) {
  const c = comando || '';
  const trovati = [];
  const win = c.match(/[A-Za-z]:[\\/][^\s"'<>|;&]*/g);
  if (win) trovati.push(...win);
  // Unix: token che iniziano per "/" (non "//" da URL) preceduti da spazio/inizio.
  const unix = c.match(/(?:^|[\s"'=])(\/(?!\/)[^\s"'<>|;&]*)/g);
  if (unix) trovati.push(...unix.map((t) => t.replace(/^[\s"'=]+/, '')));
  return trovati;
}

/**
 * Vero se `assoluto` sta dentro `base` (o coincide con essa).
 * @param {string} base
 * @param {string} assoluto
 * @returns {boolean}
 */
function dentro(base, assoluto) {
  const rel = path.relative(base, assoluto);
  if (rel === '') return true;
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Decide se chiedere conferma: scrittura + almeno un percorso assoluto fuori
 * da progetto e temp. Restituisce l'oggetto-decisione ("ask") o null.
 * @param {string} comando
 * @param {string} radice   radice del progetto
 * @param {string} temp     cartella temporanea (esente)
 * @returns {object | null}
 */
function decidi(comando, radice, temp) {
  if (!comando) return null;
  if (!indicaScrittura(comando)) return null;

  const esterni = percorsiAssoluti(comando).filter(
    (p) => !dentro(radice, p) && !dentro(temp, p)
  );
  if (esterni.length === 0) return null;

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        'Comportamento 2: questo comando sembra scrivere FUORI dalla cartella del ' +
        'progetto (' +
        esterni.join(', ') +
        '). Il metodo lo consente solo su richiesta esplicita. Confermi?',
    },
  };
}

module.exports = { decidi, indicaScrittura, percorsiAssoluti, dentro };

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
      const comando = (input && input.tool_input && input.tool_input.command) || '';
      const radice = process.env.CLAUDE_PROJECT_DIR || process.cwd();
      const decisione = decidi(comando, radice, os.tmpdir());
      if (decisione) process.stdout.write(JSON.stringify(decisione));
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: un bug dell'hook non deve bloccare i comandi.
      process.stderr.write('bash-nel-progetto: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
