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
 * Add a log message to the log content area
 * @param {string} message - The message to log
 * @param {string} level - The log level (info, error, success)
 */
export function addLog(message, level = logLevels.INFO) {
  const logContent = document.getElementById('logContent');
  if (!logContent) return;
  
  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logContent.appendChild(entry);
  logContent.scrollTop = logContent.scrollHeight;
  
  if (level === logLevels.ERROR || message.includes('Loading')) {
    showLogs(true);
  }
}

/**
 * Format a file size in bytes to a human-readable string
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
 * @param {number} progress - The progress percentage (0-100)
 */
export function updateProgress(progress) {
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (!progressContainer || !progressFill || !progressText) return;
  
  progressContainer.style.display = 'block';
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Processing: ${progress}%`;
}

/**
 * Show or hide the logs section
 * @param {boolean} show - Whether to show the logs
 */
export function showLogs(show = true) {
  const logContent = document.getElementById('logContent');
  const logToggle = document.getElementById('logToggle');
  
  if (!logContent || !logToggle) return;
  
  logContent.style.display = show ? 'block' : 'none';
  logToggle.textContent = show ? '▲' : '▼';
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
 * Create a download link for a processed file
 * @param {Blob} blob - The file blob
 * @param {string} fileName - The file name
 * @returns {HTMLAnchorElement} - The download link
 */
export function createDownloadLink(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.className = 'btn';
  a.textContent = `Download ${fileName}`;
  a.onclick = () => {
    // Clean up the URL object after download
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };
  return a;
} 