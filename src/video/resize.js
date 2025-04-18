/**
 * Video resize module using FFmpeg WASM
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { addLog, formatFileSize, updateProgress, showLogs } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, readOutputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';

let inputVideo = null;
let aspectRatio = 1;

/**
 * Initialize the video resize tool
 */
export async function initTool() {
  const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    inputVideo: document.getElementById('input-video'),
    outputVideo: document.getElementById('output-video'),
    processBtn: document.getElementById('processBtn'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    keepRatio: document.getElementById('keepRatio'),
    progress: document.getElementById('progress'),
    downloadContainer: document.getElementById('downloadContainer')
  };

  // Handle file selection
  function handleFile(file) {
    if (!file.type.startsWith('video/')) {
      addLog('Please select a video file', 'error');
      return;
    }

    inputVideo = file;
    const url = URL.createObjectURL(file);
    elements.inputVideo.src = url;
    elements.inputVideo.style.display = 'block';
    elements.dropZone.style.display = 'none';

    // Get video dimensions when metadata is loaded
    elements.inputVideo.onloadedmetadata = () => {
      aspectRatio = elements.inputVideo.videoWidth / elements.inputVideo.videoHeight;
      elements.width.value = elements.inputVideo.videoWidth;
      elements.height.value = elements.inputVideo.videoHeight;
      elements.processBtn.disabled = false;
    };

    addLog(`Loaded video: ${file.name} (${formatFileSize(file.size)})`, 'info');
  }

  // Set up drag and drop
  elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('dragover');
  });

  elements.dropZone.addEventListener('dragleave', () => {
    elements.dropZone.classList.remove('dragover');
  });

  elements.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  // Handle file input click
  elements.dropZone.addEventListener('click', () => {
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // Handle dimension changes
  elements.width.addEventListener('input', () => {
    if (elements.keepRatio.checked && elements.width.value) {
      elements.height.value = Math.round(elements.width.value / aspectRatio);
    }
  });

  elements.height.addEventListener('input', () => {
    if (elements.keepRatio.checked && elements.height.value) {
      elements.width.value = Math.round(elements.height.value * aspectRatio);
    }
  });

  // Process video
  elements.processBtn.addEventListener('click', async () => {
    if (!inputVideo) {
      addLog('Please select a video file first', 'error');
      return;
    }

    const width = parseInt(elements.width.value);
    const height = parseInt(elements.height.value);

    if (!width || !height || width <= 0 || height <= 0) {
      addLog('Please enter valid dimensions', 'error');
      return;
    }

    try {
      elements.processBtn.disabled = true;
      elements.progress.style.display = 'block';

      // Load FFmpeg if not already loaded
      const ffmpeg = await loadFFmpeg();

      const inputFileName = 'input' + getExtension(inputVideo.name);
      const outputFileName = 'output.mp4';

      addLog('Writing input file...', 'info');
      await writeInputFile(ffmpeg, inputFileName, inputVideo);

      addLog(`Resizing to ${width}x${height}...`, 'info');
      await executeFFmpeg(ffmpeg, [
        '-i', inputFileName,
        '-vf', `scale=${width}:${height}`,
        '-c:a', 'copy',
        outputFileName
      ]);

      addLog('Reading output file...', 'info');
      const data = await readOutputFile(ffmpeg, outputFileName);
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      elements.outputVideo.src = url;
      elements.outputVideo.style.display = 'block';

      // Add download button
      elements.downloadContainer.innerHTML = `
        <a href="${url}" download="resized_video.mp4" class="btn">
          Download Resized Video
        </a>
      `;

      addLog('Processing complete!', 'success');
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      console.error('Processing error:', error);
    } finally {
      elements.processBtn.disabled = false;
      elements.progress.style.display = 'none';
    }
  });

  // Initialize log toggle
  showLogs();
} 