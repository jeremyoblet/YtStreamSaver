// content.js

let currentTabId = null;

// Demander le tabId au background
function initTab() {
  chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
    if (response && response.tabId !== undefined) {
      currentTabId = response.tabId;
      console.log("Tab ID initialisé via background:", currentTabId);
      setupVisibilityListener();
    } else {
      console.error("Impossible d'obtenir le Tab ID.");
    }
  });
}

function setupVisibilityListener() {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
}

async function onVisibilityChange() {
  if (currentTabId === null) {
    console.error("Tab ID non initialisé.");
    return;
  }

  const isVisible = !document.hidden;

  if (isVisible) {
    // Si on devient visible, on demande au background si on est maître
    chrome.runtime.sendMessage({
      type: 'updateVisibility',
      tabId: currentTabId,
      visible: true
    }, (response) => {
      if (response && response.isMaster) {
        console.log("Je suis maître, je change la qualité (Visible).");
        changeQualityBasedOnVisibility(true);
      } else {
        console.log("Un autre onglet est maître ou pas de réponse (Visible).");
      }
    });
  } else {
    // Si on devient caché, on force directement la qualité basse
    console.log("Je passe caché, je change directement la qualité (Hidden).");
    changeQualityBasedOnVisibility(false);
    // Et on avertit quand même le background
    chrome.runtime.sendMessage({
      type: 'updateVisibility',
      tabId: currentTabId,
      visible: false
    });
  }
}


async function changeQualityBasedOnVisibility(isVisible) {
  const { visibleQuality = 'Auto', hiddenQuality = '144' } = await chrome.storage.sync.get({
    visibleQuality: 'Auto',
    hiddenQuality: '144'
  });

  const targetQuality = isVisible ? visibleQuality : hiddenQuality;

  console.log(`Changement demandé vers : ${targetQuality}`);
  setPlayerQuality(targetQuality);
}

function setPlayerQuality(targetQuality) {
  const settingsButton = document.querySelector('.ytp-settings-button');
  if (!settingsButton) {
    console.log('Settings button not found.');
    return;
  }

  openSettingsMenu(settingsButton, () => {
    openQualityMenu(() => {
      selectQuality(targetQuality, (finalQuality) => {
        console.log('Qualité forcée:', finalQuality);
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
    console.log('Item Qualité trouvé.');
    qualityItem.click();
    setTimeout(callback, 500);
  } else {
    console.log('Item Qualité non trouvé.');
  }
}

function extractResolution(text) {
  const match = text.match(/(\d+)p/);
  return match ? parseInt(match[1], 10) : null;
}

function selectQuality(targetQuality, callback) {
  const qualities = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');

  const qualityList = Array.from(qualities).map(q => ({
    element: q,
    label: q.textContent.trim(),
    resolution: extractResolution(q.textContent.trim()),
    isPremium: q.textContent.toLowerCase().includes('premium')
  }));

  let finalQuality = targetQuality;

  if (targetQuality.toLowerCase() === 'auto') {
    const autoQuality = qualityList.find(q => q.label.toLowerCase().includes('auto'));
    if (autoQuality) {
      autoQuality.element.click();
      finalQuality = autoQuality.label;
    }
  } else {
    const targetResolution = parseInt(targetQuality, 10);

    let exactMatch = qualityList.find(q => q.resolution === targetResolution && !q.isPremium);

    if (!exactMatch) {
      exactMatch = qualityList.find(q => q.resolution === targetResolution);
    }

    if (exactMatch && !exactMatch.isPremium) {
      exactMatch.element.click();
      finalQuality = exactMatch.label;
    } else {
      const lowerQualities = qualityList
        .filter(q => q.resolution !== null && q.resolution <= targetResolution && !q.isPremium)
        .sort((a, b) => b.resolution - a.resolution);

      if (lowerQualities.length > 0) {
        lowerQualities[0].element.click();
        finalQuality = lowerQualities[0].label;
      } else {
        const lowest = qualityList[qualityList.length - 1];
        if (lowest) {
          lowest.element.click();
          finalQuality = lowest.label;
        }
      }
    }
  }

  callback(finalQuality);
}

function notifyQualityChange(finalQuality) {
  chrome.storage.sync.get({ notificationsEnabled: true }, (items) => {
    if (items.notificationsEnabled) {
      chrome.runtime.sendMessage({ type: "qualityChanged", quality: finalQuality });
    }
  });
}

function waitForPlayerReady(callback) {
  const checkExist = setInterval(() => {
    const player = document.querySelector('.html5-video-player');
    if (player && player.getPlayerState) {
      clearInterval(checkExist);
      callback();
    }
  }, 500);
}

// Initialisation
initTab();
waitForPlayerReady(() => {
  console.log('Player prêt');
});

// Surveiller les navigations internes
window.addEventListener('yt-navigate-finish', () => {
  console.log('Navigation interne détectée (yt-navigate-finish)');
  waitForPlayerReady(() => {
    console.log('Player prêt après navigation.');
    initTab();
  });
});