import { StorageHandler } from "./storageHandler";
import { defaultSettings } from "./defaultSettings";
import { Message, Settings } from "../types";

const storage = new StorageHandler();

async function initialize(): Promise<void> {
  await storage.initializeDefaultsIfMissing(defaultSettings);
  console.log("Default settings checked.");
}

chrome.runtime.onInstalled.addListener(async () => {
  await initialize();
  console.log("Extension installée et paramètres initialisés");
});

chrome.runtime.onStartup.addListener(async () => {
  await initialize();
  console.log("Extension démarrée et paramètres vérifiés");
});

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    if (message.type === "getSettings") {
      initialize().then(() => {
        storage.readMultipleSettings().then((settings) => {
          sendResponse({ settings });
        });
      });
      return true;
    }

    if (message.type === "updateSettings") {
      (async () => {
        await storage.writeMultipleSettings(message.settings);
        console.log("Settings updated :", message.settings);
        sendResponse({ success: true });
      })();
      return true;
    }

    if (message.type === "qualityChanged") {
      (async () => {
        const enabled = await storage
          .readMultipleSettings()
          .then((s) => s.notificationsEnabled);
        if (enabled) {
          showNotification(message.quality);
        }
      })();
    }

    if (message.type === "notifyTabsQualityChanged") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (
          activeTab &&
          activeTab.url &&
          activeTab.url.includes("youtube.com/watch")
        ) {
          chrome.tabs.sendMessage(activeTab.id!, { type: "refreshQuality" });
        } else {
          console.log("No active tab on YouTube found.");
        }
      });
    }
  }
);

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

function showNotification(quality: string): void {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "icons/icon_128.png",
      title: "Qualité changée",
      message: `${quality}`,
    },
    (notificationId) => {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 2000);
    }
  );
}
