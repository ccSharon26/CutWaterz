/* eslint-disable no-restricted-globals */
const CACHE_NAME = "cutwaterz-cache-v5";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.ico",
  "./logo192.png",
  "./logo512.png"
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(STATIC_ASSETS);
        console.log("✅ Static assets cached");
      } catch (err) {
        console.warn("⚠️ Some assets failed to cache:", err);
      }
    })
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  clients.claim();
});

// Fetch: handle static files and API requests safely
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Network-first for API requests
  if (requestUrl.origin.includes("railway.app")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful GET responses if needed
          return response;
        })
        .catch(() =>
          // Return a valid fallback response if fetch fails
          new Response(JSON.stringify({ error: "Offline or server unreachable" }), {
            status: 503,
            headers: { "Content-Type": "application/json" }
          })
        )
    );
    return;
  }

  // Cache-first for static GET requests
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }

            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, clonedResponse)
            );
            return response;
          })
          .catch(() =>
            // Return index.html fallback for navigation requests
            caches.match("./index.html")
          );
      })
    );
  }
});
