# 🎥 Stream Saver Extension (Chrome Extension)

**Automatically optimize YouTube video quality based on Chrome tab or window visibility.**

## 🚀 Features

* 🔻 Automatically lowers video quality when the tab or Chrome window is hidden
* 🔺 Automatically restores a preferred quality when the tab becomes active again
* ⚙️ User-configurable min and max quality via a simple interface (`popup.html`)
* 🧹 Modular and extensible architecture
* 🛠️ Developed in TypeScript with `esbuild` for bundling

## 🧱 Architecture

The project follows a **modular** and **scalable** design, inspired by hexagonal architecture:

```
src/
├── background/        # Event-driven background scripts
├── content/           # Injected scripts that run in YouTube pages
├── popup/             # UI shown when clicking the extension icon
├── storage/           # Abstractions over Chrome storage
├── youtube/           # YouTube-specific logic and API interactions
└── lib/               # Shared utilities and helper functions
```

## 🥪 How It Works

1. The extension listens for visibility changes (tab active/inactive, window visible/hidden)
2. It adjusts the video quality on YouTube based on the user's preferences
3. Settings are saved using `chrome.storage` for persistence

## 🛠️ Development Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/youtube-stream-saver.git
cd youtube-stream-saver
```

2. **Install dependencies:**

```bash
npm install
```

3. **Build the project:**

```bash
npm run build
```

4. **Load the extension in Chrome:**

   * Go to `chrome://extensions/`
   * Enable **Developer Mode**
   * Click **Load unpacked**
   * Select the `dist/` folder

## 📆 Packaging & Publishing

A GitHub Actions pipeline builds and (optionally) publishes the extension to the Chrome Web Store (WIP).

## 📌 Chrome Permissions Used

* `tabs`
* `storage`
* `scripting`
* `notifications`

## 📌 Roadmap

* [x] MVP for automatic video quality adjustment
* [ ] Support for multiple video platforms (Twitch, Vimeo...)
* [ ] UI improvements
* [ ] Anonymous usage statistics
* [ ] Premium account connection ( connecting to an another service )
