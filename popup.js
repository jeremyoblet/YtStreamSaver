document.addEventListener('DOMContentLoaded', () => {
  const visibleSelect = document.getElementById('visibleQuality');
  const hiddenSelect = document.getElementById('hiddenQuality');
  const notificationsCheckbox = document.getElementById('notificationsEnabled');

  // Charger les options depuis storage
  chrome.storage.sync.get(
    {
      visibleQuality: 'Auto',
      hiddenQuality: '144p',
      notificationsEnabled: true
    },
    (items) => {
      visibleSelect.value = items.visibleQuality;
      hiddenSelect.value = items.hiddenQuality;
      notificationsCheckbox.checked = items.notificationsEnabled;
    }
  );

  // Sauvegarde des changements
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
