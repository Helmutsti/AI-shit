# Formato di una guida (repo guide)

Una guida e' conoscenza **situata**: risponde a domande specifiche del dominio,
non ripete sapere generale. Struttura a strati — il lettore (umano o agente)
deve poter capire in 10 righe SE la guida si applica, e solo dopo scendere nel
dettaglio.

## Struttura del file

```markdown
# <Titolo> — <dominio in 3-5 parole>

## Quando si applica
<2-4 righe: in quali progetti/situazioni questa guida e' vincolante,
 e quando invece NON si applica.>

## Vincoli
<Elenco di vincoli VERIFICABILI. Ogni vincolo deve poter diventare una voce
 di checklist in fase di validazione di conformita'. Distinguere:>
- **Non negoziabile:** <vincolo> — <fonte: normativa/contratto/decisione>
- **Default derogabile:** <vincolo> — <quando si puo' derogare e chi decide>

## Terminologia
<Solo i termini che nel dominio hanno un significato preciso e diverso
 dall'uso comune. Formato: **termine** — significato qui.>

## Decisioni scartate e cose da non fare (anti-pattern)
<La sezione piu' preziosa. Formato per ogni voce:>
> **Scartato:** <cosa> (valutato <alternativa>). Motivo: <perche'>.
> Non proporre <deriva tipica da prevenire>.

## Fonti
<Da quale materiale grezzo deriva la guida (dispensa, normativa, versione),
 cosi' si sa cosa riconsultare quando qualcosa non torna.>
```

## Criteri di qualita'

1. **Test del riassunto**: se il contenuto poteva essere scritto senza
   conoscere il progetto/dominio, non e' una guida. Tagliare o situare.
2. **Vincoli verificabili**: "gestire bene gli errori" non e' un vincolo;
   "ogni endpoint restituisce il formato errore RFC 7807" si'.
3. **Anti-pattern sempre presente**: dire cosa NON fare previene le derive del
   modello (soluzioni generiche, over-engineering) piu' delle sole istruzioni
   positive. Se la sezione e' vuota, chiedersi cosa e' gia' stato scartato.
4. **Breve in cima, dettaglio in fondo**: le prime 10 righe decidono se la
   guida e' pertinente; il resto si legge solo al bisogno.

## Registrazione nel SOMMARIO.md

Ogni guida ha una riga nel `SOMMARIO.md` del repo guide:

```markdown
- **<file>.md** — <dominio>. <Sintesi in una frase.> Si applica quando: <criterio>.
```

E' il file che l'agente legge per orientarsi (passo F1.3 del flusso): la riga
deve bastare a decidere se aprire la guida.
