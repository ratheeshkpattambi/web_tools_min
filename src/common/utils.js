/**
 * Common utilities for both image and video tools
 */

// Logging functionality
export const logLevels = {
  INFO: 'info',
  ERROR: 'error',
  SUCCESS: 'success'
};

/**
 * Initialize log functionality
 */
export function showLogs() {
  const logHeader = document.getElementById('logHeader');
  const logContent = document.getElementById('logContent');
  const logToggle = document.getElementById('logToggle');

  if (logHeader && logContent && logToggle) {
    // Set initial state
    logContent.classList.remove('active');
    logToggle.textContent = '▼';

    logHeader.addEventListener('click', () => {
      logContent.classList.toggle('active');
      logToggle.textContent = logContent.classList.contains('active') ? '▲' : '▼';
    });
  }
}

/**
 * Add a log message
 * @param {string} message - The message to log
 * @param {string} type - The type of log (info, success, error)
 */
export function addLog(message, type = 'info') {
  const logContent = document.getElementById('logContent');
  if (!logContent) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = message;
  logContent.appendChild(entry);
  logContent.scrollTop = logContent.scrollHeight;
}

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} - The formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Update the progress bar
 * @param {number} percentage - The progress percentage (0-100)
 */
export function updateProgress(percentage) {
  const progress = document.querySelector('.progress');
  if (!progress) return;

  const progressFill = progress.querySelector('.progress-fill');
  const progressText = progress.querySelector('.progress-text');
  
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  if (progressText) {
    progressText.textContent = `${percentage}%`;
  }
}

/**
 * Set up drag and drop functionality for a drop zone
 * @param {HTMLElement} dropZone - The drop zone element
 * @param {HTMLInputElement} fileInput - The file input element
 * @param {Function} onFileSelected - Callback when a file is selected
 * @param {string} acceptType - The accept type for files (e.g. 'video', 'image')
 */
export function setupDropZone(dropZone, fileInput, onFileSelected, acceptType = 'file') {
  if (!dropZone || !fileInput) return;
  
  // Initialize file input
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file);
    }
  });
  
  // Click on drop zone to trigger file input
  dropZone.addEventListener('click', () => fileInput.click());
  
  // Set up drag and drop events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });
  
  // Handle file drop
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    
    if (file) {
      if ((acceptType === 'video' && file.type.startsWith('video/')) ||
          (acceptType === 'image' && file.type.startsWith('image/')) ||
          acceptType === 'file') {
        fileInput.files = dt.files;
        onFileSelected(file);
      } else {
        addLog(`Please drop a ${acceptType} file`, logLevels.ERROR);
      }
    }
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  function highlight() {
    dropZone.classList.add('drag-over');
  }
  
  function unhighlight() {
    dropZone.classList.remove('drag-over');
  }
}

/**
 * Create a download link for the processed file
 */
export function createDownloadLink(container, url, filename, text) {
  container.innerHTML = `
    <a href="${url}" download="${filename}" class="btn">
      ${text}
    </a>
  `;
} 