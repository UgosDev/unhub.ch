const replace = require('replace-in-file');

// Firebase App Hosting provides secrets as uppercase environment variables.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // Updated error message for clarity.
  console.error("ERRORE: La variabile d'ambiente 'API_KEY' (tutto maiuscolo) non è stata trovata! Assicurati di aver creato un segreto chiamato 'api_key' in Firebase App Hosting.");
  process.exit(1);
}

const options = {
  files: [
    'App.tsx',
    'services/geminiService.ts',
    'pages/AdminDashboard.tsx',
    'components/FileViews.tsx'
  ],
  // This placeholder must be consistent in the source code.
  from: /process\.env\.API_KEY/g,
  to: `'${apiKey}'`, // Replaces with the actual key from the uppercase environment variable.
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
