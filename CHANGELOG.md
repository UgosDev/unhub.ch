# Changelog

Tutte le modifiche degne di nota a questo progetto saranno documentate in questo file.

Il formato si basa su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [9.4.0]

### Migliorato
* **[Fotocamera] Feedback Visivo Avanzato**: Migliorata l'interfaccia della fotocamera con un **contorno dinamico** che si adatta ai bordi del documento in tempo reale. Il contorno cambia colore e mostra un effetto "lock-on" quando l'inquadratura è ottimale, guidando l'utente a scattare foto perfette.

## [9.3.0]

### Aggiunto
* **Modalità "Fotografia"**: Una nuova modalità di scansione specializzata per l'analisi semantica di immagini. Non estrae testo, ma descrive e categorizza il contenuto visivo, abilitando la ricerca per immagini in `archivio.ch`. Utilizza il modello `gemini-2.5-flash` con "Thinking Mode" e ha un costo di 50 ScanCoin.

## [9.2.0]

### Aggiunto
* **[Piattaforma] Rubrica Mittenti**: L'applicazione ora estrae e salva automaticamente i dati dei mittenti (`mittenteNome`, `mittenteIndirizzo`) in una rubrica personale per ogni utente.
* **[Disdette] Autocompletamento Destinatario**: Il wizard di creazione delle disdette ora include un campo di ricerca intelligente che suggerisce i contatti dalla rubrica, pre-compilando nome e indirizzo.
* **[Disdette] Salvataggio Automatico in Rubrica**: Ogni nuovo destinatario inserito manualmente nel wizard viene aggiunto o aggiornato automaticamente nella rubrica, rendendola auto-apprendente.

## [9.1.0]

### Aggiunto
* **[Disdette] Gestione dello Stato**: Il modulo `disdette.ch` è stato potenziato per diventare uno strumento di tracciamento completo.
* **[Disdette] Stati della Disdetta**: Introdotto un sistema di stati (`Bozza`, `Generata`, `Inviata`, `Confermata`) per ogni disdetta, che permette di seguirne il ciclo di vita.
* **[Disdette] Salvataggio Bozze**: È ora possibile salvare le disdette come bozze per completarle in un secondo momento.
* **[Disdette] Promemoria**: Aggiunta la possibilità di impostare una data di promemoria nel wizard di creazione.
* **[Disdette] UI Riorganizzata**: La pagina ora raggruppa le disdette per stato, offrendo una visione chiara delle azioni da compiere.

## [9.0.0]

### Aggiunto
* **[Archivio] Riprogettazione Completa in Dashboard**: La pagina Archivio è stata trasformata in un centro di controllo interattivo per i documenti.
* **[Archivio] Widget Intelligenti**: Introdotta una dashboard con widget per "Accesso Rapido" (documenti recenti), "In Scadenza" (l'AI rileva le scadenze) e "Da Organizzare".
* **[Archivio] Viste Multiple**: Aggiunto un selettore per visualizzare i documenti in modalità **Griglia**, **Calendario** (basato sulla data del documento) e **Timeline** (cronologia verticale).
* **[Archivio] Suggerimenti AI per Archiviazione**: Il widget "Da Organizzare" include un pulsante che utilizza Gemini per suggerire la cartella più appropriata per un documento.

### Migliorato
* **[AI] Rilevamento Scadenze**: Potenziata l'analisi AI in `geminiService` per identificare e estrarre specificamente le date di scadenza dai documenti.
* **[Archivio] Interfaccia Utente**: L'intera pagina è stata resa più moderna, funzionale e tecnologica, offrendo molteplici modi per esplorare e gestire i propri file.

---

## [8.9.0]

### Aggiunto
* **[Fotocamera] Scansione Multi-Pagina**: La fotocamera ora supporta l'acquisizione di più pagine in un'unica sessione. È possibile aggiungere, visualizzare in anteprima ed eliminare singole pagine prima di finalizzare la scansione.

### Migliorato
* **[Fotocamera] Interfaccia Utente**: L'interfaccia della fotocamera è stata potenziata con una galleria di anteprime per le pagine scansionate e controlli dedicati ("Annulla Ultima", "Fine") per gestire le sessioni di scansione multi-pagina in modo intuitivo.

## [8.8.0]

### Aggiunto
* **[Archivio] Ricerca Globale Unificata**: Potenziata la barra di ricerca del modulo Archivio. Ora è possibile effettuare una ricerca semantica (in linguaggio naturale) su **tutti i documenti** presenti nell'archivio, non solo nella cartella corrente.
* **[Archivio] Ambito di Ricerca**: Aggiunto un interruttore per limitare la ricerca alla sola cartella attualmente visualizzata, offrendo massima flessibilità.
* **[Archivio] Percorso nei Risultati**: I risultati della ricerca ora mostrano il percorso completo della cartella in cui si trova il documento, fornendo un contesto immediato.

## [8.7.0]

### Aggiunto
* **[Archivio] Sistema di Cartelle**: Introdotto un sistema gerarchico completo per organizzare i documenti archiviati.
* **[Archivio] UI a Cartelle**: Riprogettata la pagina Archivio con una **sidebar** per la navigazione ad albero delle cartelle e un'area contenuti principale con breadcrumbs.
* **[Archivio] Gestione Cartelle**: Gli utenti possono ora **creare, rinominare, colorare ed eliminare** cartelle e sottocartelle tramite un'interfaccia modale e menu contestuali.
* **[Archivio] Drag & Drop**: Implementato lo spostamento intuitivo dei documenti tra le cartelle e nell'archivio principale tramite trascinamento.

### Migliorato
* **[Archivio] Ricerca**: La ricerca semantica è ora contestuale alla cartella selezionata.
* **[Archivio] Interfaccia**: L'interfaccia è ora completamente responsiva, con una sidebar a scomparsa su dispositivi mobili.

## [8.6.1]

### Modificato
* Aggiornamento della documentazione e allineamento dei file di versioning.

## [8.6.0]

### Aggiunto
* **[Fotocamera] "Ugo Vision"**: Esperienza di scansione unificata e potenziata dall'AI, sempre attiva.
* **[Fotocamera] Motore di Scansione Avanzato**: Nuovo `DocumentScannerEngine` basato su OpenCV per un rilevamento dei bordi più rapido e affidabile.
* **[Fotocamera] Overlay "Holographic Mesh"**: Una maschera 3D dinamica e interattiva (`DynamicMeshOverlay`) sostituisce il vecchio contorno, fornendo un feedback visivo sulla qualità dello scatto.
* **[Fotocamera] Scatto Automatico "Lock-On"**: Il sistema di scatto automatico ora avvia un "lock-on" con indicatore di progresso per garantire scatti perfetti.

### Migliorato
* **[Fotocamera] Interfaccia Utente**: Riprogettazione completa della `CameraView` con un'estetica moderna, pulita e controlli ottimizzati per l'uso con una sola mano.

### Rimosso
* **[Fotocamera] Selettore "Ugo Experience"**: La funzionalità è ora integrata nell'esperienza di base, eliminando la confusione e semplificando l'interfaccia.

---

## [8.5.0]

### Aggiunto
* **[archivio.ch] Paginazione**: per gestire archivi di grandi dimensioni in modo performante.
* **[archivio.ch] Vista Dettagliata**: modale per visualizzare l'immagine ingrandita e tutti i dati estratti di un documento.
* **[archivio.ch] Menu Contestuale**: (tasto destro) per azioni rapide come **spostare** tra archivio privato/familiare ed **eliminare** documenti.

### Migliorato
* **[archivio.ch] Layout**: riprogettato con una **sidebar fissa** per i filtri (tag con contatore) e un'area contenuti principale, con supporto responsivo per mobile.
* **[archivio.ch] Interattività**: ogni documento è ora cliccabile e gestibile direttamente dall'archivio.

---

## [8.4.0]

### Aggiunto
* **[archivio.ch] Ricerca Semantica**: nuova barra di ricerca “magica” che trova i documenti per contenuto in linguaggio naturale, non solo per titolo.
* **[Piattaforma] Tag automatici**: l’analisi AI ora attribuisce **tag pertinenti** (es. “Fattura”, “Digitale”) visibili sia nel workspace sia in archivio.

### Migliorato
* **[archivio.ch] Interfaccia**: riprogettazione con **sidebar** per filtri istantanei basati sui tag generati dall’AI.

---

## [8.3.0]

### Aggiunto
* **[Profilo] Gestione Famiglia**: sezione per visualizzare/condividere l’**ID Famiglia** e unirsi a un nucleo esistente.
* **[Piattaforma] Inviti via URL**: supporto a `?joinFamily=<ID>` per entrare rapidamente in una famiglia.

### Migliorato
* **[archivio.ch] Trasparenza proprietari**: nell’Archivio Familiare ogni documento mostra il **nome del proprietario**.

---

## [8.2.0]

### Aggiunto
* **[archivio.ch] Ricerca Semantica (prima introduzione)**: barra di ricerca in linguaggio naturale basata sul contenuto.
* **[Servizi] `performSemanticSearch`**: funzione che usa **Gemini** per valutare la pertinenza dei documenti rispetto a una query (logica lato client per il prototipo).

### Migliorato
* **[archivio.ch] UX ricerca**: gestione dinamica dei risultati con **stati di caricamento** e messaggi appropriati.

---

## [8.1.0]

### Aggiunto
* **Archivio Familiare vs Privato**: distinzione chiara tra spazio **condiviso** e **personale**.
* **“Salva come privato”**: opzione durante lo spostamento in `archivio.ch` per controllo totale della privacy.

### Modificato
* **Navigazione a schede**: la pagina di Archivio usa **tab** per passare tra documenti condivisi e privati.

---

## [8.0.0]

### Aggiunto
* **Moduli dedicati**: nuove pagine per `archivio`, `polizze` e `disdette`, ognuna con **branding** proprio.
* **Routing per dominio**: redirezione automatica al modulo corretto in base all’**URL**.

### Modificato
* **Ecosistema unificato**: branding e navigazione cambiano **dinamicamente** secondo il modulo attivo.
* **Dal “Invio” allo “Spostamento interno”**: i documenti si spostano tra `workspace` e moduli interni (niente più invii esterni).

---

## [7.5.0]

### Aggiunto
* **Sincronizzazione in tempo reale**: scansioni, storico, chat e saldo **ScanCoin** si aggiornano istantaneamente su tutti i dispositivi.

### Migliorato
* **Architettura dati**: migrazione a **listener Firestore** per UI reattiva “live”.
* **Offline**: persistenza potenziata per accesso ai dati sincronizzati anche **senza connessione**.

---

## [7.4.3]

### Modificato
* **Consenso “opt-in”**: l’accesso di **Ugo** al contesto documenti è **disattivato di default**. Su domande che richiedono contesto, Ugo **guida all’attivazione** nelle impostazioni.

---

## [7.4.2]

### Corretto
* **Flusso consenso**: risolto bug che faceva mostrare a Ugo l’avviso privacy **ad ogni interazione** anche dopo il permesso.

---

## [7.4.1]

### Corretto
* **Impostazioni Chatbot**: la sezione nel Profilo ora è **visibile e funzionante**.

---

## [7.4.0]

### Aggiunto
* **Sezione “Impostazioni Chatbot”**: centro unico per opzioni di Ugo (assistenza proattiva, gamification, archivio chat).
* **Pulsante ingranaggio**: accesso rapido alle impostazioni dalla chat.

### Chiarimento
* **Popup consenso**: mostrato **una sola volta** anche agli utenti esistenti, dati i potenziamenti funzionali.

---

## [7.3.0]

### Migliorato
* **Ugo contestuale globale**: può **vedere** e **rispondere** su **tutti** i documenti in workspace.
* **Istruzioni Ugo**: rafforzate per evitare **errori di privacy** e garantire l’**esecuzione corretta** delle azioni JSON.

### Aggiunto
* **Unico consenso**: popup **singolo** per l’analisi dei documenti.

---

## [7.2.0]

### Migliorato
* **Ugo Detective & Summarizer**: ricerca semantica più profonda e **riepilogo multi-fascicolo**.

### Corretto
* **Esecuzione comandi**: fix a un bug critico che bloccava le **azioni richieste** (es. unione fascicoli).

### Aggiunto
* **Consenso riepilogo**: popup di privacy la **prima** volta che si usa il riepilogo multi-documento.

---

## [7.1.1]

### Migliorato
* **Fotocamera**: avvio **multi-pagina** di default.
* **Auto-scatto**: **pausa 2s** tra le scansioni per cambio documento.

### Aggiunto
* **Copia ID**: pulsante per copiare l’**UUID** di ogni pagina.

---

## [7.1.0]

### Aggiunto
* **Integrazione Firestore**: persistenza/sync cloud di scansioni, storico, chat e preferenze.

### Migliorato
* **Profilo & ScanCoin**: sincronizzati **cross-device**.
* **Offline**: abilitata la persistenza locale di Firestore.

### Modificato
* **Coda file**: non più persistente tra sessioni (evita sync di file locali tra dispositivi).

---

## [7.0.1]

### Aggiunto
* **Anti-spam Ugo**: filtri contenuti + **rate limit**.

### Migliorato
* **Sicurezza Ugo**: enforcement costante delle **policy di Gemini**.

---

## [7.0.0]

### Modificato
* **Storico versioni**: ristrutturazione completa, rimosse date fittizie.

### Corretto
* **Banner prototipo**: fix sovrapposizione su schermi piccoli.

### Migliorato
* **Major release**: marcata una nuova fase di **maturità** dell’app.

---

## [6.44.0]

### Aggiunto
* **Selettore Modalità Intelligente**: suggerisce la migliore analisi per i file.
* **Fallback Offline**: lavoro **senza connessione**, attivabile dal profilo.

### Migliorato
* **Flusso con conferma**: fase di **“attesa”** prima dell’elaborazione per confermare la modalità.

---

## [6.43.0]

### Aggiunto
* **Modalità “Documento d’Identità”**: estrazione dati da carte/patenti.

### Migliorato
* **Lente fotocamera**: **fissa in un angolo** per usabilità.

---

## [6.42.0]

### Aggiunto
* **Tour guidato**: lanciabile in qualsiasi momento da Profilo o chiedendo a **Ugo**.

---

## [6.41.0]

### Migliorato
* **Tour**: copertura **più ampia** e interattiva.
* **Onboarding**: **Prova Demo** propone l’avvio del tour.

---

## [6.40.0]

### Modificato
* **UI fotocamera**: design moderno con **controlli fluttuanti**.

### Aggiunto
* **Ugo Experience**: maschera 3D in tempo reale per **guidare lo scatto**.
* **Galleria multi-scatto**: revisione/gestione scansioni della sessione.

### Migliorato
* **Ritaglio post-scatto**: lente d’ingrandimento per **posizionamento preciso** degli angoli.

---

## [6.39.0]

### Migliorato
* **Cambio modalità**: possibile **anche con coda in esecuzione**.

---

## [6.38.0]

### Migliorato
* **Ugo proattivo**: suggerimenti su documenti non sicuri o saldo **basso**.

### Aggiunto
* **Gamification**: **bonus ScanCoin** per interazioni cordiali con Ugo.

---

## [6.37.0]

### Migliorato
* **Architettura Ugo**: conversazioni **più stabili** e reattive.

### Corretto
* **Redo**: non si comporta più come **Undo**.

---

## [6.36.0]

### Aggiunto
* **Tour guidato interattivo** per nuovi utenti.

---

## [6.35.0]

### Migliorato
* **Rilevamento tipo documento**: feedback **live** (A4, scontrino, ecc.).
* **Edge detection**: maggiore **affidabilità** in luci difficili.

---

## [6.34.0]

### Migliorato
* **Menu circolare**: supporta interazione **“premi e rilascia”**.
* **Selettore tema**: opzioni di **primo livello** nel menu contestuale.

---

## [6.33.0]
### Aggiunto
* **Menu contestuale globale**: (tasto destro su aree vuote) per un accesso rapido alle azioni più comuni come il cambio tema o l'avvio della fotocamera.
* **Menu contestuale per Storico**: (tasto destro su una riga dello storico) per trovare il fascicolo correlato nell'area di lavoro o segnalare un problema a Ugo.

---

## [6.32.0]
### Aggiunto
* **Menu Contestuale Circolare**: Implementato un nuovo menu radiale (tasto destro) sui fascicoli per un accesso rapido a tutte le azioni principali (seleziona, espandi, invia, scarica ZIP/PDF, dividi).

---

## [6.31.0]
### Migliorato
* **Chatbot Interattivo**: Potenziato Ugo per permettergli di eseguire azioni sull'interfaccia (es. cambiare tema) e rispondere ai feedback degli utenti (pollice su/giù).

---

## [6.30.0]
### Corretto
* **Installazione PWA**: Migliorata la logica del pulsante "Installa App" nel profilo, che ora fornisce aiuto se l'installazione non è immediatamente disponibile. Ugo è ora più intelligente nel gestire questa richiesta.

---

## [6.28.0]
### Aggiunto
* **Progressive Web App (PWA)**: L'applicazione è ora installabile su desktop e mobile per un'esperienza nativa e un accesso più rapido.
* **Supporto Offline**: Grazie al service worker, l'app si avvia e funziona anche senza connessione internet (con dati precedentemente caricati).

---

## [6.27.0]
### Modificato
* **Pagina Prezzi Riprogettata**: La pagina dei prezzi è stata ridisegnata per dare priorità ai pacchetti di ricarica singola, presentando gli abbonamenti come un'opzione per un valore aggiunto.

---

## [6.26.0]
### Aggiunto
* **Modello a Abbonamenti**: Introdotta una nuova pagina prezzi con piani di abbonamento mensili/annuali e un'offerta speciale "Founders Edition".

---

## [6.25.0]
### Aggiunto
* **Funzionalità Nascoste Ugo**: Implementati "easter eggs" per il chatbot: gestione proattiva dei reclami con rimborsi, inviti a una community per utenti fedeli e supporto per i dialetti svizzeri.

---

## [6.24.0]
### Aggiunto
* **Selettore Tema**: Implementato un selettore di tema completo (Chiaro/Scuro/Sistema) nella pagina Profilo per personalizzare l'aspetto dell'app.
### Corretto
* Risolti bug critici che impedivano al selettore di tema di funzionare correttamente.

---

## [6.23.0]
### Aggiunto
* **Miglioramenti UI/UX**: Introdotta una vista a griglia opzionale per i risultati, un sistema di tagging per i fascicoli e un selettore di tema (prima implementazione).

---

## [6.22.0]
### Aggiunto
* **Importazione da Google Drive**: Integrato Google Picker per importare file direttamente da Google Drive.

---

## [6.21.0]
### Migliorato
* **Qualità Analisi AI**: Aggiunta una fase di pre-elaborazione delle immagini (miglioramento del contrasto) tramite OpenCV.js per aumentare l'accuratezza dell'OCR.

---

## [6.20.0]
### Migliorato
* **Interfaccia Utente**: Riprogettata la barra delle azioni per essere contestuale: appare solo quando uno o più fascicoli sono selezionati, semplificando l'UI.

---

## [6.19.2]
### Aggiunto
* **Download Documenti Legali**: Aggiunta la possibilità di scaricare i Termini di Servizio e la Privacy Policy in formato PDF.

---

## [6.19.1]
### Migliorato
* **Layout Globale**: Aggiunto un footer consistente in tutta l'applicazione per un aspetto più professionale.

---

## [6.19.0]
### Aggiunto
* **Framework Privacy e Consenso**: Introdotta l'accettazione dei Termini e della Privacy alla registrazione e un nuovo "Centro Privacy" nel profilo.

---

## [6.18.0]
### Aggiunto
* **Metadati Avanzati**: Potenziati i file esportati (immagini, PDF, ZIP) con metadati visibili (watermark con ID/timestamp) e invisibili per garantire tracciabilità e autenticità.

---

## [6.17.1]
### Migliorato
* **Layout Iniziale**: Riprogettata la schermata di avvio con una struttura a tre colonne per un flusso di lavoro più chiaro su schermi grandi.

---

## [6.17.0]
### Aggiunto
* **Importazione via Email**: Implementata l'interfaccia per importare documenti inviandoli a un indirizzo email temporaneo.

---

## [6.16.2]
### Migliorato
* **UI Caricamento File**: Perfezionato il design del componente di upload per una maggiore coerenza visiva.

---

## [6.16.1]
### Migliorato
* **Flusso Chatbot**: Ugo ora gestisce meglio la navigazione tra le pagine, riaprendo la chat automaticamente.
### Corretto
* Risolto un bug che causava il reset della cronologia della chat ad ogni apertura.

---

## [6.16.0]
### Aggiunto
* **Superpotenziamento Chatbot "Ugo"**: Ugo è ora proattivo, può eseguire azioni, ha una memoria a lungo termine e può usare risposte multimodali (immagini).

---

## [6.15.3]
### Migliorato
* **Potenziamento Chatbot "Ugo"**: Aggiunti saluti contestuali, risposte rapide e feedback con pollice su/giù. La cronologia ora persiste durante la sessione.

---

## [6.15.2]
### Aggiunto
* **Gamification "Utenti Gentili"**: Ugo può ora premiare gli utenti cordiali con ScanCoin bonus.

---

## [6.15.1]
### Corretto
* **Modalità Demo**: La demo ora include un esempio di estrazione di immagini, rendendo la funzionalità visibile.

---

## [6.15.0]
### Aggiunto
* **Estrazione Immagini Opzionale**: Implementata la capacità di estrarre loghi, firme e foto dai documenti con un costo aggiuntivo.

---

## [6.14.0]
### Aggiunto
* **Ritaglio Manuale di Precisione**: Dopo lo scatto con la fotocamera, è ora possibile aggiustare manualmente i bordi del documento con l'aiuto di una lente d'ingrandimento.

---

## [6.13.0]
### Migliorato
* **Robusteza e Sicurezza**: Implementata la persistenza della coda di lavoro in IndexedDB e attivati i filtri di sicurezza di Gemini per prevenire contenuti dannosi.

---

## [6.12.0]
### Migliorato
* **Rilevamento Documenti Piccoli**: Migliorata la sensibilità del rilevamento bordi in fotocamera per riconoscere anche scontrini e documenti di piccole dimensioni.

---

## [6.11.0]
### Aggiunto
* **Modalità Scontrino**: Nuova modalità specializzata per estrarre dati strutturati (voci, prezzi, totale) da scontrini e ricevute.

---

## [6.10.0]
### Aggiunto
* **Esportazione PDF per Fascicolo**: Ogni fascicolo può ora essere scaricato come un singolo file PDF multi-pagina.
* **Tentativi di Rianalisi**: Aggiunta la possibilità di riprovare fino a 3 volte una scansione fallita o di bassa qualità.

---

## [6.9.9]
### Corretto
* Risolto un bug di scorrimento su dispositivi mobili nella pagina di scansione.

---

## [6.9.8]
### Aggiunto
* **Modalità Primarie Configurabili**: È ora possibile scegliere nel profilo quali due modalità di scansione visualizzare per un accesso rapido.
### Migliorato
* **Nomi Modalità**: Rinominato le modalità di scansione con nomi più commerciali.

---

## [6.9.7]
### Aggiunto
* **Download ZIP Protetto da Password**.
* **Cookie Banner e Integrazione Clarity**.
### Migliorato
* Il logo nell'header ora è un link navigabile alla home.
* La pagina prezzi mostra stime del numero di scansioni per pacchetto.

---

## [6.9.6]
### Aggiunto
* **Indicatori Visivi per Modalità**: Aggiunto un bordo colorato ai risultati per identificare a colpo d'occhio la modalità usata.
### Migliorato
* **Flash Automatico**: Riabilitato il flash automatico in fotocamera.
* **Flusso di Lavoro**: Il selettore di modalità è ora sempre attivo.

---

## [6.9.5]
### Aggiunto
* **Modalità "Simple Scan"**: Nuova modalità gratuita (0 ScanCoin) per la digitalizzazione senza analisi AI.

---

## [6.9.3]
### Migliorato
* **Dashboard**: Spostato lo storico delle sessioni dal Profilo alla Dashboard per una migliore centralizzazione.
### Aggiunto
* **Report PDF**: È ora possibile scaricare lo storico delle transazioni in formato PDF.

---

## [6.9.4]
### Aggiunto
* **Modalità "Deep Scan"**: Nuova modalità di elaborazione specializzata per l'estrazione completa del testo da documenti densi come libri o contratti.

---

## [6.5.0]
### Aggiunto
* **Scheda Info per Modalità**: Introdotta una modale di confronto dettagliata per tutte le modalità di scansione.

---

## [6.4.0]
### Migliorato
* **Performance Liste Lunghe**: Implementata la virtualizzazione completa dei risultati per gestire un gran numero di documenti senza rallentamenti.
### Aggiunto
* **Banner di Benvenuto**: Aggiunto un banner per guidare i nuovi utenti nell'area di lavoro vuota.

---

## [6.3.0]
### Migliorato
* **Aggiornamento Statistiche**: Le statistiche totali (costo, scansioni) si aggiornano ora in tempo reale dopo ogni scansione, non solo a fine sessione.

---

## [6.2.0]
### Corretto
* **Prompt Gemini**: Risolto un problema critico nel prompt AI che causava fallimenti nell'analisi.
* **Usabilità**: Rimosso il blocco dal selettore di modalità durante l'elaborazione.

---

## [6.1.0]
### Aggiunto
* **Ricerca e Scorciatoie**: Introdotta la ricerca per fascicoli e scorciatoie da tastiera.
### Migliorato
* **Refactoring Fotocamera**: Suddivisa la logica della fotocamera in custom hook per una migliore manutenibilità.

---

## [6.0.1]
### Corretto
* Risolti bug critici che impedivano il corretto funzionamento della fotocamera e dello scatto automatico.

---

## [6.0.0]
### Aggiunto
* **Rilevamento Bordi con OpenCV**: Reintrodotta e stabilizzata la scansione da fotocamera con rilevamento bordi in tempo reale e correzione prospettica automatica.

---

## [5.7.1]
### Corretto
* **UI Fotocamera**: Ripristinato il layout precedente della fotocamera e risolti i problemi di allineamento dell'overlay video.

---

## [5.7.0]
### Aggiunto
* Implementato il rilevamento dei bordi e il ritaglio automatico tramite OpenCV.js.
* Lo scatto viene automaticamente ritagliato e corretto nella prospettiva.
* La modalità "Scatto Rapido" è stata potenziata per scattare solo quando un documento è rilevato e il dispositivo è in piano.

---

## [5.6.0]
### Aggiunto
* Implementata la "Modalità Scatto Rapido" nella fotocamera.
* Aggiunto un interruttore per attivarla e la logica per scattare automaticamente quando il dispositivo è in piano.

---

## [5.5.0]
### Aggiunto
* Implementata la funzionalità di feedback per le singole scansioni. L'utente può ora indicare se l'analisi di una pagina è buona o cattiva.
* Aggiunto un campo opzionale `feedback` all'interfaccia `ProcessedPageResult`.

---

## [5.4.0]
### Migliorato
* La chat è stata resa persistente, mantenendo la cronologia durante la navigazione. Lo stato è stato spostato in `App.tsx`.

---

## [5.3.0]
### Migliorato
* Eseguito il rebranding delle modalità di elaborazione con nomi più commerciali.
* Aggiunto il costo per scansione di fianco alla descrizione di ogni modalità per massima trasparenza.
* Aggiornata tutta l'interfaccia per riflettere i nuovi nomi.

---

## [5.2.0]
### Aggiunto
* Aggiunti indicatori di modalità e timestamp a ogni pagina scansionata.
* Implementata una filigrana (watermark) sulle immagini elaborate.
* Introdotta la funzione "Riprova Scansione".
### Migliorato
* Migliorata la gestione degli errori.

---

## [5.1.0]
### Aggiunto
* Introduzione di un conteggio scansioni e costo lato client.
* Differenziazione dei costi per modalità.
