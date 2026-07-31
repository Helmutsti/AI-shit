# Costruire contesto e ragionare con Claude: guida alle fasi 1 e 2 del workflow

Questo documento riepiloga i principi e le pratiche per le prime due fasi di un workflow di sviluppo assistito da Claude: la **fase di istruzione** (trasformare dispense e materiale grezzo in guide operative) e la **fase di ragionamento** (esplorare tecnologie e decisioni architetturali in dialogo, anche vocale). L'obiettivo di entrambe è produrre artefatti che alimentino la fase esecutiva, quella in cui agenti (ad esempio in Claude Code) svolgono task concreti di implementazione, test e pubblicazione.

---

## Fase 1 — Dalla dispensa alla guida: distillare, non travasare

### Il principio

Il valore di questa fase non sta nel passare a Claude il materiale grezzo, ma nel distillarlo in conoscenza *situata* nel progetto. Una dispensa contiene sapere generale; una guida efficace risponde invece a domande specifiche: qual è il dominio del problema, quali vincoli sono negoziabili e quali no, quale terminologia usa il progetto e con quale significato preciso, quali decisioni sono già state prese e perché.

Un test rapido per capire se un documento è una guida o solo un riassunto: se Claude potrebbe averlo scritto senza conoscere il tuo progetto, è un riassunto. Se contiene scelte, esclusioni e vincoli che valgono solo per te, è una guida.

### Strutturare a strati (progressive disclosure)

Il contesto ha un costo: un documento monolitico caricato a inizio conversazione diluisce l'attenzione del modello sulle parti che contano. La struttura consigliata è a strati.

Il primo strato è un **documento core** di una o due pagine che dà la mappa: cosa è il progetto, obiettivo, stack scelto, vincoli non negoziabili, glossario minimo. Il secondo strato è fatto di **documenti tematici** (autenticazione, modello dati, convenzioni API, deployment) richiamati solo quando la conversazione li tocca. Il terzo strato sono le **fonti grezze** (le dispense originali), conservate ma non caricate di default: servono solo quando bisogna verificare o approfondire.

Questo è lo stesso principio su cui sono costruite le Skill di Claude: un file `SKILL.md` breve che descrive quando attivarsi, con riferimenti a materiale di dettaglio letto solo al bisogno.

### Esempi pratici nell'ecosistema Claude

**Progetti su Claude.ai.** Il posto naturale per il documento core e le guide tematiche è la knowledge base di un Progetto. Le istruzioni di progetto (custom instructions del Progetto) sono ideali per il contenuto del documento core, perché vengono lette in ogni conversazione; i documenti tematici vanno invece caricati come file di conoscenza, così Claude li consulta quando servono. Riferimento: https://support.claude.com (sezione Projects).

**Skill personalizzate.** Se una guida descrive un *comportamento ripetibile* (ad esempio "quando fai review di una landing page, applica questi criteri"), conviene trasformarla in una Skill: un file markdown con una descrizione di attivazione e il corpo delle istruzioni. La differenza rispetto a un documento di progetto è che la skill si attiva in modo autonomo quando il contesto la rende pertinente, senza doverla richiamare.

**CLAUDE.md per la fase agentica.** Se la fase 3 usa Claude Code, il documento core va replicato (o meglio, generato) come `CLAUDE.md` nella root del repository: è il file che Claude Code legge automaticamente all'avvio e che orienta ogni sessione agentica. Le guide tematiche possono vivere in una cartella `docs/` referenziata dal `CLAUDE.md`. Documentazione: https://docs.claude.com/en/docs/claude-code/overview.

**Generazione assistita delle guide.** Un flusso efficace: caricare le dispense in una conversazione, chiedere a Claude di estrarre solo ciò che è rilevante per il progetto ("estrai i concetti della dispensa che impattano le nostre scelte su X, ignora il resto"), e produrre la guida come artifact, che resta modificabile e iterabile nella conversazione.

### Il test a freddo

Dopo aver scritto una guida, aprire una **conversazione nuova e pulita** (fuori dal Progetto, o in un Progetto vuoto), fornire solo la guida e fare domande di controllo: "in questo scenario, cosa faresti?", "quale tecnologia useresti per X e perché?". Se Claude risponde male o in modo generico, la guida ha un buco. Questo test è più affidabile della rilettura personale, perché chi ha il contesto in testa non si accorge di cosa manca sulla pagina.

Una variante utile: chiedere a Claude, sempre a freddo, "quali domande dovresti farmi prima di iniziare a lavorare su questo progetto?". Le domande che emergono sono l'elenco esatto delle lacune della guida.

### La sezione anti-pattern

Ogni guida dovrebbe includere una sezione "decisioni scartate e cose da non fare": tecnologie valutate e respinte (con il perché), pattern vietati, errori già commessi. Dire a Claude cosa *non* fare previene le derive tipiche del modello — soluzioni generiche, tecnologie di default, over-engineering — molto più efficacemente di istruzioni solo positive.

Esempio di formato:

> **Scartato:** ORM full-featured (valutato Prisma). Motivo: il progetto ha query analitiche complesse, restiamo su SQL esplicito con query builder leggero. Non proporre migrazioni a ORM.

---

## Fase 2 — Ragionare a voce: esplorare senza far evaporare le decisioni

### Il principio

Le sessioni di ragionamento (vocali o testuali) sono il momento in cui si valutano tecnologie, si confrontano approcci e si prendono decisioni architetturali. Il rischio strutturale è che il ragionamento *evapori*: la conversazione finisce, la decisione resta implicita, e la fase 3 riparte da una memoria imprecisa.

La regola è: **nessuna sessione di ragionamento si chiude senza un artefatto**.

### L'ADR leggero come output obbligatorio

A fine sessione, chiedere a Claude di generare un Architecture Decision Record informale con questa struttura minima: contesto (che problema stavamo risolvendo), opzioni valutate, scelta fatta, motivazioni, rischi noti e condizioni che invaliderebbero la decisione.

Esempio:

> **ADR-007 — Gestione code asincrone**
> Contesto: invio notifiche e generazione report bloccano le richieste HTTP.
> Opzioni: (A) cron + tabella DB, (B) Redis + BullMQ, (C) coda gestita cloud.
> Scelta: B. Redis è già nello stack per il caching; BullMQ dà retry e priorità senza infrastruttura nuova.
> Rischi: single point of failure su Redis; rivalutare C se il volume supera ~10k job/ora.

Questi ADR diventano input diretto della fase 3: un task esecutivo per un agente può citare "implementa secondo ADR-007", e l'agente ha tutto il contesto decisionale senza doverlo ricostruire.

### Esempi pratici nell'ecosistema Claude

**Modalità vocale + riepilogo scritto.** Dopo una sessione vocale, restare nella stessa conversazione e chiedere in testo: "genera un ADR di quanto discusso, formato: contesto / opzioni / scelta / rischi". Il documento prodotto va poi salvato nella knowledge del Progetto o nella cartella `docs/adr/` del repository.

**Ricerca nelle chat passate.** Claude.ai può cercare nelle conversazioni precedenti: se una decisione è stata discussa settimane prima, si può chiedere "cosa avevamo deciso sulla gestione delle code?" e Claude recupera la discussione. È una rete di sicurezza utile, ma non sostituisce gli ADR: il recupero funziona bene per ritrovare, meno per garantire che un agente in fase 3 parta dal contesto giusto. Gli ADR restano la fonte canonica.

**Ricerca web nelle sessioni esplorative.** Quando si valutano tecnologie, chiedere esplicitamente a Claude di verificare lo stato attuale di librerie e strumenti con la ricerca web ("controlla lo stato di manutenzione e le release recenti di queste tre librerie prima di confrontarle"). Le conoscenze del modello hanno una data di taglio; per decisioni tecnologiche la verifica è d'obbligo.

**Artifact per il confronto.** Nei confronti tra opzioni, chiedere una tabella comparativa o un diagramma architetturale come artifact: rende il confronto ispezionabile e riutilizzabile, invece di lasciarlo distribuito lungo la conversazione.

### L'avvocato del diavolo, su richiesta esplicita

Se si espone un'idea con entusiasmo, la tendenza naturale del modello è assecondare e raffinare la direzione proposta. Nel ragionamento architetturale questo è pericoloso. La contromisura è chiedere opposizione in modo esplicito:

- "Trova i tre punti più deboli di questo approccio."
- "Argomenta contro questa scelta come farebbe un senior scettico."
- "Prima di dirmi se sei d'accordo, elenca gli scenari in cui questa architettura fallisce."

A voce questo è ancora più importante, perché il ritmo conversazionale spinge verso l'accordo. Un'abitudine efficace: rendere il "giro di obiezioni" un passaggio fisso prima di ogni ADR, non un extra occasionale.

### Separare esplorazione e decisione

Una sessione esplorativa e una decisionale hanno bisogno di contesti diversi, e mischiarle produce decisioni prese su informazioni superficiali.

La **sessione esplorativa** vuole ampiezza: poco contesto di progetto caricato, ricerca web attiva, domande aperte ("quali approcci esistono per X nel 2026?"). Output atteso: una mappa delle opzioni.

La **sessione decisionale** vuole vincoli: la guida di fase 1 caricata (o il Progetto attivo), la mappa delle opzioni della sessione esplorativa come input, e domande chiuse ("date le nostre guide e questi vincoli, quale opzione scegliamo?"). Output atteso: un ADR.

In pratica, su Claude.ai questo può significare fare l'esplorazione in una conversazione fuori dal Progetto e la decisione in una conversazione dentro il Progetto, dove tutte le guide sono automaticamente disponibili.

---

## Il ponte verso la fase 3

Le prime due fasi sono riuscite se producono un pacchetto di artefatti che rende i task esecutivi *autocontenuti*: documento core, guide tematiche, sezione anti-pattern, ADR delle decisioni prese. Un buon task per un agente di fase 3 dovrebbe poter dire "implementa la feature X secondo ADR-007, rispettando le convenzioni in `docs/api-conventions.md`" — e l'agente deve trovare in quei file tutto ciò che serve, senza che il contesto viva solo nella memoria di chi ha ragionato.

Un ultimo controllo di qualità, periodico: ogni volta che un agente in fase 3 fa una domanda o commette un errore riconducibile a contesto mancante, la correzione non va fatta solo nel task — va riportata a monte, aggiornando la guida o l'ADR corrispondente. È questo ciclo di ritorno che fa maturare il sistema documentale nel tempo.

---

## Riferimenti utili

- Documentazione Claude e API: https://docs.claude.com/en/api/overview
- Claude Code: https://docs.claude.com/en/docs/claude-code/overview
- Guida al prompt engineering: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview
- Supporto Claude.ai (Progetti, Skill, funzionalità): https://support.claude.com
