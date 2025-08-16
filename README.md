# scansioni.ch

**Versione: 9.0.0**

Un'applicazione web avanzata per estrarre dati strutturati da documenti, basata su un'architettura "human-in-the-loop" e un'economia interna basata su "ScanCoin".

## Descrizione

**scansioni.ch** è ora un ecosistema digitale unificato che integra **archivio.ch**, **polizze.ch** e **disdette.ch** in un'unica piattaforma modulare. L'applicazione adatta dinamicamente il suo aspetto e le sue funzionalità in base al dominio da cui si accede, offrendo un'esperienza su misura pur mantenendo un'unica base di codice sicura e sincronizzata in tempo reale.

## Caratteristiche Principali

- **Piattaforma Modulare Unificata**: L'app integra i servizi di archivio, polizze e disdette, con un'interfaccia e un branding che si adattano dinamicamente al dominio di accesso (es. `archivio.ch`, `polizze.ch`).
- **Sincronizzazione in Tempo Reale**: Le tue scansioni, lo storico, le preferenze e il saldo ScanCoin sono sincronizzati istantaneamente su tutti i tuoi dispositivi grazie a Firebase Firestore.
- **Progressive Web App (PWA)**:
  - **Installabile**: Aggiungi l'app alla tua schermata principale o al desktop per un accesso rapido.
  - **Supporto Offline**: Grazie al caching intelligente e alla persistenza offline di Firestore, l'app si avvia istantaneamente e i dati precedentemente sincronizzati sono disponibili anche senza connessione internet.
- **Miglioramenti UI/UX Personalizzabili**:
  - **Tema Adattivo**: Un selettore completo (Chiaro, Scuro, Sistema) permette di personalizzare l'aspetto dell'interfaccia. La scelta viene salvata per garantire coerenza tra le sessioni.
- **Framework Privacy e Consenso**: Consenso esplicito ai Termini di Servizio e Privacy Policy alla registrazione, con un nuovo "Centro Privacy" per la gestione dei dati.
- **Metadati Avanzati**: Ogni file esportato (immagine, PDF, JSON) è arricchito con metadati visibili (watermark con ID univoco) e invisibili (proprietà del file conformi agli standard) per garantire tracciabilità, integrità e autenticità.
- **Economia a "ScanCoin"**: L'app utilizza una valuta interna. Gli utenti acquistano pacchetti di ScanCoin per le loro esigenze o scelgono un abbonamento per ricevere una ricarica mensile a un prezzo vantaggioso. Ogni operazione ha un costo trasparente in monete.
- **Importazione Multi-sorgente**: Offre moltepli modi per aggiungere documenti:
  - **Drag-and-drop** e selezione file locale.
  - **Importazione via Email**: Fornisce un indirizzo email temporaneo per ricevere documenti.
  - **Importazione da Google Drive**: Integra Google Picker per importare file direttamente dal cloud.
- **Modalità Demo Interattiva**: Un pulsante "Prova una Demo" popola istantaneamente l'app con un set di documenti di esempio (fatture, polizze, ecc.) con immagini generate dinamicamente.
- **Rilevamento Duplicati "Human-in-the-loop"**: Il sistema contrassegna i potenziali duplicati e lascia all'utente la decisione finale tramite un comodo confronto visivo.
- **Raggruppamento Deterministico e Manuale**: Le pagine vengono raggruppate in modo affidabile, con strumenti manuali per unire, dividere o correggere i fascicoli.
- **Assistente AI "Ugo" Superpotenziato**: Un chatbot basato su Gemini che ora include:
  - **Assistenza Proattiva**: Offre consigli contestuali basati sullo stato dell'area di lavoro (es. documenti non sicuri, saldo basso).
  - **Esecuzione di Azioni**: Esegue comandi complessi dati in linguaggio naturale (es. "Unisci tutte le fatture di E-Corp").
  - **Memoria a Lungo Termine**: La cronologia della chat persiste tra le sessioni, creando un'esperienza personalizzata.
  - **Risposte Multimodali**: Può includere contenuti visivi (immagini) nelle sue risposte per una maggiore chiarezza.
  - **Funzionalità Nascoste (Easter Eggs)**: Include un sistema di ricompense per la gentilezza, gestione dei reclami con rimborsi e inviti a una community per utenti fedeli.
  - **Adattamento Linguistico Avanzato**: Riconosce e risponde nelle lingue e dialetti svizzeri, aggiungendo personalità all'interazione.
- **Download Sicuro e Flessibile**: Esporta i fascicoli come ZIP o come singoli PDF multi-pagina.
- **Coda di Lavoro Flessibile e Modalità Multiple**: Aggiungi file a una coda continua e scegli la modalità di scansione per i prossimi caricamenti anche mentre altri file sono in elaborazione. Sono disponibili le modalità "Chroma Scan", "Quick Scan", "Batch Scan", "Deep Scan", "Scontrino" o la modalità gratuita "Simple Scan".
- **Archivio Newsletter**: Una sezione dedicata dove gli utenti possono leggere tutti gli aggiornamenti passati, le guide e gli annunci.

### Ugo Vision: Scansione da Fotocamera Professionale
- **Motore di Scansione Avanzato (OpenCV.js)**: Rileva, ritaglia e raddrizza automaticamente i documenti con un motore ad alte prestazioni.
- **Feedback Visivo "Holographic Mesh"**: Un overlay 3D dinamico e interattivo fornisce un feedback in tempo reale sulla qualità dello scatto, guidando l'utente verso la perfezione.
- **Scatto Automatico "Lock-On"**: Il sistema cattura l'immagine automaticamente solo quando l'inquadratura, la stabilità e la luce sono ottimali, garantendo scansioni sempre perfette.
- **Ritaglio Manuale di Precisione**: Dopo lo scatto, puoi aggiustare manualmente i 4 angoli del documento con l'aiuto di una lente d'ingrandimento per un controllo totale.

### Analisi AI con Gemini & Sicurezza
- **Estrazione Dati Intelligente**: Utilizza **Google Gemini** per classificare il documento, estrarre dati chiave e generare riassunti.
- **Estrazione Immagini Opzionale**: Identifica ed estrae immagini (loghi, firme) direttamente dai documenti.
- **Controllo di Sicurezza Integrato**: Ogni documento viene analizzato per minacce come **Phishing** e **SQL Injection**.

## Stack Tecnologico

- **Frontend**: React, TypeScript, Tailwind CSS
- **PWA**: Web App Manifest, Service Workers
- **Computer Vision**: OpenCV.js
- **Database**: Google Firebase Firestore (con persistenza offline)
- **Autenticazione**: Google Firebase Auth
- **AI**: Google Gemini API (`@google/genai`)

## Installazione e Avvio

L'applicazione è progettata per essere eseguita in un ambiente web statico.

1.  **Configura la API Key**:
    - L'applicazione richiede una API Key di Google Gemini.
    - Questa chiave deve essere disponibile come variabile d'ambiente `process.env.API_KEY`.
2.  **Apri `index.html`**.

## Struttura del Progetto

```
/
├── components/
├── contexts/           # React Contexts (es. AuthContext, ThemeContext)
├── pages/              # Componenti per le pagine principali (Login, Dashboard, etc.)
│   └── newsletter/     # Pagine per l'archivio newsletter
├── services/           # Servizi (chiamate API, DB, Auth, Inter-App)
├── App.tsx             # Componente principale e router
├── index.tsx
├── index.html
├── manifest.json       # PWA Manifest
├── service-worker.js   # PWA Service Worker
├── metadata.json
├── CHANGELOG.md
└── README.md
```

## Idee di Sviluppo Future

- **Integrazione Pagamenti Reale**: Collegare il negozio di ScanCoin e gli abbonamenti a un sistema di pagamento come Stripe.
- **Miglioramento Chat**: Quando Ugo indirizza a una pagina, la chat dovrebbe riaprirsi automaticamente una volta caricata la pagina.

## Versioning

Il progetto segue il [Semantic Versioning](https://semver.org/). La versione corrente è definita in `metadata.json`. Per le modifiche, vedi il [CHANGELOG.md](CHANGELOG.md).