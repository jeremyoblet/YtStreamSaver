import { build } from "esbuild";
import { copyFileSync, mkdirSync, existsSync, cpSync } from "fs";
import path from "path";

await build({
  entryPoints: ["src/content/content.js"],
  bundle: true,
  outfile: "dist/content.js",
  format: "iife",
  platform: "browser",
  sourcemap: false,
  minify: true,
});

await build({
  entryPoints: ["src/background/background.js"],
  bundle: true,
  outfile: "dist/background.js",
  format: "esm",
  platform: "browser",
  sourcemap: false,
  minify: true,
});

const filesToCopy = [
  { from: "src/popup/popup.js", to: "dist/popup.js" },
  { from: "src/popup/popup.html", to: "dist/popup.html" },
  { from: "src/popup/styles.css", to: "dist/styles.css" },
  { from: "src/manifest.json", to: "dist/manifest.json" },
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
