import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default [
  {
    files: ["**/*.js"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        chrome: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        // Ajoute ici d'autres globales si nécessaire
      },
    },
    rules: {
      // Tes règles personnalisées ici (optionnel)
    },
  },
];
