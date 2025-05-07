import { QualitySwitcher } from "./qualitySwitcher.js";

if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;

  console.log("YT Stream Saver - Content script started");

  const qualitySwitcher = new QualitySwitcher();

  // 1. Appliquer la qualité au démarrage (après que le player est prêt)
  waitForElement(".ytp-settings-button", 10000)
    .then(() => {
      qualitySwitcher.handleVisibilityChange();
    })
    .catch((err) => {
      console.warn("Player not detected at start :", err);
    });

  // 2. Re-appliquer la qualité lors des changements d’onglet
  document.addEventListener("visibilitychange", async () => {
    await qualitySwitcher.handleVisibilityChange();
  });

  // 3. Permettre au background de forcer une mise à jour
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "refreshQuality") {
      console.log("🔁 Message recieved : refreshQuality");
      qualitySwitcher.handleVisibilityChange();
    }
  });

  // 4. Observer les changements d’URL (SPA YouTube)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      if (currentUrl.includes("youtube.com/watch")) {
        console.log("💡 New video detected :", currentUrl);

        waitForElement(".ytp-settings-button", 10000)
          .then(() => {
            qualitySwitcher.handleVisibilityChange();
          })
          .catch((err) => {
            console.warn("Quality switch is not possible :", err);
          });
      }
    }
  }).observe(document, { subtree: true, childList: true });
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const interval = 100;
    let elapsed = 0;

    const check = () => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);

      elapsed += interval;
      if (elapsed >= timeout) {
        return reject(`Element "${selector}" not found after ${timeout}ms`);
      }

      setTimeout(check, interval);
    };

    check();
  });
}
