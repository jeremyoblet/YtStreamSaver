export class VisibilityListener {
    constructor(tabManager, qualityManager) {
      this.tabManager = tabManager;
      this.qualityManager = qualityManager;
      this.listenerActive = false;
    }
  
    init() {
      this.updateVisibilityListener(true);
    }
  
    updateVisibilityListener(enabled) {
      if (enabled && !this.listenerActive) {
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        this.listenerActive = true;
      } else if (!enabled && this.listenerActive) {
        document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        this.listenerActive = false;
      }
    }
  
    async onVisibilityChange() {
      const enabled = await chrome.storage.sync.get({ extensionEnabled: true }).then(r => r.extensionEnabled);
      if (!enabled) {
        console.log("[VisibilityListener] Extension désactivée, pas de changement.");
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
  }
  