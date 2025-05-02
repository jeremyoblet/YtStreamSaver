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
  console.log("Default settings checked.");
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

  if (message.type === "qualityChanged") {
    storage
      .readSettingFromStorage("notificationsEnabled", true)
      .then((enabled) => {
        if (enabled) {
          showNotification(message.quality);
        }
      });
  }

  if (message.type === "notifyTabsQualityChanged") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (
        activeTab &&
        activeTab.url &&
        activeTab.url.includes("youtube.com/watch")
      ) {
        chrome.tabs.sendMessage(activeTab.id, { type: "refreshQuality" });
      } else {
        console.log("No active tab on Youtube found.");
      }
    });
  }
});

//Allow dynamic injection on video pages ( no need to refresh page to inject content.js now )
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("youtube.com/watch")
  ) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  }
});

function showNotification(quality) {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "icons/icon.png",
      title: "Quality changed",
      message: `${quality}`,
    },
    (notificationId) => {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 2000);
    }
  );
}
