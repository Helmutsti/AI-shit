# Flusso di lavoro e modello di concorrenza

## Flusso unico di lavoro (§3.1)

Un solo ciclo di vita per ogni punto/feature. I passi `[FISSO]` valgono sempre;
i passi `[OPZ: nome]` si attivano dal wizard. Le **micro-iterazioni di stile**
(un colore, un allineamento, un testo) sono **esenti** da tutto il ciclo: si
applicano direttamente.

**Fase 0 — Raccolta** *(sempre)*
- L'idea entra in `docs/PIANO.md` (blocco appunti) o via comando rapido `bug:` /
  `punto:` / `forse:` / `miglioramento:` (sola annotazione, vedi P1). Nessun
  codice in questa fase.

**Fase 1 — Definizione** *(prima di scrivere codice)*
1. `[FISSO]` Analisi di fattibilita' **reale**: leggi il codice vero, spike empirico se serve (H1).
2. `[FISSO]` Domande di scope mirate: una per volta, opzione consigliata + perche' (H2).
3. `[OPZ: guide]` Individua **quali guide** toccano il punto (dal `SOMMARIO.md` del repo guide) ed elenca i **vincoli**.
4. `[FISSO]` Descrizione "a dovere": cosa, operativita' dettagliata, **criteri di "fatto"**.
5. `[FISSO — migrazione]`
   - se **piattaforma ON** → crea il task/milestone sulla piattaforma; il punto **esce da `PIANO.md`**;
   - se **`piano-su-file` ON** → il punto diventa milestone in `docs/PIANO.md`.
   - 🔒 **Nessuna implementazione sostanziale prima di questo passo.**

**Fase 2 — Implementazione**
6. `[FISSO]` Implementazione.
   - `[OPZ: agenti-paralleli]` coordinamento anti-conflitto: file **disgiunti** per agente; lo stato condiviso (documenti, piattaforma) lo scrive **solo il coordinatore** (H6).
7. `[OPZ: unit-test]` unit test come parte del "fatto", insieme all'implementazione (logica pura soprattutto; integrazione dove ha senso).

**Fase 3 — Verifica**
8. `[OPZ: verifica-e2e]` verifica end-to-end reale (build + avvio + browser/HMR), non per sola lettura (H3). Se non puoi eseguirla → **fallback H7**: dichiara il limite, spiega i passi, attendi il riscontro.
9. `[OPZ: guide]` **validazione di conformita'**: verifica l'implementazione contro le guide del passo 3, con checklist esplicita dei vincoli.
10. `[FISSO se toccati dati reali]` pulizia dei dati di test, con **conteggio/hash prima-dopo** e rimozione di ogni residuo (P4/H4).

**Fase 4 — Chiusura**
11. `[FISSO]` chiusura del task/milestone (piattaforma o `PIANO.md`): spunta + pulizia backlog.
12. `[FISSO]` aggiornamento documenti:
    - **`STORICO.md`** — **sempre**: append dell'esito integrale (implementazione, scoperte impreviste, bug risolti).
    - **`DOCUMENTAZIONE.md`** — **solo se** il punto cambia il presente (nuova meccanica controintuitiva, decisione core, cosa decisa-e-non-fatta da ricordare).
13. `[OPZ: commit-auto]` commit descrittivo (spiega il *perche'*); altrimenti commit **solo su richiesta**. `[OPZ: push-auto]` push (implica `commit-auto`); altrimenti **mai** per default.

---

## Modello di concorrenza e sicurezza multi-agente (§3.4 — agentic-proof)

Si applica quando `agenti-paralleli` e' ON, a maggior ragione con i **git
worktree**. Regola d'oro: **il worktree isola il filesystem, non il merge finale
ne' lo stato esterno.** Ogni agente ha la sua copia dei file, ma (1) le copie
riconvergono al merge e (2) la piattaforma dei task e' una risorsa condivisa che
nessun worktree isola. La sicurezza nasce dal rispetto di **tre livelli di
proprieta' della scrittura**.

**I tre livelli di proprieta' della scrittura**
- **Read-only condiviso** — le guide e `PROGETTO.md` (la spec): tutti leggono,
  nessuno scrive durante il parallelo. *Sicuro per costruzione.*
- **Privato dell'agente** — i file di codice assegnati, il suo worktree, il suo
  singolo task sulla piattaforma: proprieta' esclusiva. *Sicuro per partizione.*
- **Esclusivo del coordinatore** — tutti i file `docs/` mutabili (`PIANO.md`,
  `STORICO.md`, `DOCUMENTAZIONE.md`) e le transizioni cross-task: li scrive solo
  il coordinatore, in serie, **dopo** il report degli agenti. *Sicuro per serializzazione.*

**Mappa dei rischi e mitigazioni**

| Stato condiviso | Isolato dal worktree? | Rischio | Mitigazione |
|---|---|---|---|
| File di codice | Si' (copia fisica) | conflitto se 2 agenti sullo stesso file | partizione disgiunta: 1 file → 1 solo proprietario |
| `docs/` mutabili | Solo fino al merge | append concorrenti al merge | scrittura solo dal coordinatore, dopo il report |
| `PROGETTO.md` + guide | — | lettura concorrente = nessun problema | read-only durante il parallelo |
| Task piattaforma | No (stato esterno) | 2 agenti sullo stesso task → race | 1 task per agente; transizioni cross-task solo dal coordinatore |
| Branch/commit git | worktree = branch separato | — | un solo merge/commit consolidato dal coordinatore |

**Regole operative (worktree)**
1. Prima di partire, il coordinatore **decompone** il lavoro in unita' con file disgiunti e crea **un task per agente**.
2. Ogni agente lavora **solo** nei propri file/worktree/task; non tocca `docs/`, la spec o le guide (se non in lettura), ne' i task altrui.
3. Gli agenti **riportano** i risultati al coordinatore come **dati** (non scrivono i documenti condivisi).
4. Il coordinatore **consolida**: aggiorna `docs/`, esegue il **merge unico** e (se abilitato) il **commit unico**.

**Guardrail — quando un prompt viola l'agentic-proof**
Se una richiesta rompe un invariante — es. "fai modificare a due agenti lo stesso
file", "ogni agente aggiorni lo `STORICO`", "lavorate tutti sullo stesso task",
"l'agente scriva la spec o una guida" — **non eseguire in silenzio**. Se
`avvertimi` e' ON (P6): dichiara quale condizione viene violata, spiega il rischio
concreto (conflitto al merge, corruzione di `docs/`, race sul task, perdita di
tracciabilita'), proponi l'alternativa sicura e lascia decidere l'utente;
procedi solo su conferma, annotando che si opera fuori dalla condizione
agentic-proof. Questo invariante e' anche protetto dall'hook `proteggi-docs`.
