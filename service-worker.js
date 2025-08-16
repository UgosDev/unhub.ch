const CACHE_NAME = 'scansioni-ch-cache-v8.7.1';

const PRECACHE = [
  '/', '/index.html',
  '/icon.svg', '/maskable_icon.svg', '/manifest.json',

  // Core CDN deps (React 19)
  'https://esm.sh/react@19.1.1',
  'https://esm.sh/react@19.1.1/jsx-runtime',
  'https://esm.sh/react-dom@19.1.1',
  'https://esm.sh/react-dom@19.1.1/client',
  'https://esm.sh/@google/genai@^1.9.0?external=firebase',
  'https://esm.sh/react-dropzone@^14.3.8',
  'https://esm.sh/pdfjs-dist@4.10.38',
  'https://esm.sh/jszip@3.10.1',
  'https://esm.sh/file-saver@2.0.5',
  'https://esm.sh/jspdf@2.5.1',
  'https://esm.sh/jspdf-autotable@3.8.2',
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap',

  // Heavy libs
  'https://docs.opencv.org/4.x/opencv.js',
  'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs'
  // Le librerie Firebase NON vengono precaricate qui per evitare conflitti con la versione caricata dall'applicazione.
];

/* ---------- install ---------- */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(
        PRECACHE.map(u =>
          fetch(u, { mode: 'cors' })
            .then(r => r.ok ? cache.put(u, r) : null)
            .catch(() => null)
        )
      );
      self.skipWaiting();
    })
  );
});

/* ---------- fetch ---------- */
self.addEventListener('fetch', e => {
  const { request } = e;

  // bypass live APIs / analytics
  if (/generativelanguage|clarity\.ms|accounts\.google|apis\.google/.test(request.url)){
    e.respondWith(fetch(request)); return;
  }

  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(resp => {
        const ok =
          resp && resp.status === 200 &&
          (resp.type === 'basic' || resp.type === 'cors') &&
          resp.headers.get('content-type')?.startsWith('text/');

        if (ok && request.method === 'GET'){
          caches.open(CACHE_NAME).then(c => c.put(request, resp.clone()));
        }
        return resp;
      }).catch(() =>
        new Response(
          JSON.stringify({ error:'Resource unavailable offline.' }),
          { status:503, headers:{'Content-Type':'application/json'} }
        )
      );
    })
  );
});

/* ---------- activate ---------- */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k!==CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim();
});