/**
 * Video trimming module using FFmpeg WASM
 */
import { Tool } from '../common/base.js';
import { formatFileSize, formatTime } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, readOutputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';

// Video trim tool template
export const template = `
    <div class="tool-container">
      <h1>Video Trimmer</h1>
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
        <div class="slider-container">
          <div id="trim-slider" class="trim-slider">
            <div class="slider-handle start-handle"></div>
            <div class="slider-range"></div>
            <div class="slider-handle end-handle"></div>
          </div>
        </div>
        <div class="input-group time-range">
          <div class="range-inputs">
            <div>
              <label for="startTime">Start Time:</label>
              <input type="text" id="startTime" placeholder="0:00">
            </div>
            <div>
              <label for="endTime">End Time:</label>
              <input type="text" id="endTime" placeholder="0:00">
            </div>
          </div>
        </div>
        <button id="processBtn" class="btn" disabled>Trim Video</button>
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

class VideoTrimTool extends Tool {
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
    this.videoDuration = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.isDragging = false;
    this.activeDragHandle = null;
  }

  getElementsMap() {
    return {
      dropZone: 'dropZone',
      fileInput: 'fileInput',
      inputVideo: 'input-video',
      outputVideo: 'output-video',
      processBtn: 'processBtn',
      startTime: 'startTime',
      endTime: 'endTime',
      trimSlider: 'trim-slider',
      progress: 'progress',
      downloadContainer: 'downloadContainer',
      logHeader: 'logHeader',
      logContent: 'logContent'
    };
  }

  async setup() {
    // Disable inputs until video is loaded
    if (this.elements.startTime) this.elements.startTime.disabled = true;
    if (this.elements.endTime) this.elements.endTime.disabled = true;
    if (this.elements.processBtn) this.elements.processBtn.disabled = true;

    this.initFileUpload({
      acceptTypes: 'video/*',
      onFileSelected: (file) => {
        this.displayPreview(file, 'inputVideo');
        this.log(`Loaded video: ${file.name} (${formatFileSize(file.size)})`, 'info');
        
        // Get video duration when metadata is loaded
        if (this.elements.inputVideo) {
          this.elements.inputVideo.onloadedmetadata = () => {
            this.videoDuration = this.elements.inputVideo.duration;
            
            // Enable inputs
            this.elements.startTime.disabled = false;
            this.elements.endTime.disabled = false;
            this.elements.processBtn.disabled = false;
            
            // Set initial values
            this.startTime = 0;
            this.endTime = this.videoDuration;
            this.elements.startTime.value = formatTime(this.startTime);
            this.elements.endTime.value = formatTime(this.endTime);
            
            // Initialize the slider
            this.initSlider();
          };
        }
      }
    });

    // Handle manual time input
    if (this.elements.startTime) {
      this.elements.startTime.addEventListener('change', () => {
        this.updateStartTimeFromInput();
      });
    }
    
    if (this.elements.endTime) {
      this.elements.endTime.addEventListener('change', () => {
        this.updateEndTimeFromInput();
      });
    }
  }

  initSlider() {
    const slider = this.elements.trimSlider;
    if (!slider) return;
    
    // Get slider handles
    const startHandle = slider.querySelector('.start-handle');
    const endHandle = slider.querySelector('.end-handle');
    const sliderRange = slider.querySelector('.slider-range');
    
    if (!startHandle || !endHandle || !sliderRange) return;
    
    // Set initial positions
    this.updateSliderHandles();
    
    // Add event listeners for dragging
    startHandle.addEventListener('mousedown', (e) => {
      this.startDrag(e, 'start');
    });
    
    endHandle.addEventListener('mousedown', (e) => {
      this.startDrag(e, 'end');
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.dragHandle(e);
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.stopDrag();
    });
    
    // Add click event on slider to set position
    slider.addEventListener('click', (e) => {
      if (e.target === slider || e.target === sliderRange) {
        this.handleSliderClick(e);
      }
    });
  }
  
  startDrag(e, handle) {
    e.preventDefault();
    this.isDragging = true;
    this.activeDragHandle = handle;
  }
  
  dragHandle(e) {
    if (!this.isDragging || !this.elements.trimSlider) return;
    
    const slider = this.elements.trimSlider;
    const rect = slider.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    const timePosition = clampedPosition * this.videoDuration;
    
    if (this.activeDragHandle === 'start') {
      this.startTime = Math.min(timePosition, this.endTime - 0.1);
      this.elements.startTime.value = formatTime(this.startTime);
    } else {
      this.endTime = Math.max(timePosition, this.startTime + 0.1);
      this.elements.endTime.value = formatTime(this.endTime);
    }
    
    this.updateSliderHandles();
  }
  
  stopDrag() {
    this.isDragging = false;
    this.activeDragHandle = null;
  }
  
  handleSliderClick(e) {
    const slider = this.elements.trimSlider;
    const rect = slider.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const timePosition = position * this.videoDuration;
    
    // Determine which handle to move (closest)
    const startDistance = Math.abs(timePosition - this.startTime);
    const endDistance = Math.abs(timePosition - this.endTime);
    
    if (startDistance < endDistance) {
      this.startTime = timePosition;
      this.elements.startTime.value = formatTime(this.startTime);
    } else {
      this.endTime = timePosition;
      this.elements.endTime.value = formatTime(this.endTime);
    }
    
    this.updateSliderHandles();
  }
  
  updateSliderHandles() {
    const slider = this.elements.trimSlider;
    if (!slider) return;
    
    const startHandle = slider.querySelector('.start-handle');
    const endHandle = slider.querySelector('.end-handle');
    const sliderRange = slider.querySelector('.slider-range');
    
    if (!startHandle || !endHandle || !sliderRange) return;
    
    const startPos = (this.startTime / this.videoDuration) * 100;
    const endPos = (this.endTime / this.videoDuration) * 100;
    
    startHandle.style.left = `${startPos}%`;
    endHandle.style.left = `${endPos}%`;
    sliderRange.style.left = `${startPos}%`;
    sliderRange.style.right = `${100 - endPos}%`;
  }
  
  updateStartTimeFromInput() {
    const timeStr = this.elements.startTime.value;
    const time = this.parseTimeInput(timeStr);
    
    if (time !== null && time < this.endTime) {
      this.startTime = time;
    } else {
      // Revert to valid value
      this.elements.startTime.value = formatTime(this.startTime);
    }
    
    this.updateSliderHandles();
  }
  
  updateEndTimeFromInput() {
    const timeStr = this.elements.endTime.value;
    const time = this.parseTimeInput(timeStr);
    
    if (time !== null && time > this.startTime && time <= this.videoDuration) {
      this.endTime = time;
    } else {
      // Revert to valid value
      this.elements.endTime.value = formatTime(this.endTime);
    }
    
    this.updateSliderHandles();
  }
  
  parseTimeInput(timeStr) {
    // Accept formats like "1:30" or "90.5"
    let time = null;
    
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        const minutes = parseFloat(parts[0]);
        const seconds = parseFloat(parts[1]);
        if (!isNaN(minutes) && !isNaN(seconds)) {
          time = minutes * 60 + seconds;
        }
      }
    } else {
      time = parseFloat(timeStr);
      if (isNaN(time)) {
        time = null;
      }
    }
    
    return time;
  }

  async processFile(file) {
    try {
      this.startProcessing();
      this.updateProgress(10);

      const duration = this.endTime - this.startTime;
      if (duration <= 0) {
        this.log('Please set valid start and end times', 'error');
        this.endProcessing(false);
        return;
      }

      this.log(`Trimming video from ${formatTime(this.startTime)} to ${formatTime(this.endTime)}...`, 'info');

      this.ffmpeg = await loadFFmpeg();
      this.updateProgress(20);

      const inputFileName = 'input' + getExtension(file.name);
      const outputFileName = 'output' + getExtension(file.name);

      this.log('Writing input file...', 'info');
      await writeInputFile(this.ffmpeg, inputFileName, file);
      this.updateProgress(30);

      this.log('Processing...', 'info');
      await executeFFmpeg(this.ffmpeg, [
        '-ss', this.startTime.toString(),
        '-i', inputFileName,
        '-t', duration.toString(),
        '-c', 'copy',
        '-y', outputFileName
      ]);
      this.updateProgress(80);

      this.log('Reading output file...', 'info');
      const data = await readOutputFile(this.ffmpeg, outputFileName);
      
      if (!data || data.byteLength === 0) {
        throw new Error('Generated video is empty. Check video format or try different settings.');
      }
      
      const blob = new Blob([data], { type: file.type });
      this.displayOutputMedia(blob, 'outputVideo', `trimmed_video${getExtension(file.name)}`, 'downloadContainer');
      
      this.updateProgress(100);
      this.log('Trimming complete!', 'success');
      this.endProcessing();
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      console.error('Processing error:', error);
      this.endProcessing(false);
    }
  }
}

export function initTool() {
  const tool = new VideoTrimTool({
    id: 'trim',
    name: 'Video Trimmer'
  });
  
  return tool.init();
} 