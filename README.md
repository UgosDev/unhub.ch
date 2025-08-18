# scansioni.ch

**Versione: 9.6.0**

Un'applicazione web avanzata per estrarre dati strutturati da documenti, basata su un'architettura "human-in-the-loop" e un'economia interna basata su "ScanCoin".

## Descrizione

**scansioni.ch** è ora un ecosistema digitale unificato che integra **archivio.ch**, **polizze.ch** e **disdette.ch** in un'unica piattaforma modulare. L'applicazione adatta dinamicamente il suo aspetto e le sue funzionalità in base al dominio da cui si accede, offrendo un'esperienza su misura pur mantenendo un'unica base di codice sicura e sincronizzata in tempo reale.

## Caratteristiche Principali

### Piattaforma Modulare Unificata
- **Branding Dinamico**: L'app integra i servizi di archivio, polizze e disdette, con un'interfaccia che si adatta dinamicamente al dominio di accesso (es. `archivio.ch`).
- **Sincronizzazione in Tempo Reale**: I tuoi dati sono sincronizzati istantaneamente su tutti i tuoi dispositivi grazie a Firebase Firestore.
- **Progressive Web App (PWA)**: Installabile su desktop e mobile, con supporto per l'avvio offline.
- **Framework Privacy**: Consenso esplicito ai Termini di Servizio e Privacy Policy, con un "Centro Privacy" per la gestione dei dati.

### Ugo Vision: Scansione da Fotocamera Professionale
- **Motore di Scansione Avanzato (OpenCV.js)**: Rileva, ritaglia e raddrizza automaticamente i documenti con un motore ad alte prestazioni che funziona in tempo reale.
- **Feedback Visivo "Holographic Mesh"**: Un overlay 3D dinamico e interattivo fornisce un feedback in tempo reale sulla qualità dello scatto, guidando l'utente verso la perfezione.
- **Scatto Automatico "Lock-On"**: Il sistema cattura l'immagine automaticamente solo quando l'inquadratura, la stabilità e la luce sono ottimali, garantendo scansioni sempre perfette.
- **Ritaglio Manuale di Precisione**: Dopo lo scatto, puoi aggiustare manualmente i 4 angoli del documento con l'aiuto di una lente d'ingrandimento per un controllo totale.

### Analisi AI & Gestione Documentale
- **Estrazione Dati Intelligente**: Utilizza **Google Gemini** per classificare il documento, estrarre dati chiave e generare riassunti.
- **Archivio HD**: Opzione a pagamento per conservare le scansioni originali in alta risoluzione, con piani flessibili e un contatore di spazio dedicato nella dashboard.
- **Raggruppamento Deterministico e Manuale**: Le pagine vengono raggruppate in modo affidabile, con strumenti manuali per unire, dividere o correggere i fascicoli.
- **Assistente AI "Ugo"**: Un chatbot basato su Gemini che offre assistenza proattiva, esegue azioni e risponde a domande sui documenti.
- **Importazione Multi-sorgente**: Aggiungi documenti tramite drag-and-drop, email, Google Drive o fotocamera.
- **Modalità Demo Interattiva**: Un pulsante "Prova una Demo" popola l'app con dati di esempio per un tour guidato.
- **Controllo di Sicurezza Integrato**: Ogni documento viene analizzato per minacce come **Phishing**.

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