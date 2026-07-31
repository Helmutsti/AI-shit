# Modelli dei documenti generati

## Ruoli dei documenti (P3)

`CLAUDE.md` resta in radice (entry point) e delega con `@docs/PROGETTO.md`. I
documenti di lavoro vivono in `docs/` con ruoli netti:

- **`PROGETTO.md`** — la **specifica**: configurazione attiva, flusso, e le
  «Regole del progetto» (comportamenti fondamentali load-bearing + regole di
  processo/abitudini + regole locali), oltre a contesto/architettura e
  convenzioni. Si aggiorna solo quando cambia un requisito o una regola.
- **`PIANO.md`** — il **futuro grezzo**: blocco appunti delle idee e backlog a
  tre elenchi — **"Da realizzare/definire"** (mature), **"Forse"** (incerte),
  **"Scartati"** (bocciate ma conservate con motivazione e scoperte utili) — piu'
  la lista **"Bug noti da correggere"**. Quando un punto e' descritto "a dovere"
  **migra** (piattaforma o milestone nel file) e **si rimuove** da qui: la lista
  resta corta.
- **`DOCUMENTAZIONE.md`** — il **presente**: stato del progetto in forma
  sintetica e viva, per capire *com'e' e perche'* senza scorrere tutta la storia.
  Contiene il core (cos'e', architettura in breve), le decisioni attuali valide,
  i **funzionamenti controintuitivi** e le **decisioni "negative"** (cose
  deliberatamente NON fatte, col perche'). **Non cresce all'infinito**: si sfoltisce.
- **`STORICO.md`** — la **memoria di lungo periodo, append-only**: log completo
  di implementazioni e decisioni (milestone completate, scoperte impreviste,
  limiti di tool, vicoli ciechi, bug risolti). `DOCUMENTAZIONE.md` ne e' il
  distillato attuale.
- **Guide (repo esterno, sola lettura)** — vincoli **trasversali e non-tecnici**
  riusabili tra progetti (normative, compliance, regole di business, fiscale,
  privacy, accessibilita' legale). Ogni guida ha dominio + vincoli verificabili;
  un `SOMMARIO.md` nel repo guide descrive ogni file (dominio, sintesi, quando si
  applica). Attive solo se `guide` = ON; ancorate per URL+commit in `PROGETTO.md`.

## Struttura di PROGETTO.md (§3.3) — in quest'ordine

```markdown
# PROGETTO — <nome progetto>

## Configurazione attiva
- Lingua: <it|en>
- Piattaforma: <zoho|todoist|github-issues|nessuna> (+ portale/progetto/repo se
  attiva; se scelta ma MCP non ancora collegato, segnalo "in attesa di connessione MCP")
- Moduli: avvertimi <on/off>, guide <on/off>, unit-test <on/off>,
  verifica-e2e <on/off>, agenti-paralleli <on/off>, commit-auto <on/off>,
  push-auto <on/off>, figma <on/off>, piano-su-file <on/off>
- (se guide ON) Repo guide: <URL> @ <commit>; guide attive: <elenco>

## Flusso di lavoro
<copia dal flusso 3.1, con i [OPZ] attivi marcati>

## Regole del progetto
### Comportamenti fondamentali (load-bearing)
<dalle regole migrate>
### Regole di processo e Abitudini
<dalle regole migrate>
### Regole locali
<vuota all'inizio; cresce con i vincoli specifici del progetto,
 con la stessa dignita' delle altre>

## Come consultare la documentazione
Prima di descrivere un punto (F1.1), rispondi ai dubbi consultando il file
giusto — non a memoria:
- "Come funziona / perche' e' cosi'?"        → docs/DOCUMENTAZIONE.md
- "E' gia' stato deciso o scartato?"         → docs/DOCUMENTAZIONE.md (decisioni negative) + docs/adr/
- "Quali vincoli esterni valgono?"           → SOMMARIO.md del repo guide → guida pertinente (se `guide` ON)
- "Com'e' andata l'ultima volta / storia?"   → docs/STORICO.md (cerca per parola chiave o data)
Quando: in Fase 1, PRIMA della descrizione "a dovere" — non durante
l'implementazione. Cerca con i termini del glossario del progetto.

## Documenti di riferimento
<la mappa dei documenti, come sopra>
```

## Seed dei documenti (contenuto iniziale)

**PIANO.md**
```markdown
# PIANO — futuro grezzo

## Appunti / idee
-

## Da realizzare/definire
-

## Forse
-

## Scartati
-

## Bug noti da correggere
-
```

**DOCUMENTAZIONE.md**
```markdown
# DOCUMENTAZIONE — il presente

## Cos'e'
## Architettura in breve
## Funzionamenti controintuitivi
## Decisioni "negative" (deliberatamente NON fatte)
```

**STORICO.md**
```markdown
# STORICO — memoria append-only

## <data> — Inizializzazione del progetto
INIT eseguito: <riassunto della configurazione scelta>.
```

**CLAUDE.md** (riscritto, in radice)
```markdown
# <nome progetto>

Questo progetto segue il "metodo". La specifica completa e le regole vivono in:

@docs/PROGETTO.md
```

**.metodo/config.json** (letto dagli hook del plugin — va versionato)
```json
{
  "moduli": {
    "avvertimi": true,
    "guide": false,
    "unit-test": false,
    "verifica-e2e": true,
    "agenti-paralleli": false,
    "commit-auto": false,
    "push-auto": false,
    "figma": false,
    "piano-su-file": true
  },
  "verifica": "npm test && npm run build",
  "dati": "dati"
}
```
- `moduli` — riflette le scelte del wizard (aggiornalo se la configurazione cambia);
- `verifica` — comando del gate end-to-end; stringa vuota o campo assente = gate spento;
- `dati` — cartella dei dati reali sorvegliata dagli hook P4/H4 (default `dati`).
