/**
 * add a listener to be able to recieve messages from content.js.
 * Manage actions depending of the type of the recieved message.
 */

// Réception des messages envoyés depuis content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message reçu dans background :", message);

  // Fournir tabId sur demande du content script
  if (message.type === "getTabId") {
    if (sender.tab && sender.tab.id !== undefined) {
      sendResponse({ tabId: sender.tab.id });
    } else {
      console.error("Impossible d'obtenir le tab.id depuis sender.");
      sendResponse({});
    }
    return true;
  }

  // Affichage conditionnel d’une notification quand la qualité change
  if (message.type === "qualityChanged") {
    chrome.storage.sync.get({ notificationsEnabled: true }, (items) => {
      if (items.notificationsEnabled) {
        showNotification(message.quality, message.tabInfo);
      }
    });
  }
});

/**
 * Create a notification for video quality changing
 * @param {string} quality - The updated quality.
 * @param {string} tabInfo - The url of the updated tab.
 */
function showNotification(quality, tabInfo) {
  const title = tabInfo?.title || "YouTube Tab";
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "notification_icon.png",
      title: `Quality Changed`,
      message: `${quality} on ${title}`,
    },
    (notificationId) => {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 3000);
    }
  );
}

/**
 * Allow dynamic injection on video pages ( no need to refresh page to inject content.js now )
 */
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
