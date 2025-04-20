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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          // FFmpeg core and related modules (keep these separate)
          if (id.includes('@ffmpeg/core')) {
            return 'ffmpeg-core';
          }
          if (id.includes('@ffmpeg/ffmpeg') || id.includes('@ffmpeg/util')) {
            return 'ffmpeg-wasm';
          }
          
          // Video tools that use FFmpeg
          if (id.includes('/video/ffmpeg-utils.js')) {
            return 'ffmpeg-utils';
          }
          
          // Group tools by category
          if (id.includes('/video/')) {
            return 'video-tools';
          }
          if (id.includes('/image/')) {
            return 'image-tools';
          }
          if (id.includes('/text/')) {
            return 'text-tools';
          }
          
          // Group common utilities
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
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core']
  }
}); 