# AI-skills

Raccolta di **skill** per Claude / Claude Code. Ogni skill è un pacchetto `.skill` (un archivio ZIP contenente un file `SKILL.md` con frontmatter `name` + `description` e le istruzioni operative). Quando l'argomento di una richiesta corrisponde alla `description` di una skill, Claude la attiva e ne segue il protocollo.

Il filo conduttore della raccolta sono **personas specializzate** per il design e la qualità delle interfacce web — costruite intorno ai principi di *Refactoring UI* (Adam Wathan, Steve Schoger) e agli standard di accessibilità (WCAG, EAA, Legge Stanca) — più alcune skill di utilità generale (riassunti di studio, generazione del README di un progetto, modalità di risposta compatta).

## Indice delle skill

| Skill | Ruolo | Quando si attiva |
|---|---|---|
| [`emma-ui-designer`](#emma--ui-designer) | Designer UI/UX generativa | Progettare un'interfaccia da zero o iterare su un mockup |
| [`adriana-a11y-qa`](#adriana--accessibilità--audit-conformità) | QA accessibilità + conformità + design | Audit completo di un sito esistente (a11y, normativa, qualità visiva) |
| [`max-landing-qa`](#max--landing-page-qa) | QA landing page, profilo sanitario/mobile | Testare una landing/homepage pubblica dal punto di vista dell'utente target |
| [`mary-editor-qa`](#mary--editor--admin-qa) | QA backoffice, utente admin non tecnico | Testare un CMS/pannello admin con gli occhi di un gestore non tecnico |
| [`rose`](#rose--riassunti-di-ripasso) | Sintesi di materiale di studio | Creare schede di ripasso da corsi, doc, PDF |
| [`readme-generator`](#readme-generator--documentazione-del-progetto) | Generatore di README.md | Scrivere o aggiornare il README leggendo il progetto corrente |
| [`caveman-talk`](#caveman-talk) | Modalità di risposta primitiva | Risposte cortissime "da uomo delle caverne" |

---

## Le personas del design e della QA

Le quattro skill principali formano un piccolo "team" che copre l'intero ciclo di vita di un'interfaccia: **Emma** costruisce, le altre tre auditano da angolazioni diverse.

### Emma — UI Designer

Designer UI/UX **collaborativa e generativa**. Parte da un brief (anche vago, anche solo *"voglio una landing per il mio studio dentistico"*) e aiuta a iterare verso qualcosa di concreto applicando rigorosamente i principi di *Refactoring UI*.

- **Approccio:** propositiva, non critica; pragmatica (numeri, hex, dimensioni concrete); avversa alla paralisi da analisi.
- **Tre livelli di fedeltà:** consulenza testuale → wireframe in grayscale → mockup HTML ad alta fedeltà.
- **Processo in step:** parte da *una feature* (non dal layout), lavora prima in grayscale, definisce i **sistemi** (spacing scale, type scale, palette HSL, elevation, border radius) prima di disegnare, poi costruisce la gerarchia visiva e i finishing touches.
- **Deliverable:** design system in markdown, piano di design, o artifact HTML/CSS self-contained.
- Riconosce i propri limiti: per un **audit formale** rimanda ad Adriana.

### Adriana — Accessibilità + Audit conformità

QA **senior** che audita interfacce esistenti su **tre dimensioni**:

1. **Accessibilità** secondo WCAG 2.1 / 2.2 livello AA (audit sistematico sui 4 principi POUR, con note AAA come consiglio).
2. **Conformità normativa** — European Accessibility Act / EN 301 549 e Legge Stanca / AgID per la PA italiana.
3. **Qualità del design visivo** secondo *Refactoring UI* — gerarchia, spaziatura, tipografia, colore, profondità, allineamenti.

Per ogni problema distingue sempre il **minimo legale** (🔴 SC violato, normativa, cosa serve per essere conformi) dal **consiglio oltre il minimo** (🟢 best practice, WCAG AAA, raffinamenti). Misura concretamente (contrasto, tap target, struttura semantica) via `javascript_tool`. **Deliverable:** report markdown strutturato con verdetto di conformità.

### Max — Landing Page QA

Simula l'**utente target di landing page in ambito sanitario**: adulti e anziani, professionisti medici, alfabetizzazione digitale variabile, spesso non madrelingua, **prevalentemente da smartphone** (viewport 390×844).

Valuta se la pagina **conduce l'utente al suo obiettivo nei primi 30 secondi** su mobile: regola dei 3 secondi, chiarezza dei contenuti (livello B1), usabilità mobile (tap target ≥44px), accessibilità, fiducia/estetica, ricerca bug. **Deliverable:** report markdown in 5 categorie (Bug critici / Fallimenti UX / Violazioni accessibilità / Problemi estetici / Note minori), prioritizzate per il profilo demografico.

### Mary — Editor / Admin QA

Simula un **utente admin NON tecnico** — il tipico gestore di piccola azienda o clinica con bassa alfabetizzazione digitale che si confonde davanti a etichette ambigue, flussi multi-step e gergo tecnico.

Audita editor, backoffice, CMS, pannelli admin e dashboard interne (viewport desktop 1440×900). Protocollo in 5 step: esplorazione → flussi principali → audit usabilità → audit estetico → ricerca bug. Il suo valore è **rivelare i punti in cui l'interfaccia tradisce le aspettative di un utente non tecnico**. **Deliverable:** report markdown (Bug critici / Fallimenti UX / Problemi estetici / Note minori) con per ogni issue dove, cosa, perché è un problema, e rimedio.

> **Come scegliere tra le tre QA:** **Adriana** per audit di accessibilità/conformità e qualità di design (qualsiasi interfaccia); **Max** per landing pubbliche viste da utenti fragili su mobile; **Mary** per backoffice/admin usati da personale operativo non specializzato.

---

## Skill di utilità

### Rose — Riassunti di ripasso

Crea **schede di ripasso in markdown** da materiale di studio (moduli di corsi, documentazione tecnica, PDF di training, articoli). Principio guida: *forma segue contenuto* — paragrafi discorsivi per i ragionamenti, schemi/tabelle/elenchi solo per ciò che è schematico per natura, **mai bullet senza verbo**. Ogni sezione dichiara la sua utilità prima del "come". Struttura tipica: Principio → sezioni nell'ordine del materiale → regole mentali → punti critici (⚠️) → esempi minimi → "Quiz lampo" finale per l'autoverifica.

### Readme-generator — Documentazione del progetto

Genera (o riscrive) il **`README.md`** del progetto in cui viene lanciata, ricavando i contenuti **dal codice** invece di inventarli: legge i manifest (`package.json`, `Cargo.toml`, `Makefile`, `CMakeLists.txt`, `*.csproj`, `pyproject.toml`…), gli entrypoint, la CI e i file di configurazione, e chiede all'utente **solo** ciò che il progetto non dice — in primis lo scopo, se non è deducibile.

Produce cinque sezioni in ordine fisso: **descrizione breve e scopo** (3-5 righe, senza marketing), **build e messa in piedi** (prerequisiti con versioni reali, comandi dal clone all'app che gira, config minima), **installazione** — inclusa solo quando ha senso, cioè per progetti con binari o release e per ciò che gira in produzione (tipico di C/C++, Rust, Go: install da release, install da sorgente, servizio/container, verifica, aggiornamento) —, **comandi** in tabella `comando → cosa fa` presi solo da script/target esistenti, e **struttura del progetto** con le cartelle commentate, comprese quelle che compaiono *dopo* build e installazione (`target/`, `dist/`, path di install), marcate come generate.

Regole portanti: non inventare comandi o requisiti, verificare ogni comando citato, usare la lingua del progetto, e **non sovrascrivere alla cieca** un README esistente (le sezioni fuori schema — crediti, roadmap, contributing — si conservano).

### Caveman Talk

Fa parlare Claude come un **uomo delle caverne**: frasi cortissime, grammatica rotta, niente parole inutili. Utile quando si vogliono risposte minimali o "risparmiare token". *"Io bene. Tu?"*

---

## Struttura di un pacchetto `.skill`

Ogni file `.skill` è un archivio ZIP con questa struttura interna:

```
nome-skill.skill   (ZIP)
└── nome-skill/
    └── SKILL.md    (frontmatter YAML: name + description, poi le istruzioni)
```

Il `description` nel frontmatter è ciò che determina **quando** la skill viene attivata: è scritto per intercettare le formulazioni con cui un utente esprimerebbe il bisogno corrispondente.

### Ispezionare o modificare una skill

```bash
# Estrarre il contenuto
unzip nome-skill.skill -d /tmp/nome-skill

# Ricomprimere dopo una modifica (dalla cartella che contiene nome-skill/)
cd /tmp/nome-skill && zip -r ../nome-skill.skill nome-skill/
```
