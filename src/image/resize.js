/**
 * Image resize module using HTML Canvas
 */
import { addLog, formatFileSize, updateProgress, showLogs, setupDropZone, createDownloadLink } from '../common/utils.js';
import { generatePageHTML } from '../common/template.js';

/**
 * Update file info in the UI
 * @param {File} file - The selected image file
 */
function updateFileInfo(file) {
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const resizeBtn = document.getElementById('resizeBtn');
  const preview = document.getElementById('preview');

  if (file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.classList.add('active');
    resizeBtn.disabled = false;

    // Show image preview
    const imgURL = URL.createObjectURL(file);
    preview.src = imgURL;
    preview.classList.add('active');
    
    // Auto-fill dimensions with the image's original size
    const img = new Image();
    img.onload = () => {
      document.getElementById('width').value = img.width;
      document.getElementById('height').value = img.height;
      // Store original dimensions for aspect ratio preservation
      preview.dataset.originalWidth = img.width;
      preview.dataset.originalHeight = img.height;
    };
    img.src = imgURL;
  } else {
    fileInfo.classList.remove('active');
    preview.classList.remove('active');
    preview.src = '';
    resizeBtn.disabled = true;
  }
}

/**
 * Resize an image using HTML Canvas
 * @param {File} file - The image file to resize
 * @param {number} width - The target width
 * @param {number} height - The target height
 * @param {string} format - The output format (jpeg, png, etc.)
 * @param {number} quality - The image quality (0-1)
 */
async function resizeImage(file, width, height, format = 'jpeg', quality = 0.9) {
  return new Promise((resolve, reject) => {
    try {
      addLog(`Processing image: ${file.name} (${formatFileSize(file.size)})`, 'info');
      
      // Create a FileReader to read the image
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        // Create an image element to load the file data
        const img = new Image();
        
        img.onload = () => {
          updateProgress(30);
          
          // Create a canvas with the desired dimensions
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw the image on the canvas with the new dimensions
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          updateProgress(70);
          
          // Convert the canvas to a Blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to convert canvas to blob'));
              return;
            }
            
            // Generate a download name
            const originalName = file.name.split('.');
            originalName.pop(); // Remove extension
            const downloadName = `${originalName.join('.')}_resized.${format}`;
            
            updateProgress(100);
            addLog('Image processing completed successfully!', 'success');
            
            resolve({ blob, name: downloadName });
          }, `image/${format}`, quality);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Set the source of the image to the FileReader result
        img.src = event.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Initialize the page when DOM is loaded
 */
function initPage() {
  // Get DOM elements
  const dropZone = document.getElementById('dropZone');
  const imageInput = document.getElementById('imageInput');
  const resizeBtn = document.getElementById('resizeBtn');
  const logHeader = document.getElementById('logHeader');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const keepRatioCheckbox = document.getElementById('keepRatio');
  
  // Set up drag and drop
  setupDropZone(dropZone, imageInput, updateFileInfo, 'image');
  
  // Toggle log visibility
  logHeader.addEventListener('click', () => {
    const logContent = document.getElementById('logContent');
    const isVisible = logContent.style.display === 'block';
    showLogs(!isVisible);
  });
  
  // Handle preserving aspect ratio
  let isUpdatingDimension = false;
  
  function updateDimension(changedInput) {
    if (!keepRatioCheckbox.checked || isUpdatingDimension) return;
    
    isUpdatingDimension = true;
    
    const preview = document.getElementById('preview');
    const originalWidth = parseInt(preview.dataset.originalWidth, 10);
    const originalHeight = parseInt(preview.dataset.originalHeight, 10);
    
    if (originalWidth && originalHeight) {
      const aspectRatio = originalWidth / originalHeight;
      
      if (changedInput === 'width') {
        const newWidth = parseInt(widthInput.value, 10);
        if (!isNaN(newWidth)) {
          heightInput.value = Math.round(newWidth / aspectRatio);
        }
      } else {
        const newHeight = parseInt(heightInput.value, 10);
        if (!isNaN(newHeight)) {
          widthInput.value = Math.round(newHeight * aspectRatio);
        }
      }
    }
    
    isUpdatingDimension = false;
  }
  
  widthInput.addEventListener('input', () => updateDimension('width'));
  heightInput.addEventListener('input', () => updateDimension('height'));
  
  // Resize button click handler
  resizeBtn.addEventListener('click', async () => {
    if (!imageInput.files.length) {
      addLog('Please select an image file first!', 'error');
      return;
    }
    
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);
    const format = document.getElementById('format').value;
    const quality = parseFloat(document.getElementById('quality').value);
    
    if (!width || !height || isNaN(width) || isNaN(height)) {
      addLog('Please enter valid dimensions', 'error');
      return;
    }
    
    if (isNaN(quality) || quality < 0 || quality > 1) {
      addLog('Please enter a valid quality (0-1)', 'error');
      return;
    }
    
    try {
      resizeBtn.disabled = true;
      dropZone.style.pointerEvents = 'none';
      
      const progressContainer = document.getElementById('progressContainer');
      progressContainer.style.display = 'block';
      updateProgress(0);
      
      const result = await resizeImage(imageInput.files[0], width, height, format, quality);
      
      // Create download link
      const downloadContainer = document.getElementById('downloadContainer');
      const downloadLink = createDownloadLink(result.blob, result.name);
      downloadContainer.innerHTML = '';
      downloadContainer.appendChild(downloadLink);
      
      // Update preview
      const imageURL = URL.createObjectURL(result.blob);
      const preview = document.getElementById('preview');
      preview.src = imageURL;
      preview.classList.add('active');
      
    } catch (error) {
      console.error('Operation error:', error);
      addLog(`Error processing image: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      resizeBtn.disabled = false;
      dropZone.style.pointerEvents = 'auto';
    }
  });
  
  // Initialize logs
  addLog('Image resizer ready', 'info');
}

/**
 * Generate the HTML for the page
 * @returns {string} - The HTML content
 */
function generateHTML() {
  const content = `
    <div class="drop-zone" id="dropZone">
      <p>Drag and drop an image file here or click to select</p>
      <input type="file" id="imageInput" accept="image/*" style="display: none;">
    </div>
    
    <div class="file-info" id="fileInfo">
      <h3>Selected File</h3>
      <p>Name: <span id="fileName"></span></p>
      <p>Size: <span id="fileSize"></span></p>
    </div>
    
    <div class="controls">
      <h3>Resize Options</h3>
      <div class="control-group">
        <label for="width">Width:</label>
        <input type="number" id="width" placeholder="Width in pixels">
      </div>
      <div class="control-group">
        <label for="height">Height:</label>
        <input type="number" id="height" placeholder="Height in pixels">
      </div>
      <div class="control-group">
        <input type="checkbox" id="keepRatio" checked>
        <label for="keepRatio">Maintain aspect ratio</label>
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
        <label for="quality">Quality (0-1):</label>
        <input type="number" id="quality" min="0" max="1" step="0.1" value="0.9">
      </div>
      <button id="resizeBtn" class="btn" disabled>Resize Image</button>
    </div>
    
    <div class="progress-container" id="progressContainer">
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      <div id="progressText">Processing: 0%</div>
    </div>
    
    <div id="downloadContainer"></div>
    
    <img id="preview" class="output-preview">
    
    <div class="log-section">
      <div class="log-header" id="logHeader">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div class="log-content" id="logContent"></div>
    </div>
  `;
  
  return generatePageHTML('Image Resize Tool', content);
}

// Create and export the page content
const pageHTML = generateHTML();
document.addEventListener('DOMContentLoaded', initPage);

export { pageHTML, initPage }; 