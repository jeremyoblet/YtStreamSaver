export class TabManager {
  constructor() {
    this._currentTabId = null;
    this.tabStates = {};
  }

  init() {
    this._requestTabId();
  }

  _requestTabId() {
    chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
      if (response && response.tabId !== undefined) {
        this._currentTabId = response.tabId;
        console.log("[TabManager] Tab ID initialized:", this._currentTabId);
      } else {
        console.error("[TabManager] Can't get TabID.");
      }
    });
  }

  updateVisibility(isVisible) {
    if (this._currentTabId == null) return;

    chrome.runtime.sendMessage(
      {
        type: "updateVisibility",
        tabId: this._currentTabId,
        visible: isVisible,
      },
      (response) => {
        console.log("[TabManager] Visibility sent :", isVisible);
      }
    );
  }
}
