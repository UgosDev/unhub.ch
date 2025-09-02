const replace = require('replace-in-file');

// Firebase App Hosting ci darà la chiave come variabile d'ambiente
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("ERRORE: La variabile d'ambiente GEMINI_API_KEY non è stata trovata nei segreti di Firebase!");
  process.exit(1);
}

const options = {
  files: [
    'App.tsx',
    'services/geminiService.ts',
    'pages/AdminDashboard.tsx',
    'components/FileViews.tsx'
  ],
  from: /process\.env\.API_KEY/g,
  to: `'${apiKey}'`, // Sostituisce con la chiave reale tra apici
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
