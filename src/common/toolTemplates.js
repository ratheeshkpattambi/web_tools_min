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
  `,

  'regex': `
    <div class="tool-container">
      <h1>Regex Tester</h1>
      <p class="tool-description">Test and validate regular expressions with real-time highlighting</p>
      
      <div class="regex-container">
        <div class="panel-header">
          <h3>Regular Expression</h3>
          <div class="panel-actions">
            <button id="wordModeBtn" class="btn-sm" title="Match Words">
              Word Mode
            </button>
            <button id="copyRegexBtn" class="btn-sm" title="Copy Regex">
              Copy
            </button>
            <button id="clearRegexBtn" class="btn-icon" title="Clear">
              <span class="icon">❌</span>
            </button>
            <button id="loadSampleBtn" class="btn-icon" title="Load Sample">
              <span class="icon">📋</span>
            </button>
          </div>
        </div>
        
        <div class="regex-input-container">
          <span class="regex-delimiter">/</span>
          <input type="text" id="regexInput" class="regex-pattern" placeholder="Enter regex pattern" spellcheck="false">
          <span class="regex-delimiter">/</span>
          <input type="text" id="regexFlags" class="regex-flags" placeholder="flags" maxlength="6" spellcheck="false">
        </div>
        
        <div id="errorDisplay" class="regex-error"></div>
        
        <div class="match-status">
          <span id="matchCount">0 matches</span>
        </div>
        
        <div class="regex-options">
          <label>
            <input type="checkbox" id="toggleHighlight" checked>
            Highlight matches
          </label>
          <label>
            <input type="checkbox" id="toggleLineNumbers" checked>
            Show line numbers
          </label>
        </div>
        
        <div class="panel-header">
          <h3>Test Text</h3>
        </div>
        
        <textarea id="sampleText" class="text-editor" placeholder="Enter text to test your regex against..."></textarea>
        
        <div class="panel-header">
          <h3>Matches</h3>
        </div>
        
        <div id="highlightContainer" class="highlight-container"></div>
      </div>
      
      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
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
 * Generic error template
 */
export function getErrorTemplate(title, message, details = '') {
  return `
    <div class="tool-container">
      <h1>${title}</h1>
      <p>${message}</p>
      ${details ? `<div class="error-details">${details}</div>` : ''}
      <a href="/" class="btn">Return to Home</a>
    </div>
  `;
}

/**
 * 404 template
 */
export function get404Template() {
  return getErrorTemplate(
    '404 - Page Not Found',
    'The requested page could not be found.'
  );
}