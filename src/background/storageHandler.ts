import { Settings } from "../types";

export class StorageHandler {
  async writeMultipleSettings(settings: Partial<Settings>): Promise<void> {
    await chrome.storage.sync.set(settings);
  }

  async readMultipleSettings(): Promise<Settings> {
    const result = await chrome.storage.sync.get(null);
    return {
      extensionEnabled: result.extensionEnabled ?? true,
      visibleQuality: result.visibleQuality ?? "Auto",
      hiddenQuality: result.hiddenQuality ?? "144",
      notificationsEnabled: result.notificationsEnabled ?? true,
    };
  }

  async initializeDefaultsIfMissing(defaultSettings: Settings): Promise<void> {
    const storedSettings = await chrome.storage.sync.get(
      Object.keys(defaultSettings)
    );

    const toInitialize: Partial<Settings> = {};
    for (const key in defaultSettings) {
      if (storedSettings[key] === undefined) {
        toInitialize[key as keyof Settings] = defaultSettings[key];
      }
    }

    if (Object.keys(toInitialize).length > 0) {
      await this.writeMultipleSettings(toInitialize);
      console.log("Default settings added:", toInitialize);
    } else {
      console.log("Settings already exist:", storedSettings);
    }
  }
}
