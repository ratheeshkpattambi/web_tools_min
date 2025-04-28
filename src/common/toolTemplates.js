/**
 * Tool templates for all tools in the application
 * This file centralizes all tool UI templates
 */

// Video tool templates
export const videoTemplates = {};

// Image tool templates
export const imageTemplates = {};

// Text tool templates
export const textTemplates = {};

/**
 * Get the template for a specific tool
 * @param {string} category - The category (video, image, text)
 * @param {string} toolId - The tool ID
 * @returns {string} The HTML template or null if not found
 */
export function getToolTemplate(category, toolId) {
  // All tools now have their templates in their own modules
  // Return null so the template from the tool's module will be used
  return null;
}

/**
 * Generate a 404 Not Found template
 * @returns {string} HTML for a 404 page
 */
export function get404Template() {
  return `
    <div class="tool-container">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you requested does not exist.</p>
      <a href="/" class="button primary">Back to Home</a>
    </div>
  `;
}

/**
 * Generate an error template
 * @param {string} title - The error title
 * @param {string} message - The error message
 * @param {string} [details] - Additional error details
 * @returns {string} HTML for an error page
 */
export function getErrorTemplate(title, message, details = '') {
  return `
    <div class="tool-container">
      <h1>Error: ${title}</h1>
      <p>${message}</p>
      ${details ? `<pre class="error-details">${details}</pre>` : ''}
      <a href="/" class="button primary">Back to Home</a>
    </div>
  `;
} 