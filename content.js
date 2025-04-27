document.addEventListener('visibilitychange', async () => {
  const { visibleQuality = 'Auto', hiddenQuality = '144' } = await chrome.storage.sync.get({
    visibleQuality: 'Auto',
    hiddenQuality: '144'
  });

  const targetQuality = document.hidden ? hiddenQuality : visibleQuality;

  console.log(`Demande de qualité : ${targetQuality}`);
  
  setPlayerQuality(targetQuality);
});

async function setPlayerQuality(targetQuality) {
  const settingsButton = document.querySelector('.ytp-settings-button');
  if (!settingsButton) {
    console.log('Settings button not found.');
    return;
  }

  openSettingsMenu(settingsButton, async () => {
    await openQualityMenu(async () => {
      await selectQuality(targetQuality, (finalQuality) => {
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

function extractResolution(text) {
  const match = text.match(/(\d+)p/);
  return match ? parseInt(match[1], 10) : null;
}

async function selectQuality(targetQuality, callback) {
  const qualities = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');

  console.log("Qualités disponibles :");
  const qualityList = Array.from(qualities).map(q => ({
    element: q,
    label: q.textContent.trim(),
    resolution: extractResolution(q.textContent.trim()),
    isPremium: q.textContent.toLowerCase().includes('premium')
  }));

  qualityList.forEach(q => console.log(q.label));

  let finalQuality = targetQuality;

  if (targetQuality.toLowerCase() === 'auto') {
    const autoQuality = qualityList.find(q => q.label.toLowerCase().includes('auto'));
    if (autoQuality) {
      autoQuality.element.click();
      finalQuality = autoQuality.label;
    }
  } else {
    const targetResolution = parseInt(targetQuality, 10);

    // Cherche un match exact sans premium
    let exactMatch = qualityList.find(q => q.resolution === targetResolution && !q.isPremium);

    // Sinon accepte premium
    if (!exactMatch) {
      exactMatch = qualityList.find(q => q.resolution === targetResolution);
    }

    if (exactMatch && !exactMatch.isPremium) {
      exactMatch.element.click();
      finalQuality = exactMatch.label;
    } else {
      // Cherche la meilleure qualité inférieure sans premium
      const lowerQualities = qualityList
        .filter(q => q.resolution !== null && q.resolution <= targetResolution && !q.isPremium)
        .sort((a, b) => b.resolution - a.resolution);

      if (lowerQualities.length > 0) {
        lowerQualities[0].element.click();
        finalQuality = lowerQualities[0].label;
      } else {
        // Dernier recours
        const lowest = qualityList[qualityList.length - 1];
        if (lowest) {
          lowest.element.click();
          finalQuality = lowest.label;
        }
      }
    }
  }

  console.log(`Qualité sélectionnée : ${finalQuality}`);
  callback(finalQuality);
}

function notifyQualityChange(finalQuality) {
  chrome.storage.sync.get({ notificationsEnabled: true }, (items) => {
    if (items.notificationsEnabled) {
      chrome.runtime.sendMessage({ type: "qualityChanged", quality: finalQuality });
    }
  });
}
