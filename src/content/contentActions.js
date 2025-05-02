let currentTabId = null;
let visibilityListenerActive = false;

// Demander le tabId au background
function initTab() {
  chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
    if (response && response.tabId !== undefined) {
      currentTabId = response.tabId;
      console.log("Tab ID initialisé via background:", currentTabId);
      setupExtensionBehavior();
    } else {
      console.error("Impossible d'obtenir le Tab ID.");
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "refreshQuality") {
    console.log("Message refreshQuality reçu.");
    isExtensionEnabled().then((enabled) => {
      if (enabled) {
        const isVisible = !document.hidden;
        changeQualityBasedOnVisibility(isVisible);
      } else {
        console.log("Extension désactivée, aucun changement de qualité.");
      }
    });
  }
});

// Fonction pour lire si l'extension est activée
async function isExtensionEnabled() {
  const { extensionEnabled } = await chrome.storage.sync.get({
    extensionEnabled: true,
  });
  return extensionEnabled;
}

// Installer ou retirer le listener selon l'état de l'extension
async function setupExtensionBehavior() {
  const enabled = await isExtensionEnabled();
  updateVisibilityListener(enabled);
}

// Ajouter ou enlever le listener proprement
function updateVisibilityListener(enabled) {
  if (enabled && !visibilityListenerActive) {
    document.addEventListener("visibilitychange", onVisibilityChange);
    visibilityListenerActive = true;
    console.log("Listener visibilitychange activé.");
  } else if (!enabled && visibilityListenerActive) {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    visibilityListenerActive = false;
    console.log("Listener visibilitychange désactivé.");
  }
}

// Quand la visibilité change
async function onVisibilityChange() {
  if (currentTabId === null) {
    console.error("Tab ID non initialisé.");
    return;
  }

  const isVisible = !document.hidden;

  const enabled = await isExtensionEnabled();
  if (!enabled) {
    console.log("Extension désactivée, aucun changement sur visibilitychange.");
    return;
  }

  if (isVisible) {
    chrome.runtime.sendMessage(
      {
        type: "updateVisibility",
        tabId: currentTabId,
        visible: true,
      },
      (response) => {
        if (response && response.isMaster) {
          console.log("Je suis maître, je change la qualité (Visible).");
          changeQualityBasedOnVisibility(true);
        } else {
          console.log(
            "Un autre onglet est maître ou pas de réponse (Visible)."
          );
        }
      }
    );
  } else {
    console.log("Je passe caché, je change directement la qualité (Hidden).");
    changeQualityBasedOnVisibility(false);
    chrome.runtime.sendMessage({
      type: "updateVisibility",
      tabId: currentTabId,
      visible: false,
    });
  }
}

// Changer la qualité selon visible/caché
async function changeQualityBasedOnVisibility(isVisible) {
  const { visibleQuality = "Auto", hiddenQuality = "144" } =
    await chrome.storage.sync.get({
      visibleQuality: "Auto",
      hiddenQuality: "144",
    });

  const targetQuality = isVisible ? visibleQuality : hiddenQuality;

  console.log(`Changement demandé vers : ${targetQuality}`);
  setPlayerQuality(targetQuality);
}

// Fonctions existantes inchangées (setPlayerQuality, openSettingsMenu, openQualityMenu, etc.)
function setPlayerQuality(targetQuality) {
  const settingsButton = document.querySelector(".ytp-settings-button");
  if (!settingsButton) {
    console.log("Settings button not found.");
    return;
  }

  openSettingsMenu(settingsButton, () => {
    openQualityMenu(() => {
      selectQuality(targetQuality, (finalQuality) => {
        console.log("Qualité forcée:", finalQuality);
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
  const menuItems = document.querySelectorAll(".ytp-menuitem-label");
  const qualityItem = Array.from(menuItems).find((el) =>
    el.textContent.toLowerCase().includes("qualit")
  );

  if (qualityItem) {
    console.log("Item Qualité trouvé.");
    qualityItem.click();
    setTimeout(callback, 500);
  } else {
    console.log("Item Qualité non trouvé.");
  }
}

function extractResolution(text) {
  const match = text.match(/(\d+)p/);
  return match ? parseInt(match[1], 10) : null;
}

function selectQuality(targetQuality, callback) {
  const qualities = document.querySelectorAll(
    ".ytp-quality-menu .ytp-menuitem-label"
  );

  const qualityList = Array.from(qualities).map((q) => ({
    element: q,
    label: q.textContent.trim(),
    resolution: extractResolution(q.textContent.trim()),
    isPremium: q.textContent.toLowerCase().includes("premium"),
  }));

  let finalQuality = targetQuality;

  if (targetQuality.toLowerCase() === "auto") {
    const autoQuality = qualityList.find((q) =>
      q.label.toLowerCase().includes("auto")
    );
    if (autoQuality) {
      autoQuality.element.click();
      finalQuality = autoQuality.label;
    }
  } else {
    const targetResolution = parseInt(targetQuality, 10);

    let exactMatch = qualityList.find(
      (q) => q.resolution === targetResolution && !q.isPremium
    );

    if (!exactMatch) {
      exactMatch = qualityList.find((q) => q.resolution === targetResolution);
    }

    if (exactMatch && !exactMatch.isPremium) {
      exactMatch.element.click();
      finalQuality = exactMatch.label;
    } else {
      const lowerQualities = qualityList
        .filter(
          (q) =>
            q.resolution !== null &&
            q.resolution <= targetResolution &&
            !q.isPremium
        )
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
      chrome.runtime.sendMessage({
        type: "qualityChanged",
        quality: finalQuality,
        tabInfo: {
          url: window.location.href,
          title: document.title,
        },
      });
    }
  });
}

function waitForPlayerReady(callback) {
  const checkExist = setInterval(() => {
    const player = document.querySelector(".html5-video-player");
    if (player && player.getPlayerState) {
      clearInterval(checkExist);
      callback();
    }
  }, 500);
}

// Initialisation
initTab();
waitForPlayerReady(() => {
  console.log("Player prêt");
});

// Surveiller les navigations internes
window.addEventListener("yt-navigate-finish", () => {
  console.log("Navigation interne détectée (yt-navigate-finish)");
  waitForPlayerReady(() => {
    console.log("Player prêt après navigation.");
    initTab();
  });
});

// 🔥 BONUS : Ecouter les changements d'activation en live
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.extensionEnabled) {
    const enabled = changes.extensionEnabled.newValue;
    console.log(`extensionEnabled changé dynamiquement : ${enabled}`);
    updateVisibilityListener(enabled);
  }
});
