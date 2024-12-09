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
          const desired = Array.from(qualities).find(q => q.textContent.trim() === targetQuality);

          if (desired) {
            desired.click();
            console.log(`Qualité réglée sur : ${targetQuality}`);
          } else {
            const lowest = qualities[qualities.length - 1];
            if (lowest) {
              lowest.click();
              console.log(`Qualité réglée sur la plus basse disponible (car ${targetQuality} indisponible).`);
            }
          }
        }, 500);
      }
    }, 500);
  } else {
    console.log('Bouton paramètres non trouvé, impossible de changer la qualité.');
  }
}