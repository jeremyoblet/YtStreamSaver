// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const extensionCheckbox = document.getElementById('extensionEnabled');
  const visibleSelect = document.getElementById('visibleQuality');
  const hiddenSelect = document.getElementById('hiddenQuality');
  const notificationsCheckbox = document.getElementById('notificationsEnabled');

  // Charger les options depuis storage
  chrome.storage.sync.get(
    {
      extensionEnabled: true,
      visibleQuality: 'Auto',
      hiddenQuality: '144',
      notificationsEnabled: true
    },
    (items) => {
      extensionCheckbox.checked = items.extensionEnabled;
      visibleSelect.value = items.visibleQuality;
      hiddenSelect.value = items.hiddenQuality;
      notificationsCheckbox.checked = items.notificationsEnabled;
    }
  );

  // Sauvegarde des changements
  extensionCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ extensionEnabled: extensionCheckbox.checked });
  });

  visibleSelect.addEventListener('change', async () => {
    await chrome.storage.sync.set({ visibleQuality: visibleSelect.value });
    notifyTabsQualityChanged(); // <--- Ajout
  });

  hiddenSelect.addEventListener('change', async () => {
    await chrome.storage.sync.set({ hiddenQuality: hiddenSelect.value });
    notifyTabsQualityChanged(); // <--- Ajout
  });

  notificationsCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ notificationsEnabled: notificationsCheckbox.checked });
  });
});

// Fonction pour prévenir tous les tabs YouTube
function notifyTabsQualityChanged() {
  chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { type: 'refreshQuality' });
    });
  });
}
