// @ts-check
'use strict';

/*
 * Test delle funzioni pure degli hook. Nessuna dipendenza: si lancia con
 *   node hooks/tests/run.js
 * Ogni riga e' un caso: se un'asserzione fallisce, il processo esce con 1 e
 * stampa cosa si aspettava. Verde = tutte le regole decidono come da metodo.
 */

const assert = require('assert');

let casi = 0;
/** @param {string} nome @param {() => void} fn */
function test(nome, fn) {
  casi++;
  try {
    fn();
  } catch (e) {
    console.error(`✗ ${nome}`);
    console.error(String(e && e.message ? e.message : e));
    process.exit(1);
  }
}

// ---- commit-descrittivo -----------------------------------------------------
const cd = require('../scripts/commit-descrittivo.js');

test('commit: messaggio corto tra doppi apici viene negato', () => {
  const d = cd.decidi({ tool_input: { command: 'git commit -m "wip"' } });
  assert.ok(d, 'doveva negare');
});

test('commit: messaggio lungo passa', () => {
  const d = cd.decidi({
    tool_input: {
      command:
        'git commit -m "Correggo il parser delle date perche\' falliva sui fusi orari"',
    },
  });
  assert.strictEqual(d, null);
});

test('commit: heredoc — si misura il corpo, non il wrapper', () => {
  const comando =
    'git commit -m "$(cat <<\'EOF\'\nbreve\nEOF\n)"';
  assert.strictEqual(cd.estraiMessaggio(comando), 'breve');
  const d = cd.decidi({ tool_input: { command: comando } });
  assert.ok(d, 'corpo heredoc corto: doveva negare');
});

test('commit: heredoc lungo passa', () => {
  const comando =
    'git commit -m "$(cat <<\'EOF\'\nRifattorizzo il caricamento config: il vecchio percorso rompeva i worktree\nEOF\n)"';
  const d = cd.decidi({ tool_input: { command: comando } });
  assert.strictEqual(d, null);
});

test('commit: le firme standard non gonfiano la misura', () => {
  const msg = 'wip\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>';
  assert.strictEqual(cd.senzaFirme(msg), 'wip');
});

test('commit: altri comandi non vengono giudicati', () => {
  assert.strictEqual(cd.decidi({ tool_input: { command: 'git status' } }), null);
});

// ---- proteggi-docs ----------------------------------------------------------
const pd = require('../scripts/proteggi-docs.js');

test('docs: subagente che scrive in docs/ viene negato', () => {
  const d = pd.decidi({ agent_id: 'a1', tool_input: { file_path: 'docs/PIANO.md' } });
  assert.ok(d, 'doveva negare');
});

test('docs: riconosce anche gli altri campi-agente candidati', () => {
  const d = pd.decidi({ agent_type: 'implementatore', tool_input: { file_path: 'docs/X.md' } });
  assert.ok(d, 'doveva negare');
});

test('docs: il coordinatore (nessun agente) scrive liberamente', () => {
  const d = pd.decidi({ tool_input: { file_path: 'docs/PIANO.md' } });
  assert.strictEqual(d, null);
});

test('docs: percorsi simili non fanno falsi positivi', () => {
  assert.strictEqual(pd.attraversaDocs('src/mydocs/x.js'), false);
  assert.strictEqual(pd.attraversaDocs('docs-vecchi/y.md'), false);
  assert.strictEqual(pd.attraversaDocs('sub\\docs\\z.md'), true);
});

// ---- scrivi-nel-progetto ----------------------------------------------------
const sp = require('../scripts/scrivi-nel-progetto.js');

test('progetto: scrittura interna passa, esterna chiede', () => {
  const radice = 'C:\\proj';
  const temp = 'C:\\tmp';
  assert.strictEqual(sp.decidi('src\\a.js', radice, temp), null);
  assert.strictEqual(sp.decidi('C:\\tmp\\x.txt', radice, temp), null);
  assert.ok(sp.decidi('C:\\Users\\qualcuno\\Desktop\\x.txt', radice, temp));
});

// ---- moduli-git -------------------------------------------------------------
const mg = require('../scripts/moduli-git.js');

test('push: con push-auto OFF chiede conferma', () => {
  assert.ok(mg.decidi('git push origin main', false));
});

test('push: con push-auto ON passa', () => {
  assert.strictEqual(mg.decidi('git push origin main', true), null);
});

test('push: riconosciuto anche in comandi composti', () => {
  assert.ok(mg.contienePush('git add -A && git commit -m "x" && git push'));
  assert.ok(mg.contienePush('git -C sub push'));
  assert.strictEqual(mg.contienePush('git log push-branch'), false);
  assert.strictEqual(mg.contienePush('echo push'), false);
});

// ---- gate-e2e / verifica-dati (decisioni con contatore) ----------------------
const ge = require('../scripts/gate-e2e.js');

test('gate: spento se nessun comando di verifica', () => {
  assert.strictEqual(ge.decidi(null, 0).exit, 0);
});

test('gate: rosso blocca, poi molla dopo MAX tentativi', () => {
  assert.strictEqual(ge.decidi(1, 0).exit, 2);
  assert.strictEqual(ge.decidi(1, 1).exit, 2);
  assert.strictEqual(ge.decidi(1, 2).exit, 0); // tentativi esauriti: molla e avvisa
});

test('gate: verde passa e azzera', () => {
  const e = ge.decidi(0, 1);
  assert.strictEqual(e.exit, 0);
  assert.strictEqual(e.reset, true);
});

const vd = require('../scripts/verifica-dati.js');

test('dati: impronta diversa blocca, uguale passa', () => {
  assert.strictEqual(vd.decidi('aaa', 'bbb', 0).exit, 2);
  assert.strictEqual(vd.decidi('aaa', 'aaa', 0).exit, 0);
  assert.strictEqual(vd.decidi('aaa', 'bbb', 2).exit, 0); // tentativi esauriti
});

// ---- gate-definizione (F1.5) --------------------------------------------------
const gd = require('../scripts/gate-definizione.js');

test('F1.5: codice senza punto aperto chiede conferma', () => {
  assert.ok(gd.decidi('src/app.js', true, false, false));
});

test('F1.5: con punto aperto passa', () => {
  assert.strictEqual(gd.decidi('src/app.js', true, true, false), null);
});

test('F1.5: chiede una sola volta per sessione', () => {
  assert.strictEqual(gd.decidi('src/app.js', true, false, true), null);
});

test('F1.5: docs/, .metodo/ e prosa sono esenti', () => {
  assert.strictEqual(gd.decidi('docs/PIANO.md', true, false, false), null);
  assert.strictEqual(gd.decidi('.metodo/config.json', true, false, false), null);
  assert.strictEqual(gd.decidi('README.md', true, false, false), null);
});

test('F1.5: progetto non inizializzato = lucchetto spento', () => {
  assert.strictEqual(gd.decidi('src/app.js', false, false, false), null);
});

// ---- chiudi-punto (F4.11/F4.12) ------------------------------------------------
const cp = require('../scripts/chiudi-punto.js');

test('chiusura: senza STORICO aggiornato viene negata', () => {
  assert.ok(cp.decidi('rm .metodo/punto-aperto.md', false));
  assert.ok(cp.decidi('Remove-Item .metodo\\punto-aperto.md', false));
});

test('chiusura: con STORICO aggiornato passa', () => {
  assert.strictEqual(cp.decidi('rm .metodo/punto-aperto.md', true), null);
});

test('chiusura: altri rm non c\'entrano', () => {
  assert.strictEqual(cp.decidi('rm build/temp.txt', false), null);
});

// ---- segna-modifica (riconoscimento STORICO) -----------------------------------
const sm = require('../scripts/segna-modifica.js');

test('storico: riconosce docs/STORICO.md nei due separatori', () => {
  assert.ok(sm.eStorico('docs/STORICO.md'));
  assert.ok(sm.eStorico('C:\\proj\\docs\\STORICO.md'));
  assert.strictEqual(sm.eStorico('docs/PIANO.md'), false);
  assert.strictEqual(sm.eStorico('altro/STORICO.md'), false);
});

// ---- bash-nel-progetto (Comportamento 2, lato shell) ---------------------------
const bp = require('../scripts/bash-nel-progetto.js');
const RADICE = 'C:\\proj';
const TEMP = 'C:\\tmp';

test('bash: redirezione su percorso esterno chiede conferma', () => {
  assert.ok(bp.decidi('echo x > C:\\Users\\qualcuno\\Desktop\\y.txt', RADICE, TEMP));
});

test('bash: copia PowerShell su percorso esterno chiede conferma', () => {
  assert.ok(bp.decidi('Copy-Item a.txt C:\\altrove\\a.txt', RADICE, TEMP));
});

test('bash: scritture interne o in temp passano', () => {
  assert.strictEqual(bp.decidi('echo x > out.txt', RADICE, TEMP), null);
  assert.strictEqual(bp.decidi('cp a.txt C:\\proj\\sub\\a.txt', RADICE, TEMP), null);
  assert.strictEqual(bp.decidi('echo x > C:\\tmp\\scratch.txt', RADICE, TEMP), null);
});

test('bash: lettura di percorsi esterni passa (nessun indicatore)', () => {
  assert.strictEqual(bp.decidi('cat C:\\Users\\x\\file.txt', RADICE, TEMP), null);
  assert.strictEqual(bp.decidi('node C:\\Users\\x\\script.js', RADICE, TEMP), null);
});

test('bash: 2>&1 non conta come scrittura', () => {
  assert.strictEqual(bp.indicaScrittura('cmd 2>&1'), false);
  assert.ok(bp.indicaScrittura('cmd > out.log'));
});

// ---- annota-comando-rapido ---------------------------------------------------
const ar = require('../scripts/annota-comando-rapido.js');

test('prefissi: riconosciuti a inizio messaggio, non altrove', () => {
  assert.ok(ar.decidi('bug: il menu sparisce'));
  assert.ok(ar.decidi('  Forse: dark mode'));
  assert.strictEqual(ar.decidi('ho trovato un bug: il menu sparisce'), null);
  assert.strictEqual(ar.decidi('implementa il punto 3'), null);
});

test('breve: chiede il formato minimo H9, non l\'annotazione', () => {
  const p = ar.decidi('breve: sistema il typo nel README');
  assert.ok(p && p.includes('H9'), 'doveva iniettare il promemoria H9');
  assert.strictEqual(ar.decidi('in breve: com\'e\' andata?'), null);
});

console.log(`✓ ${casi} casi passati`);
