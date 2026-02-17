// ═══════════════════════════════════════════════════════════
// vite.config.js — Configuration Vite pour PWA Totem
// Ajouter dans ton vite.config.js existant
// ═══════════════════════════════════════════════════════════
// 
// Si tu utilises vite-plugin-pwa (recommandé) :
//   npm install -D vite-plugin-pwa
//
// Sinon, les fichiers manifest.json + sw.js dans /public
// suffisent avec l'index.html qui les enregistre.
// ═══════════════════════════════════════════════════════════

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Optimisation pour totem / kiosk
  build: {
    // Inline les petits assets pour réduire les requêtes
    assetsInlineLimit: 8192,
    // Chunk strategy
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single chunk pour chargement rapide
      },
    },
  },

  server: {
    // Accessible sur le réseau local (pour tester sur le totem)
    host: true,
    port: 3000,
  },

  // Si tu veux utiliser vite-plugin-pwa à la place du SW manuel :
  // ─────────────────────────────────────────────────────────
  // import { VitePWA } from "vite-plugin-pwa";
  //
  // plugins: [
  //   react(),
  //   VitePWA({
  //     registerType: "autoUpdate",
  //     includeAssets: ["logo.png", "pdf.pdf"],
  //     manifest: {
  //       name: "UNIKALO Totem — Borne Interactive",
  //       short_name: "UNIKALO Totem",
  //       description: "Borne interactive UNIKALO — Propulsé par Media4",
  //       theme_color: "#002855",
  //       background_color: "#001A3D",
  //       display: "standalone",
  //       orientation: "any",
  //       lang: "fr-FR",
  //       icons: [
  //         { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
  //         { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
  //       ],
  //     },
  //     workbox: {
  //       globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,pdf}"],
  //       runtimeCaching: [
  //         {
  //           urlPattern: /^https:\/\/fonts\.googleapis\.com/,
  //           handler: "CacheFirst",
  //           options: { cacheName: "google-fonts-stylesheets" },
  //         },
  //         {
  //           urlPattern: /^https:\/\/fonts\.gstatic\.com/,
  //           handler: "CacheFirst",
  //           options: { cacheName: "google-fonts-webfonts", expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 } },
  //         },
  //         {
  //           urlPattern: /^https:\/\/media4-duplicated/,
  //           handler: "CacheFirst",
  //           options: { cacheName: "media4-assets" },
  //         },
  //       ],
  //     },
  //   }),
  // ],
});
