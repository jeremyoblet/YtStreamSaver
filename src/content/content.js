if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;
  console.log("YT Stream Saver - Content script started");

  // My code here
  document.addEventListener("visibilitychange", async () => {
    const response = await getQualitiesFromBackground();
    if (!response) return;

    const { visibleQuality = "Auto", hiddenQuality = "144" } = response;

    const targetQuality = document.hidden ? hiddenQuality : visibleQuality;

    console.log(`Demande de qualité : ${targetQuality}`);

    setPlayerQuality(targetQuality);
  });

  async function getQualitiesFromBackground() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
        if (chrome.runtime.lastError || !response?.settings) {
          console.warn(
            "Impossible de récupérer les réglages :",
            chrome.runtime.lastError
          );
          resolve(null);
        } else {
          resolve(response.settings);
        }
      });
    });
  }

  async function setPlayerQuality(targetQuality) {
    const settingsButton = document.querySelector(".ytp-settings-button");
    if (!settingsButton) {
      console.log("Settings button not found.");
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
    const menuItems = document.querySelectorAll(".ytp-menuitem-label");
    const qualityItem = Array.from(menuItems).find((el) =>
      el.textContent.toLowerCase().includes("qualit")
    );

    if (qualityItem) {
      qualityItem.click();
      setTimeout(callback, 500);
    } else {
      console.log("Quality menu item not found.");
    }
  }

  function extractResolution(text) {
    const match = text.match(/(\d+)p/);
    return match ? parseInt(match[1], 10) : null;
  }

  async function selectQuality(targetQuality, callback) {
    const qualities = document.querySelectorAll(
      ".ytp-quality-menu .ytp-menuitem-label"
    );

    // console.log("Qualités disponibles :");
    const qualityList = Array.from(qualities).map((q) => ({
      element: q,
      label: q.textContent.trim(),
      resolution: extractResolution(q.textContent.trim()),
      isPremium: q.textContent.toLowerCase().includes("premium"),
    }));

    // qualityList.forEach((q) => console.log(q.label));

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

    console.log(`Qualité sélectionnée : ${finalQuality}`);
    callback(finalQuality);
  }

  function notifyQualityChange(finalQuality) {
    chrome.runtime.sendMessage({
      type: "qualityChanged",
      quality: finalQuality,
      tabInfo: { title: document.title },
    });
  }
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
