import { StorageHandler } from "./storageHandler";
import { Message } from "../../types";
import { defaultSettings } from "../defaultSettings";

const storage = new StorageHandler();

async function initializeDefaults(): Promise<void> {
  await storage.initializeDefaultsIfMissing(defaultSettings);
}

export async function handlePopupMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): Promise<boolean> {
  if (message.type === "getSettings") {
    await initializeDefaults();
    const settings = await storage.readMultipleSettings();
    sendResponse({ settings });
    return true;
  }

  if (message.type === "updateSettings") {
    await storage.writeMultipleSettings(message.settings);
    sendResponse({ success: true });
    return true;
  }

  return false;
}
