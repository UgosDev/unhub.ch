import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD7aOBdaYaOuTjNfqfV1OyYPdY5TfO8xFU",
  authDomain: "scansioni-ch.firebaseapp.com",
  projectId: "scansioni-ch",
  storageBucket: "scansioni-ch.firebasestorage.app",
  messagingSenderId: "289194012010",
  appId: "1:289194012010:web:298d6bdd60a2b9af610913",
  measurementId: "G-E4SMRP3VWB"
};

// Use compat initialization
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
}

const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

// IMPORTANT: Settings must be applied BEFORE any other Firestore operation, including enablePersistence.
// Force long polling to avoid WebSocket issues in some environments.
db.settings({
    experimentalForceLongPolling: true
});

// Create a promise that resolves once persistence is enabled.
const persistencePromise = db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open. Persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('Firestore persistence failed: The current browser does not support all of the features required to enable persistence.');
    } else {
        console.warn('Firestore persistence failed with error:', err);
    }
  });


export { app, auth, db, firebase, persistencePromise };