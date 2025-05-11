import { getUIElements } from "./ui";
import {
  getSettingsFromBackground,
  updateSettings,
  notifyTabsQualityChanged,
} from "./messaging";
import { VideoQuality } from "../types";

document.addEventListener("DOMContentLoaded", async () => {
  const ui = getUIElements();

  async function applySettingsToUI() {
    const settings = await getSettingsFromBackground();
    ui.extensionCheckbox.checked = settings.extensionEnabled;
    ui.visibleSelect.value = settings.visibleQuality;
    ui.hiddenSelect.value = settings.hiddenQuality;
    ui.notificationsCheckbox.checked = settings.notificationsEnabled;
  }

  function getAllSettingsFromUI() {
    return {
      extensionEnabled: ui.extensionCheckbox.checked,
      visibleQuality: ui.visibleSelect.value as VideoQuality,
      hiddenQuality: ui.hiddenSelect.value as VideoQuality,
      notificationsEnabled: ui.notificationsCheckbox.checked,
    };
  }

  async function updateAllSettingsFromUI() {
    const newSettings = getAllSettingsFromUI();
    const response = await updateSettings(newSettings);
    console.log("Tous les réglages mis à jour ?", response.success);
  }

  function addListeners() {
    ui.extensionCheckbox.addEventListener("change", async () => {
      await updateAllSettingsFromUI();
    });

    ui.visibleSelect.addEventListener("change", async () => {
      await updateAllSettingsFromUI();
      notifyTabsQualityChanged();
    });

    ui.hiddenSelect.addEventListener("change", async () => {
      await updateAllSettingsFromUI();
      // notifyTabsQualityChanged();
    });

    ui.notificationsCheckbox.addEventListener("change", async () => {
      await updateAllSettingsFromUI();
    });
  }

  await applySettingsToUI();
  addListeners();
});
