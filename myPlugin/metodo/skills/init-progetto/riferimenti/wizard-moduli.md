# Wizard — Step 1 (Moduli) e mappa Modulo→Flusso

Niente profilo Leggero/Completo: il minimo di cerimonia lo danno i passi
`[FISSO]` del flusso; il resto sono Moduli che l'utente accende/spegne.

## Step 1 — Moduli (proposti a gruppi; `◄` = default consigliato)

**Integrazione gestione progetto** — al piu' una tra zoho/todoist/github; se
nessuna, `piano-su-file` resta ON:
```
zoho             | off   milestone/task su Zoho Projects (via MCP)
todoist          | off   milestone/task su Todoist (via MCP)
github-issues    | off   milestone/task come issue/milestone GitHub
piano-su-file    | on ◄  fallback: le milestone restano in docs/PIANO.md
```

> **Nota MCP (importante).** Zoho, Todoist e GitHub funzionano tramite un
> **server MCP** che il plugin **non fornisce**: va collegato dall'utente a
> livello di Claude Code (con la sua autenticazione). Quando presenti questo
> gruppo, **avverti l'utente** che queste opzioni sono disponibili *solo se*
> l'MCP corrispondente e' (o verra') collegato. Se l'utente ne sceglie una,
> gestisci la connessione al passo 5 della procedura: verifica se l'MCP e' gia'
> attivo e, se non lo e', **notificagli come collegarlo** e prosegui senza bloccare.
**Comportamento e qualita':**
```
avvertimi        | on ◄  avvisa quando una richiesta rischia di rompere una regola (P6)
guide            | off   consulta i vincoli non-tecnici dal repo guide
unit-test        | off   gli unit test fanno parte del "fatto"
verifica-e2e     | on ◄  verifica reale end-to-end (consigliato)
```
**Esecuzione e strumenti:**
```
agenti-paralleli | off   implementazioni con piu' agenti coordinati (attiva il modello di concorrenza)
commit-auto      | off   commit a fine punto senza attendere richiesta
push-auto        | off   push dopo il commit (implica commit-auto)
figma            | off   sorgente design per le feature UI
```

**Default ("usa i default"):** `avvertimi`, `piano-su-file`, `verifica-e2e` ON;
tutto il resto OFF.

## Step 2 — Mappa Modulo → punti che aggiunge/modifica nel flusso

| Modulo attivo | Cosa aggiunge/modifica |
|---|---|
| `guide` | Fase 1: individua guide applicabili + Fase 3: validazione di conformita' |
| `unit-test` | Fase 2: unit test come parte del "fatto" |
| `verifica-e2e` | Fase 3: verifica end-to-end reale + fallback H7 |
| `agenti-paralleli` | sotto-punto della Fase 2 + attiva il modello di concorrenza |
| `commit-auto` / `push-auto` | Fase 4: commit/push automatici |
| integrazione (zoho/todoist/github) | target della migrazione (Fase 1) e della chiusura (Fase 4) |
| `piano-su-file` | Fase 1 e 4 restano su `docs/PIANO.md` |
| `figma` | sorgente per le feature UI |
| `avvertimi` | nessun nuovo passo: overlay attivo su tutto il flusso (P6) |

Mostra il flusso (`flusso-e-concorrenza.md`) con i `[OPZ]` attivi marcati e fallo
confermare prima di scriverlo in `PROGETTO.md`.
