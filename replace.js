const replace = require('replace-in-file');

// Firebase App Hosting provides secrets as uppercase environment variables.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error('❌ ERRORE: API_KEY mancante!');
  console.error('Assicurati di aver creato un segreto chiamato "api_key" in Firebase App Hosting.');
  process.exit(1);
}

console.log('🔑 API Key trovata, inizio sostituzione...');

const options = {
  files: [
    'dist/**/*.js',
    'dist/**/*.html'
  ],
  from: [/PLACEHOLDER_API_KEY/g, /process\.env\.API_KEY/g],
  to: `"${apiKey}"`,
};

try {
  console.log('🔍 Cercando file da processare...');
  const results = replace.sync(options);
  const changedFiles = results.filter(r => r.hasChanged);
  
  console.log(`📁 File esaminati: ${results.length}`);
  console.log(`✏️ File modificati: ${changedFiles.length}`);
  
  if (changedFiles.length === 0) {
    console.warn('⚠️ ATTENZIONE: Nessun placeholder API_KEY trovato nei file compilati.');
    console.log('Questo potrebbe indicare che:');
    console.log('1. Il build Vite non ha generato i file correttamente');
    console.log('2. Il placeholder non è presente nel codice sorgente');
    console.log('3. I file non sono nella cartella dist/');
  } else {
    console.log('✅ Sostituzione API Key completata con successo!');
    console.log('📝 File modificati:');
    changedFiles.forEach(r => {
      console.log(`   - ${r.file}`);
    });
  }
  
  console.log('🚀 Replace script completato!');
  
} catch (error) {
  console.error('❌ Errore durante la sostituzione della API Key:', error);
  process.exit(1);
}