/**
 * Image resize module using HTML Canvas
 */
import { Tool } from '../common/base.js';
import { formatFileSize } from '../common/utils.js';

// Image resize tool template
export const template = `
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
`;

class ImageResizeTool extends Tool {
  constructor(config = {}) {
    super({
      ...config,
      category: 'image',
      needsFileUpload: true,
      hasOutput: true,
      needsProcessButton: true,
      template // Use the local template
    });
    
    this.originalImage = null;
    this.imageAspectRatio = 1;
    this.originalWidth = 0;
    this.originalHeight = 0;
  }

  getElementsMap() {
    return {
      dropZone: 'dropZone',
      fileInput: 'fileInput',
      preview: 'preview',
      outputImage: 'output-image',
      width: 'width',
      height: 'height',
      keepRatio: 'keepRatio',
      quality: 'quality',
      processBtn: 'processBtn',
      progress: 'progress',
      outputContainer: 'outputContainer',
      downloadContainer: 'downloadContainer',
      logHeader: 'logHeader',
      logContent: 'logContent'
    };
  }

  async setup() {
    // Disable inputs until image is loaded
    if (this.elements.width) this.elements.width.disabled = true;
    if (this.elements.height) this.elements.height.disabled = true;
    if (this.elements.keepRatio) this.elements.keepRatio.checked = true;
    if (this.elements.processBtn) this.elements.processBtn.disabled = true;

    // Initialize file upload with proper template
    const dropZone = this.elements.dropZone;
    if (dropZone) {
      dropZone.innerHTML = `
        <div class="drop-icon">📁</div>
        <p>Drop image here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Image</button>
        <input type="file" id="fileInput" accept="image/*" style="display: none;">
      `;
    }

    this.initFileUpload({
      acceptTypes: 'image/*',
      onFileSelected: (file) => {
        this.loadImage(file);
      }
    });

    // Handle dimension changes
    if (this.elements.width) {
      this.elements.width.addEventListener('input', () => {
        if (this.elements.keepRatio && this.elements.keepRatio.checked) {
          this.updateHeight();
        }
      });
    }
    
    if (this.elements.height) {
      this.elements.height.addEventListener('input', () => {
        if (this.elements.keepRatio && this.elements.keepRatio.checked) {
          this.updateWidth();
        }
      });
    }
  }

  loadImage(file) {
    if (!file || !file.type.startsWith('image/')) {
      this.log('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        this.originalImage = img;
        this.originalWidth = img.width;
        this.originalHeight = img.height;
        this.imageAspectRatio = img.width / img.height;
        
        // Show preview
        if (this.elements.preview) {
          this.elements.preview.src = e.target.result;
          this.elements.preview.style.display = 'block';
        }
        
        // Enable inputs and set initial values
        this.elements.width.disabled = false;
        this.elements.height.disabled = false;
        this.elements.keepRatio.disabled = false;
        this.elements.processBtn.disabled = false;
        
        // Set initial values to original dimensions
        this.elements.width.value = this.originalWidth;
        this.elements.height.value = this.originalHeight;
        
        // Set placeholders
        this.elements.width.placeholder = 'Width';
        this.elements.height.placeholder = 'Height';
        
        this.log(`Image loaded: ${file.name} (${formatFileSize(file.size)})`, 'info');
      };
      
      img.onerror = () => {
        this.log('Failed to load image', 'error');
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      this.log('Failed to read file', 'error');
    };
    
    reader.readAsDataURL(file);
  }

  updateHeight() {
    if (!this.elements.width || !this.elements.height) return;
    
    const width = parseInt(this.elements.width.value) || 0;
    if (width <= 0) return;

    this.elements.height.value = Math.round(width / this.imageAspectRatio);
  }

  updateWidth() {
    if (!this.elements.width || !this.elements.height) return;
    
    const height = parseInt(this.elements.height.value) || 0;
    if (height <= 0) return;

    this.elements.width.value = Math.round(height * this.imageAspectRatio);
  }

  calculateDimensions() {
    if (!this.elements.width || !this.elements.height) return { width: 0, height: 0 };
    
    const width = parseInt(this.elements.width.value) || this.originalWidth;
    const height = parseInt(this.elements.height.value) || this.originalHeight;

    return { width, height };
  }

  async processFile(file) {
    try {
      if (!this.originalImage) {
        this.log('No image selected', 'error');
        return;
      }

      this.startProcessing();
      this.updateProgress(10);

      const dimensions = this.calculateDimensions();
      const { width, height } = dimensions;

      if (width <= 0 || height <= 0) {
        this.log('Please enter valid dimensions', 'error');
        this.endProcessing(false);
        return;
      }

      this.log(`Resizing to ${width}x${height} pixels...`, 'info');
      this.updateProgress(30);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;

      // Draw image with smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this.originalImage, 0, 0, width, height);

      this.updateProgress(70);

      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, file.type, 0.92);
      });

      if (!blob) {
        throw new Error('Failed to process image');
      }

      // Display output and create download link
      const url = URL.createObjectURL(blob);
      
      // Display the resized image
      if (this.elements.outputImage) {
        this.elements.outputImage.src = url;
        this.elements.outputImage.style.display = 'block';
      }
      
      // Create download link
      this.displayOutputMedia(blob, 'outputImage', `resized_${width}x${height}.${file.type.split('/')[1]}`, 'downloadContainer');
      
      this.updateProgress(100);
      this.log('Resizing complete!', 'success');
      this.endProcessing();
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      console.error('Processing error:', error);
      this.endProcessing(false);
    }
  }
}

export function initTool() {
  const tool = new ImageResizeTool({
    id: 'resize',
    name: 'Image Resize'
  });
  
  return tool.init();
} 