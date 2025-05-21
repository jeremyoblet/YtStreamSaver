import { QualitySwitcher } from "./core/qualitySwitcher";
import { fixYoutubeSettingsButtonLabel } from "./ui/fixSettingsButtonLabel";
import { waitForYoutubePlayerReady } from "./utils/waitForYoutubePlayerReady";
import { registerAllListeners } from "./listeners";

declare const window: Window & { hasRunContentScript?: boolean };

if (location.hostname.includes("youtube.com")) {
  fixYoutubeSettingsButtonLabel();
}

if (!window.hasRunContentScript) {
  window.hasRunContentScript = true;
  console.log("GREEN STREAM ON - Content script started");

  const qualitySwitcher = new QualitySwitcher();

  waitForYoutubePlayerReady(10000)
    .then(() => qualitySwitcher.handleVisibilityChange())
    .catch((err) => console.warn("Player not ready at start:", err));

  registerAllListeners(qualitySwitcher);
}
