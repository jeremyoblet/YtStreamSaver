export function waitForYoutubePlayerReady(
  timeout = 10000
): Promise<HTMLVideoElement> {
  const pollInterval = 100;
  let elapsed = 0;

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const video = document.querySelector("video") as HTMLVideoElement;
      const settingsBtn = document.querySelector(".ytp-settings-button");

      const isReady =
        video && settingsBtn && video.readyState >= 3 && !video.paused;

      if (isReady) {
        clearInterval(interval);
        resolve(video);
      }

      elapsed += pollInterval;
      if (elapsed >= timeout) {
        clearInterval(interval);
        reject("YouTube player not ready after timeout");
      }
    }, pollInterval);
  });
}
