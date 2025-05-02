import { StorageHandler } from "./storageHandler.js";

const storage = new StorageHandler();

const defaultSettings = {
  extensionEnabled: true,
  visibleQuality: "Auto",
  hiddenQuality: "144",
  notificationsEnabled: true,
};

async function initialize() {
  await storage.initializeDefaultsIfMissing(defaultSettings);
  console.log("Réglages initiaux vérifiés.");
}

initialize();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getSettings") {
    storage.readMultipleSettings(defaultSettings).then((settings) => {
      sendResponse({ settings });
    });
    return true;
  }

  if (message.type === "updateSetting") {
    const { key, value } = message;
    storage.writeSettingInStorage(key, value).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "notifyTabsQualityChanged") {
    chrome.tabs.query({ url: "*://www.youtube.com/watch*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: "refreshQuality" });
      });
    });
  }
});
