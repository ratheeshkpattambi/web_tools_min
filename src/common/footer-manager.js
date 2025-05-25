/**
 * Footer Manager - Handles dynamic footer replacement for tools
 * 
 * This module provides a simple, consistent way for tools to override the site-wide footer
 * with tool-specific content using a structured configuration approach.
 */

class FooterManager {
  constructor() {
    this.originalFooter = null;
    this.currentFooter = null;
    this.isCustomFooter = false;
  }

  /**
   * Initialize the footer manager by storing the original footer
   */
  init() {
    const footer = document.querySelector('footer');
    if (footer) {
      this.originalFooter = footer.cloneNode(true);
      this.currentFooter = footer;
    }
  }

  /**
   * Set a custom tool footer using the standard configuration
   * @param {Object} config - Footer configuration
   * @param {string} config.toolName - Name of the tool
   * @param {string} config.author - Tool author name
   * @param {string} [config.authorUrl] - Author's website/profile URL
   * @param {string} [config.version] - Tool version
   * @param {Array} [config.links] - Additional links
   * @param {string} [config.description] - Brief description or additional info
   * @param {boolean} [config.showBackLink] - Whether to show "Back to SafeWebTool" link
   * @param {string} [config.icon] - Icon URL or emoji for the footer
   */
  setToolFooter(config) {
    if (!this.currentFooter) {
      console.warn('Footer element not found');
      return;
    }

    // Validate required fields
    if (!config.toolName || !config.author) {
      console.error('toolName and author are required for custom footer');
      return;
    }

    // Store the current state
    this.isCustomFooter = true;

    // Create new footer element
    const newFooter = document.createElement('footer');
    
    // Preserve original footer classes for consistent styling
    if (this.originalFooter) {
      newFooter.className = this.originalFooter.className;
    }

    // Build the footer HTML matching the original layout
    let footerHTML = `
      <div class="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
        <!-- Left section with tool info -->
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
          ${config.icon ? (
            config.icon.startsWith('/') || config.icon.startsWith('http') ? 
              `<img src="${this.escapeHtml(config.icon)}" alt="${this.escapeHtml(config.toolName)}" class="h-6 w-6 mr-2" loading="lazy" decoding="async">` :
              `<span class="text-xl mr-2">${this.escapeHtml(config.icon)}</span>`
          ) : ''}
          <p>© ${config.authorUrl ? 
            `<a href="${this.escapeHtml(config.authorUrl)}" target="_blank" rel="noopener" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${this.escapeHtml(config.author)}</a>` : 
            this.escapeHtml(config.author)}</p>
          ${config.version ? `
            <span class="mx-2">|</span>
            <span class="version">Version: ${this.escapeHtml(config.version)}</span>
          ` : ''}
        </div>
    `;

    // Right section with links or back link
    if (config.links && config.links.length > 0) {
      footerHTML += `
        <!-- Right section with links -->
        <div class="mt-4 md:mt-0 flex space-x-4 text-sm">
          ${config.links.map(link => `
            <a href="${this.escapeHtml(link.url)}" 
               ${link.external !== false ? 'target="_blank" rel="noopener"' : ''} 
               class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              ${link.icon ? `<span class="mr-1">${this.escapeHtml(link.icon)}</span>` : ''}${this.escapeHtml(link.text)}
            </a>
          `).join('')}
        </div>
      `;
    } else if (config.showBackLink !== false) {
      // If no links but showBackLink is true, add back link on the right
      footerHTML += `
        <!-- Right section with back link -->
        <div class="mt-4 md:mt-0 text-sm">
          <a href="/" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            ← Back to SafeWebTool
          </a>
        </div>
      `;
    }

    footerHTML += `</div>`;
    
    // Set the footer content
    newFooter.innerHTML = footerHTML;

    // Replace the footer
    this.currentFooter.parentNode.replaceChild(newFooter, this.currentFooter);
    this.currentFooter = newFooter;
  }

  /**
   * Restore the original footer
   */
  restoreOriginalFooter() {
    if (!this.isCustomFooter || !this.originalFooter || !this.currentFooter) {
      return;
    }

    const restoredFooter = this.originalFooter.cloneNode(true);
    this.currentFooter.parentNode.replaceChild(restoredFooter, this.currentFooter);
    this.currentFooter = restoredFooter;
    this.isCustomFooter = false;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Create and export singleton instance
export const footerManager = new FooterManager();

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => footerManager.init());
} else {
  footerManager.init();
} 