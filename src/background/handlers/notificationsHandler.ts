// type QueuedNotification = { url: string; quality: string };

// let debounceTimer: NodeJS.Timeout | null = null;
// const notificationBuffer: QueuedNotification[] = [];

// export function queueNotification(url: string, quality: string): void {
//   notificationBuffer.push({ url, quality });

//   // Réinitialiser le timer s'il existe
//   if (debounceTimer) {
//     clearTimeout(debounceTimer);
//   }

//   // Attendre 150ms après le dernier changement
//   debounceTimer = setTimeout(() => {
//     showGroupedNotification(notificationBuffer.slice());
//     notificationBuffer.length = 0;
//     debounceTimer = null;
//   }, 150);
// }

// function showGroupedNotification(entries: QueuedNotification[]): void {
//   const message = entries
//     .map((entry) => `- ${entry.url} : passage à ${entry.quality}`)
//     .join("\n");

//   const notificationId = `group-${Date.now()}-${Math.random()}`;
//   chrome.notifications.create(
//     notificationId,
//     {
//       type: "basic",
//       iconUrl: "icons/icon_128.png",
//       title: "Qualité changée",
//       message,
//     },
//     (id) => {
//       setTimeout(() => {
//         chrome.notifications.clear(id);
//       }, 3000);
//     }
//   );
// }

type QueuedNotification = { title: string; quality: string };

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

export function queueNotification(title: string, quality: string): void {
  notificationBuffer.push({
    title: truncate(title, 60),
    quality,
  });

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
      return `• ${entry.title}  →  ${emoji} ${entry.quality}`;
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

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}
