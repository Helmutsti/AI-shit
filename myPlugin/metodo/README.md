# Plugin "metodo"

Implementa in **meccanismi non ignorabili** le regole load-bearing del metodo
di lavoro descritto in `claude_master.md`. Ogni regola critica diventa un
**hook** (un "tornello") che scatta da solo.

## Guardrail attivi

| Hook | Evento | Regola | Cosa fa |
|---|---|---|---|
| `annota-comando-rapido` | UserPromptSubmit | P1/H9 | rinforza i prefissi `bug:`/`punto:`/`forse:`/`miglioramento:` (sola annotazione) e `breve:` (risposta nel formato minimo cosa+dove+prova) |
| `commit-descrittivo` | PreToolUse (git commit) | H5 | blocca i messaggi di commit sotto i 40 caratteri (heredoc compreso; le firme non contano) |
| `moduli-git` | PreToolUse (Bash) | P6/H5 | con `push-auto` OFF, ogni `git push` chiede conferma |
| `proteggi-docs` | PreToolUse (Edit/Write) | §3.4 | impedisce ai subagenti di scrivere in `docs/` (best-effort: campo agente non documentato) |
| `scrivi-nel-progetto` | PreToolUse (Edit/Write) | Comp. 2 | chiede conferma per scritture fuori dalla cartella del progetto |
| `segna-modifica` | PostToolUse (Edit/Write) | — | segnaposti "ci sono modifiche" (per il gate e2e) e "STORICO aggiornato" (per chiudi-punto) |
| `gate-definizione` | PreToolUse (Edit/Write) | F1.5 | chiede conferma alla prima modifica di codice senza un punto aperto (una volta per sessione) |
| `chiudi-punto` | PreToolUse (Bash) | F4.11/12 | nega la cancellazione di `.metodo/punto-aperto.md` finché STORICO non è aggiornato |
| `bash-nel-progetto` | PreToolUse (Bash) | Comp. 2 | chiede conferma per comandi shell che scrivono su percorsi assoluti fuori dal progetto |
| `snapshot-dati` | SessionStart | P4/H4 | fotografa l'impronta della cartella dati all'avvio |
| `verifica-dati` | Stop | P4/H4 | blocca la chiusura se la cartella dati non è tornata come prima |
| `gate-e2e` | Stop | H3 | blocca la chiusura se build/test falliscono — parte solo se la sessione ha modificato file, e si spegne a verifica verde |

## Il ciclo di vita meccanico del punto

Il file di stato **`.metodo/punto-aperto.md`** rende obbligati i due passaggi
chiave del flusso:

1. **Apertura (F1.5)** — quando il punto è definito e migrato a task/milestone,
   si crea `.metodo/punto-aperto.md` (titolo + riferimento). Senza questo file,
   la prima modifica al codice chiede conferma (`gate-definizione`; le
   micro-iterazioni di stile si confermano e non viene più chiesto in sessione).
2. **Chiusura (F4.11/12)** — si chiude cancellando il file, ma la cancellazione
   è negata (`chiudi-punto`) finché in sessione non c'è stato un aggiornamento
   di `docs/STORICO.md`: prima l'append dell'esito, poi la chiusura.

## Skill incluse

| Skill | Cosa fa |
|---|---|
| `init-progetto` | l'INIT: wizard moduli, migrazione regole, generazione di `docs/` e `.metodo/config.json` |
| `stesura-guide` | il flusso documentale: distillare dispense in guide operative (con anti-pattern e test a freddo) e fissare le decisioni in ADR leggeri in `docs/adr/` |

## Come si prova senza installarlo

Ogni hook si può lanciare a mano passandogli su stdin lo stesso JSON che gli
manderebbe Claude Code, es.:

```
echo '{"tool_input":{"command":"git commit -m \"wip\""}}' | node hooks/scripts/commit-descrittivo.js
```

## Installazione (solo per-progetto)

> **Importante:** il plugin va installato **localmente, nel singolo progetto**
> dove serve il metodo — **mai** a livello globale/utente. Ogni progetto decide
> se usarlo; l'abilitazione (`enabledPlugins`) vive nel `.claude/settings.json`
> **di quel progetto**, non nelle impostazioni utente.

Il repo è anche un marketplace locale (`.claude-plugin/marketplace.json`).
Dalla cartella del progetto target:

```
/plugin marketplace add <cartella-del-repo-metodo>
/plugin install myworkflow@manuelmarket
/reload-plugins
```

L'abilitazione resta circoscritta a quel progetto: aprendo un altro progetto
senza abilitarlo, il metodo non è attivo.

## Configurazione per progetto

Gli hook leggono `.metodo/config.json` nella radice del progetto (lo genera
l'INIT; va versionato). Campi:

```json
{
  "moduli": { "push-auto": false, "commit-auto": false },
  "verifica": "npm test && npm run build",
  "dati": "dati"
}
```

- `moduli` — le scelte del wizard in forma leggibile dagli hook (`moduli-git`
  usa `push-auto`; campo assente = OFF, il default del metodo);
- `verifica` — comando del gate end-to-end; assente o vuoto = gate spento;
- `dati` — cartella dei dati reali sorvegliata da snapshot/verifica (default `dati`).

## Test degli hook

```
node hooks/tests/run.js
```

Copre le funzioni-decisione di tutti gli script (commit, docs, push, gate,
dati, prefissi) senza bisogno di installare il plugin.
