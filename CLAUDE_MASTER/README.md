# CLAUDE_MASTER

🇮🇹 [Italiano](#-italiano) · 🇬🇧 [English](#-english)

---

## 🇮🇹 Italiano

### CLAUDE_MASTER — come si usa

`claude_master.md` è un **seme di configurazione**: un `CLAUDE.md` di partenza, riusabile tra progetti, che alla prima esecuzione si auto-configura tramite un wizard (l'**INIT**) e poi si trasforma nella configurazione definitiva del progetto.

Non va eseguito da qui: va **copiato dentro un progetto**.

#### Cosa fare

1. **Copia** `claude_master.md` nella radice di un nuovo progetto e **rinominalo** in **`CLAUDE.md`**.
2. Alla **primissima esecuzione** di Claude nel progetto parte l'**INIT**, che:
   - esegue il **wizard di configurazione** (scelta lingua, moduli, flusso di lavoro);
   - genera i documenti in **`docs/`**, a partire da **`docs/PROGETTO.md`** (più i seed di `PIANO.md`, `DOCUMENTAZIONE.md`, `STORICO.md`);
   - **riscrive `CLAUDE.md`** come semplice delega a `@docs/PROGETTO.md`, **rimuovendo la sezione INIT** (che non serve più).

#### Cosa succede alle regole

- I **Comportamenti fondamentali** e le **Regole di processo / Abitudini** **non** vengono cancellati: **migrano** dentro `docs/PROGETTO.md`, dove diventano le **«Regole del progetto»** editabili dall'utente.
- Solo la **sezione INIT** sparisce dopo il primo avvio.
- I Comportamenti fondamentali sono **load-bearing** (reggono la sicurezza multi-agente e la portabilità): restano attivi di default, e Claude avverte prima di disattivarli.

#### Rilanciare la configurazione

L'INIT non riparte da solo. Per riconfigurare, scrivi `init` (o "rivedi la configurazione") nel progetto.

---

## 🇬🇧 English

### CLAUDE_MASTER — how to use it

`claude_master.md` is a **configuration seed**: a starter `CLAUDE.md`, reusable across projects, that self-configures on first run through a wizard (the **INIT**) and then turns into the project's final configuration.

It is not meant to be run from here: it must be **copied into a project**.

#### What to do

1. **Copy** `claude_master.md` into the root of a new project and **rename** it to **`CLAUDE.md`**.
2. On the **very first run** of Claude in the project, the **INIT** starts, which:
   - runs the **configuration wizard** (language, modules, workflow choices);
   - generates the documents in **`docs/`**, starting from **`docs/PROGETTO.md`** (plus the seeds for `PIANO.md`, `DOCUMENTAZIONE.md`, `STORICO.md`);
   - **rewrites `CLAUDE.md`** as a simple delegation to `@docs/PROGETTO.md`, **removing the INIT section** (no longer needed).

#### What happens to the rules

- The **Core behaviors** and the **Process rules / Habits** are **not** deleted: they **migrate** into `docs/PROGETTO.md`, where they become the user-editable **"Project rules"**.
- Only the **INIT section** disappears after the first run.
- The Core behaviors are **load-bearing** (they underpin multi-agent safety and portability): they stay active by default, and Claude warns you before disabling them.

#### Re-running the configuration

The INIT does not restart on its own. To reconfigure, type `init` (or "review the configuration") in the project.
