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
      <div id="dropZone" class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
        <div class="text-5xl text-slate-400 dark:text-gray-500 mb-3">🎬</div>
        <p class="text-slate-600 dark:text-slate-300 text-lg mb-1">Drop your video here or click to select</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Supports MP4, WebM, MOV, and other common video formats</p>
        <input type="file" id="fileInput" class="hidden" accept="video/*">
        <button class="file-select-btn px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium">Select File</button>
      </div>
      <div class="video-wrapper">
        <video id="input-video" controls style="display: none; max-width: 100%; height: auto;"></video>
      </div>
      
      <div class="my-4 grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label for="width" class="font-medium text-slate-700 dark:text-slate-300">Width:</label>
          <input type="number" id="width" placeholder="Width" class="p-2 border border-slate-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
        </div>
        <div class="flex flex-col gap-2">
          <label for="height" class="font-medium text-slate-700 dark:text-slate-300">Height:</label>
          <input type="number" id="height" placeholder="Height" class="p-2 border border-slate-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
        </div>
        <div class="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" id="keepRatio" checked class="h-4 w-4 rounded border-slate-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700">
          <label for="keepRatio" class="text-sm text-slate-700 dark:text-slate-300">Keep Aspect Ratio</label>
        </div>
        <button id="processBtn" class="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors md:col-span-2" disabled>Resize Video</button>
      </div>

      <div id="progress" class="my-4 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden transition-colors" style="display: none;">
        <div class="h-5 bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-in-out" style="width: 0%;"></div>
        <div class="text-center text-xs font-medium text-slate-700 dark:text-slate-300 -mt-4 leading-5">0%</div>
      </div>

      <div id="outputContainer" class="output-container">
        <div class="video-wrapper">
          <video id="output-video" controls style="display: none; max-width: 100%; height: auto;"></video>
        </div>
        <div id="downloadContainer"></div>
      </div>

      <div id="logHeader" class="mt-6 bg-slate-100 dark:bg-gray-700 p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-colors">
        <span class="font-medium text-slate-700 dark:text-slate-300">Logs</span>
        <span id="logToggle" class="text-slate-500 dark:text-slate-400 transform transition-transform">▼</span>
      </div>
      <textarea id="logContent" class="w-full h-48 p-4 rounded-b-md mt-px font-mono text-xs resize-none bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 border-0 focus:outline-none transition-colors" readonly placeholder="Logs will appear here..."></textarea>
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