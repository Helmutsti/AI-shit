# CLAUDE_MASTER — seme di configurazione

> Come usare questo file: vedi **`README.md`**.

## 1. Comportamenti fondamentali (base della sicurezza multi-agente e della portabilità)

Valgono da subito. Durante l'INIT **migrano** in `docs/PROGETTO.md` insieme a tutte le altre regole (vedi lo *step di migrazione*, sezione 2) e da lì diventano **«Regole del progetto» editabili dall'utente**, come le altre — nessuna distinzione tra "generale" e "specifico". Portano però una **nota aggiuntiva**: sono **load-bearing**, cioè reggono la proprietà **agentic-proof** (sezione 3.4) e l'**auto-portabilità** del progetto. Disattivarli o modificarli è una **scelta dell'utente** (resta l'autorità), ma Claude deve **avvertire delle conseguenze prima di procedere**. Per questo, di default, nella migrazione restano **attivi e invariati**.

1. **La verità durevole vive nei file versionati del progetto.** La conoscenza di lungo periodo (spec, decisioni, storico, regole locali) sta nei **file versionati del repo** (`CLAUDE.md`/`docs/PROGETTO.md`, `docs/DOCUMENTAZIONE.md`, `docs/STORICO.md`), così chiunque, su qualsiasi macchina, ha tutto leggendo il repository. Sono ammesse **due eccezioni esplicite**, entrambe *non* fonti di verità durevole:
   - **Riferimenti esterni in sola lettura** (le **guide**, vedi INIT): documenti riusabili tra progetti, che il progetto *consulta* ma non possiede. Restano tracciabili perché `docs/PROGETTO.md` registra **quale repo guide e quale commit** usa.
   - **Specchio operativo su piattaforma** (Zoho/Todoist/GitHub, se attiva): tiene solo la **worklist transitoria** (task/milestone in corso). Appena un punto è chiuso, l'esito durevole finisce in `docs/STORICO.md` **dentro il repo**. La piattaforma non è mai l'unica copia di una decisione.
   *Esempio:* una decisione architetturale va scritta in `docs/STORICO.md`/`docs/DOCUMENTAZIONE.md`, non "ricordata" solo su una scheda Zoho che un clone del repo non vedrebbe.

2. **Non scrivere fuori dalla cartella del progetto senza autorizzazione.** Tutti i file che il progetto *produce* (codice, documentazione, temporanei) restano **dentro** la cartella del progetto; niente scritture su Desktop, home utente o percorsi di sistema, salvo richiesta esplicita. Il repo delle guide è **sola lettura**: lo si clona/aggiorna e consulta, non ci si scrive dal progetto.
   *Esempio:* un file di appunti temporaneo va in una sottocartella del progetto o nello scratchpad di sessione, non sul Desktop — salvo richiesta esplicita (com'è avvenuto per questo file master).

3. **Progetto sempre auto-portante.** Deve poter girare su questa macchina e proseguire su altre senza dipendere da stato esterno non versionato: niente percorsi assoluti macchina-specifici cablati, config di esempio inclusa nel repo, strumenti/binari referenziati in modo relativo (o risolti per OS) e documentati. Le dipendenze esterne (repo guide, piattaforma) sono **dichiarate e ancorate** in `docs/PROGETTO.md` (URL + commit/tag delle guide; nome portale/progetto della piattaforma), così un altro PC le ricostruisce.
   *Esempio:* i percorsi dei binari si risolvono per-OS (es. scelti da `process.platform`), non con `C:\Users\...` cablato; il repo guide è indicato per URL+commit, non per path locale di questo PC.

4. **Proponi miglioramenti di workflow che noti in autonomia.** Quando osservi un flusso utile, un'abitudine ricorrente o una regola non ancora scritta, **proponila**. Se è **specifica del progetto**, offri di aggiungerla alle *Regole del progetto* (parte *Regole locali*) di `docs/PROGETTO.md`. Se è un **vincolo trasversale/riusabile** (normativa, compliance, regola di business), proponi di aggiungerla alle **guide** — che vivono **fuori** dal progetto (vale il comportamento 2): non modificarle di tua iniziativa, chiedi il repo/percorso o fornisci il testo pronto. Se è una regola **generale di metodo**, va nel **master**, anch'esso fuori dal progetto: chiedi il path di `claude_master.md` o fornisci il blocco pronto.
   *Esempio:* dopo aver coordinato più agenti in parallelo senza conflitti, proporre: "vuoi che aggiunga questa regola di coordinamento? Se è di metodo va nel master, se è un vincolo di settore va in una guida — dimmi dove."

---

## 2. Come funziona l'INIT (istruzioni per Claude — questa sezione descrive il *procedimento*, non i contenuti)

Questa sezione dice **come** eseguire l'INIT. I **contenuti** (flusso di lavoro, wizard, regole di dettaglio) stanno nella sezione 3, e sono ciò che l'INIT copia/istanzia nei documenti generati.

Esegui l'INIT **solo alla prima esecuzione** in un progetto (finché `CLAUDE.md` contiene ancora questa sezione). Procedimento:
0. **Scelta della lingua.** Chiedere all'utente se usare l'IT o EN.
1. **Migrazione delle regole.** Presenta all'utente **tutte le regole generali** di questo master — Comportamenti fondamentali (sezione 1), Regole di processo e Abitudini (sezione 4) — spiegando che, finito il wizard, **diventano tutte «Regole del progetto»**: un unico corpo editabile dentro `docs/PROGETTO.md`, senza più distinzione tra "generale" e "specifico". L'utente sceglie:
   - **«tieni tutte così»** (default) → migrano invariate;
   - **rivedi** → per ciascuna può disattivarla o modificarne il testo.
   I **Comportamenti fondamentali** migrano con le altre **ma** con la nota **load-bearing**: se l'utente chiede di disattivarne/modificarne uno, **avvertilo** che regge la sicurezza multi-agente (3.4) e la portabilità, e procedi solo su sua conferma esplicita.

2. **Regole locali fin da subito.** Chiarisci che la sezione **`Regole del progetto`** nasce **già popolata** con le regole migrate, e che l'utente vi aggiungerà man mano i vincoli locali (convenzioni, priorità del cliente) **nello stesso elenco**. Non serve una sezione separata: dopo la migrazione "tutte le regole sono di progetto".

3. **Esegui il wizard di configurazione** (2 step, sezione 3.2): **Step 1 — Moduli**, proponi i moduli **a gruppi**, ciascuno con **default consigliato + perché**, e l'utente li accende/spegne; poi **Step 2 — Flusso**, dove **mostri il ciclo di vita assemblato con i punti aggiunti dai moduli attivi** e lo fai confermare. Se l'utente dice "usa i default", applica i default e mostra comunque il flusso risultante.

4. **Se `guide` = ON**: chiedi **URL del repo git delle guide** e (opzionale) il **commit/tag** a cui ancorarti; clonalo/aggiornalo in sola lettura, leggi il suo **`SOMMARIO.md`**, mostra l'elenco delle guide disponibili e fatti dire **quali attivare**. Registra in `docs/PROGETTO.md`: URL + commit + elenco guide attive.

5. **Se una piattaforma** (`zoho`/`todoist`/`github-issues`) **= ON**: verifica che l'integrazione sia raggiungibile, chiedi **dove** creare i task (portale/progetto/repo di destinazione) e registralo in `docs/PROGETTO.md`. Se nessuna piattaforma è attiva, assicurati che **`piano-su-file` = ON** (le milestone restano in `PIANO.md`).

6. **Genera `docs/`** (crea la cartella) con **`PROGETTO.md`** e i seed vuoti di **`PIANO.md`**, **`DOCUMENTAZIONE.md`**, **`STORICO.md`**. La struttura di `PROGETTO.md` è nella sezione 3.3.

7. **Riscrivi `CLAUDE.md`** (resta in radice) perché contenga **solo** un header e la delega `@docs/PROGETTO.md`, rimuovendo comportamenti, flusso, regole e questa sezione INIT (ora vivono in `docs/PROGETTO.md`).

8. **Conferma** cosa hai creato, la configurazione scelta, e che l'INIT non ripartirà più (salvo l'utente scriva `init` / "rivedi la configurazione"). Ricorda che le *Regole del progetto* nascono già popolate con le regole migrate e che la loro parte *Regole locali* è sua da arricchire man mano.

---

## 3. INIT — contenuto (flusso, wizard, regole)

### 3.1 — Flusso unico di lavoro

Un solo ciclo di vita per ogni punto/feature. I passi **[FISSO]** valgono sempre; i passi **[OPZ: *nome*]** si attivano dal wizard (3.2). Le **micro-iterazioni di stile** (un colore, un allineamento, un testo) sono **esenti** da tutto il ciclo: si applicano direttamente.

**Fase 0 — Raccolta** *(sempre)*
- L'idea entra in `docs/PIANO.md` (blocco appunti) o via **comando rapido** `bug:` / `punto:` / `forse:` / `miglioramento:` (sola annotazione, vedi P1). Nessun codice in questa fase.

**Fase 1 — Definizione** *(prima di scrivere codice)*
1. **[FISSO]** Analisi di fattibilità **reale**: leggi il codice vero, fai uno spike empirico se serve (vedi H1). **Consulta anche la documentazione interna**: `DOCUMENTAZIONE.md` (funzionamenti controintuitivi, decisioni negative) e gli ADR pertinenti — per non riproporre soluzioni già deliberatamente scartate.
2. **[FISSO]** Domande di scope mirate: una per volta, con opzione consigliata + perché (vedi H2).
3. **[OPZ: guide]** Individua **quali guide** toccano il punto (consulta il `SOMMARIO.md` del repo guide) ed elenca i **vincoli** da rispettare.
4. **[FISSO]** Descrizione "a dovere" del punto: cosa, operatività dettagliata, **criteri di "fatto"**.
5. **[FISSO — migrazione]**
   - se **piattaforma ON** → crea il task/milestone **sulla piattaforma**; il punto **esce da `PIANO.md`**;
   - se **`piano-su-file` ON** → il punto diventa milestone dentro `docs/PIANO.md`.
   - 🔒 **Nessuna implementazione sostanziale prima di questo passo.**

**Fase 2 — Implementazione**
6. **[FISSO]** Implementazione.
   - **[OPZ: agenti-paralleli]** coordinamento anti-conflitto: file **disgiunti** per agente; lo **stato condiviso** (documenti, piattaforma) lo scrive **solo il coordinatore** (vedi H6).
7. **[OPZ: unit-test]** unit test come parte del "fatto", insieme all'implementazione (logica pura soprattutto; integrazione dove ha senso).

**Fase 3 — Verifica**
8. **[OPZ: verifica-e2e]** verifica end-to-end reale (build + avvio + browser/HMR), non per sola lettura (vedi H3). Se non puoi eseguirla tu per un limite dell'ambiente → **fallback**: dichiara il limite, spiega all'utente i passi esatti, attendi il suo riscontro (vedi H7).
9. **[OPZ: guide]** **validazione di conformità**: verifica l'implementazione **contro le guide** individuate al passo 3, con checklist esplicita dei vincoli.
10. **[FISSO se toccati dati reali]** pulizia dei dati di test, con **conteggio/hash prima-dopo** e rimozione di ogni residuo (vedi P4/H4).

**Fase 4 — Chiusura**
11. **[FISSO]** chiusura del task/milestone (sulla piattaforma o in `docs/PIANO.md`): spunta + pulizia backlog.
12. **[FISSO]** aggiornamento documenti:
    - **`docs/STORICO.md`** — **sempre**: append dell'esito integrale (implementazione, scoperte impreviste, bug risolti).
    - **`docs/DOCUMENTAZIONE.md`** — **solo se** il punto cambia il presente (nuova meccanica controintuitiva, decisione core, cosa decisa-e-non-fatta da ricordare).
13. **[OPZ: commit-auto]** commit descrittivo (spiega il *perché*, non solo il *cosa*); altrimenti commit **solo su richiesta**. **[OPZ: push-auto]** push (implica `commit-auto`); altrimenti **mai** per default.

### 3.2 — Wizard di configurazione (2 step, in quest'ordine)

**Non c'è più il profilo Leggero/Completo**: il minimo di cerimonia lo danno i passi `[FISSO]` del flusso; tutto il resto sono **Moduli** che l'utente accende/spegne. Il wizard mostra **prima i Moduli** (Step 1) e **poi il flusso risultante** (Step 2).

#### Step 1 — Moduli *(punti isolati dal workflow: capacità e comportamenti indipendenti dal ciclo di vita; alcuni, una volta accesi, aggiungono punti al flusso — vedi Step 2)*

*Integrazione gestione progetto* — al più una tra zoho/todoist/github-issues; se nessuna, `piano-su-file` resta ON:
```
zoho             | off   milestone/task su Zoho Projects (via MCP)
todoist          | off   milestone/task su Todoist (via MCP)
github-issues    | off   milestone/task come issue/milestone GitHub
piano-su-file    | on ◄  fallback: le milestone restano in docs/PIANO.md
```
*Comportamento e qualità:*
```
avvertimi        | on ◄  avvisa quando una richiesta rischia di rompere una regola attiva (P6)
guide            | off   consulta i vincoli non-tecnici dal repo guide
unit-test        | off   gli unit test fanno parte del "fatto"
verifica-e2e     | on ◄  verifica reale end-to-end (consigliato)
```
*Esecuzione e strumenti:*
```
agenti-paralleli | off   implementazioni con più agenti coordinati (attiva il modello 3.4)
commit-auto      | off   commit a fine punto senza attendere richiesta
push-auto        | off   push dopo il commit (implica commit-auto)
figma            | off   sorgente design per le feature UI
```

*Default ("usa i default"):* `avvertimi` ON, `piano-su-file` ON, `verifica-e2e` ON; tutto il resto OFF.

#### Step 2 — Flusso risultante *(mostra il ciclo di vita 3.1 assemblato con i punti aggiunti dai Moduli attivi, e fallo confermare)*

Presenta il flusso `[FISSO]` (sezione 3.1) con i **punti aggiuntivi** iniettati dai Moduli accesi allo Step 1. Mappa **modulo → punti che aggiunge/modifica**:

| Modulo attivo | Cosa aggiunge/modifica nel flusso |
|---|---|
| `guide` | Fase 1.3 (individua guide applicabili) + Fase 3.9 (validazione di conformità) |
| `unit-test` | Fase 2.7 (unit test come parte del "fatto") |
| `verifica-e2e` | Fase 3.8 (verifica end-to-end reale + fallback H7) |
| `agenti-paralleli` | sotto-punto della Fase 2.6 + attiva il modello di concorrenza 3.4 |
| `commit-auto` / `push-auto` | Fase 4.13 (commit/push automatici) |
| integrazione (zoho/todoist/github) | definisce il target della migrazione (Fase 1.5) e della chiusura (Fase 4.11) |
| `piano-su-file` | Fase 1.5 e 4.11 restano su `docs/PIANO.md` |
| `figma` | sorgente per le feature UI |
| `avvertimi` | nessun nuovo passo: **overlay attivo su tutto il flusso** (guardrail P6) |

Confermato il flusso, l'INIT lo scrive in `docs/PROGETTO.md` (sezione `## Flusso di lavoro`) con i `[OPZ]` attivi marcati.

### 3.3 — Struttura di `docs/PROGETTO.md` (documento generato)

Genera `docs/PROGETTO.md` con, in quest'ordine:
1. `## Configurazione attiva` — i **Moduli attivi** scelti nel wizard: piattaforma scelta (+ portale/progetto di destinazione) e gli altri moduli ON/OFF, e — se `guide` ON — **URL del repo guide + commit ancorato + elenco guide attive**.
2. `## Flusso di lavoro` — copiato dalla sezione 3.1, con i `[OPZ]` attivi marcati.
3. `## Regole del progetto` — **il corpo unico delle regole**, prodotto dallo *step di migrazione* (sezione 2). È un unico elenco editabile; per leggibilità organizzalo in sottosezioni:
   - *Comportamenti fondamentali* (dalla sezione 1) — marcati **load-bearing**;
   - *Regole di processo* e *Abitudini di lavoro* (dalla sezione 4);
   - *Regole locali* — inizialmente **vuota**, cresce con i vincoli specifici del progetto (convenzioni, priorità del cliente), con la **stessa dignità** delle altre.
   Nessuna sezione separata "Comportamenti" / "Regole di processo": dopo la migrazione **tutto vive qui**.
4. `## Documenti di riferimento` — la mappa dei documenti (vedi P3).

### 3.4 — Modello di concorrenza e sicurezza multi-agente (agentic-proof)

Si applica quando `agenti-paralleli` è ON, a maggior ragione con i **git worktree**. Regola d'oro: **il worktree isola il filesystem, non il merge finale né lo stato esterno.** Ogni agente ha la sua copia dei file, ma (1) le copie riconvergono al merge e (2) la piattaforma dei task è una risorsa condivisa che nessun worktree isola. La sicurezza non nasce dal worktree: nasce dal rispetto di **tre livelli di proprietà della scrittura**.

**I tre livelli di proprietà della scrittura**
- **Read-only condiviso** — le **guide** e `docs/PROGETTO.md` (la spec): tutti gli agenti leggono, **nessuno scrive** durante il lavoro parallelo. *Sicuro per costruzione.*
- **Privato dell'agente** — i **file di codice assegnati** a quell'agente, il suo **worktree**, il suo **singolo task** sulla piattaforma: proprietà **esclusiva**, nessuna sovrapposizione con altri agenti. *Sicuro per partizione.*
- **Esclusivo del coordinatore** — **tutti i file `docs/` mutabili** (`PIANO.md`, `STORICO.md`, `DOCUMENTAZIONE.md`) e le **transizioni cross-task**: li scrive **solo il coordinatore**, in serie, **dopo** che gli agenti hanno riportato i risultati come dati. *Sicuro per serializzazione.*

**Mappa dei rischi e mitigazioni**

| Stato condiviso | Isolato dal worktree? | Rischio | Mitigazione |
|---|---|---|---|
| File di codice | Sì (copia fisica) | conflitto se 2 agenti sullo stesso file | partizione **disgiunta**: 1 file → 1 solo agente proprietario |
| `docs/` mutabili | Solo fino al merge | conflitti/append concorrenti al merge | scrittura **solo dal coordinatore**, dopo il report degli agenti |
| `PROGETTO.md` + guide | — | lettura concorrente = nessun problema | **read-only** durante il parallelo |
| Task piattaforma | ❌ No (stato esterno) | 2 agenti sullo stesso task → race condition | **1 task per agente**; transizioni cross-task solo dal coordinatore |
| Branch/commit git | worktree = branch separato | — | **un solo merge/commit consolidato** dal coordinatore |

**Regole operative (worktree)**
1. Prima di partire, il coordinatore **decompone** il lavoro in unità con **file disgiunti** e crea **un task per agente**.
2. Ogni agente lavora **solo** nei propri file/worktree/task; **non tocca** `docs/`, la spec o le guide (se non in lettura), né i task altrui.
3. Gli agenti **riportano** i risultati al coordinatore come **dati** (non scrivono i documenti condivisi).
4. Il coordinatore **consolida**: aggiorna `docs/`, esegue il **merge unico** e (se abilitato) il **commit unico**.

**Guardrail — quando un prompt viola la condizione agentic-proof**
Se una richiesta rompe uno di questi invarianti — es. "fai modificare a due agenti lo stesso file", "ogni agente aggiorni lo `STORICO`", "lavorate tutti sullo stesso task", "l'agente scriva la spec o una guida" — **non eseguire in silenzio**. Se `avvertimi` è ON (vedi P6), applica il protocollo di avviso: dichiara **quale** condizione viene violata, spiega il **rischio concreto** (conflitto al merge, corruzione di `docs/`, race sul task, perdita di tracciabilità), proponi l'**alternativa sicura** (ripartizione dei file, scrittura via coordinatore, un task per agente…) e **lascia decidere l'utente** — procedi come chiesto solo su sua conferma esplicita, annotando che si opera fuori dalla condizione agentic-proof.

---

## 4. Regole di processo e Abitudini (migrano, rivedibili, nelle «Regole del progetto» — vedi step di migrazione, sezione 2)

### Regole di processo

#### P1 — Comandi rapidi di annotazione (prefissi)
Un messaggio che **inizia** con `bug:`, `miglioramento:`, `punto:` o `forse:` è un ordine di **sola annotazione**: registra la voce nel posto giusto (bug → lista bug; `punto:` → backlog "Da realizzare/definire"; `forse:` → backlog "Forse"; `miglioramento:` → backlog, gruppo più adatto) e conferma cosa/dove. **Nessun codice.** Senza prefisso valgono le regole normali del flusso.
*Esempio:* "miglioramento: pulsante 'video successivo'" → si aggiunge un punto al backlog e si risponde "annotato in PIANO → Da realizzare/definire", senza implementare.

#### P2 — Bug segnalati in modo vago
Davanti a un bug descritto genericamente, prova **prima** a riprodurlo nell'ambiente reale; se non è riproducibile, **chiedi di precisare** invece di correggere alla cieca.
*Esempio:* "il menu sparisce" → prova ad aprirlo in vari punti; se non si riproduce, chiedi "su quale pagina, in che posizione, con quale larghezza finestra?".

#### P3 — I documenti di riferimento (ruoli distinti)
`CLAUDE.md` resta in radice (entry point) e delega con `@docs/PROGETTO.md`. I documenti di lavoro vivono in `docs/` con ruoli netti:
- **`PROGETTO.md`** — la **specifica**: configurazione attiva, flusso, e le **Regole del progetto** (comportamenti fondamentali load-bearing + regole di processo/abitudini + regole locali), oltre a contesto/architettura e convenzioni. Si aggiorna solo quando cambia un requisito o una regola.
- **`PIANO.md`** — il **futuro grezzo**: blocco appunti delle idee e backlog a tre elenchi — **"Da realizzare/definire"** (mature), **"Forse"** (incerte), **"Scartati"** (bocciate ma conservate con motivazione e scoperte utili) — più la lista **"Bug noti da correggere"**. Quando un punto è descritto "a dovere" **migra** sulla piattaforma (o diventa milestone nel file, se `piano-su-file`) e **si rimuove** da qui: la lista resta corta.
- **`DOCUMENTAZIONE.md`** — il **presente**: stato del progetto in forma sintetica e viva, per capire *com'è e perché* senza scorrere tutta la storia. Contiene il core (cos'è, architettura in breve), le decisioni attuali valide, i **funzionamenti controintuitivi** da ricordare, e le **decisioni "negative"** (cose deliberatamente NON fatte, col perché). **Non cresce all'infinito**: si sfoltisce per riflettere lo stato corrente.
- **`STORICO.md`** — la **memoria di lungo periodo, append-only**: log completo di implementazioni e decisioni (milestone completate, scoperte impreviste, limiti di tool, vicoli ciechi, bug risolti). `DOCUMENTAZIONE.md` ne è il distillato attuale.
- **Guide (repo esterno, sola lettura)** — vincoli **trasversali e non-tecnici** riusabili tra progetti (normative, compliance, regole di business, fiscale, privacy, accessibilità legale). Ogni guida è un documento con dominio + vincoli verificabili. Un **`SOMMARIO.md`** nel repo guide descrive ogni file (dominio, sintesi, quando si applica) per orientare l'agente. Attive solo se `guide` = ON; ancorate per URL+commit in `PROGETTO.md`.

#### P4 — Feature che mutano file reali su disco
Per operazioni rischiose che scrivono file reali, preferisci un **mini-dataset sandbox** isolato; se operi sui dati veri, confronta un **conteggio/hash prima e dopo** e **pulisci** ogni residuo di test.
*Esempio:* prima di uno script che rinomina i file, contare "358 prima / 358 dopo" e rimuovere ogni file creato per la prova.

#### P5 — Man mano che il progetto cresce
Quando la verifica manuale o gli elenchi non scalano più, valuta di attivare `unit-test` (per la logica pura soprattutto) e aggiungi un **indice riassuntivo** in cima a `PROGETTO.md`.

#### P6 — Avvertimi prima di rompere una regola (toggle `avvertimi`)
Quando `avvertimi` è ON, prima di eseguire una richiesta che **violerebbe una regola attiva** di questa guida — un Comportamento fondamentale, un passo `[FISSO]` del flusso, una Regola di processo/Abitudine, o la condizione agentic-proof (3.4) — **non procedere in silenzio**. Applica il protocollo:
1. **fermati** e dì **quale** regola verrebbe violata (citala per nome/numero);
2. spiega in una riga il **rischio concreto** che quella regola previene;
3. proponi l'**alternativa conforme**, se esiste;
4. **lascia la decisione all'utente**: procedi come chiesto **solo su sua conferma esplicita** (l'utente resta l'autorità). Se procede fuori regola, **annotalo** (in `STORICO.md` se rilevante) così resta traccia della deroga.
*Nota:* l'avviso sui Comportamenti fondamentali **load-bearing** (quando si chiede di disattivarli/modificarli) resta attivo **anche con `avvertimi` OFF** — è la nota aggiuntiva della sezione 1, sempre valida.
*Esempio:* l'utente chiede "committa e pusha tutto" ma `push-auto` è OFF → "Ti avviso: `push-auto` è OFF, di default non pusho. Vuoi che pushi comunque, solo per questa volta?".

### Abitudini di lavoro

#### H1 — Fattibilità reale, non presunta
Prima di progettare, **leggi il codice vero** e, se serve, fai uno **spike empirico** su tool/dati reali, invece di assumere come funzionano.
*Esempio:* per capire la shape di un JSON, interrogare direttamente lo strumento su un caso reale invece di indovinare i nomi dei campi.

#### H2 — Domande di scope mirate
Chiedi **solo** sui punti di reale ambiguità, una domanda per volta, con **opzione consigliata e perché** — mai questionari generici.
*Esempio:* "rinominare X in Y" → chiedere "solo il testo visibile o anche schema/API/endpoint?" con la raccomandazione, prima di toccare codice.

#### H3 — Verifica end-to-end reale
Una feature è "fatta" solo dopo averla vista funzionare **davvero** (build + avvio + interazione), non per sola lettura; quando un'etichetta o un log non bastano, leggi lo stato reale.
*Esempio:* dopo aver aggiunto una modalità del player, leggere in pagina il valore reale (es. `currentSrc`) invece di fidarsi dell'etichetta del pulsante.

#### H4 — Pulizia sistematica dei dati di test
Ogni verifica su dati reali si chiude riportando tutto allo **stato iniziale**, confermato con conteggi/hash.

#### H5 — Commit descrittivo
I commit spiegano il **perché** oltre al *cosa*. Commit e push seguono i moduli `commit-auto`/`push-auto`; se OFF, si fanno **solo su richiesta esplicita**.

#### H6 — Coordinamento degli agenti paralleli
Applica il **modello di concorrenza (sezione 3.4)**: proprietà **esclusiva** dei file di codice (mai due agenti sullo stesso file), **1 task per agente**, `docs/` e piattaforma scritti **solo dal coordinatore**, guide e spec in **sola lettura**, **un unico merge/commit** consolidato a fine lavoro. Se un prompt viola l'agentic-proof, scatta il guardrail `avvertimi` (P6 / 3.4): avvisa e lascia decidere l'utente.
*Esempio:* un agente implementa, un altro verifica una parte diversa; il secondo NON tocca i documenti — riporta al coordinatore, che consolida e (se abilitato) committa.

#### H7 — Se non puoi verificare tu, spiega all'utente come farlo
Quando la verifica end-to-end (H3) **non è eseguibile da te** per un limite dell'ambiente (browser che non raggiunge `localhost`, nessun accesso a un dispositivo/servizio, azione vietata come inserire credenziali): **non fingere** di averla fatta né saltarla in silenzio. **Dichiara il limite** e **spiega i passi esatti** (comandi, cosa aprire, cosa osservare, esito atteso), poi **attendi il riscontro** prima di dire "fatto". Nel frattempo verifica tutto ciò che *è* alla tua portata (logica core/server via CLI/`curl`, build), dichiarando cosa hai coperto e cosa resta all'utente.
*Esempio:* il browser automatico non apre `localhost` → avvii comunque il server, verifichi l'API da shell, e dai all'utente istruzioni precise ("apri `http://localhost:5173`, metti 2 video in coda, lascia finire il primo → il secondo deve partire da solo") chiedendo conferma.

#### H8 — Delega ai subagenti, main agent libero
Lo strumento subagent va **sfruttato al massimo**: ogni task delegabile — ricerche nel codice, implementazioni circoscritte, verifiche, raccolte dati — va affidato a un subagente, così il **main agent resta libero** di coordinare e ricevere nuovi prompt invece di consumare il proprio contesto sull'esecuzione. La delega però si decide in **due tempi**: prima **valuta con attenzione quale modello** usare per il subagente — è lì che si risparmiano tempo e token:
- **modello leggero** (es. Haiku): ricerche, verifiche meccaniche, raccolta dati, task ripetitivi con istruzioni chiare;
- **modello intermedio** (es. Sonnet): implementazioni standard su perimetro ben definito;
- **modello principale**: solo per ragionamento complesso, architettura, task ambigui — o si tiene sul main agent.

Limiti: **non** delegare quando spiegare il contesto costa più del lavoro (micro-modifiche puntuali) e rispetta sempre il modello di concorrenza (sezione 3.4): file disgiunti, `docs/` e piattaforma scritti solo dal coordinatore, report come dati.
*Esempio:* "cerca tutti gli usi deprecati dell'API X e correggili" → un subagente leggero fa la ricognizione, un subagente intermedio applica le correzioni sui file individuati; il main agent consolida i report e resta disponibile.

#### H9 — Risposta proporzionale all'esito
La lunghezza della risposta si misura sull'**informazione nuova per l'utente**, non sul lavoro svolto. Per un esito atteso e verificato basta il **formato minimo: cosa + dove + prova** (una riga, verificabile). Si scala oltre **solo** se c'è qualcosa che l'utente non sa già: scoperte impreviste, una decisione da prendere, una verifica fallita, una deroga alle regole. Vietati: riepiloghi di ciò che era già noto, ripetizione del piano appena eseguito, sezioni/tabelle per esiti semplici. Mai "fatto" da solo: senza *dove* e *prova* non è verificabile. Un messaggio che inizia con **`breve:`** chiede esplicitamente il formato minimo (comando rapido, come i prefissi P1).
*Esempio:* dopo un'implementazione riuscita → "Fatto: `rimuoviTodo` in `src/app.js` + test, `node test.js` verde." — niente riepilogo del piano, niente sezioni.
