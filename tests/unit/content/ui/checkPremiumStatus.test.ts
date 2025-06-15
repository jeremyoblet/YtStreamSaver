import { describe, it, expect, beforeEach } from "vitest";
import { checkIfUserIsPremium } from "../../../../src/content/ui/checkPremiumStatus";

describe("checkIfUserIsPremium", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should return true if logo-type is YOUTUBE_PREMIUM_LOGO", async () => {
    document.body.innerHTML = `<ytd-masthead logo-type="YOUTUBE_PREMIUM_LOGO"></ytd-masthead>`;
    const isPremium = await checkIfUserIsPremium();
    expect(isPremium).toBe(true);
  });

  it("should return false if logo-type is not YOUTUBE_PREMIUM_LOGO", async () => {
    document.body.innerHTML = `<ytd-masthead logo-type="STANDARD_LOGO"></ytd-masthead>`;
    const isPremium = await checkIfUserIsPremium();
    expect(isPremium).toBe(false);
  });

  it("should return false if <ytd-masthead> is missing", async () => {
    const isPremium = await checkIfUserIsPremium();
    expect(isPremium).toBe(false);
  });
});
