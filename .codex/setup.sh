#!/bin/bash
set -e

# Install npm dependencies
npm install

# Install Playwright browsers
npx playwright install
