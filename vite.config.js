import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Young Eagles Home Care Centre',
        short_name: 'Young Eagles',
        description: 'Educational app connecting teachers, parents and students',
        theme_color: '#3B82F6',
        background_color: '#3B82F6',
        display: 'standalone',
        scope: '/',
        start_url: '/?pwa=true',
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
        // Bump cache version when schema changes
        cacheId: 'young-eagles-v2.0.0',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/youngeagles-api-server\.up\.railway\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v2',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days for API responses
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'api-queue',
                options: {
                  maxRetentionTime: 24 * 60 // 24 hours
                }
              }
            }
          },
          {
            // Cache images with CacheFirst strategy
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: process.env.VITE_API_LOCAL_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('❌ API Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📡 Proxying API request:', req.method, req.url);
          });
        }
      },
      // Socket.IO proxy for development - separate from API calls
      '/socket.io': {
        target: process.env.VITE_API_LOCAL_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 60000,
        configure: (proxy, options) => {
          proxy.on('proxyReqWs', (proxyReq, req, socket) => {
            console.log('🔌 Proxying WebSocket request for Socket.IO');
          });
          proxy.on('error', (err, req, res) => {
            if (err.code !== 'ECONNRESET') {
              console.error('❌ WebSocket Proxy error:', err.message);
            }
          });
        }
      }
    }
  },
  define: {
    // Ensure environment variables are available at build time
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  build: {
    sourcemap: true, // Enable source maps for better debugging
    rollupOptions: {
      output: {
        // Better chunk splitting for performance
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios', 'react-toastify']
        }
      }
    }
  }
})
