// Service worker: offline app shell. Bump CACHE when any listed asset changes
// so clients fetch fresh copies (old caches are purged on activate).
const CACHE = "at-cards-v1";

// Paths are relative to the SW scope (the directory this file is served from),
// so the app works under a sub-path like https://user.github.io/repo/.
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./src/main.js",
  "./src/state.js",
  "./src/cards-svg.js",
  "./src/art.js",
  "./src/editor.js",
  "./src/pdf.js",
  "./src/styles.css",
  "./src/data/weapons.js",
  "./src/vendor/jspdf.umd.min.js",
  "./src/vendor/svg2pdf.umd.min.js",
  "./src/vendor/courier-prime-400.woff2",
  "./src/vendor/courier-prime-700.woff2",
  "./art/card-blue.svg",
  "./art/card-red.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GETs; fall back to network and cache the result.
// Network errors fall back to whatever is cached (true offline support).
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
