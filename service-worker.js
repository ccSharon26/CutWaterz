/* eslint-disable no-restricted-globals */
const CACHE_NAME = "cutwaterz-cache-v4";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.ico",
];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Install and pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        STATIC_ASSETS.map((url) =>
          fetch(url).then((response) => {
            if (!response.ok) throw new Error(`Request failed for ${url}`);
            return cache.put(url, response);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// Serve cached files when offline
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Let network handle API requests (railway backend)
  if (requestUrl.origin.includes("railway.app")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

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
          .catch(() => caches.match("./index.html"));
      })
    );
  }
});

// Clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});
