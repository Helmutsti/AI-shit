---
name: stesura-guide
description: Flusso di stesura della documentazione di metodo — distillare dispense e materiale grezzo in guide operative (fase 1) e trasformare sessioni di ragionamento in ADR che non evaporano (fase 2). Usala quando l'utente vuole "scrivere una guida", "distillare una dispensa", "trasformare questo materiale in documentazione", "registrare una decisione", "fare un ADR", o chiude una sessione di ragionamento/confronto tra opzioni. NON e' il flusso di implementazione (quello e' il ciclo di vita dei punti): qui si producono artefatti di conoscenza.
---

# Stesura di guide e ADR

Questa skill copre le fasi a monte dell'implementazione: produrre gli artefatti
di conoscenza che rendono i task esecutivi autocontenuti. Due procedure:
**distillare una guida** da materiale grezzo e **fissare una decisione** in un
ADR. I formati di dettaglio sono in `riferimenti/formato-guida.md` e
`riferimenti/formato-adr.md`; la struttura a tre strati del repo guide
(SOMMARIO core → guide → grezzi) e' in `riferimenti/struttura-repo-guide.md`.

**DOCUMENTAZIONE vs ADR (per non duplicare):** l'ADR e' il verbale immutabile
della singola decisione (contesto, opzioni, perche', rischi); `DOCUMENTAZIONE.md`
e' la foto del presente e cita ogni decisione viva in UNA riga con il link al
suo ADR. Il ragionamento sta solo nell'ADR: se DOCUMENTAZIONE ri-spiega i
perche', taglia e linka.

## Dove vanno gli artefatti (rispetta il metodo)

- **Guide** → nel **repo guide** (esterno, riusabile tra progetti). Se stai
  lavorando *dentro* un progetto col metodo, ricorda il Comportamento 2: dal
  progetto le guide sono in sola lettura. Due strade: (a) apri il repo guide
  come progetto e lavora li'; (b) prepara il testo pronto e lascialo consegnare
  all'utente. Ogni guida nuova va registrata nel `SOMMARIO.md` del repo guide.
- **ADR** → nel progetto, in **`docs/adr/ADR-NNN-<slug>.md`**, con una riga di
  rimando in `docs/STORICO.md` (la decisione e' un esito durevole) e — se cambia
  il presente del progetto — l'aggiornamento di `docs/DOCUMENTAZIONE.md`.
- Materiale grezzo (dispense, trascrizioni) → conservato ma **mai** caricato di
  default: e' il terzo strato, si consulta solo per verificare o approfondire.

## Procedura A — Dalla dispensa alla guida (distillare, non travasare)

1. **Chiedi il contesto d'uso** prima di leggere il materiale: per quale
   progetto/dominio serve la guida? Quali decisioni dovra' sostenere? Una
   domanda per volta (H2).
2. **Leggi il materiale grezzo** e estrai SOLO cio' che impatta le scelte del
   contesto dichiarato. Ignora il sapere generale: se una frase potrebbe stare
   in qualsiasi manuale, non va nella guida.
3. **Scrivi la guida a strati** (formato in `riferimenti/formato-guida.md`):
   dominio e quando si applica, vincoli verificabili, terminologia con
   significato preciso, e la **sezione anti-pattern** (decisioni scartate col
   perche', pattern vietati, errori gia' commessi). Le esclusioni valgono
   quanto le prescrizioni.
4. **Applica il test del riassunto**: se Claude avrebbe potuto scrivere questa
   guida senza conoscere il progetto, e' un riassunto, non una guida. Torna al
   passo 2 e taglia/situa.
5. **Proponi il test a freddo**: suggerisci all'utente di aprire una
   conversazione nuova, fornire solo la guida e fare domande di controllo
   ("in questo scenario cosa faresti?"), oppure chiedere "quali domande dovresti
   farmi prima di lavorare su questo progetto?" — le domande che emergono sono
   le lacune della guida. Offriti di simulare tu il lettore a freddo.
6. **Colloca e registra** (struttura in `riferimenti/struttura-repo-guide.md`):
   la guida va in `guide/<dominio>.md` (kebab-case parlante), il materiale
   grezzo si conserva in `grezzi/<fonte>/` (mai caricato di default) e la
   sezione **Fonti** della guida punta li'. Poi la riga nel `SOMMARIO.md`
   (tabella: guida, dominio, quando si applica) — e' l'unico file letto sempre,
   deve restare sotto una pagina. Se il progetto ancora la guida per commit,
   ricorda di aggiornare l'ancora in `docs/PROGETTO.md` dopo il commit del
   repo guide.

## Procedura B — Dalla sessione di ragionamento all'ADR

Regola: **nessuna sessione di ragionamento si chiude senza un artefatto.**

1. Se la discussione ha confrontato opzioni, ricostruisci la mappa: che problema
   si stava risolvendo, quali opzioni sono emerse, quali vincoli le hanno
   filtrate.
2. **Giro di obiezioni PRIMA dell'ADR** (passaggio fisso, non extra): elenca i
   punti deboli della scelta emergente, gli scenari in cui fallisce, cosa
   direbbe un senior scettico. Se un'obiezione regge, torna alla discussione
   invece di verbalizzare una decisione fragile.
3. **Scrivi l'ADR leggero** (formato in `riferimenti/formato-adr.md`): contesto,
   opzioni valutate, scelta, motivazioni, rischi noti e **condizioni che
   invaliderebbero la decisione**. Numera progressivo (ADR-001, ADR-002...).
4. **Salva e collega**: file in `docs/adr/`, riga di rimando in `STORICO.md`,
   eventuale aggiornamento di `DOCUMENTAZIONE.md` (decisioni attuali valide).
   Da qui in poi i task possono citare "implementa secondo ADR-NNN".
5. Per le decisioni tecnologiche, **verifica lo stato attuale con la ricerca
   web** (manutenzione, release recenti) prima di fissare la scelta: la
   conoscenza del modello ha una data di taglio.

## Il ciclo di ritorno (manutenzione)

Quando in fase esecutiva un agente fa una domanda o sbaglia per contesto
mancante, la correzione non va fatta solo nel task: **riportala a monte**,
aggiornando la guida o l'ADR corrispondente. Se noti questo pattern durante il
lavoro, proponilo (Comportamento 4).
