// build.js
import { build } from "esbuild";
import { copyFileSync, mkdirSync, existsSync, cpSync } from "fs";
import path from "path";

// 1. Build le content script
await build({
  entryPoints: ["src/content/mainContent.js"],
  bundle: true,
  outfile: "dist/content.js",
  format: "iife",
  platform: "browser",
  sourcemap: true,
});

// 2. Build le background en tant que module
await build({
  entryPoints: ["src/background/background.js"],
  bundle: true,
  outfile: "dist/background.js",
  format: "esm",
  platform: "browser",
  sourcemap: true,
});

// 2. Copier les fichiers nécessaires
const filesToCopy = [
  { from: "src/popup/popup.js", to: "dist/popup.js" },
  { from: "popup.html", to: "dist/popup.html" },
  { from: "styles.css", to: "dist/styles.css" },
  { from: "manifest.json", to: "dist/manifest.json" },
];

const iconsFolder = "icons";
const distIconsFolder = "dist/icons";

filesToCopy.forEach(({ from, to }) => {
  copyFileSync(from, to);
});

if (!existsSync(distIconsFolder)) {
  mkdirSync(distIconsFolder, { recursive: true });
}

cpSync(iconsFolder, distIconsFolder, { recursive: true });
