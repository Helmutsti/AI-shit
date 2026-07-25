# Regole da migrare in «Regole del progetto»

Durante l'INIT queste regole finiscono in `docs/PROGETTO.md`, sezione
«Regole del progetto», come **unico elenco editabile**, senza piu' distinzione
tra "generale" e "specifico". Organizzale in sottosezioni (Comportamenti
fondamentali / Regole di processo / Abitudini / Regole locali). Presentale
all'utente: **«tieni tutte cosi'»** (default, migrano invariate) oppure
**«rivedi»** (per ciascuna puo' disattivarla o modificarne il testo).

I **Comportamenti fondamentali** sono **load-bearing**: reggono la sicurezza
multi-agente (§3.4) e la portabilita'. Se l'utente vuole disattivarne o
modificarne uno, **avvertilo delle conseguenze** e procedi solo su sua conferma
esplicita — vale anche con `avvertimi` OFF.

---

## Comportamenti fondamentali (load-bearing)

**1. La verita' durevole vive nei file versionati del progetto.** La conoscenza
di lungo periodo (spec, decisioni, storico, regole locali) sta nei file
versionati del repo (`CLAUDE.md`/`docs/PROGETTO.md`, `docs/DOCUMENTAZIONE.md`,
`docs/STORICO.md`), cosi' chiunque, su qualsiasi macchina, ha tutto leggendo il
repository. Due eccezioni esplicite, entrambe *non* fonti di verita' durevole:
- **Riferimenti esterni in sola lettura** (le guide): documenti riusabili tra
  progetti, che il progetto consulta ma non possiede; tracciati in `PROGETTO.md`
  per repo + commit.
- **Specchio operativo su piattaforma** (Zoho/Todoist/GitHub): solo la worklist
  transitoria; appena un punto e' chiuso l'esito durevole finisce in
  `STORICO.md` dentro il repo. La piattaforma non e' mai l'unica copia.

*Esempio:* una decisione architetturale va scritta in `STORICO.md`/
`DOCUMENTAZIONE.md`, non "ricordata" solo su una scheda Zoho che un clone del
repo non vedrebbe.

**2. Non scrivere fuori dalla cartella del progetto senza autorizzazione.**
Tutto cio' che il progetto produce (codice, documentazione, temporanei) resta
dentro la cartella del progetto; niente scritture su Desktop, home o percorsi di
sistema, salvo richiesta esplicita. Il repo delle guide e' in sola lettura: lo
si clona/aggiorna e consulta, non ci si scrive.

*Esempio:* un file di appunti temporaneo va in una sottocartella del progetto o
nello scratchpad di sessione, non sul Desktop — salvo richiesta esplicita.

**3. Progetto sempre auto-portante.** Deve girare su questa macchina e
proseguire su altre senza dipendere da stato esterno non versionato: niente
percorsi assoluti macchina-specifici cablati, config di esempio inclusa nel
repo, strumenti/binari risolti in modo relativo o per-OS e documentati. Le
dipendenze esterne (repo guide, piattaforma) sono dichiarate e ancorate in
`PROGETTO.md` (URL + commit/tag delle guide; nome portale/progetto).

*Esempio:* i percorsi dei binari si risolvono per-OS (es. da `process.platform`),
non con `C:\Users\...` cablato; il repo guide e' indicato per URL+commit.

**4. Proponi miglioramenti di workflow che noti in autonomia.** Quando osservi
un flusso utile o una regola non ancora scritta, proponila. Se e' specifica del
progetto → «Regole locali» di `PROGETTO.md`. Se e' un vincolo trasversale/
riusabile → una guida (fuori dal progetto: chiedi il repo o fornisci il testo,
non modificarle di iniziativa). Se e' una regola generale di metodo → il master.

*Esempio:* dopo aver coordinato piu' agenti senza conflitti: "vuoi che aggiunga
questa regola di coordinamento? Se e' di metodo va nel master, se e' un vincolo
di settore va in una guida — dimmi dove."

---

## Regole di processo

**P1 — Comandi rapidi di annotazione (prefissi).** Un messaggio che *inizia* con
`bug:`, `miglioramento:`, `punto:` o `forse:` e' un ordine di **sola
annotazione**: registra la voce nel posto giusto (bug → lista bug; `punto:` →
backlog "Da realizzare/definire"; `forse:` → backlog "Forse"; `miglioramento:` →
backlog, gruppo piu' adatto) e conferma cosa/dove. **Nessun codice.** Senza
prefisso valgono le regole normali del flusso.
*Esempio:* "miglioramento: pulsante 'video successivo'" → si aggiunge un punto al
backlog e si risponde "annotato in PIANO → Da realizzare/definire", senza implementare.

**P2 — Bug segnalati in modo vago.** Davanti a un bug generico, prova **prima** a
riprodurlo nell'ambiente reale; se non e' riproducibile, **chiedi di precisare**
invece di correggere alla cieca.
*Esempio:* "il menu sparisce" → prova ad aprirlo in vari punti; se non si
riproduce, chiedi "su quale pagina, in che posizione, con quale larghezza finestra?".

**P3 — I documenti di riferimento (ruoli distinti).** Vedi `template-documenti.md`
per i ruoli di `PROGETTO.md`/`PIANO.md`/`DOCUMENTAZIONE.md`/`STORICO.md` e delle guide.

**P4 — Feature che mutano file reali su disco.** Per operazioni rischiose,
preferisci un **mini-dataset sandbox** isolato; se operi sui dati veri, confronta
un **conteggio/hash prima e dopo** e **pulisci** ogni residuo di test.
*Esempio:* prima di uno script che rinomina i file, contare "358 prima / 358
dopo" e rimuovere ogni file creato per la prova.

**P5 — Man mano che il progetto cresce.** Quando la verifica manuale o gli
elenchi non scalano piu', valuta di attivare `unit-test` (logica pura
soprattutto) e aggiungi un **indice riassuntivo** in cima a `PROGETTO.md`.

**P6 — Avvertimi prima di rompere una regola (toggle `avvertimi`).** Quando
`avvertimi` e' ON, prima di eseguire una richiesta che violerebbe una regola
attiva — un Comportamento fondamentale, un passo `[FISSO]`, una Regola/Abitudine,
o l'agentic-proof (§3.4) — **non procedere in silenzio**:
1. fermati e di' **quale** regola verrebbe violata (per nome/numero);
2. spiega in una riga il **rischio concreto** che previene;
3. proponi l'**alternativa conforme**, se esiste;
4. **lascia decidere l'utente**: procedi solo su conferma esplicita; se procede
   fuori regola, annotalo (in `STORICO.md` se rilevante).
*Nota:* l'avviso sui Comportamenti fondamentali load-bearing vale **anche con
`avvertimi` OFF**.
*Esempio:* l'utente chiede "committa e pusha tutto" ma `push-auto` e' OFF → "Ti
avviso: `push-auto` e' OFF, di default non pusho. Vuoi che pushi comunque, solo
per questa volta?".

---

## Abitudini di lavoro

**H1 — Fattibilita' reale, non presunta.** Prima di progettare, leggi il codice
vero e, se serve, fai uno spike empirico su tool/dati reali, invece di assumere.
*Esempio:* per capire la shape di un JSON, interroga direttamente lo strumento su
un caso reale invece di indovinare i nomi dei campi.

**H2 — Domande di scope mirate.** Chiedi solo sui punti di reale ambiguita', una
domanda per volta, con opzione consigliata e perche' — mai questionari generici.
*Esempio:* "rinominare X in Y" → chiedere "solo il testo visibile o anche
schema/API/endpoint?" con la raccomandazione, prima di toccare codice.

**H3 — Verifica end-to-end reale.** Una feature e' "fatta" solo dopo averla vista
funzionare davvero (build + avvio + interazione), non per sola lettura.
*Esempio:* dopo aver aggiunto una modalita' del player, leggere in pagina il
valore reale (es. `currentSrc`) invece di fidarsi dell'etichetta del pulsante.

**H4 — Pulizia sistematica dei dati di test.** Ogni verifica su dati reali si
chiude riportando tutto allo stato iniziale, confermato con conteggi/hash.

**H5 — Commit descrittivo.** I commit spiegano il **perche'** oltre al cosa.
Commit e push seguono i moduli `commit-auto`/`push-auto`; se OFF, solo su
richiesta esplicita.

**H6 — Coordinamento degli agenti paralleli.** Applica il modello di concorrenza
(`flusso-e-concorrenza.md`): proprieta' esclusiva dei file di codice (mai due
agenti sullo stesso file), 1 task per agente, `docs/` e piattaforma scritti solo
dal coordinatore, guide e spec in sola lettura, un unico merge/commit
consolidato. Se un prompt viola l'agentic-proof, scatta `avvertimi` (P6/§3.4).
*Esempio:* un agente implementa, un altro verifica una parte diversa; il secondo
NON tocca i documenti — riporta al coordinatore, che consolida e (se abilitato) committa.

**H7 — Se non puoi verificare tu, spiega all'utente come farlo.** Quando la
verifica end-to-end non e' eseguibile per un limite dell'ambiente (browser che
non raggiunge `localhost`, nessun accesso a un dispositivo, azione vietata):
**non fingere** e non saltarla in silenzio. Dichiara il limite, spiega i passi
esatti (comandi, cosa aprire, cosa osservare, esito atteso), attendi il riscontro.
Nel frattempo verifica cio' che *e'* alla tua portata (logica/server via CLI,
build), dichiarando cosa hai coperto e cosa resta all'utente.
*Esempio:* il browser automatico non apre `localhost` → avvii il server,
verifichi l'API da shell, e dai all'utente istruzioni precise ("apri
`http://localhost:5173`, metti 2 video in coda, lascia finire il primo → il
secondo deve partire da solo") chiedendo conferma.
