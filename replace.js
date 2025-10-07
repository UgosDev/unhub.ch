const replace = require('replace-in-file');

// Firebase App Hosting provides secrets as uppercase environment variables.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("ERRORE: La variabile d'ambiente 'API_KEY' non è stata trovata!");
  console.error("Assicurati di aver creato un segreto chiamato 'api_key' in Firebase App Hosting.");
  process.exit(1);
}

console.log('🔑 API Key trovata, inizio sostituzione...');

const options = {
  files: [
    'dist/**/*.js',
    'dist/**/*.html'
  ],
  from: [/PLACEHOLDER_API_KEY/g, /process\.env\.API_KEY/g],
  to: apiKey,
};

try {
  const results = replace.sync(options);
  const changedFiles = results.filter(r => r.hasChanged);
  
  if (changedFiles.length === 0) {
    console.warn('⚠️  ATTENZIONE: Nessuna API Key placeholder trovata nei file compilati.');
    console.log('File processati:', results.map(r => r.file));
  } else {
    console.log('✅ Sostituzione API Key completata con successo!');
    console.log('📁 File modificati:');
    changedFiles.forEach(r => {
      console.log(`   - ${r.file}`);
    });
  }
  
  console.log('🚀 Build completato! L\'applicazione è pronta per il deploy.');
  
} catch (error) {
  console.error('❌ Errore durante la sostituzione della API Key:', error);
  process.exit(1);
}