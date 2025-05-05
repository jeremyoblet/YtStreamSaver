export class QualitySwitcher {
  async handleVisibilityChange() {
    const storedSettings = await this.getQualitiesFromBackground();
    console.log(storedSettings);
    if (!storedSettings || !storedSettings.extensionEnabled) {
      console.log("Extension disabled by user.");
      return;
    }

    const { visibleQuality, hiddenQuality } = storedSettings;
    const targetQuality = document.hidden ? hiddenQuality : visibleQuality;

    console.log(`Quality applied : ${targetQuality}`);
    await this.setPlayerQuality(targetQuality);
  }

  async getQualitiesFromBackground() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
        if (chrome.runtime.lastError || !response?.settings) {
          console.warn(
            "Impossible to get settings :",
            chrome.runtime.lastError
          );
          resolve(null);
        } else {
          resolve(response.settings);
        }
      });
    });
  }

  async setPlayerQuality(targetQuality) {
    const settingsButton = document.querySelector(".ytp-settings-button");
    if (!settingsButton) {
      console.log("Settings button not found.");
      return;
    }

    this.openSettingsMenu(settingsButton, async () => {
      try {
        await this.waitForElement(".ytp-quality-menu", 2000);
        await this.selectQuality(targetQuality, (finalQuality) => {
          this.notifyQualityChange(finalQuality);
        });
      } catch (err) {
        console.warn("⏱Quality menu did not appeared :", err);
      }
    });
  }

  openSettingsMenu(button, callback) {
    button.click();
    setTimeout(() => {
      const menuItems = document.querySelectorAll(".ytp-menuitem-label");
      const qualityItem = Array.from(menuItems).find((el) =>
        el.textContent.toLowerCase().includes("qualit")
      );

      if (qualityItem) {
        qualityItem.click();
        setTimeout(callback, 1000); // petit délai pour laisser apparaître le menu qualité
      } else {
        console.log("Quality menu item not found.");
      }
    }, 1000); // délai pour que le premier menu s'affiche
  }

  async waitForElement(selector, timeout = 2000) {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;

      const check = () => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);

        elapsed += interval;
        if (elapsed >= timeout) {
          return reject(`Element "${selector}" not found after ${timeout}ms`);
        }

        setTimeout(check, interval);
      };
      check();
    });
  }

  extractResolution(text) {
    const match = text.match(/(\d+)p/);
    return match ? parseInt(match[1], 10) : null;
  }

  isPlainResolution(label) {
    return /^[0-9]+p$/i.test(label.trim()); // ex : "1080p"
  }

  isPremium(label) {
    return /premium/i.test(label);
  }

  async selectQuality(targetQuality, callback) {
    const qualities = document.querySelectorAll(
      ".ytp-quality-menu .ytp-menuitem-label"
    );

    if (qualities.length === 0) {
      console.warn("⚠️ Aucune option de qualité trouvée.");
      return;
    }

    const qualityList = Array.from(qualities)
      .map((q) => {
        const label = q.textContent.trim();
        return {
          element: q,
          label,
          resolution: this.extractResolution(label),
          isPlain: this.isPlainResolution(label),
          isPremium: this.isPremium(label),
        };
      })
      .filter((q) => !q.isPremium); // ⚠️ On exclut TOUT de type Premium

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

      // 1. Privilégier la version propre (ex: "1080p")
      let exactMatch = qualityList.find(
        (q) => q.resolution === targetResolution && q.isPlain
      );

      // 2. Sinon, chercher n'importe quelle version non premium
      if (!exactMatch) {
        exactMatch = qualityList.find((q) => q.resolution === targetResolution);
      }

      // 3. Clic si trouvé
      if (exactMatch && exactMatch.element) {
        exactMatch.element.click();
        finalQuality = exactMatch.label;
      } else {
        // 4. Fallback vers la résolution inférieure la plus élevée non premium
        const lowerQualities = qualityList
          .filter(
            (q) => q.resolution !== null && q.resolution < targetResolution
          )
          .sort((a, b) => b.resolution - a.resolution);

        if (lowerQualities.length > 0) {
          lowerQualities[0].element.click();
          finalQuality = lowerQualities[0].label;
        } else {
          // Dernier recours : la plus basse non premium
          const lowest = qualityList[qualityList.length - 1];
          if (lowest) {
            lowest.element.click();
            finalQuality = lowest.label;
          }
        }
      }
    }

    console.log(`✅ Selected quality : ${finalQuality}`);
    callback(finalQuality);
  }

  notifyQualityChange(finalQuality) {
    chrome.runtime.sendMessage({
      type: "qualityChanged",
      quality: finalQuality,
      tabInfo: { title: document.title },
    });
  }
}
