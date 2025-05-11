export type VideoQuality =
  | "Auto"
  | "144"
  | "240"
  | "360"
  | "480"
  | "720"
  | "1080";

export type Settings = {
  extensionEnabled: boolean;
  visibleQuality: VideoQuality;
  hiddenQuality: VideoQuality;
  notificationsEnabled: boolean;
};

export type PopupUISettings = {
  extensionCheckbox: HTMLInputElement;
  visibleSelect: HTMLSelectElement;
  hiddenSelect: HTMLSelectElement;
  notificationsCheckbox: HTMLInputElement;
};

export type MessageResponse = { success: boolean };

export type Message =
  | { type: "getSettings" }
  | { type: "updateSettings"; settings: Partial<Settings> }
  | { type: "qualityChanged"; quality: string }
  | { type: "notifyTabsQualityChanged" };
