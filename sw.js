// Offline cache for Dispatch. Bump VERSION when shipping changes.
const VERSION = "dispatch-v5";
const SHELL = ["./", "index.html", "content.js", "practice.js", "dispatch.js", "install.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-180.png", "icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("dispatch-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first for the app's own files (so updates show up), cache when offline.
// Feeds and other sites go straight to the network; the app caches stories itself.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
