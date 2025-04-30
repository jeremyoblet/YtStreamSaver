document.addEventListener("DOMContentLoaded", () => {
  const extensionCheckbox = document.getElementById("extensionEnabled");
  const visibleSelect = document.getElementById("visibleQuality");
  const hiddenSelect = document.getElementById("hiddenQuality");
  const notificationsCheckbox = document.getElementById("notificationsEnabled");

  chrome.storage.sync.get(
    {
      extensionEnabled: true,
      visibleQuality: "Auto",
      hiddenQuality: "Auto",
      notificationsEnabled: true,
    },
    (items) => {
      extensionCheckbox.checked = items.extensionEnabled;
      visibleSelect.value = items.visibleQuality;
      hiddenSelect.value = items.hiddenQuality;
      notificationsCheckbox.checked = items.notificationsEnabled;
    }
  );

  extensionCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ extensionEnabled: extensionCheckbox.checked });
  });

  visibleSelect.addEventListener("change", async () => {
    await chrome.storage.sync.set({ visibleQuality: visibleSelect.value });
    notifyTabsQualityChanged();
  });

  hiddenSelect.addEventListener("change", async () => {
    await chrome.storage.sync.set({ hiddenQuality: hiddenSelect.value });
    notifyTabsQualityChanged();
  });

  notificationsCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({
      notificationsEnabled: notificationsCheckbox.checked,
    });
  });
});

function notifyTabsQualityChanged() {
  chrome.tabs.query({ url: "*://www.youtube.com/watch*" }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { type: "refreshQuality" });
    });
  });
}
