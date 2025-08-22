# Changelog

Tutte le modifiche degne di nota a questo progetto saranno documentate in questo file.

Il formato si basa su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
* **Menu contestuale globale** (tasto destro su aree vuote).
* **Menu storico**: scorciatoia per trovare fascicoli **correlati**.

---

## [6.32.0]

### Aggiunto
* **Menu Contestuale Circolare** su fascicolo per accesso rapido ad **azioni principali**.

---

## [6.31.0]

### Migliorato
* **Ugo controlla impostazioni**: può modificare **tema/modalità** via testo.
* **Feedback conversazionale**: Ugo risponde a 👍/👎 con toni **naturali**.

---

## [6.30.0]

### Migliorato
* **Install PWA**: pulsante sempre **visibile** nel Profilo con indicazione supporto.
* **Messaggi Ugo**: spiega l’installazione quando il browser **non è compatibile**.

---

## [6.28.0]

### Aggiunto
* **PWA**: installabile su desktop e mobile, con **supporto offline**.

---

## [6.27.0]

### Migliorato
* **Prezzi**: riprogettata la pagina, enfasi sui pacchetti a **ricarica singola**; abbonamenti come **valore aggiunto**.

---

## [6.26.0]

### Aggiunto
* **Abbonamenti**: piani **mensili/annuali** + **Founders Edition** a tempo limitato.

---

## [6.25.0]

### Aggiunto
* **Ugo Easter Egg**: gestione reclami con **rimborsi**, inviti a community, **dialetti svizzeri**.

---

## [6.24.0]

### Aggiunto
* **Tema**: selettore **Chiaro/Scuro/Sistema**.

### Corretto
* **Tema scuro**: risolti bug di applicazione.

---

## [6.23.0]

### Aggiunto
* **Vista griglia** per risultati **compatti**.
* **Tagging** per organizzare e **cercare** fascicoli.

---

## [6.22.0]

### Aggiunto
* **Import Google Drive**: acquisizione diretta dal **cloud**.

---

## [6.21.0]

### Migliorato
* **Pre-elaborazione immagini (CLAHE)**: qualità e accuratezza **migliorate** per l’analisi AI.

---

## [6.20.0]

### Migliorato
* **Barra azioni**: ora **contestuale**, appare solo con selezione fascicoli.

---

## [6.19.2]

### Aggiunto
* **Documenti legali**: **download PDF** di Termini e Privacy.

---

## [6.19.1]

### Aggiunto
* **Footer globale** su tutte le pagine.

---

## [6.19.0]

### Aggiunto
* **Framework privacy**: accettazione **obbligatoria** dei termini e **Centro Privacy** nel profilo.

---

## [6.18.0]

### Aggiunto
* **Metadati avanzati**: **UUID/timestamp** come **watermark** e nei file esportati (PDF, ZIP).

---

## [6.17.1]

### Migliorato
* **Layout iniziale**: struttura a **tre colonne** su schermi grandi.

---

## [6.17.0]

### Aggiunto
* **Import via email temporanea**: invia documenti a un **indirizzo dedicato**.

---

## [6.16.2]

### Migliorato
* **Dropzone**: feedback visivo **coerente** nel box di caricamento.

---

## [6.16.1]

### Migliorato
* **Ugo**: riapertura **automatica** dopo navigazione.

### Corretto
* **Cronologia chat**: non si **resetta** ad ogni apertura.

---

## [6.16.0]

### Aggiunto
* **Ugo potenziato**: assistenza **proattiva**, esecuzione **azioni**, **memoria** a lungo termine e **multimodale**.

---

## [6.15.3]

### Migliorato
* **Ugo UX**: saluti **contestuali**, **risposte rapide** suggerite, **feedback granulare**.

---

## [6.15.2]

### Aggiunto
* **Easter Egg**: Ugo può premiare con **ScanCoin bonus**.

---

## [6.15.1]

### Migliorato
* **Demo**: esempi di **estrazione immagini** inclusi.

---

## [6.15.0]

### Aggiunto
* **Estrazione immagini**: loghi/firme prelevati durante l’analisi.

---

## [6.14.0]

### Migliorato
* **Schermata ritaglio**: lente d’ingrandimento per **precisione assoluta**.

---

## [6.13.0]

### Migliorato
* **Coda lavoro**: **persistente** e riprende dopo ricarica.

### Aggiunto
* **Filtri sicurezza Gemini**: blocco contenuti **dannosi**.

---

## [6.12.0]

### Migliorato
* **Rilevamento documenti**: più **sensibile**, riconosce **scontrini** e formati piccoli.

---

## [6.11.0]

### Aggiunto
* **Modalità “Scontrino”**: estrazione **dettagliata** delle voci.

---

## [6.10.0]

### Aggiunto
* **Export PDF multi-pagina** per ogni fascicolo.
* **Retry intelligente** su scansioni **fallite** o di **bassa qualità**.

---

## [6.9.9]

### Corretto
* **Scroll mobile**: non riporta più la vista in **cima**.

---

## [6.9.8]

### Aggiunto
* **Preferenze modalità**: configurazione da **Profilo**.

### Migliorato
* **Naming modalità**: nomi più **commerciali** e descrittivi.

---

## [6.9.7]

### Aggiunto
* **ZIP protetti** da **password**.
* **Cookie banner** + integrazione **Microsoft Clarity**.

---

## [6.9.6]

### Migliorato
* **Flash**: **auto** riabilitato + **indicatore** stato.
* **Indicatori colore**: mostrano la **modalità** nei risultati e in coda.

---

## [6.9.5]

### Aggiunto
* **“Simple Scan” (No-AI)**: digitalizzazione **senza analisi dati**.

---

## [6.9.4]

### Aggiunto
* **“Deep Scan”**: estrazione **completa** del testo da documenti lunghi.

---

## [6.9.3]

### Migliorato
* **Storico transazioni**: spostato in **Dashboard** e **scaricabile in PDF**.

---

## [6.5.0]

### Aggiunto
* **Modale comparativa**: confronto **dettagliato** di tutte le modalità di scansione.

---

## [6.4.0]

### Migliorato
* **Virtualizzazione risultati**: performance migliori con molte voci.

### Aggiunto
* **Banner di benvenuto**: guida iniziale in workspace **vuoto**.

---

## [6.3.0]

### Migliorato
* **Statistiche**: costi e totale scansioni si **aggiornano in tempo reale**.

---

## [6.2.0]

### Corretto
* **Prompt Gemini**: fix a un problema **critico** che causava fallimenti.

### Migliorato
* **Cambio modalità on-the-fly**: possibile anche durante **elaborazione**.

---

## [6.1.0]

### Aggiunto
* **Ricerca fascicoli** + **scorciatoie tastiera** per azioni principali.

### Migliorato
* **Refactor fotocamera**: estrazione in **custom hook** per manutenibilità.

---

## [6.0.1]

### Corretto
* **Fotocamera**: fix a bug su **scatto** e **flash**.

---

## [6.0.0]

### Aggiunto
* **Scansione da fotocamera** stabile con **OpenCV** (rilevamento bordi + ritaglio automatico).

### Modificato
* **Major 6.0.0**: promossa la feature a **principale e matura**.

---

## [5.7.1]

### Corretto
* **Overlay fotocamera**: risolti problemi di **layout** e **disallineamento**.

---

## [5.7.0]

### Aggiunto
* **OpenCV.js (prima implementazione)**: **rilevamento bordi** e **ritaglio automatico**.

---

## [5.6.0]

### Aggiunto
* **“Scatto Rapido”**: scatta **automaticamente** quando il dispositivo è in **piano**.

---

## [5.5.0]

### Aggiunto
* **Feedback per scansione**: pollice su/giù su ogni **singola pagina**.

---

## [5.4.0]

### Migliorato
* **Chat**: cronologia **persistente** durante la navigazione nella sessione.

---

## [5.3.0]

### Migliorato
* **Naming modalità**: più **commerciale**.

### Aggiunto
* **Costo stimato in CHF**: visibile per ogni **modalità**.

---

## [5.2.0]

### Aggiunto
* **Indicatori**: **modalità**, **timestamp** e **watermark** sulle immagini.
* **Riprova Scansione**: rielaborazione di **singole pagine**.

---

## [5.0.1]

### Corretto
* **Accesso fotocamera**: gestione migliore quando la **posteriore non è disponibile** (fallback **frontale**; evita “Requested device not found”).

---

## [5.0.0]

### Modificato
* **Duplicati “Human-in-the-loop” (correzione critica)**: non blocca più i file; li segna come **“Potenziali Duplicati”** con analisi di **somiglianza interna** (non AI). L’utente **conferma/nega** con nuovi pulsanti → meno falsi positivi, più affidabilità.
* **Raggruppamento deterministico**: rafforzata la logica su **ID file sorgente** come metodo **primario**; l’AI resta **solo di supporto** per la coerenza titoli.

---

## [4.0.0]

### Corretto
* **Raggruppamento deterministico (correzione critica)**: ogni pagina estratta da un file riceve **`sourceFileId` univoco** → le pagine **tornano sempre insieme**. Fix definitivo ai fascicoli che mostravano un solo file/contatore errato. L’AI è **fallback** per foto singole.

---

## [3.9.0]

### Aggiunto
* **Gestione duplicati interattiva**:

  * **Avviso chiaro** con **nome file originale** coincidente.
  * **Confronto visivo**: modale **fianco a fianco** tra scansione e documento originale.
  * **Override manuale**: pulsante **“Non è un duplicato”** per forzare nuova analisi **ignorando** il rilevamento.

### Corretto
* **Raggruppamento AI definitivo**: istruzioni **algoritmiche**; l’AI trova un **titolo “master”** per il fascicolo e deriva **chiavi** da quello. Fix per **raggruppamento impreciso** e **conteggio pagine**.

---

## [3.8.0]

### Corretto
* **Raggruppamento AI & conteggio**: prompt più **algoritmico** → fix ai fascicoli con un solo file/contatore errato.
* **Spinner coda**: sostituito con **SVG** fluido (arco in rotazione).
* **Pulsanti invio**: struttura interna riprogettata; fix **disallineamenti** e **testi** inattesi; aggiunti **divisori verticali**.
* **Sovrapposizione UI**: più spazio in fondo alla lista per non coprire l’ultimo fascicolo con la **barra sticky**.

### Modificato
* **Loghi partner**: nuovi **SVG wordmark** di `archivio.ch` e `polizze.ch` nei pulsanti e in home.

---

## [3.7.0]

### Aggiunto
* **Dividi fascicolo**: pulsante **“Dividi”** su multipagina per separare documenti uniti per errore.
* **Riprova raggruppamento intelligente**: pulsante **“Riprova”** che unisce fascicoli selezionati in base al **criterio più comune**.
* **Invio flessibile**: pulsanti per **tutte le destinazioni** su ogni fascicolo; quella suggerita dall’AI è **evidenziata**.
* **Invia tutti**: smistamento **massivo** dei fascicoli **sicuri** con **doppia conferma**.

### Modificato
* **Stile pulsanti invio**: sfondo **neutro** per far risaltare i **loghi**.
* **Raggruppamento AI**: istruzioni più **rigide** e **algoritmiche** (migliora conteggio pagine).
* **Icona “Riprova”**: da **Sparkles** a **ArrowsPath** più intuitiva.

### Corretto
* **Spinner coda**: sostituzione con SVG più **fluido**.
* **Sovrapposizione UI**: extra **spazio** in fondo alla lista.

---

## [3.6.0]

### Aggiunto
* **Roadmap in `README.md`**: note per **sviluppi futuri** (es. possibile re-introduzione/monetizzazione “Scatto Rapido”).

---

## [3.5.1]

### Corretto
* **Layout header**: fix **sovrapposizione** tra testo benvenuto e logo.
* **Interfaccia fotocamera**: rollback a versione **stabile** e **mobile-friendly**; guida all’allineamento **affidabile**.

---

## [3.5.0]

### Modificato
* **Fotocamera mobile-first**: controlli **grandi**, spaziati, **intuitivi** in stile app nativa.
* **Guida all’allineamento**: logica sensori **riscritta** (permessi gestiti, feedback chiaro).

---

## [3.4.0]

### Aggiunto
* **Storico utilizzo & costi**: sezione nel profilo con **token** (in/out), **costo stimato** e **pagine** elaborate.
* **Salvataggio storico**: su **“Pulisci Sessione”**, lo storico corrente viene **archiviato** prima di svuotare l’area di lavoro.
* **Coda visiva**: pannello sinistro mostra **in tempo reale** i file in **attesa** e in **analisi**.

### Modificato
* **Cancellazione account**: rimuove anche **tutto lo storico**.
* **Processo di analisi**: aggiornamento **stato coda** per maggiore **trasparenza**.

---

## [3.3.0]

### Aggiunto
* **Raggruppamento intelligente**: AI raggruppa automaticamente pagine in **fascicoli** usando il **nome file** suggerito.
* **Invio contestuale**: pulsanti specifici per **destinazioni** (`polizze.ch`, `archivio.ch`).
* **Download per fascicolo**: export **ZIP** del solo fascicolo.

### Modificato
* **UI risultati**: da lista piatta a **fascicoli espandibili**.
* **Invio**: gestione di **interi fascicoli** per mantenerli uniti.

---

## [3.2.0]

### Aggiunto
* **Comunicazione inter-app**: `BroadcastChannel` per inviare documenti ad altre app dell’ecosistema **senza server**.
* **Pulsanti invio multipli**: scorciatoie per **varie destinazioni**.

### Rimosso
* **Archivio locale**: eliminati pagina e **IndexedDB** interni; l’app è un **hub** e delega lo storage.

### Modificato
* **Flusso semplificato**: dopo invio **riuscito**, i documenti vengono **rimossi** dalla sessione.

---

## [3.1.0]

### Aggiunto
* **Login USSO**: nuovo metodo di accesso.
* **Icona personalizzata**: per il login USSO.

### Modificato
* **Pagina login**: mostra **entrambe** le opzioni (email/password e USSO) **separate** visivamente.

---

## [3.0.0]

### Aggiunto
* **Autenticazione completa**: login, registrazione e **profilo**; accesso **obbligatorio** per usare l’app.
* **Persistenza sessione**: via **`localStorage`**.
* **Pagina profilo**: info utente, **logout** e cancellazione **account/dati**.

### Modificato
* **Ingresso**: la landing ora indirizza a **login/registrazione**.
* **Header dinamico**: link al profilo e **logout** per utenti autenticati.
* **Reset allo logout**: l’app si **resetta** completamente per pulizia dati.