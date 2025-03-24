import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

// Logging functionality
const logLevels = {
  INFO: 'info',
  ERROR: 'error',
  SUCCESS: 'success'
};

function addLog(message, level = logLevels.INFO) {
  const logContent = document.getElementById('logContent');
  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logContent.appendChild(entry);
  logContent.scrollTop = logContent.scrollHeight;
  
  if (level === logLevels.ERROR || message.includes('Loading FFmpeg')) {
    showLogs(true);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

// Progress bar functionality
function updateProgress(progress) {
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  progressContainer.style.display = 'block';
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Processing: ${progress}%`;
}

function showLogs(show = true) {
  const logContent = document.getElementById('logContent');
  const logToggle = document.getElementById('logToggle');
  logContent.style.display = show ? 'block' : 'none';
  logToggle.textContent = show ? '▲' : '▼';
}

const load = async () => {
  if (ffmpeg) return ffmpeg;
  
  try {
    addLog('Loading FFmpeg...', logLevels.INFO);
    ffmpeg = new FFmpeg();
    
    ffmpeg.on('log', ({ message }) => {
      addLog(message, logLevels.INFO);
    });

    ffmpeg.on('progress', ({ progress, time }) => {
      const percentage = Math.round(progress * 100);
      updateProgress(percentage);
      addLog(`Processing: ${percentage}% complete`, logLevels.INFO);
    });

    const baseURL = '/ffmpeg';
    
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
    
    addLog('FFmpeg loaded successfully!', logLevels.SUCCESS);
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg setup error:', error);
    addLog(`Failed to load FFmpeg: ${error.message || 'Unknown error'}`, logLevels.ERROR);
    throw error;
  }
};

// Setup drag and drop
const dropZone = document.getElementById('dropZone');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.classList.add('drag-over');
}

function unhighlight(e) {
  dropZone.classList.remove('drag-over');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const file = dt.files[0];
  if (file && file.type.startsWith('video/')) {
    document.getElementById('videoInput').files = dt.files;
    updateFileInfo(file);
  } else {
    addLog('Please drop a video file', logLevels.ERROR);
  }
}

// DOM elements
const videoInput = document.getElementById('videoInput');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizeBtn = document.getElementById('resizeBtn');
const preview = document.getElementById('preview');
const logHeader = document.getElementById('logHeader');

// File input change handler
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    updateFileInfo(file);
  }
});

// Toggle log visibility
logHeader.addEventListener('click', () => {
  const logContent = document.getElementById('logContent');
  const isVisible = logContent.style.display === 'block';
  showLogs(!isVisible);
});

// Start loading FFmpeg when the page loads
window.addEventListener('DOMContentLoaded', () => {
  addLog('Initializing video resizer...', logLevels.INFO);
  load().catch(error => {
    console.error('Initialization error:', error);
    addLog(`Initialization error: ${error.message || 'Unknown error'}`, logLevels.ERROR);
  });
});

resizeBtn.addEventListener('click', async () => {
  if (!videoInput.files.length) {
    addLog('Please select a video file first!', logLevels.ERROR);
    return;
  }

  const width = widthInput.value;
  const height = heightInput.value;
  
  try {
    resizeBtn.disabled = true;
    dropZone.style.pointerEvents = 'none';
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = 'block';
    updateProgress(0);
    
    // Load FFmpeg
    const ffmpeg = await load();
    
    // Read the file
    const inputFile = videoInput.files[0];
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    
    addLog(`Processing video: ${inputFile.name} (${formatFileSize(inputFile.size)})`, logLevels.INFO);
    
    try {
      // Write the file to FFmpeg's file system
      await ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));
      addLog('Video loaded into FFmpeg', logLevels.INFO);
      
      // Run FFmpeg command
      addLog(`Resizing to ${width}x${height}...`, logLevels.INFO);
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vf', `scale=${width}:${height}`,
        '-c:a', 'copy',
        outputFileName
      ]);
      
      // Read the result
      const data = await ffmpeg.readFile(outputFileName);
      const videoURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      
      // Display the result
      preview.src = videoURL;
      preview.classList.add('active');
      addLog('Video processing completed successfully!', logLevels.SUCCESS);
    } catch (processError) {
      console.error('Processing error:', processError);
      throw new Error(`Error processing video: ${processError.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Operation error:', error);
    addLog(`Error processing video: ${error.message || 'Unknown error'}`, logLevels.ERROR);
  } finally {
    resizeBtn.disabled = false;
    dropZone.style.pointerEvents = 'auto';
  }
}); 