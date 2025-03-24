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
            <a href="/video">Video Tools</a>
            <a href="/image">Image Tools</a>
            <a href="/text">Text Tools</a>
          </div>
        </nav>
      </header>
      
      <div class="container">
        <h1>${title}</h1>
        ${content}
      </div>
      
      <footer>
        <div class="author-info">
          <div class="author-details">
            <img src="https://avatars.githubusercontent.com/u/8389908" alt="Ratheesh Kalarot" class="author-avatar">
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
 * Generate HTML for a tool card on the home page
 * @param {string} title - The tool title
 * @param {string} description - The tool description
 * @param {string} icon - The icon class or text
 * @param {string} link - The tool link
 * @returns {string} - The tool card HTML
 */
export function generateToolCard(title, description, icon, link) {
  return `
    <a href="${link}" class="tool-card">
      <div class="tool-icon">${icon}</div>
      <h2>${title}</h2>
      <p>${description}</p>
    </a>
  `;
} 