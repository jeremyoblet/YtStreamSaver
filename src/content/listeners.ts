import type { QualitySwitcher } from "./core/qualitySwitcher";
import { waitForYoutubePlayerReady } from "./utils/waitForYoutubePlayerReady";

export function registerAllListeners(qualitySwitcher: QualitySwitcher) {
  // 1. Visibilité onglet
  document.addEventListener("visibilitychange", async () => {
    await qualitySwitcher.handleVisibilityChange();
  });

  // 2. Messages venant du background script
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === "refreshQuality") {
      console.log("🔁 Message received : refreshQuality");
      qualitySwitcher.handleVisibilityChange();
    }
  });

  // 3. Changement d’URL (SPA YouTube)
  let lastUrl = location.href;

  new MutationObserver(() => {
    const currentUrl = location.href;

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      if (currentUrl.includes("youtube.com/watch")) {
        console.log("💡 New video detected:", currentUrl);

        waitForYoutubePlayerReady(10000)
          .then(() => qualitySwitcher.handleVisibilityChange())
          .catch((err) => console.warn("Quality switch is not possible:", err));
      }
    }
  }).observe(document, { subtree: true, childList: true });
}
