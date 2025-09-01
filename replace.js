const replace = require('replace-in-file');

// Firebase App Hosting ci darà la chiave come variabile d'ambiente
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('ERRORE: La GEMINI_API_KEY non è stata trovata nei segreti di Firebase!');
  process.exit(1);
}

const options = {
  files: 'index.tsx', // Il file dove si trova `process.env.API_KEY`
  from: /process\.env\.API_KEY/g,
  to: `'${apiKey}'`, // Sostituisce con la chiave reale tra apici
};

try {
  const results = replace.sync(options);
  console.log('Sostituzione API Key completata:', results.filter(r => r.hasChanged).map(r => r.file));
} catch (error) {
  console.error('Errore durante la sostituzione della API Key:', error);
  process.exit(1);
}
