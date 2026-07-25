// @ts-check
'use strict';

/*
 * GUARDRAIL P4/H4 — parte 1 di 2: LA FOTO.
 *
 * Hook SessionStart: all'apertura della sessione calcola un'impronta (hash)
 * della cartella dati/ e la salva in un file temporaneo. La parte 2
 * (verifica-dati.js) la riuserà a fine turno per vedere se qualcosa e' cambiato.
 *
 * Perche' un file temporaneo? Perche' i due hook sono due processi separati,
 * in due momenti diversi: la foto scattata all'avvio va "parcheggiata" da
 * qualche parte per ritrovarla alla chiusura. La parcheggiamo in os.tmpdir()
 * (la cartella temporanea del sistema), con un nome legato alla sessione.
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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
 * La cartella dei dati reali del progetto: <progetto>/dati.
 * CLAUDE_PROJECT_DIR e' la radice del progetto (la mette Claude Code); se manca,
 * usiamo la cartella corrente. Se dati/ non esiste, gli hook non fanno nulla.
 * @returns {string}
 */
function cartellaDati() {
  const radice = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  return path.join(radice, 'dati');
}

/**
 * Il file temporaneo dove parcheggiamo la foto iniziale, uno per sessione.
 * @param {string} sessione
 * @returns {string}
 */
function fileFoto(sessione) {
  return path.join(os.tmpdir(), `metodo-foto-${sessione}`);
}

/**
 * Impronta stabile del contenuto di una cartella. Per ogni file (in ordine)
 * calcola l'hash del contenuto, poi fa l'hash dell'elenco. Se due momenti
 * danno la stessa impronta, il contenuto e' identico. Se la cartella non
 * esiste, restituisce null. Usa `crypto` (nativo di Node): stesso risultato su
 * Windows e Mac, senza dipendere da comandi di sistema.
 * @param {string} cartella
 * @returns {string | null}
 */
function improntaCartella(cartella) {
  if (!fs.existsSync(cartella) || !fs.statSync(cartella).isDirectory()) return null;

  /** @type {string[]} */
  const files = [];
  const esplora = (dir) => {
    for (const voce of fs.readdirSync(dir, { withFileTypes: true })) {
      const completo = path.join(dir, voce.name);
      if (voce.isDirectory()) esplora(completo);
      else if (voce.isFile()) files.push(completo);
    }
  };
  esplora(cartella);
  files.sort();

  const righe = files.map((f) => {
    const h = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
    const relativo = path.relative(cartella, f).split(path.sep).join('/');
    return `${h}  ${relativo}`;
  });
  return crypto.createHash('sha256').update(righe.join('\n')).digest('hex');
}

// Esportiamo le funzioni cosi' la parte 2 riusa ESATTAMENTE le stesse (stessa
// cartella, stesso nome-file, stesso algoritmo): e' cio' che tiene le due parti
// allineate.
module.exports = { improntaCartella, cartellaDati, fileFoto };

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
      const impronta = improntaCartella(cartellaDati());
      // Niente cartella dati/? Non scriviamo nulla: non c'e' niente da sorvegliare.
      if (impronta !== null) fs.writeFileSync(fileFoto(sessione), impronta);
      process.exit(0);
    })
    .catch((err) => {
      process.stderr.write('snapshot-dati: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
