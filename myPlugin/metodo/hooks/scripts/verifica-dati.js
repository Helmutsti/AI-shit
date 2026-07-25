// @ts-check
'use strict';

/*
 * GUARDRAIL P4/H4 — parte 2 di 2: IL CONFRONTO.
 *
 * Hook Stop: scatta quando Claude sta per fermarsi. Rifa' l'impronta di dati/ e
 * la confronta con la foto scattata all'avvio (parte 1). Se sono diverse, dati/
 * e' cambiata: probabilmente ci sono residui di test da ripulire.
 *
 * Come si "blocca" con un hook Stop: uscendo con CODICE 2. Significa "non
 * fermarti": Claude riprende il controllo, legge il messaggio su stderr e deve
 * sistemare. (Uscire con 0 = "va bene, fermati pure".)
 *
 * IL CONTATORE DI SICUREZZA. Un hook Stop che esce con 2 rimanda Claude al
 * lavoro. Se continuasse a fallire, Claude verrebbe rilanciato all'infinito.
 * Per questo teniamo un contatore: dopo MAX tentativi lasciamo passare (exit 0)
 * e restituiamo il controllo all'utente. Senza questo, un blocco = loop infinito.
 */

const os = require('os');
const path = require('path');
const fs = require('fs');

// Riusiamo le funzioni della parte 1: stessa cartella, stesso algoritmo.
const { improntaCartella, cartellaDati, fileFoto } = require('./snapshot-dati.js');

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

/**
 * File temporaneo che conta i tentativi falliti, uno per sessione.
 * @param {string} sessione
 * @returns {string}
 */
function fileTentativi(sessione) {
  return path.join(os.tmpdir(), `metodo-tentativi-${sessione}`);
}

/**
 * Decide l'esito, dato il confronto e i tentativi gia' fatti.
 *  - exit 2  => blocca ("non fermarti, pulisci")
 *  - exit 0  => passa (tutto ok, oppure abbiamo esaurito i tentativi)
 * @param {string} improntaFoto      l'impronta iniziale
 * @param {string} improntaAdesso    l'impronta a fine turno
 * @param {number} tentativiPrec
 * @param {number} [max]
 * @returns {{ exit: 0 | 2, stderr?: string, contatore: number, reset: boolean }}
 */
function decidi(improntaFoto, improntaAdesso, tentativiPrec, max = MAX_TENTATIVI) {
  const n = tentativiPrec + 1;

  // Contatore di sicurezza: esauriti i tentativi, molla e avvisa.
  if (n > max) {
    return {
      exit: 0,
      stderr: `H4: dati/ risulta ancora modificata dopo ${max} tentativi. Verifica a mano.`,
      contatore: n,
      reset: false,
    };
  }

  // Cartella cambiata: blocca e chiedi di pulire.
  if (improntaAdesso !== improntaFoto) {
    return {
      exit: 2,
      stderr:
        "H4: la cartella dati/ non e' tornata allo stato iniziale. Rimuovi ogni residuo " +
        'dei test (file creati, righe aggiunte, rinomine) e conferma con un conteggio prima/dopo.',
      contatore: n,
      reset: false,
    };
  }

  // Tutto a posto: azzera il contatore e lascia fermare.
  return { exit: 0, contatore: 0, reset: true };
}

module.exports = { decidi, fileTentativi, MAX_TENTATIVI };

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
      const foto = fileFoto(sessione);
      const improntaAdesso = improntaCartella(cartellaDati());

      // Niente cartella dati/ o nessuna foto iniziale: niente da confrontare.
      if (improntaAdesso === null || !fs.existsSync(foto)) process.exit(0);

      const improntaFoto = fs.readFileSync(foto, 'utf8').trim();
      const fileTent = fileTentativi(sessione);
      const prec = fs.existsSync(fileTent)
        ? parseInt(fs.readFileSync(fileTent, 'utf8'), 10) || 0
        : 0;

      const esito = decidi(improntaFoto, improntaAdesso, prec);

      // Aggiorna il contatore: azzeralo (rimuovi il file) se tutto ok, altrimenti salvalo.
      if (esito.reset) {
        if (fs.existsSync(fileTent)) fs.rmSync(fileTent);
      } else {
        fs.writeFileSync(fileTent, String(esito.contatore));
      }

      if (esito.stderr) process.stderr.write(esito.stderr + '\n');
      process.exit(esito.exit);
    })
    .catch((err) => {
      // fail-open: un bug nell'hook Stop non deve impedire a Claude di fermarsi.
      process.stderr.write('verifica-dati: errore ignorato: ' + String(err) + '\n');
      process.exit(0);
    });
}
