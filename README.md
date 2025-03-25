# Web Tools

A collection of browser-based tools for video, image, and text processing.

## Local Development

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json dist
npm install

# Start dev server
npm run dev
```

## Critical Dependencies
The video tools require FFmpeg WASM, which is loaded from:
```
https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm
```
This specific CDN and version must be maintained for video processing to work correctly.

## Deployment

### Local Build
```bash
npm run build
```

### Netlify
Automatic deployment on push to main branch:
- Uses `npm ci` for clean install
- Runs `vite build`
- Deploys from `dist` folder 