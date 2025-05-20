import { QualitySwitcher } from "./qualitySwitcher";
import { fixYoutubeSettingsButtonLabel } from "./fixSettingsButtonLabel";

// Exécuter le correctif sur l'UI de YouTube
if (location.hostname.includes("youtube.com")) {
  fixYoutubeSettingsButtonLabel();
}

declare const window: Window & { hasRunContentScript?: boolean };

if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;

  console.log("GREEN STREAM ON - Content script started");

  const qualitySwitcher = new QualitySwitcher();

  // 1. Appliquer la qualité au démarrage lorsque le player est prêt
  waitForYoutubePlayerReady(10000)
    .then(() => {
      qualitySwitcher.handleVisibilityChange();
    })
    .catch((err) => {
      console.warn("Player not ready at start:", err);
    });

  // 2. Appliquer la qualité lors des changements d’onglet
  document.addEventListener("visibilitychange", async () => {
    await qualitySwitcher.handleVisibilityChange();
  });

  // 3. Permettre au background script de forcer une mise à jour
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
        console.log("💡 New video detected:", currentUrl);

        waitForYoutubePlayerReady(10000)
          .then(() => {
            qualitySwitcher.handleVisibilityChange();
          })
          .catch((err) => {
            console.warn("Quality switch is not possible:", err);
          });
      }
    }
  }).observe(document, { subtree: true, childList: true });
}

// ✅ Fonction robuste pour détecter que le player est prêt (lecture en cours)
function waitForYoutubePlayerReady(timeout = 10000): Promise<HTMLVideoElement> {
  const pollInterval = 100;
  let elapsed = 0;

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const video = document.querySelector("video") as HTMLVideoElement;
      const settingsBtn = document.querySelector(".ytp-settings-button");

      const isReady =
        video &&
        settingsBtn &&
        video.readyState >= 3 && // HAVE_FUTURE_DATA (le flux vidéo est prêt à être lu)
        !video.paused;

      if (isReady) {
        clearInterval(interval);
        resolve(video);
      }

      elapsed += pollInterval;
      if (elapsed >= timeout) {
        clearInterval(interval);
        reject("YouTube player not ready after timeout");
      }
    }, pollInterval);
  });
}
