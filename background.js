let tabStates = {}; // Stocké en RAM pour chaque onglet

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message reçu dans background :", message);

  // Fournir tabId sur demande
  if (message.type === "getTabId") {
    if (sender.tab && sender.tab.id !== undefined) {
      sendResponse({ tabId: sender.tab.id });
    } else {
      console.error("Impossible d'obtenir le tab.id depuis sender.");
      sendResponse({});
    }
    return true; // Nécessaire pour les réponses asynchrones
  }

  // Mise à jour de la visibilité d'un onglet
  if (message.type === 'updateVisibility') {
    const { tabId, visible } = message;
    console.log(`updateVisibility reçu: tabId=${tabId}, visible=${visible}`);

    if (tabId == null) {
      console.error('tabId est null ou undefined !');
      sendResponse({ isMaster: false });
      return true;
    }

    tabStates[tabId] = {
      visible: visible,
      updatedAt: Date.now()
    };

    console.log('TabStates mis à jour :', tabStates);

    const visibleTabs = Object.entries(tabStates)
      .filter(([_, state]) => state.visible)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt);

    let masterTabId = visibleTabs.length > 0 ? parseInt(visibleTabs[0][0], 10) : null;

    sendResponse({ isMaster: masterTabId === tabId });
    return true;
  }

  // Réagir au changement de qualité pour afficher une notification
  if (message.type === 'qualityChanged') {
    showNotification(message.quality);
  }

  // Permettre de récupérer les tabStates pour debug
  if (message.type === 'getTabStates') {
    sendResponse({ tabStates });
    return true;
  }
});

// Fonction d'affichage de la notification
function showNotification(quality) {
  chrome.notifications.create(
    {
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Quality Changed',
      message: `${quality}`
    },
    (notificationId) => {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 2000);
    }
  );
}
