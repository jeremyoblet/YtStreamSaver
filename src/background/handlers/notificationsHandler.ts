type QueuedNotification = { visibility: "visible" | "hidden"; quality: string };

let debounceTimer: NodeJS.Timeout | null = null;
const notificationBuffer: QueuedNotification[] = [];

// Map qualité → emoji
const qualityEmojiMap: Record<string, string> = {
  "144p": "🟢",
  "240p": "🟢",
  "360p": "🟡",
  "480p": "🟡",
  "720p": "🟠",
  "1080p": "🔵",
  "1440p": "🟣",
  "2160p": "🔴",
  Auto: "⚙️",
};

export function queueNotification(
  visibility: "visible" | "hidden",
  quality: string
): void {
  notificationBuffer.push({ visibility, quality });

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    showGroupedNotification(notificationBuffer.slice());
    notificationBuffer.length = 0;
    debounceTimer = null;
  }, 150);
}

function showGroupedNotification(entries: QueuedNotification[]): void {
  const message = entries
    .map((entry) => {
      const emoji = qualityEmojiMap[entry.quality] ?? "📺";
      const label =
        entry.visibility === "visible" ? "tab visible" : "tab cachée";
      return `• ${label}  →  ${emoji} ${entry.quality}`;
    })
    .join("\n");

  const notificationId = `group-${Date.now()}-${Math.random()}`;
  chrome.notifications.create(
    notificationId,
    {
      type: "basic",
      iconUrl: "icons/icon_128.png",
      title: "Changement de qualité détecté",
      message,
    },
    (id) => {
      setTimeout(() => {
        chrome.notifications.clear(id);
      }, 3000);
    }
  );
}
