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

  async readMultipleSettings(defaults = {}) {
    const result = await chrome.storage.sync.get(defaults);
    return result;
  }

  async initializeDefaultsIfMissing(defaults = {}) {
    const current = await this.readMultipleSettings(defaults);

    const toInitialize = {};
    for (const key in defaults) {
      if (current[key] === undefined) {
        toInitialize[key] = defaults[key];
      }
    }

    if (Object.keys(toInitialize).length > 0) {
      await this.writeMultipleSettings(toInitialize);
      console.log("Default settings added :", toInitialize);
    } else {
      console.log("Settings already exists :", current);
    }
  }
}
