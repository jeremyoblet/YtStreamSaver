import { getExtensionEnabled, getVisibleQuality, getHiddenQuality } from './utils/storageUtils.js';

export class QualityManager {
  constructor(tabManager) {
    this.tabManager = tabManager;
  }

  init() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'refreshQuality') {
        this.handleRefreshRequest();
      }
    });
  }

  async handleRefreshRequest() {
    const enabled = await getExtensionEnabled();
    if (!enabled) {
      console.log("[QualityManager] Extension désactivée, pas de refresh.");
      return;
    }
    const isVisible = !document.hidden;
    this.changeQualityBasedOnVisibility(isVisible);
  }

  async changeQualityBasedOnVisibility(isVisible) {
    const targetQuality = isVisible ? await getVisibleQuality() : await getHiddenQuality();
    console.log("[QualityManager] Changement demandé vers :", targetQuality);
    this.setPlayerQuality(targetQuality);
  }

  setPlayerQuality(targetQuality) {
    // Ici, ton ancienne logique d'ouverture de menu et de sélection de qualité.
    console.log("[QualityManager] Simulation : changement de qualité vers", targetQuality);
  }
}
