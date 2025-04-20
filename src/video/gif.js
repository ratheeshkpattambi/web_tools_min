/**
 * Video to GIF conversion module using FFmpeg WASM
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { addLog, formatFileSize, updateProgress, showLogs } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, readOutputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';
import { initFileUpload } from '../common/fileUpload.js';

let inputVideo = null;
let aspectRatio = 1;
let logVisible = false;

/**
 * Update both the progress bar and call the global updateProgress
 * @param {number} percent - The progress percentage
 */
function updateGifProgress(percent) {
  // Call the imported updateProgress
  updateProgress(percent);
  
  // Also directly update the UI
  const progressElement = document.getElementById('progress');
  if (progressElement) {
    const fill = progressElement.querySelector('.progress-fill');
    const text = progressElement.querySelector('.progress-text');
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${percent}%`;
  }
}

/**
 * Initialize the video to GIF tool
 */
export async function initTool() {
  const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    inputVideo: document.getElementById('input-video'),
    outputGif: document.getElementById('output-gif'),
    processBtn: document.getElementById('processBtn'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    keepRatio: document.getElementById('keepRatio'),
    fps: document.getElementById('fps'),
    quality: document.getElementById('quality'),
    startTime: document.getElementById('startTime'),
    duration: document.getElementById('duration'),
    progress: document.getElementById('progress'),
    downloadContainer: document.getElementById('downloadContainer'),
    logHeader: document.getElementById('logHeader'),
    logToggle: document.getElementById('logToggle'),
    logContent: document.getElementById('logContent')
  };

  // Variables
  let selectedFile = null;
  let videoAspectRatio = 1;

  // Event listeners
  elements.logHeader.addEventListener('click', () => {
    logVisible = !logVisible;
    elements.logContent.style.display = logVisible ? 'block' : 'none';
    elements.logToggle.textContent = logVisible ? '▲' : '▼';
  });

  initFileUpload({
    dropZoneId: 'dropZone',
    fileInputId: 'fileInput',
    acceptTypes: 'video/*',
    onFileSelected: (file) => {
      selectedFile = file;
      const url = URL.createObjectURL(file);
      elements.inputVideo.src = url;
      elements.inputVideo.style.display = 'block';

      // Reset output display
      elements.outputGif.style.display = 'none';
      elements.downloadContainer.innerHTML = '';

      // Get video dimensions when metadata is loaded
      elements.inputVideo.onloadedmetadata = () => {
        videoAspectRatio = elements.inputVideo.videoWidth / elements.inputVideo.videoHeight;
        
        // Set default width maintaining aspect ratio
        if (elements.width.value == 320) { // Only if it's still the default
          elements.width.value = Math.min(640, elements.inputVideo.videoWidth);
          updateHeight();
        }
        
        elements.processBtn.disabled = false;
      };

      // Update duration field based on video length
      elements.inputVideo.onloadeddata = () => {
        if (elements.duration.value == 5.0) { // Only if it's still the default
          const videoLength = elements.inputVideo.duration;
          // If video is short, use its full length, otherwise default to 5 seconds
          elements.duration.value = videoLength < 5 ? videoLength.toFixed(1) : 5.0;
        }
      };

      addLog(`Loaded video: ${file.name} (${formatFileSize(file.size)})`, 'info');
    }
  });

  // Helper function to update height based on width and aspect ratio
  function updateHeight() {
    if (elements.keepRatio.checked && elements.width.value) {
      elements.height.value = Math.round(elements.width.value / videoAspectRatio);
    }
  }
  
  // Helper function to update width based on height and aspect ratio
  function updateWidth() {
    if (elements.keepRatio.checked && elements.height.value) {
      elements.width.value = Math.round(elements.height.value * videoAspectRatio);
    }
  }

  // Handle dimension changes
  elements.width.addEventListener('input', updateHeight);
  elements.height.addEventListener('input', updateWidth);

  // Parse time input (like "1:30") to seconds
  function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    
    // If it's already a number, return it
    if (!isNaN(timeStr)) return parseFloat(timeStr);
    
    const parts = timeStr.split(':').map(part => parseFloat(part));
    
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] * 60 + parts[1]; // minutes:seconds
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hours:minutes:seconds
    
    return 0;
  }

  // Process video to GIF
  elements.processBtn.addEventListener('click', async () => {
    if (!selectedFile) {
      addLog('Please select a video file first', 'error');
      return;
    }

    const width = parseInt(elements.width.value) || 320;
    const height = parseInt(elements.height.value) || 240;
    const fps = parseInt(elements.fps.value) || 10;
    const quality = elements.quality.value;
    const startTime = parseTimeToSeconds(elements.startTime.value);
    const duration = parseFloat(elements.duration.value) || 5.0;

    // Validate inputs
    if (width <= 0 || height <= 0) {
      addLog('Please enter valid dimensions', 'error');
      return;
    }

    if (fps <= 0 || fps > 30) {
      addLog('FPS must be between 1 and 30', 'error');
      return;
    }

    try {
      elements.processBtn.disabled = true;
      elements.progress.style.display = 'block';
      elements.progress.querySelector('.progress-fill').style.width = '0%';
      elements.progress.querySelector('.progress-text').textContent = '0%';
      
      // Reset output display
      elements.outputGif.style.display = 'none';
      elements.downloadContainer.innerHTML = '';

      // Load FFmpeg if not already loaded
      const ffmpeg = await loadFFmpeg();

      const inputFileName = 'input' + getExtension(selectedFile.name);
      const paletteFileName = 'palette.png';
      const outputFileName = 'output.gif';

      addLog('Writing input file...', 'info');
      await writeInputFile(ffmpeg, inputFileName, selectedFile);
      updateGifProgress(20);

      // Base filter for scaling and fps
      const scaleFilter = `scale=${width}:${height}:flags=lanczos`;
      const fpsFilter = `fps=${fps}`;
      const baseFilters = `${fpsFilter},${scaleFilter}`;

      // Time arguments
      const timeArgs = [];
      if (startTime > 0) {
        timeArgs.push('-ss', startTime.toString());
      }
      if (duration > 0) {
        timeArgs.push('-t', duration.toString());
      }

      // Step 1: Generate color palette
      addLog('Generating palette...', 'info');
      await executeFFmpeg(ffmpeg, [
        ...timeArgs,
        '-i', inputFileName,
        '-vf', `${baseFilters},palettegen=stats_mode=diff`,
        '-y', paletteFileName
      ]);
      updateGifProgress(50);

      // Set quality-specific paletteuse options
      let paletteUseOptions;
      if (quality === 'high') {
        paletteUseOptions = 'dither=sierra2_4a:diff_mode=rectangle';
      } else if (quality === 'medium') {
        paletteUseOptions = 'dither=floyd_steinberg:diff_mode=rectangle';
      } else { // low quality
        paletteUseOptions = 'dither=bayer:bayer_scale=3:diff_mode=rectangle';
      }

      // Step 2: Create GIF with palette
      addLog(`Creating GIF (${width}x${height}, ${fps} fps)...`, 'info');
      await executeFFmpeg(ffmpeg, [
        ...timeArgs,
        '-i', inputFileName,
        '-i', paletteFileName,
        '-lavfi', `${baseFilters} [x]; [x][1:v] paletteuse=${paletteUseOptions}`,
        '-loop', '0',
        '-y', outputFileName
      ]);
      updateGifProgress(80);

      addLog('Reading output file...', 'info');
      const data = await readOutputFile(ffmpeg, outputFileName);
      
      // Check if the output has data
      if (!data || data.byteLength === 0) {
        throw new Error('Generated GIF is empty. Check video format or try different settings.');
      }
      
      const blob = new Blob([data], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);

      // Display the output GIF
      elements.outputGif.src = url;
      elements.outputGif.style.display = 'block';

      // Add download button with consistent styling
      elements.downloadContainer.innerHTML = `
        <a href="${url}" download="video_${width}x${height}.gif" class="btn">
          Download GIF
        </a>
        <div class="file-info active">
          <p>File Size: ${formatFileSize(blob.size)}</p>
          <p>Dimensions: ${width} × ${height} pixels</p>
          <p>Frame Rate: ${fps} fps</p>
        </div>
      `;

      addLog('Conversion complete!', 'success');
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      console.error('Processing error:', error);
      
      // Show more detailed error message in the UI
      elements.downloadContainer.innerHTML = `
        <div class="error-details">
          <p>Failed to create GIF: ${error.message}</p>
          <p>Try using different settings or a different video file.</p>
        </div>
      `;
    } finally {
      elements.processBtn.disabled = false;
      
      // Ensure progress is hidden but completed
      elements.progress.querySelector('.progress-fill').style.width = '100%';
      elements.progress.querySelector('.progress-text').textContent = '100%';
      setTimeout(() => {
        elements.progress.style.display = 'none';
      }, 500);
    }
  });

  // Initialize log toggle
  showLogs();
} 