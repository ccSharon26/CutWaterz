// src/serviceWorkerRegistration.js
export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);

          // Force update check on every load
          registration.update();

          // Listen for new versions
          registration.onupdatefound = () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.onstatechange = () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("⚡ New content available, reloading...");
                  window.location.reload(); // auto reload when new build detected
                }
              };
            }
          };
        })
        .catch((error) => console.error("❌ SW registration failed:", error));
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
