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
if [ ! -f "dist/video/ffmpeg/ffmpeg-core.js" ]; then
    echo "Error: FFmpeg core JS file not found"
    exit 1
fi

if [ ! -f "dist/video/ffmpeg/ffmpeg-core.wasm" ]; then
    echo "Error: FFmpeg WASM file not found"
    exit 1
fi

# Create required directories to support direct URL access
echo "Creating directory structure for direct URL access..."
mkdir -p dist/video/resize dist/image/resize

# Copy the index.html file to each subdirectory for direct URL access
echo "Setting up direct URL access..."
cp dist/index.html dist/video/index.html
cp dist/index.html dist/image/index.html
cp dist/index.html dist/video/resize/index.html
cp dist/index.html dist/image/resize/index.html

echo "Build completed successfully!" 