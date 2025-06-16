import { chromium } from 'playwright';

(async () => {
  const pathToExtension = 'C:/Users/Wam/Documents/CODING/CHROME_EXTENTIONS/YtStreamSaver/dist';

  const context = await chromium.launchPersistentContext('', {
    headless: false, // Obligatoire : les extensions ne marchent qu'en mode non-headless
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  });

  const page = await context.newPage();
  await page.goto('https://www.youtube.com');

  // Attendre le popup de cookies si présent
  try {
    await page.waitForSelector('form[action*="consent"] button', { timeout: 5000 });

    // Cliquer sur "Tout refuser" si dispo, sinon "Tout accepter"
    const buttons = await page.$$('form[action*="consent"] button');
    for (const button of buttons) {
      const text = await button.textContent();
      if (text?.toLowerCase().includes('refuser')) {
        await button.click();
        console.log('>> Bouton "Refuser tout" cliqué');
        break;
      } else if (text?.toLowerCase().includes('accepter')) {
        await button.click();
        console.log('>> Bouton "Accepter tout" cliqué');
        break;
      }
    }
  } catch (e) {
    console.log('>> Aucun popup de consentement détecté');
  }

  // Attendre que les miniatures de vidéo soient visibles
  await page.waitForSelector('ytd-thumbnail');

  // Cliquer sur la première vidéo
  await page.click('ytd-thumbnail');

  // Attendre que la vidéo démarre (au moins que la balise vidéo apparaisse)
  await page.waitForSelector('video');

  // Mettre en pause la vidéo après 3 secondes
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const video = document.querySelector('video');
    video?.pause();
  });

  // Vérifier la qualité actuelle (exemple pour tester ton extension)
  const quality = await page.evaluate(() => {
    return document.querySelector('video')?.getVideoPlaybackQuality?.().totalVideoFrames;
  });

  console.log('Frames lues :', quality);

})();
