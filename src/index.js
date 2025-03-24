import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

// Logging functionality
const logLevels = {
  INFO: 'info',
  ERROR: 'error',
  SUCCESS: 'success'
};

function showLogs(show = true) {
  const logContent = document.getElementById('logContent');
  const logToggle = document.getElementById('logToggle');
  const logSection = document.querySelector('.log-section');
  
  logContent.style.display = show ? 'block' : 'none';
  logToggle.textContent = show ? '▲' : '▼';
  if (show) {
    logSection.classList.add('expanded');
  } else {
    logSection.classList.remove('expanded');
  }
}

function addLog(message, level = logLevels.INFO) {
  const logContent = document.getElementById('logContent');
  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logContent.appendChild(entry);
  logContent.scrollTop = logContent.scrollHeight;
  
  // Show logs when adding error messages or during initial loading
  if (level === logLevels.ERROR || message.includes('Loading FFmpeg')) {
    showLogs(true);
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
  
  // Show logs during processing
  if (progress > 0 && progress < 100) {
    showLogs(true);
  }
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

// DOM elements
const videoInput = document.getElementById('videoInput');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizeBtn = document.getElementById('resizeBtn');
const preview = document.getElementById('preview');
const logHeader = document.getElementById('logHeader');
const logContent = document.getElementById('logContent');
const logToggle = document.getElementById('logToggle');

// Toggle log visibility
logHeader.addEventListener('click', () => {
  const isVisible = logContent.style.display === 'block';
  logContent.style.display = isVisible ? 'none' : 'block';
  logToggle.textContent = isVisible ? '▼' : '▲';
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
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = 'block';
    updateProgress(0);
    
    // Load FFmpeg
    const ffmpeg = await load();
    
    // Read the file
    const inputFile = videoInput.files[0];
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    
    addLog(`Processing video: ${inputFile.name} (${Math.round(inputFile.size / 1024 / 1024)}MB)`, logLevels.INFO);
    
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
  }
}); 