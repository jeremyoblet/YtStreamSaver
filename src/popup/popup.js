document.addEventListener("DOMContentLoaded", () => {
  const extensionCheckbox = document.getElementById("extensionEnabled");
  const visibleSelect = document.getElementById("visibleQuality");
  const hiddenSelect = document.getElementById("hiddenQuality");
  const notificationsCheckbox = document.getElementById("notificationsEnabled");

  async function getSettingsFromBackground() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
        resolve(response.settings);
      });
    });
  }

  async function applySettingsToUI() {
    const settings = await getSettingsFromBackground();
    extensionCheckbox.checked = settings.extensionEnabled;
    visibleSelect.value = settings.visibleQuality;
    hiddenSelect.value = settings.hiddenQuality;
    notificationsCheckbox.checked = settings.notificationsEnabled;
  }

  function addListenersToSettings() {
    extensionCheckbox.addEventListener("change", () => {
      chrome.runtime.sendMessage(
        {
          type: "updateSetting",
          key: "extensionEnabled",
          value: extensionCheckbox.checked,
        },
        (response) => {
          console.log("Réglage enregistré ?", response.success);
        }
      );
    });

    visibleSelect.addEventListener("change", () => {
      chrome.runtime.sendMessage(
        {
          type: "updateSetting",
          key: "visibleQuality",
          value: visibleSelect.value,
        },
        (response) => {
          console.log("Réglage enregistré ?", response.success);
        }
      );
      chrome.runtime.sendMessage({ type: "notifyTabsQualityChanged" });
    });

    hiddenSelect.addEventListener("change", () => {
      chrome.runtime.sendMessage(
        {
          type: "updateSetting",
          key: "hiddenQuality",
          value: hiddenSelect.value,
        },
        (response) => {
          console.log("Réglage enregistré ?", response.success);
        }
      );
      // chrome.runtime.sendMessage({ type: "notifyTabsQualityChanged" });
    });

    notificationsCheckbox.addEventListener("change", () => {
      chrome.runtime.sendMessage(
        {
          type: "updateSetting",
          key: "notificationsEnabled",
          value: notificationsCheckbox.checked,
        },
        (response) => {
          console.log("Réglage enregistré ?", response.success);
        }
      );
    });
  }

  applySettingsToUI();
  addListenersToSettings();
});
