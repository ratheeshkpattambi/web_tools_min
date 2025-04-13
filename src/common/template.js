/**
 * Template utility for consistent HTML structure across pages
 */

/**
 * Generate a standard page HTML structure
 * @param {string} title - The page title
 * @param {string} content - The main content HTML
 * @returns {string} - The complete HTML structure
 */
export function generatePageHTML(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | Web Tools</title>
      <link rel="stylesheet" href="/common/styles.css">
      <!-- Google tag (gtag.js) -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-SK7DDP7ND6"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-SK7DDP7ND6');
      </script>
      <!-- COOP and COEP headers for SharedArrayBuffer support (needed for WASM) -->
      <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
      <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
    </head>
    <body>
      <header>
        <nav>
          <a href="/" class="logo">WebTools</a>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/video">Video</a>
            <a href="/image">Image</a>
            <a href="/text">Text</a>
          </div>
        </nav>
      </header>
      
      <main>
        <div class="container">
          ${content}
        </div>
      </main>
      
      <footer>
        <div class="author-info">
          <div class="author-details">
            <img src="https://avatars.githubusercontent.com/u/8389908" alt="Ratheesh Kalarot" class="author-avatar" loading="eager" fetchpriority="high" decoding="async">
            <p>© Dr. Ratheesh Kalarot</p>
            <p class="author-links">
              <a href="https://scholar.google.co.nz/citations?user=BuKGWPEAAAAJ&hl=en" target="_blank">Google Scholar</a>
              <a href="https://github.com/ratheeshkpattambi/web_tools_min" target="_blank">GitHub</a>
              <a href="https://www.linkedin.com/in/ratheesh-kalarot/" target="_blank">LinkedIn</a>
            </p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `;
}

/**
 * Generate a tool card for the home page
 */
export function generateToolCard(title, description, link) {
  return `
    <a href="${link}" class="tool-card">
      <h2>${title}</h2>
      <p>${description}</p>
    </a>
  `;
}

/**
 * Generate video tool content with proper IDs
 */
export function generateVideoToolContent(title, description, toolType) {
  return `
    <div class="tool-container">
      <h1>${title}</h1>
      <p>${description}</p>
      
      <div id="${toolType}-dropZone" class="drop-zone">
        <p>Drop video here or click to select</p>
        <input type="file" id="${toolType}-fileInput" accept="video/*" style="display: none;">
      </div>
      
      <video id="${toolType}-input-video" controls style="display: none;"></video>
      
      ${toolType === 'resize' ? `
        <div class="controls">
          <div class="input-group">
            <label for="width">Width:</label>
            <input type="number" id="width" placeholder="Width">
          </div>
          <div class="input-group">
            <label for="height">Height:</label>
            <input type="number" id="height" placeholder="Height">
          </div>
          <div class="input-group">
            <label for="keepRatio">
              <input type="checkbox" id="keepRatio" checked>
              Keep Aspect Ratio
            </label>
          </div>
          <button id="${toolType}-processBtn" class="btn" disabled>Resize Video</button>
        </div>
      ` : `
        <div class="controls">
          <div class="input-group">
            <label for="format">Format:</label>
            <select id="format">
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="mov">MOV</option>
            </select>
          </div>
          <div class="input-group">
            <label for="quality">Quality:</label>
            <select id="quality">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="input-group">
            <label for="bitrate">Bitrate (kb/s):</label>
            <input type="number" id="bitrate" value="2000" min="500">
          </div>
          <button id="${toolType}-processBtn" class="btn" disabled>Re-encode Video</button>
        </div>
      `}
      
      <div id="${toolType}-progress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>
      
      <div id="${toolType}-logHeader" class="log-header">
        <span>Logs</span>
        <span id="${toolType}-logToggle">▼</span>
      </div>
      <div id="${toolType}-logContent" class="log-content"></div>
      
      <video id="${toolType}-output-video" controls style="display: none;"></video>
      <div id="${toolType}-downloadContainer"></div>
    </div>
  `;
} 