export class StorageHandler {
  constructor() {}

  async writeSettingInStorage(setting, value) {
    await chrome.storage.sync.set({ [setting]: value });
  }

  async writeMultipleSettings(settings) {
    await chrome.storage.sync.set(settings);
  }

  async readSettingFromStorage(setting, defaultValue = null) {
    const result = await chrome.storage.sync.get({ [setting]: defaultValue });
    return result[setting];
  }

  async readMultipleSettings(defaultSettings) {
    const result = await chrome.storage.sync.get(defaultSettings);
    return result;
  }

  async initializeDefaultsIfMissing(defaultSettings) {
    const storedSettings = await chrome.storage.sync.get(
      Object.keys(defaultSettings)
    );

    const toInitialize = {};

    for (const key in defaultSettings) {
      if (storedSettings[key] === undefined) {
        toInitialize[key] = defaultSettings[key];
      }
    }

    if (Object.keys(toInitialize).length > 0) {
      await this.writeMultipleSettings(toInitialize);
      console.log("Default settings added :", toInitialize);
    } else {
      console.log("Settings already exist:", storedSettings);
    }
  }
}
