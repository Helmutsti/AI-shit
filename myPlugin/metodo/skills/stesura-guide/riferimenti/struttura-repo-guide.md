# Struttura del repo guide (tre strati)

Il repo guide serve due lettori con lo stesso file system: l'**agente** (che
recupera, non legge tutto) e l'**umano frettoloso** (che vuole il quadro in una
pagina). La struttura a strati serve entrambi: piu' si scende, piu' si legge
raramente.

```
repo-guide/
├── SOMMARIO.md            ← STRATO 1 (core): l'unico file che si legge sempre
├── guide/
│   ├── <dominio>.md       ← STRATO 2: guide distillate, una per dominio
│   └── ...
└── grezzi/
    ├── <fonte>/           ← STRATO 3: materiale originale, MAI caricato di default
    │   ├── dispensa.pdf
    │   └── export-sito.md
    └── ...
```

## Strato 1 — SOMMARIO.md (il core)

Una riga per guida, formato fisso. Deve bastare a decidere se aprire la guida:

```markdown
# SOMMARIO — guide disponibili

| Guida | Dominio | Quando si applica |
|---|---|---|
| [guide/fatturazione-it.md](guide/fatturazione-it.md) | Fatturazione elettronica IT | Ogni feature che emette/riceve fatture verso SdI |
| [guide/privacy-gdpr.md](guide/privacy-gdpr.md) | Trattamento dati personali | Ogni feature che salva dati riconducibili a persone |
```

Regole: massimo una pagina; se supera ~20 guide, si raggruppa per area con un
sottotitolo. La colonna "Quando si applica" e' un **criterio di attivazione**,
non una descrizione: deve permettere il match con il punto in lavorazione.

## Strato 2 — guide/ (le distillate)

Formato in `formato-guida.md`: quando si applica, vincoli verificabili
(non negoziabili vs derogabili), terminologia, anti-pattern, fonti. Nomi file
parlanti in kebab-case (`fatturazione-it.md`, non `guida1.md`): l'agente naviga
per Glob/Grep. Ogni guida chiude con la sezione **Fonti** che punta al grezzo:

```markdown
## Fonti
- grezzi/corso-fatturazione-2025/dispensa.pdf (cap. 3-4)
- https://www.agenziaentrate.gov.it/... (consultato 2026-07)
```

## Strato 3 — grezzi/ (le fonti)

Una sottocartella per fonte (corso, normativa, sito esportato). Si conserva
tutto ma non si carica mai di default: serve solo quando una guida non basta o
va verificata. Per i siti web: salvare l'export in markdown accanto all'URL,
cosi' la fonte resta consultabile anche offline e ancorata alla versione vista.

## Possibilita': repo di documentazione di prodotto (affianco alle guide)

Quando una famiglia di progetti condivide dominio e feature che attraversano
**piu' repository di codice** (es. un prodotto storico spalmato su legacy +
backend + frontend), la conoscenza cross-repo non puo' vivere in nessuno dei
singoli repo senza duplicarsi. In quel caso e' legittimo un **repo di
documentazione di prodotto**, separato e **affiancato — ma mai fuso — al repo
guide**:

```
repo-guide/            ← trasversale a TUTTI i prodotti, zero tecnologia
repo-docs-<prodotto>/  ← la famiglia: architettura cross, glossario di dominio,
                         feature multi-repo, ADR di prodotto. Pieno di tecnologia,
                         riusabile solo dentro quel prodotto.
progetto/docs/         ← solo i fatti del singolo codebase (INIT del metodo)
```

Regole che tengono in piedi il modello:
- ogni repo di codice **ancora** il repo docs in `PROGETTO.md` (URL + commit),
  come fa con le guide, e dai progetti lo consulta **in sola lettura**;
- i link vanno **dal basso verso l'alto** (il `docs/` di progetto rimanda al
  prodotto); il repo di prodotto non duplica mai il dettaglio di un singolo repo;
- ci si scrive aprendolo **come progetto a se'** — al quale si puo' applicare
  il metodo stesso (indice come core, note datate distillate nel presente);
- resta distinto dalle guide perche' ha ciclo di vita, pubblico e riuso diversi:
  fonderli ricreerebbe la mescolanza che gli strati servono a evitare.

Questa e' una possibilita' da valutare solo per prodotti multi-repo: per un
progetto autonomo, la documentazione generata dall'INIT nel repo basta.

## Dove NON stanno le cose

- **Decisioni di progetto** → `docs/adr/` DENTRO il progetto (Comportamento 1:
  la verita' del progetto vive nel suo repo). Nel repo guide una decisione entra
  solo se trasversale e riusabile — e allora e' una voce **anti-pattern o un
  vincolo dentro una guida**, non un ADR.
- **Regole di metodo** → nel master/plugin, non nelle guide.
- **Convenzioni locali di un progetto** → «Regole locali» di quel `PROGETTO.md`.

## Percorso di lettura (per l'agente)

1. `docs/PROGETTO.md` dice quale repo guide e' ancorato e quali guide sono attive.
2. Al passo F1.3 si legge **solo `SOMMARIO.md`** e si selezionano le guide
   pertinenti al punto.
3. Delle guide selezionate si leggono le prime righe ("Quando si applica"):
   se pertinenti, si estrae la **checklist dei vincoli** per F3.9.
4. I grezzi si aprono solo se un vincolo e' ambiguo o contestato.
