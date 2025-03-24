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
          </div>
        </nav>
      </header>
      
      <div class="container">
        <h1>${title}</h1>
        ${content}
      </div>
      
      <footer>
        <p>&copy; ${new Date().getFullYear()} WebTools - Simple Web-based Media Editing</p>
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
    <div class="tool-card">
      <div class="tool-card-header">
        <h2>${icon} ${title}</h2>
      </div>
      <div class="tool-card-body">
        <p>${description}</p>
      </div>
      <div class="tool-card-footer">
        <a href="${link}" class="btn">Open Tool</a>
      </div>
    </div>
  `;
} 