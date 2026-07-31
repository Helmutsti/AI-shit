# Formato dell'ADR leggero

Un ADR (Architecture Decision Record) fissa una decisione perche' il
ragionamento non evapori con la conversazione. E' *leggero*: mezza pagina,
non un documento formale.

## File e numerazione

- Percorso: `docs/adr/ADR-NNN-<slug>.md` (numerazione progressiva a 3 cifre).
- Una riga di rimando in `docs/STORICO.md`:
  `<data> — Decisione: <titolo> (vedi docs/adr/ADR-NNN-<slug>.md)`.
- Se la decisione cambia il presente del progetto, aggiorna anche
  `docs/DOCUMENTAZIONE.md` (sezione decisioni attuali).

## Struttura

```markdown
# ADR-NNN — <titolo della decisione>

- **Data:** <YYYY-MM-DD>
- **Stato:** attiva | superata da ADR-MMM

## Contesto
<Che problema stavamo risolvendo. 2-4 righe.>

## Opzioni valutate
- (A) <opzione> — <pro/contro in una riga>
- (B) <opzione> — <pro/contro in una riga>
- (C) <opzione> — <pro/contro in una riga>

## Scelta
<Quale opzione e perche' — le motivazioni vere, incluse quelle "di comodo"
 (gia' nello stack, competenze del team), che sono legittime e vanno dette.>

## Obiezioni considerate
<L'esito del giro di obiezioni: i punti deboli sollevati e perche' non hanno
 ribaltato la scelta.>

## Rischi e condizioni di invalidazione
<Rischi noti della scelta E le condizioni misurabili che imporrebbero di
 rivalutarla. Es.: "rivalutare C se il volume supera ~10k job/ora".>
```

## Regole d'uso

1. **Nessuna sessione di ragionamento si chiude senza artefatto**: se si e'
   discusso e scelto, l'ADR va scritto nella stessa sessione.
2. **Giro di obiezioni prima, non dopo**: l'ADR registra anche le obiezioni
   (sezione dedicata) — se e' vuota, il giro non e' stato fatto.
3. **Gli ADR non si riscrivono**: una decisione superata cambia stato
   ("superata da ADR-MMM") e resta come storia; la nuova decisione e' un
   nuovo ADR.
4. **I task citano gli ADR**: un buon task esecutivo dice "implementa secondo
   ADR-007" — l'agente trova li' tutto il contesto decisionale.
