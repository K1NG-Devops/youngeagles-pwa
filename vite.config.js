import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  base: '/',
  define: {
    // Ensure environment variables are available in browser
    'process.env': {}
  },
  envPrefix: 'VITE_',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Young Eagles PWA - Minimal',
        short_name: 'Young Eagles',
        description: 'Young Eagles Progressive Web App - Minimal Version',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cacheId: 'young-eagles-minimal-v1.0.1',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // Reduced aggressiveness to prevent React internals corruption
        passes: 1
      },
      mangle: {
        // Disable safari10 mangling which can be too aggressive
        safari10: false,
        // Preserve React internals and common properties
        reserved: ['isElement', 'createElement', 'Component', 'PureComponent']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('axios') || id.includes('socket.io')) {
              return 'network';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf';
            }
            if (id.includes('react-toastify')) {
              return 'toast';
            }
            if (id.includes('crypto-js')) {
              return 'crypto';
            }
            return 'vendor';
          }
          
          // App chunks based on routes
          if (id.includes('/pages/Dashboard')) {
            return 'dashboard';
          }
          if (id.includes('/pages/') && (id.includes('Payment') || id.includes('Checkout'))) {
            return 'payments';
          }
          if (id.includes('/components/ads/')) {
            return 'ads';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    target: 'esnext',
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096
  }
}) 