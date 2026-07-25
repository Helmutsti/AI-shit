---
name: init-progetto
description: Esegue l'INIT del metodo in un progetto nuovo — scelta della lingua, migrazione delle regole, wizard dei moduli (2 step) e generazione di docs/ con PROGETTO.md, PIANO.md, DOCUMENTAZIONE.md e STORICO.md. Usala quando l'utente scrive "init", "inizializza il progetto", "configura il metodo", "rivedi la configurazione", oppure quando apri un progetto che non ha ancora docs/PROGETTO.md e serve impostarlo. NON usarla in un progetto gia' inizializzato, salvo richiesta esplicita di rivedere la configurazione.
---

# INIT del metodo

Questa skill imposta un progetto nuovo secondo il metodo di lavoro. Il *cosa*
scrivere nei documenti sta nei file di `riferimenti/`; qui c'e' il *come*
condurre la procedura. Fai una cosa per volta, con domande mirate (una alla
volta, con opzione consigliata + perche').

## Quando eseguirla

Solo alla prima configurazione di un progetto (finche' non esiste
`docs/PROGETTO.md`). Se `docs/PROGETTO.md` esiste gia', NON rifare l'INIT: dillo
all'utente e procedi solo se chiede esplicitamente "rivedi la configurazione".

## Procedura (passi in ordine)

### 0. Lingua
Chiedi se usare **italiano o inglese** per i documenti generati. Default: il
valore di `lingua` nella config del plugin (se non indicato, `it`).

### 1. Migrazione delle regole
Apri `riferimenti/regole-da-migrare.md`. Spiega all'utente che tutte quelle
regole — Comportamenti fondamentali, Regole di processo, Abitudini — finiranno
in `docs/PROGETTO.md` come **«Regole del progetto»**, un unico corpo editabile.
Offri due strade:
- **«tieni tutte cosi'»** (default) → migrano invariate;
- **«rivedi»** → per ciascuna l'utente puo' disattivarla o modificarne il testo.

I **Comportamenti fondamentali** sono **load-bearing**: se l'utente vuole
disattivarne/modificarne uno, **avvisalo** che regge la sicurezza multi-agente
e la portabilita', e procedi solo su sua conferma.

### 2. Regole locali
Chiarisci che la sezione «Regole del progetto» nasce **gia' popolata** con le
regole migrate, e che l'utente vi aggiungera' i vincoli locali (convenzioni,
priorita' del cliente) nello **stesso elenco**. Nessuna sezione separata.

### 3. Wizard di configurazione (2 step)
**Step 1 — Moduli.** Proponi i moduli a gruppi, ciascuno con default consigliato
+ perche'; l'utente accende/spegne. I gruppi e i default sono in
`riferimenti/wizard-moduli.md`. Se l'utente dice "usa i default", applica i
default (`avvertimi` ON, `piano-su-file` ON, `verifica-e2e` ON; resto OFF).
Quando presenti il gruppo *Integrazione gestione progetto*, **avvisa** che
zoho/todoist/github funzionano tramite un **MCP che il plugin non fornisce**: si
possono scegliere, ma vanno collegati dall'utente (vedi passo 5).

**Step 2 — Flusso risultante.** Mostra il flusso di lavoro
(`riferimenti/flusso-e-concorrenza.md`) **assemblato con i punti aggiunti dai
moduli accesi** (vedi la mappa modulo→passi in `wizard-moduli.md`) e fallo
confermare.

### 4. Se `guide` = ON
Chiedi **URL del repo git delle guide** e (opzionale) il **commit/tag**.
Clonalo/aggiornalo in sola lettura, leggi il suo `SOMMARIO.md`, mostra l'elenco
e fatti dire quali attivare. Registra in `PROGETTO.md`: URL + commit + guide attive.

### 5. Se una piattaforma (`zoho`/`todoist`/`github-issues`) = ON
La piattaforma funziona tramite un **server MCP** che il plugin **non fornisce**.
Procedi cosi':
1. **Verifica se l'MCP e' gia' collegato** (cerca gli strumenti del provider,
   es. `Zoho_Projects__*` / `Todoist__*` / GitHub). 
2. **Se e' collegato:** chiedi **dove** creare i task (portale/progetto/repo) e
   registralo in `PROGETTO.md`.
3. **Se NON e' collegato:** **notifica l'utente** che deve collegarlo lui, con
   le istruzioni — es. *"Apri i server MCP con `/mcp` (o aggiungilo in
   settings.json) e autentica <provider>, poi dimmi quando e' pronto"*. **Non
   bloccare l'INIT**: registra in `PROGETTO.md` che la piattaforma e' scelta ma
   *in attesa di connessione MCP*, e ricorda all'utente di completare il
   collegamento prima del primo uso.

Se nessuna piattaforma e' attiva, assicurati che `piano-su-file` = ON.

### 6. Genera docs/
Crea la cartella `docs/` con:
- **`PROGETTO.md`** — struttura in `riferimenti/template-documenti.md`, riempita
  con la configurazione scelta, il flusso confermato e le regole migrate;
- **`PIANO.md`**, **`DOCUMENTAZIONE.md`**, **`STORICO.md`** — i seed (vedi lo
  stesso template).

### 7. Riscrivi CLAUDE.md
`CLAUDE.md` resta in radice ma deve contenere **solo** un header e la delega
`@docs/PROGETTO.md`. Togli da li' comportamenti, flusso e regole: ora vivono in
`docs/PROGETTO.md`.

### 8. Conferma
Riepiloga cosa hai creato, la configurazione scelta, e che l'INIT non ripartira'
piu' (salvo "init" / "rivedi la configurazione"). Ricorda che le «Regole del
progetto» nascono gia' popolate e che la parte «Regole locali» e' sua da arricchire.
