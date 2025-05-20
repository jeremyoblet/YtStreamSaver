import { handlePopupMessage } from "./handlers/popupHandlers";
import { handleContentMessage } from "./handlers/contentHandlers";

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension installée et paramètres initialisés");
});

chrome.runtime.onStartup.addListener(async () => {
  console.log("Extension démarrée");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const handledByPopup = await handlePopupMessage(
      message,
      sender,
      sendResponse
    );
    if (handledByPopup) return;

    const handledByContent = await handleContentMessage(
      message,
      sender,
      sendResponse
    );
    if (handledByContent) return;
  })();

  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url?.includes("youtube.com/watch")
  ) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  }
});
