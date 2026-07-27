# Plugin "metodo"

Implementa in **meccanismi non ignorabili** le regole load-bearing del metodo
di lavoro descritto in `claude_master.md`. Ogni regola critica diventa un
**hook** (un "tornello") che scatta da solo.

## Guardrail attivi

| Hook | Evento | Regola | Cosa fa |
|---|---|---|---|
| `commit-descrittivo` | PreToolUse (git commit) | H5 | blocca i messaggi di commit sotto i 40 caratteri |
| `proteggi-docs` | PreToolUse (Edit/Write) | §3.4 | impedisce ai subagenti di scrivere in `docs/` |
| `snapshot-dati` | SessionStart | P4/H4 | fotografa l'impronta di `dati/` all'avvio |
| `verifica-dati` | Stop | P4/H4 | blocca la chiusura se `dati/` non è tornata come prima |
| `gate-e2e` | Stop | H3 | blocca la chiusura se build/test (da `.metodo/config.json`) falliscono |

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

Il gate end-to-end è spento finché il progetto non dichiara un comando in
`.metodo/config.json`:

```json
{ "verifica": "npm test && npm run build" }
```
