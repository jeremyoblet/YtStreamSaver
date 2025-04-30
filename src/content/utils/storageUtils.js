export async function getExtensionEnabled() {
  const { extensionEnabled } = await chrome.storage.sync.get({
    extensionEnabled: true,
  });
  return extensionEnabled;
}

export async function getHiddenQuality() {
  const { hiddenQuality } = await chrome.storage.sync.get({
    hiddenQuality: "auto",
  });
  return hiddenQuality;
}

export async function getVisibleQuality() {
  const { visibleQuality } = await chrome.storage.sync.get({
    visibleQuality: "Auto",
  });
  return visibleQuality;
}

export async function getNotificationsEnabled() {
  const { notificationEnabled } = await chrome.storage.sync.get({
    notificationsEnabled: true,
  });
  return notificationEnabled;
}
