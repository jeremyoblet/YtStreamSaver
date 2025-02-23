chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "qualityChanged")
  {
    showNotification(message.quality);
  }
});

function showNotification(quality)
{
  chrome.notifications.create(
  {
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Quality changed',
    message: `${quality}`
  }, notificationId => {
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 2000);
  });
}
