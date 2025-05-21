const SELECTOR = ".ytp-settings-button";

export async function fixYoutubeSettingsButtonLabel(): Promise<void> {
  const button = await waitForSettingsButton();

  const initialTitle = button.getAttribute("title");
  const initialLabel = button.getAttribute("aria-label");

  if (!initialTitle || !initialLabel) {
    console.warn("[fixYoutubeLabel] Impossible d'enregistrer les valeurs initiales du bouton.");
    return;
  }

  observeAttributeChanges(button, () => {
    restoreBrokenAttributes(button, initialTitle, initialLabel);
  });

  restoreBrokenAttributes(button, initialTitle, initialLabel);
  console.log("[fixYoutubeLabel] Protection des labels activée (multilingue).");
}

async function waitForSettingsButton(): Promise<HTMLElement> {
  const existing = document.querySelector(SELECTOR) as HTMLElement | null;
  if (existing) return existing;

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const found = document.querySelector(SELECTOR) as HTMLElement | null;
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

function restoreBrokenAttributes(
  button: HTMLElement,
  title: string,
  label: string
): void {
  const currentTitle = button.getAttribute("title");
  const currentLabel = button.getAttribute("aria-label");

  if (currentTitle === "null" || !currentTitle) {
    console.warn("[fixYoutubeLabel] Correction du title →", title);
    button.setAttribute("title", title);
  }

  if (currentLabel === "null" || !currentLabel) {
    console.warn("[fixYoutubeLabel] Correction du aria-label →", label);
    button.setAttribute("aria-label", label);
  }
}

function observeAttributeChanges(
  element: HTMLElement,
  callback: () => void
): void {
  const observer = new MutationObserver(callback);
  observer.observe(element, {
    attributes: true,
    attributeFilter: ["title", "aria-label"],
  });
}
