/**
 * Tool templates for all tools in the application
 * This file centralizes all tool UI templates
 */

// Video tool templates
export const videoTemplates = {};

// Image tool templates
export const imageTemplates = {
  'resize': `
    <div class="tool-container">
      <h1>Image Resize</h1>
      <div id="dropZone" class="drop-zone">
        <div class="drop-icon">📁</div>
        <p>Drop image here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Image</button>
        <input type="file" id="fileInput" accept="image/*" style="display: none;">
      </div>

      <div class="image-wrapper">
        <img id="preview" style="display: none; max-width: 100%; height: auto;">
      </div>
      
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
        <button id="processBtn" class="btn" disabled>Resize Image</button>
      </div>

      <div id="progress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>

      <div id="outputContainer" class="output-container">
        <div class="image-wrapper">
          <img id="output-image" style="display: none; max-width: 100%; height: auto;">
        </div>
        <div id="downloadContainer"></div>
      </div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
  `
};

// Text tool templates
export const textTemplates = {
  'editor': `
    <div class="tool-container">
      <h1>Text Editor</h1>
      <p class="tool-description">The plainest text editor - just type and download</p>

      <textarea id="editor" class="text-editor" placeholder="Start typing..."></textarea>

      <div class="editor-footer">
        <div class="word-count">
          Words: <span id="wordCount">0</span>
        </div>
        <div class="char-count">
          Characters: <span id="charCount">0</span>
        </div>
      </div>

      <div id="downloadContainer"></div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
  `,
  
  'yaml': `
    <div class="tool-container">
      <h1>YAML Validator</h1>
      <p class="section-description">Validate YAML and convert it to JSON or Python dictionary with interactive view</p>
      
      <div class="yaml-editor-container">
        <div class="editor-panel">
          <div class="panel-header">
            <h3>YAML Input</h3>
            <div class="panel-actions">
              <button id="clearYamlBtn" class="btn-icon" title="Clear">
                <span class="icon">❌</span>
              </button>
              <button id="loadSampleBtn" class="btn-icon" title="Load Sample">
                <span class="icon">📋</span>
              </button>
            </div>
          </div>
          <textarea id="yamlInput" class="yaml-editor" placeholder="Paste your YAML here..."></textarea>
          <div id="yamlStatus" class="status-bar"></div>
        </div>
        
        <div class="output-panel">
          <div class="panel-header">
            <h3>Output</h3>
            <div class="panel-actions">
              <button id="expandAllBtn" class="btn-icon" title="Expand All">
                <span class="icon">🔽</span>
              </button>
              <button id="collapseAllBtn" class="btn-icon" title="Collapse All">
                <span class="icon">◀</span>
              </button>
              <button id="copyOutputBtn" class="btn-icon" title="Copy">
                <span class="icon">📋</span>
              </button>
            </div>
          </div>
          <div id="jsonOutput" class="json-output"></div>
        </div>
      </div>
      
      <div id="errorContainer" class="error-container">
        <div class="error-header">Error</div>
        <div id="errorContent" class="error-content"></div>
      </div>
      
      <div class="tool-options">
        <div class="option-group">
          <label>
            <input type="checkbox" id="autoValidate" checked>
            Auto-validate
          </label>
        </div>
        <div class="option-group">
          <label>
            <input type="checkbox" id="prettyPrint">
            Pretty print
          </label>
        </div>
        <div class="option-group format-selector">
          <span>Format:</span>
          <label class="radio-label">
            <input type="radio" name="outputFormat" id="formatJson" checked>
            JSON
          </label>
          <label class="radio-label">
            <input type="radio" name="outputFormat" id="formatPython">
            Python Dict
          </label>
        </div>
      </div>
    </div>
  `
};

/**
 * Get the template for a specific tool
 * @param {string} category - The category (video, image, text)
 * @param {string} toolId - The tool ID
 * @returns {string} The HTML template or null if not found
 */
export function getToolTemplate(category, toolId) {
  // Special case for video tools which have their templates in their own modules
  if (category === 'video') {
    // Return null so the template from the tool's module will be used
    return null;
  }
  
  const templates = {
    'video': videoTemplates,
    'image': imageTemplates,
    'text': textTemplates
  };
  
  if (!templates[category] || !templates[category][toolId]) {
    return null;
  }
  
  return templates[category][toolId];
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