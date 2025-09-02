const replace = require('replace-in-file');

// Firebase App Hosting richiede che i nomi dei segreti siano in minuscolo.
const apiKey = process.env.api_key;

if (!apiKey) {
  // Messaggio di errore aggiornato per essere più specifico.
  console.error("ERRORE: La variabile d'ambiente 'api_key' (tutto minuscolo) non è stata trovata nei segreti di Firebase! Assicurati di averla creata con questo nome esatto.");
  process.exit(1);
}

const options = {
  files: [
    'App.tsx',
    'services/geminiService.ts',
    'pages/AdminDashboard.tsx',
    'components/FileViews.tsx'
  ],
  // Questo è il segnaposto nel codice sorgente, che va bene mantenere così.
  from: /process\.env\.API_KEY/g,
  to: `'${apiKey}'`, // Sostituisce con la chiave reale dalla variabile d'ambiente in minuscolo.
};

try {
  const results = replace.sync(options);
  if (results.filter(r => r.hasChanged).length === 0) {
    console.warn("ATTENZIONE: La API Key non è stata sostituita in nessun file. Controlla che i percorsi in `files` siano corretti e che `process.env.API_KEY` sia presente nei file di origine.");
  } else {
    console.log('Sostituzione API Key completata:', results.filter(r => r.hasChanged).map(r => r.file));
  }
} catch (error) {
  console.error('Errore durante la sostituzione della API Key:', error);
  process.exit(1);
}
