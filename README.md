# SafeWebTool

A collection of privacy-focused tools that process your data locally in your browser.

🌐 Visit the website: [https://safewebtool.com/](https://safewebtool.com/)

## Philosophy
- 🔒 **Privacy First**: Your media never leaves your computer. All processing happens locally in your browser.
- 🚫 **No Ads**: Completely ad-free experience.
- 🆓 **Free & Open Source**: Built with transparency and community in mind.
- 🤝 **Community Driven**: Contributions and feedback are welcome!

## Features
- Video processing tools
  - Video compression
  - Format conversion
  - Basic trimming
- Image editing capabilities
  - Image resizing
  - Format conversion
  - Basic filters
- Text manipulation utilities
  - Text formatting
  - Character/word counting
  - Case conversion

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (standard)
npm run build

# Build for production (optimized, excludes test files)
npm run build:prod
```

## Testing
```bash
# Install Playwright browsers
npx playwright install

# Run tests (Chrome desktop and mobile only)
npm run test:chrome
```

## Deployment
Automatically deployed to Netlify on push to main branch.

[![Netlify Status](https://api.netlify.com/api/v1/badges/1f7a6d52-4a4b-489c-9cd1-7131562cc8b1/deploy-status)](https://app.netlify.com/sites/safewebtool/deploys)

## How to Contribute

```bash
# Get started
git clone https://github.com/ratheeshkpattambi/safewebtool.git
cd safewebtool
npm install

# Development
npm run dev

# Test
npm run test:chrome
```

1. Create branch and implement your feature
2. Submit PR - Netlify will create a preview automatically
3. We'll review your PR within 2 days
