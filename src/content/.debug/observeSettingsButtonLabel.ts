export function observeSettingsButtonLabel(): void {
    const settingsButton = document.querySelector(".ytp-settings-button");
  
    if (!settingsButton) {
      console.warn("[debugHook] Bouton paramètres non trouvé.");
      return;
    }
  
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "aria-label" || mutation.attributeName === "title")
        ) {
          const newLabel = (mutation.target as HTMLElement).getAttribute("aria-label");
          const newTitle = (mutation.target as HTMLElement).getAttribute("title");
          console.warn(
            `[debugHook] Attribut modifié : ${mutation.attributeName} → aria-label="${newLabel}" / title="${newTitle}"`,
            mutation
          );
          console.trace(); // Pour remonter la pile si c'est causé par ton code
        }
      }
    });
  
    observer.observe(settingsButton, {
      attributes: true,
      attributeFilter: ["aria-label", "title"],
    });
  
    console.log("[debugHook] Observer actif sur le bouton paramètres.");
  }
  