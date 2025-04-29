(() => {
  // src/content/utils/storageUtils.js
  async function getExtensionEnabled() {
    const { extensionEnabled } = await chrome.storage.sync.get({ extensionEnabled: true });
    return extensionEnabled;
  }
  async function getVisibleQuality() {
    const { visibleQuality } = await chrome.storage.sync.get({ visibleQuality: "Auto" });
    return visibleQuality;
  }
  async function getHiddenQuality() {
    const { hiddenQuality } = await chrome.storage.sync.get({ hiddenQuality: "144" });
    return hiddenQuality;
  }

  // src/content/TabManager.js
  var TabManager = class {
    constructor() {
      this.currentTabId = null;
      this.tabStates = {};
    }
    init() {
      this.requestTabId();
    }
    requestTabId() {
      chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
        if (response && response.tabId !== void 0) {
          this.currentTabId = response.tabId;
          console.log("[TabManager] Tab ID initialis\xE9:", this.currentTabId);
        } else {
          console.error("[TabManager] Impossible d'obtenir le Tab ID.");
        }
      });
    }
    updateVisibility(isVisible) {
      if (this.currentTabId == null) return;
      chrome.runtime.sendMessage({
        type: "updateVisibility",
        tabId: this.currentTabId,
        visible: isVisible
      }, (response) => {
        console.log("[TabManager] Visibilit\xE9 envoy\xE9e :", isVisible);
      });
    }
    getCurrentTabId() {
      return this.currentTabId;
    }
  };

  // src/content/QualityManager.js
  var QualityManager = class {
    constructor(tabManager2) {
      this.tabManager = tabManager2;
    }
    init() {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "refreshQuality") {
          this.handleRefreshRequest();
        }
      });
    }
    async handleRefreshRequest() {
      const enabled = await getExtensionEnabled();
      if (!enabled) {
        console.log("[QualityManager] Extension d\xE9sactiv\xE9e, pas de refresh.");
        return;
      }
      const isVisible = !document.hidden;
      this.changeQualityBasedOnVisibility(isVisible);
    }
    async changeQualityBasedOnVisibility(isVisible) {
      const targetQuality = isVisible ? await getVisibleQuality() : await getHiddenQuality();
      console.log("[QualityManager] Changement demand\xE9 vers :", targetQuality);
      this.setPlayerQuality(targetQuality);
    }
    setPlayerQuality(targetQuality) {
      console.log("[QualityManager] Simulation : changement de qualit\xE9 vers", targetQuality);
    }
  };

  // src/content/VisibilityListener.js
  var VisibilityListener = class {
    constructor(tabManager2, qualityManager2) {
      this.tabManager = tabManager2;
      this.qualityManager = qualityManager2;
      this.listenerActive = false;
    }
    init() {
      this.updateVisibilityListener(true);
    }
    updateVisibilityListener(enabled) {
      if (enabled && !this.listenerActive) {
        document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this));
        this.listenerActive = true;
      } else if (!enabled && this.listenerActive) {
        document.removeEventListener("visibilitychange", this.onVisibilityChange.bind(this));
        this.listenerActive = false;
      }
    }
    async onVisibilityChange() {
      const enabled = await chrome.storage.sync.get({ extensionEnabled: true }).then((r) => r.extensionEnabled);
      if (!enabled) {
        console.log("[VisibilityListener] Extension d\xE9sactiv\xE9e, pas de changement.");
        return;
      }
      const isVisible = !document.hidden;
      console.log("[VisibilityListener] VisibilityChange: ", isVisible);
      this.tabManager.updateVisibility(isVisible);
      if (isVisible) {
        this.qualityManager.changeQualityBasedOnVisibility(true);
      } else {
        this.qualityManager.changeQualityBasedOnVisibility(false);
      }
    }
  };

  // src/content/mainContent.js
  console.log("YT Stream Saver - Content script d\xE9marr\xE9");
  var tabManager = new TabManager();
  var qualityManager = new QualityManager(tabManager);
  var visibilityListener = new VisibilityListener(tabManager, qualityManager);
  tabManager.init();
  qualityManager.init();
  visibilityListener.init();
})();
//# sourceMappingURL=content.js.map
