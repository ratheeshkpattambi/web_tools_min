# Web Media Tools

A collection of browser-based media editing tools for video and image processing. Built with Vite and modern web technologies.

## Features

- **Video Tools**
  - Video Resize: Browser-based video resizing using WASM-powered FFmpeg
- **Image Tools**
  - Image Resize: Client-side image resizing with quality control
- **Text Tools**
  - Text Editor: Simple browser-based text editor

## Tech Stack

- Vite for build and development
- FFmpeg.wasm for video processing
- Modern JavaScript (ES Modules)
- CSS Variables for theming

## Development

### Prerequisites

- Node.js (v20.0.0 or higher)
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ratheeshkpattambi/web_tools_min.git
   cd web_tools_min
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Build

For production build:
```bash
npm run build
```

For Netlify deployment:
```bash
npm run build:netlify
```

### Preview production build:
```bash
npm run preview
```

## Deployment

The site is automatically deployed to Netlify. The `netlify.toml` configuration handles:
- Build settings
- CORS headers for FFmpeg.wasm
- SPA routing

## Browser Requirements

This application requires a modern browser with:
- WebAssembly support
- SharedArrayBuffer support (requires secure context)
- Cross-Origin Isolation support

## License

MIT License - See LICENSE file for details 