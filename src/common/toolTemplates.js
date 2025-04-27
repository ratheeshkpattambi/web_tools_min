/**
 * Tool templates for all tools in the application
 * This file centralizes all tool UI templates
 */

// Video tool templates
export const videoTemplates = {
  'resize': `
    <div class="tool-container">
      <h1>Video Resize</h1>
      <div id="dropZone" class="drop-zone">
        <div class="drop-icon">📁</div>
        <p>Drop video here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Video</button>
        <input type="file" id="fileInput" accept="video/*" style="display: none;">
      </div>
      <div class="video-wrapper">
        <video id="input-video" controls style="display: none; max-width: 100%; height: auto;"></video>
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
        <button id="processBtn" class="btn" disabled>Resize Video</button>
      </div>

      <div id="progress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>

      <div id="outputContainer" class="output-container">
        <div class="video-wrapper">
          <video id="output-video" controls style="display: none; max-width: 100%; height: auto;"></video>
        </div>
        <div id="downloadContainer"></div>
      </div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
  `,
  'trim': `
    <div class="tool-container">
      <h1>Video Trimmer</h1>
      <div id="dropZone" class="drop-zone">
        <div class="drop-icon">📁</div>
        <p>Drop video here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Video</button>
        <input type="file" id="fileInput" accept="video/*" style="display: none;">
      </div>
      <div class="video-wrapper">
        <video id="input-video" controls style="display: none; max-width: 100%; height: auto;"></video>
      </div>
      
      <div class="controls">
        <div class="slider-container">
          <div id="trim-slider" class="trim-slider">
            <div class="slider-handle start-handle"></div>
            <div class="slider-range"></div>
            <div class="slider-handle end-handle"></div>
          </div>
        </div>
        <div class="input-group time-range">
          <div class="range-inputs">
            <div>
              <label for="startTime">Start Time:</label>
              <input type="text" id="startTime" placeholder="0:00">
            </div>
            <div>
              <label for="endTime">End Time:</label>
              <input type="text" id="endTime" placeholder="0:00">
            </div>
          </div>
        </div>
        <button id="processBtn" class="btn" disabled>Trim Video</button>
      </div>

      <div id="progress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>

      <div id="outputContainer" class="output-container">
        <div class="video-wrapper">
          <video id="output-video" controls style="display: none; max-width: 100%; height: auto;"></video>
        </div>
        <div id="downloadContainer"></div>
      </div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
  `,
  'reencode': `
    <div class="tool-container">
      <h1>Video Re-encode</h1>
      <div id="dropZone" class="drop-zone">
        <div class="drop-icon">📁</div>
        <p>Drop video here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Video</button>
        <input type="file" id="fileInput" accept="video/*" style="display: none;">
      </div>
      <div class="video-wrapper">
        <video id="input-video" controls style="display: none; max-width: 100%; height: auto;"></video>
      </div>
      
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
        <button id="processBtn" class="btn" disabled>Re-encode Video</button>
      </div>

      <div id="progress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>

      <div id="outputContainer" class="output-container">
        <div class="video-wrapper">
          <video id="output-video" controls style="display: none; max-width: 100%; height: auto;"></video>
        </div>
        <div id="downloadContainer"></div>
      </div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
  `,
  'info': `
    <div class="tool-container">
      <h1>Video Info</h1>
      <div id="videoDropZone" class="drop-zone">
        <div class="drop-icon">📁</div>
        <p>Drop video here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Video</button>
        <input type="file" id="videoFileInput" accept="video/*" style="display: none;">
      </div>
      <div class="video-wrapper">
        <video id="video-preview" controls style="display: none; max-width: 100%; height: auto;"></video>
      </div>

      <div id="videoProgress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>

      <div id="videoInfoContainer" class="info-container"></div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
  `,
  'gif': `
    <div class="tool-container">
      <h1>Video to GIF</h1>
      <div id="dropZone" class="drop-zone">
        <div class="drop-icon">📁</div>
        <p>Drop video here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Video</button>
        <input type="file" id="fileInput" accept="video/*" style="display: none;">
      </div>
      <div class="video-wrapper">
        <video id="input-video" controls style="display: none; max-width: 100%; height: auto;"></video>
      </div>
      
      <div class="controls">
        <div class="input-group">
          <label for="width">Width:</label>
          <input type="number" id="width" placeholder="Width" value="320">
        </div>
        <div class="input-group">
          <label for="height">Height:</label>
          <input type="number" id="height" placeholder="Height" value="240">
        </div>
        <div class="input-group">
          <label for="keepRatio">
            <input type="checkbox" id="keepRatio" checked>
            Keep Aspect Ratio
          </label>
        </div>
        <div class="input-group">
          <label for="fps">FPS:</label>
          <input type="number" id="fps" min="1" max="30" value="10">
          <span class="small-note">Lower = smaller file</span>
        </div>
        <div class="input-group">
          <label for="quality">Quality:</label>
          <select id="quality">
            <option value="high">High (more colors)</option>
            <option value="medium" selected>Medium</option>
            <option value="low">Low (smaller file)</option>
          </select>
        </div>
        <div class="input-group time-range">
          <label>Time Range:</label>
          <div class="range-inputs">
            <div>
              <label for="startTime">Start:</label>
              <input type="text" id="startTime" placeholder="0:00" value="0:00">
            </div>
            <div>
              <label for="duration">Duration:</label>
              <input type="text" id="duration" placeholder="5.0" value="5.0">
              <span class="small-note">seconds</span>
            </div>
          </div>
        </div>
        <button id="processBtn" class="btn" disabled>Create GIF</button>
      </div>

      <div id="progress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>

      <div id="outputContainer" class="output-container">
        <div class="output-wrapper">
          <img id="output-gif" style="display: none; max-width: 100%;">
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