document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    setPlayerQuality("144p");
  } else {
    setPlayerQuality("Auto");
  }
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
            // Si la qualité souhaitée n'est pas trouvée, on prend la plus basse
            const lowest = qualities[qualities.length - 1];
            if (lowest) {
              lowest.click();
              finalQuality = lowest.textContent.trim();
            }
          }

          console.log(`Qualité réglée sur : ${finalQuality}`);
          // Envoyer un message au background pour qu'il affiche une notification
          chrome.runtime.sendMessage({type: "qualityChanged", quality: finalQuality});

        }, 500);
      }
    }, 500);
  } else {
    console.log('Bouton paramètres non trouvé, impossible de changer la qualité.');
  }
}
