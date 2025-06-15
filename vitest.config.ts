import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    globals: false,
    environment: 'node' // ou 'jsdom' si tu veux simuler le DOM
  }
});
