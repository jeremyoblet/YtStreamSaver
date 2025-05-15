import { QualitySwitcher } from "./qualitySwitcher";
import { fixYoutubeSettingsButtonLabel } from "./fixSettingsButtonLabel";

if (location.hostname.includes("youtube.com")) {
  fixYoutubeSettingsButtonLabel();
}

declare const window: Window & { hasRunContentScript?: boolean };

if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;

  console.log("GREEN STREAM ON - Content script started");

  const qualitySwitcher = new QualitySwitcher();

  // 1. Appliquer la qualité au démarrage
  waitForElement(".ytp-settings-button", 10000)
    .then(() => {
      qualitySwitcher.handleVisibilityChange();
    })
    .catch((err) => {
      console.warn("Player not detected at start :", err);
    });

  // 2. Appliquer la qualité lors des changements d’onglet
  document.addEventListener("visibilitychange", async () => {
    await qualitySwitcher.handleVisibilityChange();
  });

  // 3. Permettre au background de forcer une mise à jour
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === "refreshQuality") {
      console.log("🔁 Message received : refreshQuality");
      qualitySwitcher.handleVisibilityChange();
    }
  });

  // 4. Détecter les changements d’URL (SPA YouTube)
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

function waitForElement(
  selector: string,
  timeout: number = 10000
): Promise<Element> {
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
