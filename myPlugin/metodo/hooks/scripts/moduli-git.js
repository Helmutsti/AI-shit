// @ts-check
'use strict';

/*
 * GUARDRAIL P6/H5 — "push solo se il modulo push-auto e' acceso".
 *
 * Hook PreToolUse su Bash: se il comando contiene un `git push` e il progetto
 * NON ha il modulo `push-auto` attivo, non blocca ma **chiede conferma**
 * (permissionDecision "ask") — e' l'esempio canonico di P6 reso meccanico:
 * "committa e pusha tutto" con push-auto OFF → "confermi il push?".
 *
 * I moduli scelti all'INIT vivono in `.metodo/config.json`:
 *   { "moduli": { "push-auto": false, "commit-auto": false, ... } }
 * Config o campo mancanti = modulo OFF (il default del metodo): si chiede.
 */

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
 * Vero se il modulo indicato e' attivo in `.metodo/config.json`.
 * Mancanza di file/campo = OFF (default del metodo).
 * @param {string} nome
 * @returns {boolean}
 */
function moduloAttivo(nome) {
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(radiceProgetto(), '.metodo', 'config.json'), 'utf8')
    );
    return !!(cfg && cfg.moduli && cfg.moduli[nome] === true);
  } catch {
    return false;
  }
}

/**
 * Vero se il comando esegue un `git push` (anche in comandi composti con
 * && / ; / |, e con opzioni tra `git` e `push`, es. `git -C x push`).
 * @param {string} comando
 * @returns {boolean}
 */
function contienePush(comando) {
  // Le opzioni globali di git possono avere un argomento (-C <dir>, -c k=v):
  // tra `git` e `push` accettiamo sia flag secchi sia coppie flag+valore.
  return /(^|&&|\|\||;|\|)\s*git\s+((-C|-c)\s+\S+\s+|--?\S+\s+)*push\b/.test(
    comando || ''
  );
}

/**
 * Decide se chiedere conferma. Oggetto-decisione ("ask") se il comando pusha e
 * `push-auto` e' OFF; altrimenti null ("nessuna decisione, prosegui").
 * @param {string} comando
 * @param {boolean} pushAuto  stato del modulo push-auto
 * @returns {object | null}
 */
function decidi(comando, pushAuto) {
  if (!contienePush(comando)) return null;
  if (pushAuto) return null; // modulo acceso: il push automatico e' voluto

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        'P6/H5: il modulo `push-auto` e\' OFF — il metodo non pusha di default. ' +
        'Confermi questo push (solo per questa volta)? Per pushare sempre, accendi ' +
        '`push-auto` in .metodo/config.json.',
    },
  };
}

module.exports = { decidi, contienePush, moduloAttivo };

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
      const decisione = decidi(comando, moduloAttivo('push-auto'));
      if (decisione) process.stdout.write(JSON.stringify(decisione));
      process.exit(0);
    })
    .catch((err) => {
      // fail-open: un bug dell'hook non deve bloccare i comandi git.
      process.stderr.write('moduli-git: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
