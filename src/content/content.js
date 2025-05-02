import { QualitySwitcher } from "./qualitySwitcher.js";

if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;
  console.log("YT Stream Saver - Content script started");

  const qualitySwitcher = new QualitySwitcher();

  document.addEventListener("visibilitychange", async () => {
    await qualitySwitcher.handleVisibilityChange();
  });

  // Détection des changements d'URL pour YouTube SPAs
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      if (currentUrl.includes("youtube.com/watch")) {
        console.log(
          "\u{1F4A1} Navigation d\u00e9tect\u00e9e, nouvelle vid\u00e9o :",
          currentUrl
        );
      }
    }
  }).observe(document, { subtree: true, childList: true });
}
