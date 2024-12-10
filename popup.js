chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "qualityChanged") {
      showNotification(`Qualité changée : ${message.quality}`);
    }
  });
  
  function showNotification(text) {
    const notificationDiv = document.getElementById('notification');
    notificationDiv.textContent = text;
    notificationDiv.style.display = 'block';
  
    setTimeout(() => {
      notificationDiv.style.display = 'none';
    }, 2000);
  }
  