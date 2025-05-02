import { TabManager } from "./TabManager.js";
import { QualityManager } from "./QualityManager.js";
import { VisibilityListener } from "./VisibilityListener.js";

if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;
  console.log("YT Stream Saver - Content script démarré");

  const tabManager = new TabManager();
  //   const qualityManager = new QualityManager(tabManager);
  //   const visibilityListener = new VisibilityListener(tabManager, qualityManager);

  tabManager.init();
  //   qualityManager.init();
  //   visibilityListener.init();

  let lastUrl = location.href;

  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      if (currentUrl.includes("youtube.com/watch")) {
        console.log("💡 Navigation détectée, nouvelle vidéo :", currentUrl);
      }
    }
  }).observe(document, { subtree: true, childList: true });
}
