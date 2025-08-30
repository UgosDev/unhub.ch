import React from 'react';
import {
    CoinIcon,
    SparklesIcon,
    RectangleStackIcon,
    ShieldCheckIcon,
    CameraIcon,
    QuestionMarkCircleIcon,
    PaperAirplaneIcon,
    DownloadIcon,
    DocumentPlusIcon,
} from '../components/icons';

export const getFaqData = () => [
    {
        id: 1,
        question: 'Come funzionano gli ScanCoin?',
        answer: () => React.createElement('div', { className: 'space-y-2' },
            React.createElement('p', null, 'Gli ScanCoin sono la valuta interna di scansioni.ch. Invece di un abbonamento fisso, acquisti pacchetti di ScanCoin che vengono poi detratti dal tuo saldo per ogni operazione di analisi AI.'),
            React.createElement('p', null, 'Questo ti dà la massima flessibilità: paghi solo per quello che usi. Puoi ricaricare il tuo saldo in qualsiasi momento dalla pagina "Prezzi".')
        ),
        searchText: 'valuta interna monete pacchetti negozio ricarica saldo costo prezzo',
        Icon: CoinIcon,
    },
    {
        id: 2,
        question: 'Qual è la differenza tra le modalità di scansione?',
        answer: () => React.createElement('div', { className: 'space-y-2' },
            React.createElement('p', null, 'Ogni modalità è ottimizzata per un compito specifico:'),
            React.createElement('ul', { className: 'list-disc list-inside space-y-1 pl-2' },
                React.createElement('li', null, React.createElement('strong', null, 'Chroma Scan:'), ' Massima qualità e accuratezza. Ideale per documenti importanti.'),
                React.createElement('li', null, React.createElement('strong', null, 'Scontrino:'), ' Specializzata per estrarre ogni riga da ricevute e scontrini.'),
                React.createElement('li', null, React.createElement('strong', null, 'Quick Scan:'), ' Elaborazione rapida per grandi volumi e risultati immediati.'),
                React.createElement('li', null, React.createElement('strong', null, 'Batch Scan:'), ' Ottimizzata per PDF multi-pagina, elabora più pagine in parallelo.'),
                React.createElement('li', null, React.createElement('strong', null, 'Deep Scan:'), ' Estrae il testo completo, parola per parola, da documenti densi come contratti o libri.'),
                React.createElement('li', null, React.createElement('strong', null, 'Simple Scan:'), ' Modalità gratuita per digitalizzare senza analisi AI.')
            ),
            React.createElement('p', null, "Puoi trovare un confronto dettagliato cliccando sull'icona (i) accanto al selettore della modalità.")
        ),
        searchText: 'chroma quick batch deep scontrino simple scan qualità velocità business libro no-ai costo prezzo differenze',
        Icon: SparklesIcon,
    },
     {
        id: 9,
        question: 'Cos\'è la modalità "Simple Scan"?',
        answer: () => React.createElement('p', null, 'È una modalità gratuita (0 ScanCoin) pensata per la semplice digitalizzazione. Acquisisce l\'immagine, la raddrizza e applica la filigrana, ma non esegue alcuna analisi AI. È perfetta quando hai solo bisogno di una copia digitale di un documento e non ti serve estrarre dati, risparmiando così i tuoi ScanCoin.'),
        searchText: 'gratis no-ai no ai senza intelligenza artificiale costo zero',
        Icon: DocumentPlusIcon,
    },
    {
        id: 3,
        question: 'Come funziona il raggruppamento in "fascicoli"?',
        answer: () => React.createElement('div', { className: 'space-y-2' },
            React.createElement('p', null, 'Il nostro sistema AI raggruppa automaticamente le pagine in "fascicoli" basandosi su identificativi comuni (come lo stesso numero di fattura o di polizza).'),
            React.createElement('p', null, 'Se un raggruppamento non è corretto, puoi selezionare i fascicoli desiderati e usare i pulsanti "Unisci" o "Dividi" per gestirli manualmente. Puoi anche usare il menu contestuale (tasto destro) per un accesso più rapido a queste azioni.')
        ),
        searchText: 'gruppi unisci dividi dossier pdf manuale correggi',
        Icon: RectangleStackIcon,
    },
    {
        id: 10,
        question: 'Cosa significa il contorno colorato nella fotocamera?',
        answer: () => React.createElement('p', null, 'Il contorno dinamico che vedi sullo schermo evidenzia i bordi del documento rilevato in tempo reale. Quando attivi la "Ugo Experience", questo contorno diventa una maschera 3D che si adatta alla prospettiva. Diventa verde brillante quando l\'inquadratura, la stabilità e la luce sono ottimali, indicando il momento perfetto per scattare.'),
        searchText: 'camera bordi automatico opencv rilevamento contorno viola verde ugo experience',
        Icon: CameraIcon,
    },
    {
        id: 11,
        question: 'Che cos\'è la "Ugo Experience" nella fotocamera?',
        answer: () => React.createElement('div', { className: 'space-y-2' },
            React.createElement('p', null, 'La "Ugo Experience" è una modalità di assistenza AI avanzata, attivabile direttamente dalla fotocamera. Utilizza Gemini in tempo reale per darti un feedback preciso su:'),
            React.createElement('ul', { className: 'list-disc list-inside space-y-1 pl-2' },
                React.createElement('li', null, React.createElement('strong', null, 'Qualità della Luce')),
                React.createElement('li', null, React.createElement('strong', null, 'Stabilità dell\'inquadratura')),
                React.createElement('li', null, React.createElement('strong', null, 'Allineamento del documento'))
            ),
            React.createElement('p', null, 'Questa funzione ha un costo di 1 ScanCoin al secondo, ma garantisce scansioni di qualità professionale, riducendo la necessità di ripetere gli scatti.')
        ),
        searchText: 'ugo experience ai intelligenza artificiale camera fotocamera guida feedback mesh overlay costo',
        Icon: SparklesIcon,
    },
    {
        id: 8,
        question: 'Come posso installare l\'applicazione?',
        answer: () => React.createElement('p', null, 'scansioni.ch è una Progressive Web App (PWA). Puoi installarla sul tuo computer o smartphone per un\'esperienza migliore. Cerca l\'icona di installazione nella barra degli indirizzi del tuo browser (solitamente a destra) o vai alla pagina "Profilo" per trovare il pulsante di installazione. I vantaggi includono un avvio più rapido e la possibilità di utilizzarla anche offline.'),
        searchText: 'pwa progressive web app offline installa homescreen desktop',
        Icon: DownloadIcon,
    },
    {
        id: 6,
        question: 'Cosa fa il pulsante "Invia a..."?',
        answer: () => React.createElement('p', null, 'Il pulsante "Invia a..." trasferisce un intero fascicolo a una delle nostre applicazioni partner. Il sistema suggerisce una destinazione basata sulla categoria (es. \'Assicurazione\' va a polizze.ch), ma sei sempre libero di scegliere. Una volta inviato, il fascicolo viene rimosso dalla tua area di lavoro per mantenerla ordinata.'),
        searchText: 'archivio.ch polizze.ch invio esporta partner',
        Icon: PaperAirplaneIcon,
    },
    {
        id: 4,
        question: 'I miei documenti sono al sicuro con l\'analisi AI?',
        answer: () => React.createElement('div', { className: 'space-y-2' },
            React.createElement('p', null, 'Assolutamente sì. La tua privacy e la sicurezza dei tuoi dati sono la nostra massima priorità. Ecco come li proteggiamo:'),
             React.createElement('ul', { className: 'list-disc list-inside space-y-1 pl-2' },
                React.createElement('li', null, React.createElement('strong', null, 'Nessun Addestramento sui Tuoi Dati:'), ' Utilizziamo l\'API di Google Gemini per l\'analisi. Per policy, Google non utilizza i dati inviati tramite l\'API enterprise per addestrare i suoi modelli di intelligenza artificiale. I tuoi documenti rimangono tuoi.'),
                React.createElement('li', null, React.createElement('strong', null, 'Crittografia Completa:'), ' I tuoi dati sono crittografati sia durante il trasferimento (TLS) sia quando vengono temporaneamente elaborati sui server di Google.'),
                React.createElement('li', null, React.createElement('strong', null, 'Controllo Locale:'), ' L\'applicazione salva i risultati delle scansioni direttamente sul tuo dispositivo. Non conserviamo copie dei tuoi documenti sui nostri server.'),
                React.createElement('li', null, React.createElement('strong', null, 'Analisi di Sicurezza:'), ' Ogni documento viene analizzato per potenziali minacce (es. phishing) prima di qualsiasi altra operazione.')
            )
        ),
        searchText: 'sicurezza privacy phishing dati personali locale server AI intelligenza artificiale gemini google addestramento modelli',
        Icon: ShieldCheckIcon,
    },
    {
        id: 7,
        question: 'Non trovo una risposta, cosa faccio?',
        answer: () => React.createElement('p', null, 'Se non trovi la risposta qui, puoi usare il nostro assistente virtuale "Ugo"! Clicca sulla bolla viola in basso a destra per avviare una conversazione. Ugo è un esperto di tutte le funzionalità dell\'app e può anche eseguire azioni per te, come trovare e unire documenti.'),
        searchText: 'aiuto supporto ugo chatbot assistente virtuale',
        Icon: QuestionMarkCircleIcon,
    }
];