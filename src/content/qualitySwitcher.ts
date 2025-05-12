import { Settings, VideoQuality } from "../types";

export class QualitySwitcher {
  async handleVisibilityChange(): Promise<void> {
    const storedSettings = await this.getQualitiesFromBackground();
    if (!storedSettings || !storedSettings.extensionEnabled) {
      console.log("Extension disabled by user.");
      return;
    }

    const isPaused = this.isVideoPaused();
    if (isPaused) {
      console.log("Vidéo en pause, aucun changement de qualité.");
      return;
    }

    const { visibleQuality, hiddenQuality } = storedSettings;
    const targetQuality = document.hidden ? hiddenQuality : visibleQuality;

    console.log(`🎯 Qualité appliquée : ${targetQuality}`);
    this.forceCloseSettingsMenu();
    await this.setPlayerQuality(targetQuality);
  }

  isVideoPaused(): boolean {
    const video = document.querySelector("video") as HTMLVideoElement | null;
    return video ? video.paused : true;
  }

  async getQualitiesFromBackground(): Promise<Settings | null> {
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

  async setPlayerQuality(targetQuality: VideoQuality): Promise<void> {
    const settingsButton = document.querySelector(
      ".ytp-settings-button"
    ) as HTMLElement | null;
    if (!settingsButton) {
      console.log("🔘 Bouton des paramètres non trouvé.");
      return;
    }

    this.openSettingsMenu(settingsButton, async () => {
      try {
        await this.waitForElement(".ytp-quality-menu", 2000);
        await this.selectQuality(targetQuality, (finalQuality) => {
          this.notifyQualityChange(finalQuality);
        });
      } catch (err) {
        console.warn("⏱ Le menu qualité ne s'est pas affiché :", err);
      }
    });
  }

  async openSettingsMenu(
    button: HTMLElement,
    callback: () => void
  ): Promise<void> {
    button.click();

    try {
      const qualityItem = await this.waitForElement(
        ".ytp-menuitem-label",
        2000,
        (el) => el.textContent?.toLowerCase().includes("qualit") ?? false
      );

      if (qualityItem instanceof HTMLElement) {
        qualityItem.click();
        setTimeout(callback, 500);
      } else {
        console.warn("⚠️ Élément 'qualité' non trouvé.");
        this.forceCloseSettingsMenu();
      }
    } catch (err) {
      console.warn("⏱ Timeout sur openSettingsMenu :", err);
      this.forceCloseSettingsMenu();
    }
  }

  async waitForElement(
    selector: string,
    timeout: number = 2000,
    validateFn?: (el: Element) => boolean
  ): Promise<Element> {
    return new Promise((resolve, reject) => {
      const tryMatch = () => {
        const candidates = document.querySelectorAll(selector);
        for (const el of candidates) {
          if (!validateFn || validateFn(el)) return el;
        }
        return null;
      };

      const existing = tryMatch();
      if (existing) return resolve(existing);

      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(
          `⏱ Timeout : élément '${selector}' introuvable après ${timeout}ms`
        );
      }, timeout);

      const observer = new MutationObserver(() => {
        const match = tryMatch();
        if (match) {
          clearTimeout(timeoutId);
          observer.disconnect();
          resolve(match);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  extractResolution(text: string): number | null {
    const match = text.match(/(\d+)p/);
    return match ? parseInt(match[1], 10) : null;
  }

  isPlainResolution(label: string): boolean {
    return /^[0-9]+p$/i.test(label.trim());
  }

  isPremium(label: string): boolean {
    return /premium/i.test(label);
  }

  async selectQuality(
    targetQuality: VideoQuality,
    callback: (finalQuality: string) => void
  ): Promise<void> {
    const qualities = document.querySelectorAll(
      ".ytp-quality-menu .ytp-menuitem-label"
    );
    if (qualities.length === 0) {
      console.warn("⚠️ Aucune qualité trouvée.");
      return;
    }

    const qualityList = Array.from(qualities)
      .map((q) => {
        const label = q.textContent?.trim() || "";
        return {
          element: q as HTMLElement,
          label,
          resolution: this.extractResolution(label),
          isPlain: this.isPlainResolution(label),
          isPremium: this.isPremium(label),
        };
      })
      .filter((q) => !q.isPremium);

    let finalQuality = targetQuality;

    if (targetQuality.toLowerCase() === "auto") {
      const auto = qualityList.find((q) =>
        q.label.toLowerCase().includes("auto")
      );
      if (auto) {
        auto.element.click();
        finalQuality = auto.label;
      }
    } else {
      const targetRes = parseInt(targetQuality, 10);
      let match =
        qualityList.find((q) => q.resolution === targetRes && q.isPlain) ||
        qualityList.find((q) => q.resolution === targetRes);

      if (match) {
        match.element.click();
        finalQuality = match.label;
      } else {
        const fallback =
          qualityList
            .filter((q) => q.resolution !== null && q.resolution < targetRes)
            .sort((a, b) => b.resolution! - a.resolution!)[0] ||
          qualityList[qualityList.length - 1];

        if (fallback) {
          fallback.element.click();
          finalQuality = fallback.label;
        }
      }
    }

    console.log(`✅ Qualité sélectionnée : ${finalQuality}`);
    callback(finalQuality);
  }

  forceCloseSettingsMenu(): void {
    const menu = document.querySelector(".ytp-settings-menu");
    const button = document.querySelector(
      ".ytp-settings-button"
    ) as HTMLElement | null;

    if (
      menu &&
      menu instanceof HTMLElement &&
      menu.offsetParent !== null &&
      button
    ) {
      button.click();
      console.log("⚙️ Menu paramètres fermé manuellement.");
    }
  }

  notifyQualityChange(finalQuality: string): void {
    chrome.runtime.sendMessage({
      type: "qualityChanged",
      quality: finalQuality,
      tabInfo: { title: document.title },
    });
  }
}
