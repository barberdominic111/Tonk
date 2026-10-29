import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // game state lives in localStorage, so an update reload never loses it
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: { cleanupOutdatedCaches: true, navigateFallback: '/index.html' },
      manifest: {
        name: 'Tonk',
        short_name: 'Tonk',
        description: 'Pass-and-play Tonk card game for 2–4 players with computer opponents.',
        theme_color: '#091a0d',
        background_color: '#091a0d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
