/**
 * Base Tool class
 */
import { addLog, updateProgress, showLogs } from './utils.js';

export class Tool {
  /**
   * Constructor initializes the tool with configuration
   * @param {Object} config - Tool configuration
   * @param {string} config.id - Tool ID
   * @param {string} config.name - Tool display name
   * @param {string} config.category - Tool category (video, image, text)
   * @param {boolean} config.needsFileUpload - Whether this tool needs file upload (default: true)
   * @param {boolean} config.hasOutput - Whether this tool produces downloadable output (default: false)
   * @param {boolean} config.needsProcessButton - Whether this tool needs a process button (default: false)
   */
  constructor(config = {}) {
    this.id = config.id || '';
    this.name = config.name || '';
    this.category = config.category || '';
    this.needsFileUpload = config.hasOwnProperty('needsFileUpload') ? config.needsFileUpload : true;
    this.hasOutput = config.hasOwnProperty('hasOutput') ? config.hasOutput : false;
    this.needsProcessButton = config.hasOwnProperty('needsProcessButton') ? config.needsProcessButton : false;
    
    this.elements = {};
    this.initialized = false;
    this.isProcessing = false;
    this.inputFile = null;
  }

  /**
   * Initialize the tool
   */
  async init() {
    if (this.initialized) return this;
    
    // Show logs panel
    showLogs();
    
    // Get elements from DOM
    this._initElements();
    
    // Set up common event listeners
    this._setupCommonListeners();
    
    // Tool-specific initialization
    await this.setup();
    
    // Mark as initialized
    this.initialized = true;
    
    return this;
  }
  
  /**
   * Initialize elements from DOM
   * @private
   */
  _initElements() {
    // Get element mappings from the derived class
    const elementsMap = this.getElementsMap();
    
    for (const [key, id] of Object.entries(elementsMap)) {
      this.elements[key] = document.getElementById(id);
      if (!this.elements[key] && id !== null) {
        console.warn(`Element with ID '${id}' not found for '${key}'`);
      }
    }
  }
  
  /**
   * Set up common event listeners
   * @private
   */
  _setupCommonListeners() {
    // Set up process button if needed
    if (this.needsProcessButton && this.elements.processBtn) {
      this.elements.processBtn.addEventListener('click', () => {
        if (!this.isProcessing && this.inputFile) {
          this.processFile(this.inputFile);
        } else if (!this.inputFile) {
          this.log('Please select a file first', 'error');
        }
      });
    }
    
    // Set up log toggle
    const logHeader = document.getElementById('logHeader');
    const logContent = document.getElementById('logContent');
    const logToggle = document.getElementById('logToggle');
    
    if (logHeader && logContent && logToggle) {
      logHeader.addEventListener('click', () => {
        if (logContent.style.display === 'none') {
          logContent.style.display = 'block';
          logToggle.textContent = '▼';
        } else {
          logContent.style.display = 'none';
          logToggle.textContent = '▶';
        }
      });
    }
  }
  
  /**
   * Get mapping of element keys to DOM IDs
   * Should be implemented by derived classes
   * @returns {Object} Map of element keys to DOM IDs
   */
  getElementsMap() {
    return {};
  }
  
  /**
   * Set up the tool
   * Should be implemented by derived classes
   */
  async setup() {
    throw new Error('setup() must be implemented by derived classes');
  }
  
  /**
   * Process a file with the tool
   * Should be implemented by derived classes if needed
   * @param {File} file - The file to process
   */
  async processFile(file) {
    throw new Error('processFile() must be implemented by derived classes');
  }
  
  /**
   * Log a message
   * @param {string} message - The message to log
   * @param {string} type - Log type (info, success, error, warning)
   */
  log(message, type = 'info') {
    addLog(message, type);
  }
  
  /**
   * Update progress indicator
   * @param {number} percent - Progress percentage (0-100)
   */
  updateProgress(percent) {
    updateProgress(percent);
    
    const { progress } = this.elements;
    if (progress) {
      progress.style.display = 'block';
      
      // Update text if it exists
      const progressText = progress.querySelector('.progress-text');
      if (progressText) {
        progressText.textContent = `${Math.round(percent)}%`;
      }
    }
  }
  
  /**
   * Hide progress indicator
   */
  hideProgress() {
    const { progress } = this.elements;
    if (progress) {
      progress.style.display = 'none';
    }
  }
  
  /**
   * Initialize file upload
   * @param {Object} options - Upload options
   * @param {string} options.acceptTypes - File types to accept (e.g. 'video/*')
   * @param {Function} options.onFileSelected - Callback when a file is selected
   */
  initFileUpload(options = {}) {
    const { dropZone, fileInput } = this.elements;
    
    if (!dropZone || !fileInput) {
      this.log('Missing drop zone or file input elements', 'error');
      return;
    }
    
    import('./fileUpload.js').then(module => {
      module.initFileUpload({
        dropZoneId: dropZone.id,
        fileInputId: fileInput.id,
        acceptTypes: options.acceptTypes || '*/*',
        onFileSelected: (file) => {
          this.inputFile = file;
          
          // Enable process button if exists
          if (this.elements.processBtn) {
            this.elements.processBtn.disabled = false;
          }
          
          // Call user's onFileSelected handler if provided
          if (options.onFileSelected) {
            options.onFileSelected(file);
          }
        }
      });
    });
  }
  
  /**
   * Create a download link
   * @param {Blob} blob - The data blob
   * @param {string} filename - The filename for download
   * @param {string} containerKey - Key of container element in this.elements
   * @returns {string} The blob URL
   */
  createDownloadLink(blob, filename, containerKey = 'downloadContainer') {
    const url = URL.createObjectURL(blob);
    const container = this.elements[containerKey];
    
    if (container) {
      container.innerHTML = `
        <a href="${url}" download="${filename}" class="btn">
          Download ${this.name} Result
        </a>
      `;
      container.style.display = 'block';
    }
    
    return url;
  }
  
  /**
   * Display a preview for different file types
   * @param {Blob|File} file - The file to preview
   * @param {string} elementKey - Key of preview element in this.elements
   * @returns {string} The blob URL
   */
  displayPreview(file, elementKey) {
    const url = URL.createObjectURL(file);
    const element = this.elements[elementKey];
    
    if (!element) return url;
    
    // Display based on element type
    if (element.tagName === 'VIDEO') {
      element.src = url;
      element.style.display = 'block';
      
      return url;
    } else if (element.tagName === 'IMG') {
      element.src = url;
      element.style.display = 'block';
      
      return url;
    } else if (element.tagName === 'AUDIO') {
      element.src = url;
      element.style.display = 'block';
      
      return url;
    }
    
    return url;
  }
  
  /**
   * Display output media (video/image/audio) and create a download link
   * @param {Blob|File} blob - The output data blob
   * @param {string} mediaKey - Key of the media element in this.elements
   * @param {string} filename - Filename for downloading the blob
   * @param {string} [containerKey='downloadContainer'] - Key of the download container
   * @returns {string} The blob URL
   */
  displayOutputMedia(blob, mediaKey, filename, containerKey = 'downloadContainer') {
    const url = URL.createObjectURL(blob);
    const mediaEl = this.elements[mediaKey];
    if (mediaEl && ['VIDEO', 'IMG', 'AUDIO'].includes(mediaEl.tagName)) {
      mediaEl.src = url;
      mediaEl.style.display = 'block';
    }
    this.createDownloadLink(blob, filename, containerKey);
    return url;
  }
  
  /**
   * Start processing and update UI accordingly
   */
  startProcessing() {
    this.isProcessing = true;
    
    if (this.elements.processBtn) {
      this.elements.processBtn.disabled = true;
    }
    
    this.updateProgress(0);
  }
  
  /**
   * End processing and update UI accordingly
   */
  endProcessing(success = true) {
    this.isProcessing = false;
    
    if (this.elements.processBtn) {
      this.elements.processBtn.disabled = false;
    }
    
    this.hideProgress();
    
    if (success) {
      this.log('Processing complete!', 'success');
    }
  }
} 