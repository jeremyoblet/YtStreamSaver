import {
  getExtensionEnabled,
  getVisibleQuality,
  getHiddenQuality,
} from "./utils/storageUtils.js";

export class QualityManager {
  constructor(tabManager) {
    this.tabManager = tabManager;
    this.debug = true;
  }

  init() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "refreshQuality") {
        this._handleRefreshRequest();
      }
    });
  }

  async _handleRefreshRequest() {
    const enabled = await getExtensionEnabled();
    if (!enabled) {
      if (this.debug) {
        console.log(
          "[QualityManager] Extension not activated. Not refreshing."
        );
      }
      return;
    }

    const isVisible = !document.hidden;
    this.changeQualityBasedOnVisibility(isVisible);
  }

  async changeQualityBasedOnVisibility(isVisible) {
    const targetQuality = isVisible
      ? await getVisibleQuality()
      : await getHiddenQuality();
    if (this.debug)
      console.log(
        "[QualityManager] Quality changing asked on :",
        targetQuality
      );

    try {
      this.setPlayerQuality(targetQuality);
    } catch (error) {
      console.error("[QualityManager] Error when quality changing :", error);
    }
  }

  setPlayerQuality(targetQuality) {
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
        if (this.debug)
          console.log(
            "[QualityManager] Qualité définie sur automatique :",
            finalQuality
          );
        return;
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

    if (this.debug)
      console.log("[QualityManager] Final quality selected :", finalQuality);
  }
}

function extractResolution(label) {
  const match = label.match(/(\d+)[pP]/);
  return match ? parseInt(match[1], 10) : null;
}
