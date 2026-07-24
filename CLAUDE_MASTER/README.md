# CLAUDE_MASTER — come si usa

`claude_master.md` è un **seme di configurazione**: un `CLAUDE.md` di partenza, riusabile tra progetti, che alla prima esecuzione si auto-configura tramite un wizard (l'**INIT**) e poi si trasforma nella configurazione definitiva del progetto.

Non va eseguito da qui: va **copiato dentro un progetto**.

## Cosa fare

1. **Copia** `claude_master.md` nella radice di un nuovo progetto e **rinominalo** in **`CLAUDE.md`**.
2. Alla **primissima esecuzione** di Claude nel progetto parte l'**INIT**, che:
   - esegue il **wizard di configurazione** (scelta lingua, moduli, flusso di lavoro);
   - genera i documenti in **`docs/`**, a partire da **`docs/PROGETTO.md`** (più i seed di `PIANO.md`, `DOCUMENTAZIONE.md`, `STORICO.md`);
   - **riscrive `CLAUDE.md`** come semplice delega a `@docs/PROGETTO.md`, **rimuovendo la sezione INIT** (che non serve più).

## Cosa succede alle regole

- I **Comportamenti fondamentali** e le **Regole di processo / Abitudini** **non** vengono cancellati: **migrano** dentro `docs/PROGETTO.md`, dove diventano le **«Regole del progetto»** editabili dall'utente.
- Solo la **sezione INIT** sparisce dopo il primo avvio.
- I Comportamenti fondamentali sono **load-bearing** (reggono la sicurezza multi-agente e la portabilità): restano attivi di default, e Claude avverte prima di disattivarli.

## Rilanciare la configurazione

L'INIT non riparte da solo. Per riconfigurare, scrivi `init` (o "rivedi la configurazione") nel progetto.
