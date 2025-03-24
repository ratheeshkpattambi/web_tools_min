# Web Media Tools

A collection of browser-based media editing tools for video and image processing. The application is designed to be modular, allowing users to access only the tools they need without loading unnecessary dependencies.

## Features

- **Video Tools** - Tools that utilize WASM for advanced video processing
  - **Video Resize** - Resize videos to any dimensions while maintaining quality

- **Image Tools** - Lightweight tools that use browser APIs (no WASM)
  - **Image Resize** - Resize images with options for format and quality

## Architecture

The application is structured to ensure efficient resource usage:

- `/video` - Contains all video-related tools and WASM dependencies
- `/image` - Contains all image-related tools (no WASM dependencies)
- `/common` - Shared utilities and styles

Each tool is accessible directly via URL (e.g., `/video/resize` or `/image/resize`). The application only loads the necessary dependencies for each tool, meaning WASM is only loaded when using video tools.

## Development

### Prerequisites

- Node.js (v20.0.0 or higher)
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Development Commands

- **Development server with hot reload**:
  ```
  npm run dev
  ```

- **Build for production**:
  ```
  npm run build
  ```

- **Preview production build**:
  ```
  npm run start
  ```

### Browser Requirements

This application requires a modern browser with the following features:
- WebAssembly (for video tools)
- SharedArrayBuffer (for video tools)
- Canvas API (for image tools)
- Web Workers

## Dependencies

- [@ffmpeg/core](https://github.com/ffmpegwasm/ffmpeg.wasm) - WebAssembly build of FFmpeg
- [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) - JavaScript interface to FFmpeg WASM
- [@ffmpeg/util](https://github.com/ffmpegwasm/ffmpeg.wasm) - Utilities for FFmpeg WASM

## License

This project is licensed under the MIT License - see the LICENSE file for details. 