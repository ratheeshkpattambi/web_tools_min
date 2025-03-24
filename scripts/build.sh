#!/bin/bash

# Exit on error
set -e

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the project
echo "Building project..."
npm run build

# Verify FFmpeg files exist
echo "Verifying FFmpeg files..."
if [ ! -f "dist/ffmpeg/ffmpeg-core.js" ]; then
    echo "Error: FFmpeg core JS file not found"
    exit 1
fi

if [ ! -f "dist/ffmpeg/ffmpeg-core.wasm" ]; then
    echo "Error: FFmpeg WASM file not found"
    exit 1
fi

echo "Build completed successfully!" 