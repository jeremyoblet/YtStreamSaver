document.addEventListener('visibilitychange', () => {
  chrome.storage.sync.get(
    {
      visibleQuality: 'Auto',
      hiddenQuality: '144p'
    },
    (items) => {
      if (document.hidden)
      {
        setPlayerQuality(items.hiddenQuality);
      }

      else
      {
        setPlayerQuality(items.visibleQuality);
      }
    }
  );
});

function setPlayerQuality(targetQuality)
{
  const settingsButton = document.querySelector('.ytp-settings-button');
  if (settingsButton)
  {
    settingsButton.click();
    setTimeout(() => {
      const menuItems = document.querySelectorAll('.ytp-menuitem-label');
      const qualityItem = Array.from(menuItems).find(el => el.textContent.toLowerCase().includes('qualit'));
      if (qualityItem) {
        qualityItem.click();
        setTimeout(() => {
          const qualities = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');
          
          // Debug : Affichez les qualités disponibles
          console.log("Qualités disponibles :");
          Array.from(qualities).forEach(q => console.log(q.textContent.trim()));

          let finalQuality = targetQuality;
          // Rechercher l'item qui contient la chaine targetQuality
          let desired = null;

          if (targetQuality.toLowerCase() === 'auto')
          {
            desired = Array.from(qualities).find(q =>
              q.textContent.trim().toLowerCase().includes('auto')
            );
          }

          else
          {
            desired = Array.from(qualities).find(q =>
              q.textContent.trim().toLowerCase().includes(targetQuality.toLowerCase())
            );
          }

          if (desired)
          {
            desired.click();
            finalQuality = desired.textContent.trim();
          }
          
          else
          {
            // Si la qualité souhaitée n'est pas trouvée, on prend la plus basse
            const lowest = qualities[qualities.length - 1];
            if (lowest) {
              lowest.click();
              finalQuality = lowest.textContent.trim();
            }
          }

          console.log(`Current quality : ${finalQuality}`);

          chrome.storage.sync.get({ notificationsEnabled: true }, (items) => {
            if (items.notificationsEnabled)
            {
              chrome.runtime.sendMessage({type: "qualityChanged", quality: finalQuality});
            }
          });

        }, 500);
      }
    }, 500);
  }
  
  else
  {
    console.log('Seetings button not found. Quality not changed.');
  }
}
