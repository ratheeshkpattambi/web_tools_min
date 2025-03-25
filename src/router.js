import { generateToolCard } from './common/template.js';

// Home page content
const homeContent = `
  <div class="home">
    <h2>Web Tools</h2>
    <p class="subtitle">Simple browser-based tools for your needs</p>
    <div class="tools-grid">
      ${generateToolCard(
        'Video Tools',
        'Resize, compress, and convert videos directly in your browser',
        '🎥',
        '/video'
      )}
      ${generateToolCard(
        'Image Tools',
        'Edit, resize, and optimize images with ease',
        '🖼️',
        '/image'
      )}
      ${generateToolCard(
        'Text Tools',
        'Format, convert, and analyze text content',
        '📝',
        '/text'
      )}
    </div>
  </div>
`;

const routes = {
  '/': {
    title: 'Web Tools',
    content: homeContent
  },
  '/video': {
    title: 'Video Tools',
    content: `
      <div class="video-tools">
        <div class="drop-zone" id="dropZone">
          <p>Drag and drop a video file here or click to select</p>
          <input type="file" id="fileInput" accept="video/*" style="display: none;">
        </div>
        <div class="progress" id="progress" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">0%</div>
        </div>
        <video id="output-video" controls style="max-width: 100%; margin-top: 20px;"></video>
        <div id="log"></div>
      </div>
    `
  },
  '/image': {
    title: 'Image Tools',
    content: `
      <div class="tool-description">
        <p>Resize and optimize your images with ease.</p>
      </div>
      
      <div class="image-tools">
        <div class="drop-zone" id="dropZone">
          <p>Drag and drop an image file here or click to select</p>
          <input type="file" id="imageInput" accept="image/*" style="display: none;">
        </div>
        
        <div class="controls">
          <div class="control-group">
            <label for="width">Width:</label>
            <input type="number" id="width" placeholder="Width in pixels">
          </div>
          <div class="control-group">
            <label for="height">Height:</label>
            <input type="number" id="height" placeholder="Height in pixels">
          </div>
          <div class="control-group">
            <label>
              <input type="checkbox" id="keepRatio" checked>
              Maintain aspect ratio
            </label>
          </div>
          <div class="control-group">
            <label for="format">Format:</label>
            <select id="format">
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div class="control-group">
            <label for="quality">Quality:</label>
            <input type="range" id="quality" min="0" max="1" step="0.1" value="0.9">
            <span id="qualityValue">0.9</span>
          </div>
          <button id="resizeBtn" class="btn" disabled>Resize Image</button>
        </div>
        
        <div class="preview-container">
          <img id="preview" class="preview-image" style="display: none;">
        </div>
      </div>
    `
  },
  '/text': {
    title: 'Text Tools',
    content: `
      <div class="tool-description">
        <p>A simple text editor for basic text editing needs.</p>
      </div>
      
      <div class="editor-container">
        <div class="editor-header">
          <div class="editor-controls">
            <button id="clearBtn" class="btn">Clear</button>
            <button id="copyBtn" class="btn">Copy</button>
          </div>
        </div>
        <textarea id="textEditor" class="text-editor" placeholder="Enter your text here..."></textarea>
      </div>
    `
  }
};

export function handleRoute(path) {
  const route = routes[path] || routes['/'];
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) return;
  
  // Update page title
  document.title = `${route.title} | Web Tools`;
  
  // Update active nav link
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
  
  // Set the content
  mainContent.innerHTML = route.content;
  
  // Initialize tools based on path
  if (path === '/video') {
    import('./video/index.js').then(module => {
      module.initVideoTools();
    }).catch(error => {
      console.error('Error loading video tools:', error);
      mainContent.innerHTML = `
        <div class="error">
          <h2>Error Loading Video Tools</h2>
          <p>${error.message}</p>
        </div>
      `;
    });
  } else if (path === '/text') {
    import('./text/editor.js').then(module => {
      module.initPage();
    }).catch(error => {
      console.error('Error loading text editor:', error);
      mainContent.innerHTML = `
        <div class="error">
          <h2>Error Loading Text Editor</h2>
          <p>${error.message}</p>
        </div>
      `;
    });
  } else if (path === '/image') {
    import('./image/resize.js').then(module => {
      module.initPage();
    }).catch(error => {
      console.error('Error loading image tools:', error);
      mainContent.innerHTML = `
        <div class="error">
          <h2>Error Loading Image Tools</h2>
          <p>${error.message}</p>
        </div>
      `;
    });
  }
} 