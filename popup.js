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

  visibleSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ visibleQuality: visibleSelect.value });
  });

  hiddenSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ hiddenQuality: hiddenSelect.value });
  });

  notificationsCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ notificationsEnabled: notificationsCheckbox.checked });
  });
});
