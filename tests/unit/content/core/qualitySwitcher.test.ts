import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QualitySwitcher } from "../../../../src/content/core/qualitySwitcher";
import { checkIfUserIsPremium } from "../../../../src/content/ui/checkPremiumStatus";

// mock API Chrome
(globalThis as any).chrome = {
  runtime: {
    sendMessage: vi.fn((msg, callback) => {
      if (msg.type === "getSettings") {
        callback({
          settings: {
            extensionEnabled: true,
            visibleQuality: "720",
            hiddenQuality: "144"
          }
        });
      }
    }),
    lastError: null,
  },
};

// mock checkIfUserIsPremium
vi.mock("@/content/ui/checkPremiumStatus", () => ({
  checkIfUserIsPremium: vi.fn().mockResolvedValue(false),
}));

describe("QualitySwitcher", () => {
  let switcher: QualitySwitcher;

  beforeEach(() => {
    vi.clearAllMocks();
    switcher = new QualitySwitcher();

    // Simule une vidéo en cours de lecture
    document.body.innerHTML = `
      <video></video>
      <div class="ytp-settings-button"></div>
    `;
    const video = document.querySelector("video") as HTMLVideoElement;
    Object.defineProperty(video, "paused", { value: false });

    // Onglet actif
    Object.defineProperty(document, "hidden", { value: false });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should apply visible quality when tab is active and video playing", async () => {
    const spy = vi.spyOn(switcher, "setPlayerQuality").mockResolvedValue();

    await switcher.handleVisibilityChange();

    expect(spy).toHaveBeenCalledWith("720");
  });

  it("should not apply quality if video is paused", async () => {
    const video = document.querySelector("video")!;
    Object.defineProperty(video, "paused", { value: true });

    const spy = vi.spyOn(switcher, "setPlayerQuality");
    await switcher.handleVisibilityChange();

    expect(spy).not.toHaveBeenCalled();
  });

  it("should apply hidden quality when tab is hidden", async () => {
    Object.defineProperty(document, "hidden", { value: true });
    const spy = vi.spyOn(switcher, "setPlayerQuality").mockResolvedValue();

    await switcher.handleVisibilityChange();

    expect(spy).toHaveBeenCalledWith("144");
  });
});
