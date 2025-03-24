/**
 * Video resize module using FFmpeg WASM
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { addLog, formatFileSize, updateProgress, showLogs, setupDropZone, createDownloadLink } from '../common/utils.js';
import { generatePageHTML } from '../common/template.js';

let ffmpeg = null;

/**
 * Load FFmpeg WASM
 * @returns {Promise<FFmpeg>} - The loaded FFmpeg instance
 */
const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  try {
    addLog('Loading FFmpeg...', 'info');
    ffmpeg = new FFmpeg();
    
    ffmpeg.on('log', ({ message }) => {
      addLog(message, 'info');
    });

    ffmpeg.on('progress', ({ progress }) => {
      const percentage = Math.round(progress * 100);
      updateProgress(percentage);
      addLog(`Processing: ${percentage}% complete`, 'info');
    });

    const baseURL = '/video/ffmpeg';
    
    try {
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        workerURL: `${baseURL}/ffmpeg-core.worker.js`
      });
    } catch (loadError) {
      console.error('FFmpeg load error:', loadError);
      throw new Error(`Failed to load FFmpeg core files: ${loadError.message || 'Unknown error'}`);
    }
    
    addLog('FFmpeg loaded successfully!', 'success');
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg setup error:', error);
    addLog(`Failed to load FFmpeg: ${error.message || 'Unknown error'}`, 'error');
    throw error;
  }
};

/**
 * Update file info in the UI
 * @param {File} file - The selected video file
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

    // Show video preview
    const videoURL = URL.createObjectURL(file);
    preview.src = videoURL;
    preview.classList.add('active');
    preview.onloadedmetadata = () => {
      // Auto-fill dimensions with video's original size
      document.getElementById('width').value = preview.videoWidth;
      document.getElementById('height').value = preview.videoHeight;
    };
  } else {
    fileInfo.classList.remove('active');
    preview.classList.remove('active');
    preview.src = '';
    resizeBtn.disabled = true;
  }
}

/**
 * Resize the video
 * @param {File} inputFile - The input video file
 * @param {number} width - The target width
 * @param {number} height - The target height
 */
const resizeVideo = async (inputFile, width, height) => {
  try {
    const resizeBtn = document.getElementById('resizeBtn');
    const dropZone = document.getElementById('dropZone');
    const downloadContainer = document.getElementById('downloadContainer');
    
    resizeBtn.disabled = true;
    dropZone.style.pointerEvents = 'none';
    updateProgress(0);
    
    // Load FFmpeg
    const ffmpeg = await loadFFmpeg();
    
    // Read the file
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    
    addLog(`Processing video: ${inputFile.name} (${formatFileSize(inputFile.size)})`, 'info');
    
    try {
      // Write the file to FFmpeg's file system
      await ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));
      addLog('Video loaded into FFmpeg', 'info');
      
      // Run FFmpeg command
      addLog(`Resizing to ${width}x${height}...`, 'info');
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vf', `scale=${width}:${height}`,
        '-c:a', 'copy',
        outputFileName
      ]);
      
      // Read the result
      const data = await ffmpeg.readFile(outputFileName);
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      
      // Generate a download name (original_name_resized.mp4)
      const originalName = inputFile.name.split('.');
      originalName.pop(); // Remove extension
      const downloadName = `${originalName.join('.')}_resized.mp4`;
      
      // Create download link
      const downloadLink = createDownloadLink(videoBlob, downloadName);
      downloadContainer.innerHTML = '';
      downloadContainer.appendChild(downloadLink);
      
      // Update preview
      const videoURL = URL.createObjectURL(videoBlob);
      const preview = document.getElementById('preview');
      preview.src = videoURL;
      preview.classList.add('active');
      
      addLog('Video processing completed successfully!', 'success');
    } catch (processError) {
      console.error('Processing error:', processError);
      throw new Error(`Error processing video: ${processError.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Operation error:', error);
    addLog(`Error processing video: ${error.message || 'Unknown error'}`, 'error');
  } finally {
    const resizeBtn = document.getElementById('resizeBtn');
    const dropZone = document.getElementById('dropZone');
    
    resizeBtn.disabled = false;
    dropZone.style.pointerEvents = 'auto';
  }
};

/**
 * Initialize the page when DOM is loaded
 */
function initPage() {
  // Get DOM elements
  const dropZone = document.getElementById('dropZone');
  const videoInput = document.getElementById('videoInput');
  const resizeBtn = document.getElementById('resizeBtn');
  const logHeader = document.getElementById('logHeader');
  
  // Set up drag and drop
  setupDropZone(dropZone, videoInput, updateFileInfo, 'video');
  
  // Toggle log visibility
  logHeader.addEventListener('click', () => {
    const logContent = document.getElementById('logContent');
    const isVisible = logContent.style.display === 'block';
    showLogs(!isVisible);
  });
  
  // Resize button click handler
  resizeBtn.addEventListener('click', () => {
    if (!videoInput.files.length) {
      addLog('Please select a video file first!', 'error');
      return;
    }
    
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    
    if (!width || !height || isNaN(width) || isNaN(height)) {
      addLog('Please enter valid dimensions', 'error');
      return;
    }
    
    resizeVideo(videoInput.files[0], width, height);
  });
  
  // Initialize logs
  addLog('Video resizer ready', 'info');
}

/**
 * Generate the HTML for the page
 * @returns {string} - The HTML content
 */
function generateHTML() {
  const content = `
    <div class="drop-zone" id="dropZone">
      <p>Drag and drop a video file here or click to select</p>
      <input type="file" id="videoInput" accept="video/*" style="display: none;">
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
      <button id="resizeBtn" class="btn" disabled>Resize Video</button>
    </div>
    
    <div class="progress-container" id="progressContainer">
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      <div id="progressText">Processing: 0%</div>
    </div>
    
    <div id="downloadContainer"></div>
    
    <video id="preview" class="output-preview" controls></video>
    
    <div class="log-section">
      <div class="log-header" id="logHeader">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div class="log-content" id="logContent"></div>
    </div>
  `;
  
  return generatePageHTML('Video Resize Tool', content);
}

// Create and export the page content
const pageHTML = generateHTML();
document.addEventListener('DOMContentLoaded', initPage);

export { pageHTML, initPage }; 