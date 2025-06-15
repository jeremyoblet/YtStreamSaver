import { QualitySwitcher } from "./core/qualitySwitcher";
import { fixYoutubeSettingsButtonLabel } from "./ui/fixSettingsButtonLabel";
import { waitForYoutubePlayerReady } from "./utils/waitForYoutubePlayerReady";
import { registerAllListeners } from "./listeners";


fixYoutubeSettingsButtonLabel();

const qualitySwitcher = new QualitySwitcher();

// pour le cas ou on arrive directement sur une video sans passer par la page d'accueil
if (location.hostname.includes("youtube.com")) {
  waitForYoutubePlayerReady(10000)
    .then(() => qualitySwitcher.handleVisibilityChange())
    .catch((err) => console.warn("Player not ready at start:", err));
}

registerAllListeners(qualitySwitcher);
