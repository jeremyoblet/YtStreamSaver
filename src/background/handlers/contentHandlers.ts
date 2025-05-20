import { StorageHandler } from "./storageHandler";
import { Message } from "../../types";

const storage = new StorageHandler();

export async function handleContentMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): Promise<boolean> {
  if (message.type === "qualityChanged") {
    const enabled = await storage
      .readMultipleSettings()
      .then((s) => s.notificationsEnabled);
    if (enabled) {
      showNotification(message.quality);
    }
    return true;
  }

  if (message.type === "notifyTabsQualityChanged") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.url && activeTab.url.includes("youtube.com/watch")) {
        chrome.tabs.sendMessage(activeTab.id!, { type: "refreshQuality" });
      }
    });
    return true;
  }

  return false;
}

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
