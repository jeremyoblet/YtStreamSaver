import { Settings, MessageResponse } from "../types";

export function getSettingsFromBackground(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
      resolve(response.settings as Settings);
    });
  });
}

export function updateSettings(
  settings: Partial<Settings>
): Promise<MessageResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "updateSettings", settings },
      (response) => {
        resolve(response);
      }
    );
  });
}

export function notifyTabsQualityChanged(): void {
  chrome.runtime.sendMessage({ type: "notifyTabsQualityChanged" });
}
