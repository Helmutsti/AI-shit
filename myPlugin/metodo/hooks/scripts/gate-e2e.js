// @ts-check
'use strict';

/*
 * GUARDRAIL H3 — gate di verifica end-to-end.
 *
 * Hook Stop (come verifica-dati): quando Claude sta per fermarsi, lancia il
 * comando di build/test del progetto. Se fallisce, esce con CODICE 2: "non
 * fermarti, una feature e' 'fatta' solo a build/test verdi".
 *
 * Il comando NON e' cablato qui: ogni progetto e' diverso. Si legge da
 *   <progetto>/.metodo/config.json   ->   { "verifica": "npm test && npm run build" }
 * Se il file o il campo mancano, il gate e' SPENTO e l'hook non disturba: cosi'
 * il plugin non impone nulla a chi non ha (ancora) una verifica da lanciare.
 *
 * Stesso CONTATORE DI SICUREZZA di verifica-dati: dopo MAX tentativi lascia
 * passare, per non rilanciare Claude all'infinito su un test che resta rosso.
 *
 * ECONOMIA: build/test partono SOLO se la sessione ha modificato dei file
 * (segnaposto lasciato da segna-modifica.js, hook PostToolUse su Edit/Write).
 * Un turno puramente conversazionale non paga minuti di build per niente.
 * A verifica verde il segnaposto si rimuove: il gate non riparte finche'
 * non c'e' una nuova modifica.
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { fileModifiche } = require('./segna-modifica.js');

const MAX_TENTATIVI = 2;

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

/** @returns {string} percorso di .metodo/config.json */
function fileConfig() {
  return path.join(radiceProgetto(), '.metodo', 'config.json');
}

/**
 * File temporaneo che conta i tentativi falliti, uno per sessione.
 * @param {string} sessione
 * @returns {string}
 */
function fileTentativi(sessione) {
  return path.join(os.tmpdir(), `metodo-gate-${sessione}`);
}

/**
 * Il comando di verifica dichiarato dal progetto, o null se il gate e' spento
 * (niente file, niente campo, o campo vuoto).
 * @returns {string | null}
 */
function comandoVerifica() {
  const f = fileConfig();
  if (!fs.existsSync(f)) return null;
  try {
    const cfg = JSON.parse(fs.readFileSync(f, 'utf8'));
    const cmd = cfg && typeof cfg.verifica === 'string' ? cfg.verifica.trim() : '';
    return cmd || null;
  } catch {
    return null; // config illeggibile: meglio spento che rotto
  }
}

/**
 * Decide l'esito dato il codice d'uscita del comando di verifica.
 *  - exit 2 => blocca ("build/test rossi, sistema")
 *  - exit 0 => passa (verdi, gate spento, o tentativi esauriti)
 * @param {number | null} codiceVerifica  exit code del comando, o null se spento
 * @param {number} tentativiPrec
 * @param {number} [max]
 * @returns {{ exit: 0 | 2, stderr?: string, contatore: number, reset: boolean }}
 */
function decidi(codiceVerifica, tentativiPrec, max = MAX_TENTATIVI) {
  // Gate spento: nessun comando da lanciare.
  if (codiceVerifica === null) return { exit: 0, contatore: 0, reset: true };

  const n = tentativiPrec + 1;

  // Contatore di sicurezza: esauriti i tentativi, molla e avvisa.
  if (n > max) {
    return {
      exit: 0,
      stderr: `H3: build/test ancora falliti dopo ${max} tentativi. Verifica a mano.`,
      contatore: n,
      reset: false,
    };
  }

  // Comando fallito: blocca.
  if (codiceVerifica !== 0) {
    return {
      exit: 2,
      stderr:
        `H3: la verifica end-to-end non passa (uscita ${codiceVerifica}). Una feature e' ` +
        '"fatta" solo dopo build + test verdi: sistema il problema prima di chiudere.',
      contatore: n,
      reset: false,
    };
  }

  // Verdi: azzera il contatore e lascia fermare.
  return { exit: 0, contatore: 0, reset: true };
}

module.exports = { decidi, comandoVerifica, fileTentativi, MAX_TENTATIVI };

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

      const cmd = comandoVerifica();
      if (cmd === null) process.exit(0); // gate spento

      // Nessuna modifica dall'ultima verifica verde: niente da controllare.
      const flagModifiche = fileModifiche(sessione);
      if (!fs.existsSync(flagModifiche)) process.exit(0);

      // Lancia il comando nella radice del progetto. stdio:'ignore' = non
      // inquiniamo l'output; ci interessa solo il codice d'uscita.
      const r = spawnSync(cmd, {
        shell: true,
        stdio: 'ignore',
        cwd: radiceProgetto(),
        timeout: 570000, // sotto il timeout di 600s dichiarato in hooks.json
      });
      // status null = timeout o kill => trattalo come fallimento.
      const codice = typeof r.status === 'number' ? r.status : 1;

      const fileTent = fileTentativi(sessione);
      const prec = fs.existsSync(fileTent)
        ? parseInt(fs.readFileSync(fileTent, 'utf8'), 10) || 0
        : 0;

      const esito = decidi(codice, prec);

      if (esito.reset) {
        if (fs.existsSync(fileTent)) fs.rmSync(fileTent);
        // Verde: le modifiche sono verificate, spegni il segnaposto.
        if (fs.existsSync(flagModifiche)) fs.rmSync(flagModifiche);
      } else {
        fs.writeFileSync(fileTent, String(esito.contatore));
      }

      if (esito.stderr) process.stderr.write(esito.stderr + '\n');
      process.exit(esito.exit);
    })
    .catch((err) => {
      // fail-open: un bug dell'hook non deve impedire a Claude di fermarsi.
      process.stderr.write('gate-e2e: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
