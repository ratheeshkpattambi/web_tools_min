/**
 * Video re-encode module using FFmpeg WASM
 */
import { Tool } from '../common/base.js';
import { formatFileSize } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, readOutputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';

// Video reencode tool template
export const template = `
    <div class="tool-container">
      <h1>Video Re-encode</h1>
      <div id="dropZone" class="drop-zone">
        <div class="drop-icon">📁</div>
        <p>Drop video here</p>
        <p class="drop-subtitle">or</p>
        <button type="button" class="file-select-btn">Select Video</button>
        <input type="file" id="fileInput" accept="video/*" style="display: none;">
      </div>
      <div class="video-wrapper">
        <video id="input-video" controls style="display: none; max-width: 100%; height: auto;"></video>
      </div>
      
      <div class="controls">
        <div class="input-group">
          <label for="format">Format:</label>
          <select id="format">
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mov">MOV</option>
          </select>
        </div>
        <div class="input-group">
          <label for="quality">Quality:</label>
          <select id="quality">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div class="input-group">
          <label for="bitrate">Bitrate (kb/s):</label>
          <input type="number" id="bitrate" value="2000" min="500">
        </div>
        <button id="processBtn" class="btn" disabled>Re-encode Video</button>
      </div>

      <div id="progress" class="progress" style="display: none;">
        <div class="progress-fill"></div>
        <div class="progress-text">0%</div>
      </div>

      <div id="outputContainer" class="output-container">
        <div class="video-wrapper">
          <video id="output-video" controls style="display: none; max-width: 100%; height: auto;"></video>
        </div>
        <div id="downloadContainer"></div>
      </div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
`;

class VideoReencodeTool extends Tool {
  constructor(config = {}) {
    super({
      ...config,
      category: 'video',
      needsFileUpload: true,
      hasOutput: true,
      needsProcessButton: true,
      template // Use the local template
    });
    
    this.ffmpeg = null;
    this.outputContainer = null;
  }

  getElementsMap() {
    return {
      dropZone: 'dropZone',
      fileInput: 'fileInput',
      inputVideo: 'input-video',
      outputVideo: 'output-video',
      processBtn: 'processBtn',
      format: 'format',
      quality: 'quality',
      bitrate: 'bitrate',
      progress: 'progress',
      outputContainer: 'outputContainer',
      downloadContainer: 'downloadContainer',
      logHeader: 'logHeader',
      logContent: 'logContent'
    };
  }

  async setup() {
    // Ensure logs are at the bottom
    this.ensureProperDOMOrder();
    
    this.initFileUpload({
      acceptTypes: 'video/*',
      onFileSelected: (file) => {
        this.displayPreview(file, 'inputVideo');
        this.log(`Loaded video: ${file.name} (${formatFileSize(file.size)})`, 'info');
      }
    });
  }
  
  /**
   * Ensure DOM elements are in the correct order
   */
  ensureProperDOMOrder() {
    // Find the container of log elements
    const logHeader = document.getElementById('logHeader');
    const logContent = document.getElementById('logContent');
    
    if (logHeader && logContent) {
      // Get the parent container
      const container = logHeader.closest('.tool-container');
      
      if (container) {
        // Move logs to the end
        container.appendChild(logHeader);
        container.appendChild(logContent);
      }
    }
  }

  async processFile(file) {
    try {
      this.startProcessing();
      this.updateProgress(10);

      const format = this.elements.format.value;
      const quality = this.elements.quality.value;
      const bitrate = parseInt(this.elements.bitrate.value);

      if (!bitrate || bitrate < 500) {
        this.log('Please enter a valid bitrate (minimum 500kb/s)', 'error');
        this.endProcessing(false);
        return;
      }

      this.ffmpeg = await loadFFmpeg();
      this.updateProgress(30);

      const inputFileName = 'input' + getExtension(file.name);
      const outputFileName = `output.${format}`;

      this.log('Writing input file...', 'info');
      await writeInputFile(this.ffmpeg, inputFileName, file);
      this.updateProgress(50);

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

      this.log(`Re-encoding video to ${format.toUpperCase()}...`, 'info');
      await executeFFmpeg(this.ffmpeg, ffmpegArgs);
      this.updateProgress(80);

      this.log('Reading output file...', 'info');
      const data = await readOutputFile(this.ffmpeg, outputFileName);
      const blob = new Blob([data], { type: `video/${format}` });
      this.updateProgress(90);
      
      // Display output media and create download link using base helper
      this.displayOutputMedia(blob, 'outputVideo', `reencoded_video.${format}`, 'downloadContainer');
      
      this.updateProgress(100);
      this.log('Processing complete!', 'success');
      this.endProcessing();
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      console.error('Processing error:', error);
      this.endProcessing(false);
    }
  }
}

/**
 * Initialize the video re-encode tool
 */
export function initTool() {
  const tool = new VideoReencodeTool({
    id: 'reencode',
    name: 'Video Re-encode'
  });
  
  return tool.init();
} 