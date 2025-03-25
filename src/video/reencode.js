/**
 * Video re-encode module using FFmpeg WASM
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { addLog, formatFileSize, updateProgress, showLogs } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, readOutputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';

let inputVideo = null;

/**
 * Initialize the video re-encode tool
 */
export async function initTool() {
  const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    inputVideo: document.getElementById('input-video'),
    outputVideo: document.getElementById('output-video'),
    processBtn: document.getElementById('processBtn'),
    format: document.getElementById('format'),
    quality: document.getElementById('quality'),
    bitrate: document.getElementById('bitrate'),
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
    elements.processBtn.disabled = false;

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

  // Process video
  elements.processBtn.addEventListener('click', async () => {
    if (!inputVideo) {
      addLog('Please select a video file first', 'error');
      return;
    }

    const format = elements.format.value;
    const quality = elements.quality.value;
    const bitrate = parseInt(elements.bitrate.value);

    if (!bitrate || bitrate < 500) {
      addLog('Please enter a valid bitrate (minimum 500kb/s)', 'error');
      return;
    }

    try {
      elements.processBtn.disabled = true;
      elements.progress.style.display = 'block';

      // Load FFmpeg if not already loaded
      const ffmpeg = await loadFFmpeg();

      const inputFileName = 'input' + getExtension(inputVideo.name);
      const outputFileName = `output.${format}`;

      addLog('Writing input file...', 'info');
      await writeInputFile(ffmpeg, inputFileName, inputVideo);

      // Build FFmpeg command based on format and quality
      const ffmpegArgs = ['-i', inputFileName];

      if (format === 'mp4') {
        ffmpegArgs.push(
          '-c:v', 'libx264',
          '-preset', quality === 'high' ? 'slow' : quality === 'medium' ? 'medium' : 'fast',
          '-crf', quality === 'high' ? '18' : quality === 'medium' ? '23' : '28',
          '-c:a', 'aac',
          '-b:a', '128k'
        );
      } else if (format === 'webm') {
        ffmpegArgs.push(
          '-c:v', 'libvpx-vp9',
          '-b:v', `${bitrate}k`,
          '-deadline', quality === 'high' ? 'best' : quality === 'medium' ? 'good' : 'realtime',
          '-c:a', 'libopus'
        );
      } else if (format === 'mov') {
        ffmpegArgs.push(
          '-c:v', 'libx264',
          '-preset', quality === 'high' ? 'slow' : quality === 'medium' ? 'medium' : 'fast',
          '-crf', quality === 'high' ? '18' : quality === 'medium' ? '23' : '28',
          '-c:a', 'aac',
          '-b:a', '128k'
        );
      }

      ffmpegArgs.push(outputFileName);

      addLog(`Re-encoding video to ${format.toUpperCase()}...`, 'info');
      await executeFFmpeg(ffmpeg, ffmpegArgs);

      addLog('Reading output file...', 'info');
      const data = await readOutputFile(ffmpeg, outputFileName);
      const blob = new Blob([data], { type: `video/${format}` });
      const url = URL.createObjectURL(blob);

      elements.outputVideo.src = url;
      elements.outputVideo.style.display = 'block';

      // Add download button
      elements.downloadContainer.innerHTML = `
        <a href="${url}" download="reencoded_video.${format}" class="btn">
          Download Re-encoded Video
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