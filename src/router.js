import { generateToolCard } from './common/template.js';

// Generate content for each route
function generateVideoContent(path) {
  if (path === '/video/resize') {
    return `
      <div class="tool-container">
        <h1>Video Resize</h1>
        <div id="dropZone" class="drop-zone">
          <p>Drop video here or click to select</p>
          <input type="file" id="fileInput" accept="video/*" style="display: none;">
        </div>
        <video id="input-video" controls style="display: none;"></video>
        
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

        <div id="logHeader" class="log-header">
          <span>Logs</span>
          <span id="logToggle">▼</span>
        </div>
        <div id="logContent" class="log-content"></div>

        <video id="output-video" controls style="display: none;"></video>
        <div id="downloadContainer"></div>
      </div>
    `;
  } else if (path === '/video/reencode') {
    return `
      <div class="tool-container">
        <h1>Video Re-encode</h1>
        <div id="dropZone" class="drop-zone">
          <p>Drop video here or click to select</p>
          <input type="file" id="fileInput" accept="video/*" style="display: none;">
        </div>
        <video id="input-video" controls style="display: none;"></video>
        
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

        <div id="logHeader" class="log-header">
          <span>Logs</span>
          <span id="logToggle">▼</span>
        </div>
        <div id="logContent" class="log-content"></div>

        <video id="output-video" controls style="display: none;"></video>
        <div id="downloadContainer"></div>
      </div>
    `;
  } else {
    return `
      <div class="tool-container">
        <h1>Video Tools</h1>
        <p class="section-description">Process and convert your videos with ease</p>
        <div class="tool-grid">
          <a href="/video/resize" class="tool-card">
            <div class="tool-icon">📐</div>
            <h3>Video Resize</h3>
            <p>Resize videos while maintaining quality</p>
          </a>
          <a href="/video/reencode" class="tool-card">
            <div class="tool-icon">🎥</div>
            <h3>Video Re-encode</h3>
            <p>Convert videos to different formats</p>
          </a>
        </div>
      </div>
    `;
  }
}

function generateImageContent(path) {
  if (path === '/image/resize') {
    return `
      <div class="tool-container">
        <h1>Image Resize</h1>
        <div id="dropZone" class="drop-zone">
          <p>Drop image here or click to select</p>
          <input type="file" id="imageInput" accept="image/*" style="display: none;">
        </div>
        
        <div id="fileInfo" class="file-info">
          <p>File: <span id="fileName"></span></p>
          <p>Size: <span id="fileSize"></span></p>
        </div>

        <img id="preview" style="display: none; max-width: 100%; margin: 1rem 0;">
        
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
            <label>
              <input type="checkbox" id="keepRatio" checked>
              Keep Aspect Ratio
            </label>
          </div>
          <div class="input-group">
            <label for="format">Format:</label>
            <select id="format">
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div class="input-group">
            <label for="quality">Quality: <span id="qualityValue">0.8</span></label>
            <input type="range" id="quality" min="0.1" max="1" step="0.1" value="0.8">
          </div>
        </div>

        <button id="resizeBtn" class="btn" disabled>Resize Image</button>

        <div id="progress" class="progress" style="display: none;">
          <div class="progress-fill"></div>
          <div class="progress-text">0%</div>
        </div>

        <div id="logHeader" class="log-header">
          <span>Logs</span>
          <span id="logToggle">▼</span>
        </div>
        <div id="logContent" class="log-content"></div>
      </div>
    `;
  } else {
    return `
      <div class="tool-container">
        <h1>Image Tools</h1>
        <p class="section-description">Edit and optimize your images</p>
        <div class="tool-grid">
          <a href="/image/resize" class="tool-card">
            <div class="tool-icon">🖼️</div>
            <h3>Image Resize</h3>
            <p>Resize and optimize images while maintaining quality</p>
          </a>
        </div>
      </div>
    `;
  }
}

function generateTextContent(path) {
  if (path === '/text/editor') {
    return `
      <div class="tool-container">
        <h1>Text Editor</h1>
        <div id="dropZone" class="drop-zone">
          <p>Drop text file here or click to select</p>
          <input type="file" id="fileInput" accept=".txt" style="display: none;">
        </div>

        <div class="editor-toolbar">
          <button id="formatBold" class="btn-icon" title="Bold">
            <span class="icon">B</span>
          </button>
          <button id="formatItalic" class="btn-icon" title="Italic">
            <span class="icon">I</span>
          </button>
          <button id="formatUnderline" class="btn-icon" title="Underline">
            <span class="icon">U</span>
          </button>
          <button id="clearFormat" class="btn-icon" title="Clear Formatting">
            <span class="icon">T</span>
          </button>
          <div class="toolbar-separator"></div>
          <button id="downloadBtn" class="btn-icon" title="Download">
            <span class="icon">↓</span>
          </button>
        </div>

        <textarea id="editor" class="text-editor" placeholder="Start typing or drop a text file..."></textarea>

        <div class="editor-footer">
          <div class="word-count">
            Words: <span id="wordCount">0</span>
          </div>
          <div class="char-count">
            Characters: <span id="charCount">0</span>
          </div>
        </div>

        <div id="logHeader" class="log-header">
          <span>Logs</span>
          <span id="logToggle">▼</span>
        </div>
        <div id="logContent" class="log-content"></div>
      </div>
    `;
  } else {
    return `
      <div class="tool-container">
        <h1>Text Tools</h1>
        <p class="section-description">Simple text editing and formatting tools</p>
        <div class="tool-grid">
          <a href="/text/editor" class="tool-card">
            <div class="tool-icon">📝</div>
            <h3>Text Editor</h3>
            <p>Simple text editing with formatting options</p>
          </a>
        </div>
      </div>
    `;
  }
}

function generateHomeContent() {
  return `
    <div class="tool-container">
      <section class="tools-section">
        <h2>Video Tools</h2>
        <p class="section-description">Process and convert your videos with ease</p>
        <div class="tool-grid">
          <a href="/video/resize" class="tool-card">
            <div class="tool-icon">📐</div>
            <h3>Video Resize</h3>
            <p>Resize videos while maintaining quality</p>
          </a>
          <a href="/video/reencode" class="tool-card">
            <div class="tool-icon">🎥</div>
            <h3>Video Re-encode</h3>
            <p>Convert videos to different formats</p>
          </a>
        </div>
      </section>

      <section class="tools-section">
        <h2>Image Tools</h2>
        <p class="section-description">Edit and optimize your images</p>
        <div class="tool-grid">
          <a href="/image/resize" class="tool-card">
            <div class="tool-icon">🖼️</div>
            <h3>Image Resize</h3>
            <p>Resize and optimize images while maintaining quality</p>
          </a>
        </div>
      </section>

      <section class="tools-section">
        <h2>Text Tools</h2>
        <p class="section-description">Simple text editing and formatting tools</p>
        <div class="tool-grid">
          <a href="/text/editor" class="tool-card">
            <div class="tool-icon">📝</div>
            <h3>Text Editor</h3>
            <p>Simple text editing with formatting options</p>
          </a>
        </div>
      </section>
    </div>
  `;
}

export async function handleRoute(path) {
  const main = document.querySelector('main');
  if (!main) return;

  // Update page title based on route
  let pageTitle = 'Web Tools';
  if (path === '/video') pageTitle = 'Video Tools';
  else if (path === '/video/resize') pageTitle = 'Video Resize';
  else if (path === '/video/reencode') pageTitle = 'Video Re-encode';
  else if (path === '/image') pageTitle = 'Image Tools';
  else if (path === '/image/resize') pageTitle = 'Image Resize';
  else if (path === '/text') pageTitle = 'Text Tools';
  else if (path === '/text/editor') pageTitle = 'Text Editor';
  document.title = `${pageTitle} | Web Tools`;

  // Generate content based on route
  let content = '';
  
  if (path === '/' || path === '/home') {
    content = generateHomeContent();
  } else if (path.startsWith('/video')) {
    content = generateVideoContent(path);
  } else if (path.startsWith('/image')) {
    content = generateImageContent(path);
  } else if (path.startsWith('/text')) {
    content = generateTextContent(path);
  } else {
    content = '<h1>404 - Page Not Found</h1>';
  }

  // Update content
  main.innerHTML = content;

  // Initialize tools based on route
  if (path === '/video/resize') {
    import('./video/resize.js').then(module => {
      module.initTool();
    });
  } else if (path === '/video/reencode') {
    import('./video/reencode.js').then(module => {
      module.initTool();
    });
  } else if (path === '/image/resize') {
    import('./image/resize.js').then(module => {
      module.initPage();
    });
  } else if (path === '/text/editor') {
    import('./text/editor.js').then(module => {
      module.initPage();
    });
  }
} 