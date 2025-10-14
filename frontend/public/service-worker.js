/* eslint-disable no-restricted-globals */
const CACHE_NAME = "cutwaterz-static-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

// Install SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Fetch requests
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 1️⃣ Handle API requests separately
  if (requestUrl.origin.includes("railway.app")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match(event.request)) // fallback if offline
    );
    return;
  }

  // 2️⃣ Handle static assets (cache-first)
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, cloned)
            );
            return response;
          })
        );
      })
    );
  }
});

// Activate new SW versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
});
