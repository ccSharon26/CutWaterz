/* eslint-disable no-restricted-globals */
const CACHE_NAME = "cutwaterz-cache-v2";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

// ✅ Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// ✅ Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // control all pages right away
});

// ✅ Fetch handler
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 1️⃣ Network-first for API requests
  if (requestUrl.origin.includes("railway.app")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2️⃣ Cache-first for static assets
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((response) => {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
            return response;
          })
          .catch(() => caches.match("/index.html")); // fallback
      })
    );
  }
});
