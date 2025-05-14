import { build } from "esbuild";
import { copyFileSync, mkdirSync, existsSync, cpSync } from "fs";
import path from "path";

const sharedConfig = {
  bundle: true,
  platform: "browser",
  sourcemap: false,
  minify: true,
};

await build({
  ...sharedConfig,
  entryPoints: ["src/content/content.ts"],
  outfile: "dist/content.js",
  format: "iife",
});

await build({
  ...sharedConfig,
  entryPoints: ["src/background/background.ts"],
  outfile: "dist/background.js",
  format: "esm",
});

await build({
  ...sharedConfig,
  entryPoints: ["src/popup/popup.ts"],
  outfile: "dist/popup.js",
  format: "iife",
});

const filesToCopy = [
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
