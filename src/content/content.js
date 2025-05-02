if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;
  console.log("YT Stream Saver - Content script started");

  // My code here

  // end of my code

  let lastUrl = location.href;

  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      if (currentUrl.includes("youtube.com/watch")) {
        console.log("💡 Navigation détectée, nouvelle vidéo :", currentUrl);
      }
    }
  }).observe(document, { subtree: true, childList: true });
}
