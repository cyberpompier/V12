import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'PWA Fixed Header Footer',
        short_name: 'PWA App',
        description: 'PWA with fixed header and footer',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ]
})
