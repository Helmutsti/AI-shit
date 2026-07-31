# AI-shit

Cartella di lavoro con **materiale per Claude / Claude Code**: alcune skill pronte da installare, un modello di configurazione da copiare nei progetti nuovi e un plugin con i controlli automatici del metodo di lavoro.

## Cosa c'è dentro

| Elemento | Cos'è |
|---|---|
| `*.skill` | Skill singole, pronte da installare in Claude |
| `CLAUDE_MASTER/` | Un `CLAUDE.md` di partenza da copiare nei progetti nuovi |
| `myPlugin/` | Plugin `myworkflow` per Claude Code, con i controlli automatici |

---

## 1. Le skill (`*.skill`)

Ogni file `.skill` è un pacchetto (uno ZIP con dentro un `SKILL.md`) che aggiunge a Claude una competenza. Claude la attiva da sé quando la richiesta corrisponde all'argomento della skill.

| Skill | A cosa serve |
|---|---|
| `emma-ui-designer` | Progetta interfacce da zero: dal brief al mockup HTML |
| `adriana-a11y-qa` | Controlla un sito: accessibilità, obblighi di legge, qualità del design |
| `max-landing-qa` | Prova una landing page come farebbe un utente anziano da smartphone |
| `mary-editor-qa` | Prova un pannello di amministrazione come farebbe un utente non tecnico |
| `rose` | Trasforma materiale di studio in schede di ripasso |
| `readme-generator` | Scrive il README di un progetto leggendone il codice |
| `caveman-talk` | Fa rispondere Claude a frasi cortissime, "da uomo delle caverne" |

Le prime quattro sono un piccolo "team di design": **Emma** costruisce, le altre tre controllano da punti di vista diversi — Adriana per accessibilità e norme, Max per le pagine pubbliche su mobile, Mary per i gestionali interni.

### Come si guarda o si modifica una skill

```bash
# Aprire il pacchetto
unzip nome-skill.skill -d /tmp/nome-skill

# Richiuderlo dopo una modifica
cd /tmp/nome-skill && zip -r ../nome-skill.skill nome-skill/
```

---

## 2. `CLAUDE_MASTER/`

Contiene `claude_master.md`: un file di configurazione riutilizzabile da **copiare nella radice di un progetto nuovo, rinominandolo `CLAUDE.md`**.

Alla prima esecuzione di Claude nel progetto parte un wizard che fa qualche domanda (lingua, moduli, flusso di lavoro), genera i documenti in `docs/` e trasforma il file nella configurazione definitiva di quel progetto. Da qui non va eseguito: serve solo come modello.

---

## 3. `myPlugin/`

Il plugin **`myworkflow`** per Claude Code: trasforma le regole del metodo di lavoro in controlli automatici (*hook*) che scattano da soli.

| Controllo | Quando scatta | Cosa fa |
|---|---|---|
| `commit-descrittivo` | prima di un `git commit` | blocca i messaggi troppo corti (sotto i 40 caratteri) |
| `proteggi-docs` | prima di una modifica a file | impedisce ai subagenti di scrivere in `docs/` |
| `snapshot-dati` | all'avvio della sessione | fotografa lo stato della cartella `dati/` |
| `verifica-dati` | alla chiusura | blocca la chiusura se `dati/` è stata alterata |
| `gate-e2e` | alla chiusura | blocca la chiusura se build o test non passano |

Va installato **per singolo progetto**, mai a livello globale. Dalla cartella del progetto in cui serve:

```
/plugin marketplace add <percorso-di-myPlugin>
/plugin install myworkflow@manuelmarket
/reload-plugins
```

Il controllo su build e test resta spento finché il progetto non dichiara il comando da usare in `.metodo/config.json`:

```json
{ "verifica": "npm test && npm run build" }
```

Dettagli completi in `myPlugin/metodo/README.md`.
