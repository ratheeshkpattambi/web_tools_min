import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    exclude: ['tests/**', '**/*.spec.js', '**/*.test.js', 'playwright.config.js'],
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('/tests/') || id.includes('.spec.js') || id.includes('.test.js')) {
            return undefined;
          }
          
          if (id.includes('node_modules')) {
            if (id.includes('@ffmpeg/core')) {
              return 'vendor-ffmpeg-core';
            }
            if (id.includes('@ffmpeg/ffmpeg') || id.includes('@ffmpeg/util')) {
              return 'vendor-ffmpeg-wasm';
            }
            if (id.includes('js-yaml')) {
              return 'vendor-js-yaml';
            }
            if (id.includes('@playwright')) {
              return undefined;
            }
            return 'vendor';
          }
          
          if (id.includes('/video/ffmpeg-utils.js')) {
            return 'video-utils';
          }
          
          if (id.includes('/video/')) {
            return 'video-tools';
          }
          if (id.includes('/image/')) {
            return 'image-tools';
          }
          if (id.includes('/text/')) {
            return 'text-tools';
          }
          
          if (id.includes('/common/')) {
            return 'common';
          }
          
          return null;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core', 'js-yaml', '@playwright/test']
  }
}); 