// src/content/TabManager.js
import { getExtensionEnabled } from './utils/storageUtils.js';

export class TabManager {
  constructor() {
    this.currentTabId = null;
    this.tabStates = {};
  }

  init() {
    this.requestTabId();
  }

  requestTabId() {
    chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
      if (response && response.tabId !== undefined) {
        this.currentTabId = response.tabId;
        console.log("[TabManager] Tab ID initialisé:", this.currentTabId);
      } else {
        console.error("[TabManager] Impossible d'obtenir le Tab ID.");
      }
    });
  }

  updateVisibility(isVisible) {
    if (this.currentTabId == null) return;

    chrome.runtime.sendMessage({
      type: 'updateVisibility',
      tabId: this.currentTabId,
      visible: isVisible
    }, (response) => {
      console.log("[TabManager] Visibilité envoyée :", isVisible);
    });
  }

  getCurrentTabId() {
    return this.currentTabId;
  }
}
