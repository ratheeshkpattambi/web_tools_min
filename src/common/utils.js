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

  // Convert logContent to textarea if it's not already
  if (!logContent.tagName || logContent.tagName !== 'TEXTAREA') {
    const textarea = document.createElement('textarea');
    textarea.id = 'logContent';
    textarea.className = 'w-full h-48 p-4 rounded-b-md mt-px font-mono text-xs resize-none bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 border-0 focus:outline-none transition-colors';
    textarea.readOnly = true;
    textarea.placeholder = 'Logs will appear here...';
    
    // Copy any existing content
    const existingContent = logContent.textContent || '';
    textarea.value = existingContent;
    
    // Replace the old element
    logContent.parentNode.replaceChild(textarea, logContent);
    
    // Update reference
    const newLogContent = document.getElementById('logContent');
    if (newLogContent) {
      logContent = newLogContent;
    }
  }

  // Get the type prefix and add the message
  let prefix = '';
  if (type === 'success') {
    prefix = '✓ SUCCESS: ';
  } else if (type === 'error') {
    prefix = '✗ ERROR: ';
  } else if (type === 'warning') {
    prefix = '⚠ WARNING: ';
  } else {
    prefix = 'ℹ INFO: ';
  }

  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${prefix}${message}\n`;
  
  logContent.value += logEntry;
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
 * Format seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string (MM:SS)
 */
export function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

/**
 * Escape HTML special characters in a string
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
