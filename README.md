# Video Resizer

A web application that uses FFmpeg.wasm to resize videos directly in the browser.

## Features

- Browser-based video resizing
- No server-side processing required
- Real-time progress tracking
- Detailed operation logs

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run build
npm run serve
```

3. Visit https://localhost:8080

## Production Deployment

### Local Build

1. Build the project:
```bash
npm run build
```

2. The `dist` directory will contain the production-ready files.

### Netlify Deployment

1. Push your code to a Git repository

2. Connect to Netlify:
   - Sign in to Netlify
   - Click "New site from Git"
   - Choose your repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. The necessary headers for WASM support are configured in `netlify.toml`

## Security Notes

- SSL certificates (`cert.pem` and `key.pem`) are for local development only
- Never commit SSL certificates to version control
- Production SSL is handled by Netlify automatically

## Environment Requirements

- Node.js 20 or later
- Modern browser with WebAssembly support

## License

MIT 