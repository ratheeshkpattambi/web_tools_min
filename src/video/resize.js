/**
 * Video resizing module using FFmpeg WASM
 */
import { Tool } from '../common/base.js';
import { formatFileSize } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, readOutputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';

// Video resize tool template
export const template = `
    <div class="tool-container">
      <h1>Video Resize</h1>
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
          <label for="width">Width:</label>
          <input type="number" id="width" placeholder="Width">
        </div>
        <div class="input-group">
          <label for="height">Height:</label>
          <input type="number" id="height" placeholder="Height">
        </div>
        <div class="input-group">
          <label for="keepRatio">
            <input type="checkbox" id="keepRatio" checked>
            Keep Aspect Ratio
          </label>
        </div>
        <button id="processBtn" class="btn" disabled>Resize Video</button>
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

class VideoResizeTool extends Tool {
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
    this.videoAspectRatio = 1;
    this.originalWidth = 0;
    this.originalHeight = 0;
  }

  getElementsMap() {
    return {
      dropZone: 'dropZone',
      fileInput: 'fileInput',
      inputVideo: 'input-video',
      outputVideo: 'output-video',
      processBtn: 'processBtn',
      width: 'width',
      height: 'height',
      keepRatio: 'keepRatio',
      quality: 'quality',
      progress: 'progress',
      downloadContainer: 'downloadContainer',
      logHeader: 'logHeader',
      logContent: 'logContent'
    };
  }

  async setup() {
    // Disable inputs until video is loaded
    if (this.elements.width) this.elements.width.disabled = true;
    if (this.elements.height) this.elements.height.disabled = true;
    if (this.elements.keepRatio) this.elements.keepRatio.checked = true;
    if (this.elements.processBtn) this.elements.processBtn.disabled = true;

    this.initFileUpload({
      acceptTypes: 'video/*',
      onFileSelected: (file) => {
        this.displayPreview(file, 'inputVideo');
        this.log(`Loaded video: ${file.name} (${formatFileSize(file.size)})`, 'info');
        
        // Get video dimensions when metadata is loaded
        if (this.elements.inputVideo) {
          this.elements.inputVideo.onloadedmetadata = () => {
            this.originalWidth = this.elements.inputVideo.videoWidth;
            this.originalHeight = this.elements.inputVideo.videoHeight;
            this.videoAspectRatio = this.originalWidth / this.originalHeight;
            
            // Enable inputs and set initial values
            this.elements.width.disabled = false;
            this.elements.height.disabled = false;
            this.elements.keepRatio.disabled = false;
            this.elements.processBtn.disabled = false;
            
            // Set initial values to original dimensions
            this.elements.width.value = this.originalWidth;
            this.elements.height.value = this.originalHeight;
            
            // Set placeholders
            this.elements.width.placeholder = 'Width';
            this.elements.height.placeholder = 'Height';
          };
        }
      }
    });

    // Handle dimension changes
    if (this.elements.width) {
      this.elements.width.addEventListener('input', () => {
        if (this.elements.keepRatio && this.elements.keepRatio.checked) {
          this.updateHeight();
        }
      });
    }
    
    if (this.elements.height) {
      this.elements.height.addEventListener('input', () => {
        if (this.elements.keepRatio && this.elements.keepRatio.checked) {
          this.updateWidth();
        }
      });
    }
  }

  updateHeight() {
    if (!this.elements.width || !this.elements.height) return;
    
    const width = parseInt(this.elements.width.value) || 0;
    if (width <= 0) return;

    this.elements.height.value = Math.round(width / this.videoAspectRatio);
  }

  updateWidth() {
    if (!this.elements.width || !this.elements.height) return;
    
    const height = parseInt(this.elements.height.value) || 0;
    if (height <= 0) return;

    this.elements.width.value = Math.round(height * this.videoAspectRatio);
  }

  calculateDimensions() {
    if (!this.elements.width || !this.elements.height) return { width: 0, height: 0 };
    
    const width = parseInt(this.elements.width.value) || this.originalWidth;
    const height = parseInt(this.elements.height.value) || this.originalHeight;

    return { width, height };
  }

  async processFile(file) {
    try {
      this.startProcessing();
      this.updateProgress(10);

      const dimensions = this.calculateDimensions();
      const { width, height } = dimensions;
      const quality = this.elements.quality ? this.elements.quality.value : 'medium';

      if (width <= 0 || height <= 0) {
        this.log('Please enter valid dimensions', 'error');
        this.endProcessing(false);
        return;
      }

      this.log(`Resizing to ${width}x${height} pixels...`, 'info');

      this.ffmpeg = await loadFFmpeg();
      this.updateProgress(20);

      const inputFileName = 'input' + getExtension(file.name);
      const outputFileName = 'output' + getExtension(file.name);

      this.log('Writing input file...', 'info');
      await writeInputFile(this.ffmpeg, inputFileName, file);
      this.updateProgress(30);

      const scaleFilter = `scale=${width}:${height}:flags=lanczos`;
      const qualityArgs = quality === 'high' ? ['-crf', '18'] :
                         quality === 'medium' ? ['-crf', '23'] :
                         ['-crf', '28'];

      await executeFFmpeg(this.ffmpeg, [
        '-i', inputFileName,
        '-vf', scaleFilter,
        ...qualityArgs,
        '-preset', 'medium',
        '-y', outputFileName
      ]);
      this.updateProgress(80);

      this.log('Reading output file...', 'info');
      const data = await readOutputFile(this.ffmpeg, outputFileName);
      
      if (!data || data.byteLength === 0) {
        throw new Error('Generated video is empty. Check video format or try different settings.');
      }
      
      const blob = new Blob([data], { type: file.type });
      this.displayOutputMedia(blob, 'outputVideo', `video_${width}x${height}${getExtension(file.name)}`, 'downloadContainer');
      
      this.updateProgress(100);
      this.log('Resizing complete!', 'success');
      this.endProcessing();
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      console.error('Processing error:', error);
      this.endProcessing(false);
    }
  }
}

export function initTool() {
  const tool = new VideoResizeTool({
    id: 'resize',
    name: 'Video Resize'
  });
  
  return tool.init();
} 