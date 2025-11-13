export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);

          // Listen for updates
          registration.onupdatefound = () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.onstatechange = () => {``
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  console.log("🆕 New version available!");
                  showUpdateToast(() => {
                    // Clear cache + reload app
                    caches.keys().then((keys) =>
                      Promise.all(keys.map((key) => caches.delete(key)))
                    );
                    setTimeout(() => window.location.reload(true), 800);
                  });
                }
              };
            }
          };

          // Periodically check for updates (every 10 mins)
          setInterval(() => registration.update(), 10 * 60 * 1000);
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    });
  }
}

// ✅ Custom dark CutWaterz-styled toast
function showUpdateToast(onRefresh) {
  // Avoid duplicate toasts
  if (document.getElementById("pwa-update-toast")) return;

  const toast = document.createElement("div");
  toast.id = "pwa-update-toast";
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f0f0f;
      color: #f1f1f1;
      padding: 14px 20px;
      border: 1px solid #F59E0B;
      border-radius: 14px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      font-family: system-ui, sans-serif;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    ">
      <span>🔄 New version of <b>CutWaterz</b> available</span>
      <button id="refresh-btn" style="
        background: #F59E0B;
        color: #0f0f0f;
        border: none;
        padding: 6px 14px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Refresh</button>
    </div>
  `;

  document.body.appendChild(toast);

  // Add animation style
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  `;
  document.head.appendChild(style);

  // Click handler
  toast.querySelector("#refresh-btn").addEventListener("click", () => {
    toast.remove();
    onRefresh();
  });
}
