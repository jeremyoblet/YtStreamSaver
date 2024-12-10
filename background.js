chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "qualityChanged") {
    showNotification(message.quality);
  }
});

function showNotification(quality) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Qualité changée',
    message: `La qualité de la vidéo est maintenant : ${quality}`
  }, notificationId => {
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 2000);
  });
}
