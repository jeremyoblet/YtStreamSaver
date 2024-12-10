document.addEventListener('visibilitychange', () => {
  chrome.storage.sync.get(
    {
      visibleQuality: 'Auto',
      hiddenQuality: '144p'
    },
    (items) => {
      if (document.hidden) {
        setPlayerQuality(items.hiddenQuality);
      } else {
        setPlayerQuality(items.visibleQuality);
      }
    }
  );
});

function setPlayerQuality(targetQuality) {
  const settingsButton = document.querySelector('.ytp-settings-button');
  if (settingsButton) {
    settingsButton.click();
    setTimeout(() => {
      const menuItems = document.querySelectorAll('.ytp-menuitem-label');
      const qualityItem = Array.from(menuItems).find(el => el.textContent.includes('Qualité'));
      if (qualityItem) {
        qualityItem.click();
        setTimeout(() => {
          const qualities = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');
          let finalQuality = targetQuality;
          const desired = Array.from(qualities).find(q => q.textContent.trim() === targetQuality);

          if (desired) {
            desired.click();
          } else {
            // Si pas disponible, on prend la plus basse
            const lowest = qualities[qualities.length - 1];
            if (lowest) {
              lowest.click();
              finalQuality = lowest.textContent.trim();
            }
          }

          console.log(`Video quality : ${finalQuality}`);

          // Vérifier si les notifications sont actives
          chrome.storage.sync.get({ notificationsEnabled: true }, (items) => {
            if (items.notificationsEnabled) {
              chrome.runtime.sendMessage({type: "qualityChanged", quality: finalQuality});
            }
          });

        }, 500);
      }
    }, 500);
  } else {
    console.log('Bouton paramètres non trouvé, impossible de changer la qualité.');
  }
}
