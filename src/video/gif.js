/**
 * Video to GIF conversion module using FFmpeg WASM
 */
import { Tool } from '../common/base.js';
import { formatFileSize } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, readOutputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';

class VideoGifTool extends Tool {
  constructor(config = {}) {
    super({
      ...config,
      category: 'video',
      needsFileUpload: true,
      hasOutput: true,
      needsProcessButton: true
    });
    
    this.ffmpeg = null;
    this.videoAspectRatio = 1;
  }

  getElementsMap() {
    return {
      dropZone: 'dropZone',
      fileInput: 'fileInput',
      inputVideo: 'input-video',
      outputGif: 'output-gif',
      processBtn: 'processBtn',
      width: 'width',
      height: 'height',
      keepRatio: 'keepRatio',
      fps: 'fps',
      quality: 'quality',
      startTime: 'startTime',
      duration: 'duration',
      progress: 'progress',
      downloadContainer: 'downloadContainer'
    };
  }

  async setup() {
    this.initFileUpload({
      acceptTypes: 'video/*',
      onFileSelected: (file) => {
        this.displayPreview(file, 'inputVideo');
        this.log(`Loaded video: ${file.name} (${formatFileSize(file.size)})`, 'info');
        
        // Get video dimensions when metadata is loaded
        this.elements.inputVideo.onloadedmetadata = () => {
          this.videoAspectRatio = this.elements.inputVideo.videoWidth / this.elements.inputVideo.videoHeight;
          
          // Set default width maintaining aspect ratio
          if (this.elements.width.value == 320) {
            this.elements.width.value = Math.min(640, this.elements.inputVideo.videoWidth);
            this.updateHeight();
          }
        };
        
        // Update duration field based on video length
        this.elements.inputVideo.onloadeddata = () => {
          if (this.elements.duration.value == 5.0) {
            const videoLength = this.elements.inputVideo.duration;
            this.elements.duration.value = videoLength < 5 ? videoLength.toFixed(1) : 5.0;
          }
        };
      }
    });

    // Handle dimension changes
    this.elements.width.addEventListener('input', () => this.updateHeight());
    this.elements.height.addEventListener('input', () => this.updateWidth());
  }

  updateHeight() {
    if (this.elements.keepRatio.checked && this.elements.width.value) {
      this.elements.height.value = Math.round(this.elements.width.value / this.videoAspectRatio);
    }
  }

  updateWidth() {
    if (this.elements.keepRatio.checked && this.elements.height.value) {
      this.elements.width.value = Math.round(this.elements.height.value * this.videoAspectRatio);
    }
  }

  parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    if (!isNaN(timeStr)) return parseFloat(timeStr);
    
    const parts = timeStr.split(':').map(part => parseFloat(part));
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  async processFile(file) {
    try {
      this.startProcessing();
      this.updateProgress(10);

      const width = parseInt(this.elements.width.value) || 320;
      const height = parseInt(this.elements.height.value) || 240;
      const fps = parseInt(this.elements.fps.value) || 10;
      const quality = this.elements.quality.value;
      const startTime = this.parseTimeToSeconds(this.elements.startTime.value);
      const duration = parseFloat(this.elements.duration.value) || 5.0;

      if (width <= 0 || height <= 0) {
        this.log('Please enter valid dimensions', 'error');
        this.endProcessing(false);
        return;
      }

      if (fps <= 0 || fps > 30) {
        this.log('FPS must be between 1 and 30', 'error');
        this.endProcessing(false);
        return;
      }

      this.ffmpeg = await loadFFmpeg();
      this.updateProgress(20);

      const inputFileName = 'input' + getExtension(file.name);
      const paletteFileName = 'palette.png';
      const outputFileName = 'output.gif';

      this.log('Writing input file...', 'info');
      await writeInputFile(this.ffmpeg, inputFileName, file);
      this.updateProgress(30);

      const scaleFilter = `scale=${width}:${height}:flags=lanczos`;
      const fpsFilter = `fps=${fps}`;
      const baseFilters = `${fpsFilter},${scaleFilter}`;

      const timeArgs = [];
      if (startTime > 0) timeArgs.push('-ss', startTime.toString());
      if (duration > 0) timeArgs.push('-t', duration.toString());

      this.log('Generating palette...', 'info');
      await executeFFmpeg(this.ffmpeg, [
        ...timeArgs,
        '-i', inputFileName,
        '-vf', `${baseFilters},palettegen=stats_mode=diff`,
        '-y', paletteFileName
      ]);
      this.updateProgress(60);

      const paletteUseOptions = quality === 'high' ? 'dither=sierra2_4a:diff_mode=rectangle' :
                               quality === 'medium' ? 'dither=floyd_steinberg:diff_mode=rectangle' :
                               'dither=bayer:bayer_scale=3:diff_mode=rectangle';

      this.log(`Creating GIF (${width}x${height}, ${fps} fps)...`, 'info');
      await executeFFmpeg(this.ffmpeg, [
        ...timeArgs,
        '-i', inputFileName,
        '-i', paletteFileName,
        '-lavfi', `${baseFilters} [x]; [x][1:v] paletteuse=${paletteUseOptions}`,
        '-loop', '0',
        '-y', outputFileName
      ]);
      this.updateProgress(80);

      this.log('Reading output file...', 'info');
      const data = await readOutputFile(this.ffmpeg, outputFileName);
      
      if (!data || data.byteLength === 0) {
        throw new Error('Generated GIF is empty. Check video format or try different settings.');
      }
      
      const blob = new Blob([data], { type: 'image/gif' });
      this.displayOutputMedia(blob, 'outputGif', `video_${width}x${height}.gif`);
      
      this.updateProgress(100);
      this.log('Conversion complete!', 'success');
      this.endProcessing();
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      console.error('Processing error:', error);
      this.endProcessing(false);
    }
  }
}

export function initTool() {
  const tool = new VideoGifTool({
    id: 'gif',
    name: 'Video to GIF'
  });
  
  return tool.init();
} 