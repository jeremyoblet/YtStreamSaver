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

function setPlayerQuality(targetQuality) {
  const settingsButton = document.querySelector('.ytp-settings-button');
  if (!settingsButton) {
    console.log('Settings button not found. Quality not changed.');
    return;
  }

  openSettingsMenu(settingsButton, () => {
    openQualityMenu(() => {
      selectQuality(targetQuality, (finalQuality) => {
        notifyQualityChange(finalQuality);
      });
    });
  });
}

function openSettingsMenu(button, callback) {
  button.click();
  setTimeout(callback, 500);
}

function openQualityMenu(callback) {
  const menuItems = document.querySelectorAll('.ytp-menuitem-label');
  const qualityItem = Array.from(menuItems).find(el => el.textContent.toLowerCase().includes('qualit'));

  if (qualityItem) {
    qualityItem.click();
    setTimeout(callback, 500);
  } else {
    console.log('Quality menu item not found.');
  }
}

function selectQuality(targetQuality, callback) {
  const qualities = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');

  console.log("Qualités disponibles :");
  Array.from(qualities).forEach(q => console.log(q.textContent.trim()));

  let desired = null;
  if (targetQuality.toLowerCase() === 'auto') {
    desired = Array.from(qualities).find(q =>
      q.textContent.trim().toLowerCase().includes('auto')
    );
  } else {
    desired = Array.from(qualities).find(q =>
      q.textContent.trim().toLowerCase().includes(targetQuality.toLowerCase())
    );
  }

  let finalQuality = targetQuality;

  if (desired) {
    desired.click();
    finalQuality = desired.textContent.trim();
  } else {
    const lowest = qualities[qualities.length - 1];
    if (lowest) {
      lowest.click();
      finalQuality = lowest.textContent.trim();
    }
  }

  console.log(`Current quality: ${finalQuality}`);

  callback(finalQuality);
}

function notifyQualityChange(finalQuality) {
  chrome.storage.sync.get({ notificationsEnabled: true }, (items) => {
    if (items.notificationsEnabled) {
      chrome.runtime.sendMessage({ type: "qualityChanged", quality: finalQuality });
    }
  });
}
