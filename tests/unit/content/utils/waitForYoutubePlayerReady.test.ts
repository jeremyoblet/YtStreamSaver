import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitForYoutubePlayerReady } from "../../../../src/content/utils/waitForYoutubePlayerReady";

describe("waitForYoutubePlayerReady", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers(); // Important pour contrôler setInterval
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves when player is ready", async () => {
    // Crée un faux <video> avec les bonnes propriétés
    const video = document.createElement("video");
    Object.defineProperty(video, "readyState", { value: 4 });
    Object.defineProperty(video, "paused", { value: false });
    document.body.appendChild(video);

    // Crée le bouton settings
    const btn = document.createElement("div");
    btn.classList.add("ytp-settings-button");
    document.body.appendChild(btn);

    // Lance la promesse
    const promise = waitForYoutubePlayerReady();

    // Simule l'attente des intervals
    vi.advanceTimersByTime(200); // suffisant ici

    const resolvedVideo = await promise;
    expect(resolvedVideo).toBe(video);
  });

  it("rejects after timeout if player not ready", async () => {
    const promise = waitForYoutubePlayerReady(500); // plus court pour test

    vi.advanceTimersByTime(600);

    await expect(promise).rejects.toBe("YouTube player not ready after timeout");
  });
});
