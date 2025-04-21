/**
 * Video info tool using FFmpeg
 */
import { Tool } from '../common/base.js';
import { loadFFmpeg, writeInputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';
import { formatFileSize } from '../common/utils.js';

class VideoInfoTool extends Tool {
  constructor(config = {}) {
    super({
      ...config,
      category: 'video',
      needsFileUpload: true,
      hasOutput: false,
      needsProcessButton: false
    });
    
    this.ffmpeg = null;
  }

  getElementsMap() {
    return {
      dropZone: 'videoDropZone',
      fileInput: 'videoFileInput',
      inputVideo: 'video-preview',
      infoContainer: 'videoInfoContainer',
      progress: 'videoProgress'
    };
  }

  async setup() {
    this.initFileUpload({
      acceptTypes: 'video/*',
      onFileSelected: (file) => {
        this.displayPreview(file, 'inputVideo');
        this.displayBasicInfo(file);
        this.processFile(file);
      }
    });
  }

  displayBasicInfo(file) {
    const basicInfo = document.createElement('div');
    basicInfo.className = 'info-section';
    basicInfo.innerHTML = `
      <h3>Basic Info</h3>
      <table class="info-table">
        <tr>
          <td>Filename:</td>
          <td>${file.name}</td>
        </tr>
        <tr>
          <td>Size:</td>
          <td>${formatFileSize(file.size)}</td>
        </tr>
        <tr>
          <td>Type:</td>
          <td>${file.type}</td>
        </tr>
      </table>
    `;
    this.elements.infoContainer.innerHTML = '';
    this.elements.infoContainer.appendChild(basicInfo);
    this.elements.infoContainer.style.display = 'block';
  }

  async processFile(file) {
    try {
      this.startProcessing();
      this.updateProgress(10);

      this.ffmpeg = await loadFFmpeg();
      this.updateProgress(30);

      const inputFileName = 'input' + getExtension(file.name);
      await writeInputFile(this.ffmpeg, inputFileName, file);
      this.updateProgress(50);

      const ffmpegLogs = [];
      
      this.ffmpeg.on('log', ({ message }) => {
        ffmpegLogs.push(message);
        
        if (message.includes('Stream') || 
            message.includes('Duration') || 
            message.includes('Video:') || 
            message.includes('Audio:') ||
            message.includes('Input #0')) {
          this.log(message, 'info');
        }
      });

      await executeFFmpeg(this.ffmpeg, ['-i', inputFileName]);
      
      await this.ffmpeg.exec([
        '-i', inputFileName,
        '-vframes', '1',
        '-f', 'null',
        '-'
      ]);
      
      this.updateProgress(80);

      const videoInfo = this.extractVideoInfo(this.elements.inputVideo, ffmpegLogs);
      const audioInfo = this.extractAudioInfo(ffmpegLogs);
      
      this.displayVideoInfo(videoInfo, audioInfo);
      
      this.updateProgress(100);
      this.endProcessing();
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      console.error('Analysis error:', error);
      this.endProcessing(false);
    }
  }

  extractVideoInfo(videoEl, logs) {
    const videoInfo = {
      width: videoEl.videoWidth || this.extractFromLogs(logs, /(\d+)x\d+/, 1),
      height: videoEl.videoHeight || this.extractFromLogs(logs, /\d+x(\d+)/, 1),
      duration: this.formatDuration(videoEl.duration) || this.extractFromLogs(logs, /Duration:\s*([^,]+)/, 1)
    };
    
    if (videoInfo.width && videoInfo.height) {
      videoInfo.aspectRatio = (parseInt(videoInfo.width) / parseInt(videoInfo.height)).toFixed(3);
    }
    
    videoInfo.container = this.extractFromLogs(logs, /Input #0,\s*([^,]+)/, 1);
    
    const videoStream = logs.find(log => log.includes('Stream') && log.includes('Video:'));
    if (videoStream) {
      const codecMatch = videoStream.match(/Video:\s*([^(,]+)/);
      if (codecMatch) videoInfo.codec = codecMatch[1].trim();
      
      const fpsMatch = videoStream.match(/(\d+(?:\.\d+)?) fps/);
      if (fpsMatch) videoInfo.frameRate = fpsMatch[1] + ' fps';
      
      const bitrateMatch = videoStream.match(/(\d+) kb\/s/);
      if (bitrateMatch) videoInfo.bitrate = bitrateMatch[1] + ' kbps';
      
      if (!videoInfo.bitrate) {
        const overallBitrateMatch = logs.find(log => log.includes('bitrate:'));
        if (overallBitrateMatch) {
          const match = overallBitrateMatch.match(/bitrate:\s*([^ ]+)/);
          if (match) videoInfo.bitrate = match[1];
        }
      }
      
      const pixFmtMatch = videoStream.match(/yuv\w+/);
      if (pixFmtMatch) videoInfo.pixFmt = pixFmtMatch[0];
      
      const profileMatch = videoStream.match(/\(([^)]+)\)/);
      if (profileMatch) videoInfo.profile = profileMatch[1];
      
      const darMatch = videoStream.match(/DAR (\d+:\d+)/);
      if (darMatch) videoInfo.displayAspectRatio = darMatch[1];
      
      const sarMatch = videoStream.match(/SAR (\d+:\d+)/);
      if (sarMatch) videoInfo.sampleAspectRatio = sarMatch[1];
      
      const colorSpaceMatch = videoStream.match(/\b(bt\d+|srgb|bt2020nc)\b/i);
      if (colorSpaceMatch) videoInfo.colorSpace = colorSpaceMatch[0];
      
      const colorRangeMatch = videoStream.match(/\b(limited|full)\b/i);
      if (colorRangeMatch) videoInfo.colorRange = colorRangeMatch[0];
    }
    
    return videoInfo;
  }
  
  extractAudioInfo(logs) {
    const audioInfo = {};
    const audioStream = logs.find(log => log.includes('Stream') && log.includes('Audio:'));
    
    if (audioStream) {
      const codecMatch = audioStream.match(/Audio:\s*([^,]+)/);
      if (codecMatch) audioInfo.codec = codecMatch[1].trim();
      
      const sampleRateMatch = audioStream.match(/(\d+) Hz/);
      if (sampleRateMatch) {
        const sampleRate = parseInt(sampleRateMatch[1]);
        audioInfo.sampleRate = (sampleRate / 1000).toFixed(1) + ' kHz';
      }
      
      const channelsMatch = audioStream.match(/(\d+\.\d+|mono|stereo|5\.1)/);
      if (channelsMatch) audioInfo.channels = channelsMatch[1];
      
      const bitrateMatch = audioStream.match(/(\d+) kb\/s/);
      if (bitrateMatch) audioInfo.bitrate = bitrateMatch[1] + ' kbps';
    }
    
    return audioInfo;
  }
  
  displayVideoInfo(videoInfo, audioInfo) {
    const videoInfoSection = document.createElement('div');
    videoInfoSection.className = 'info-section';
    videoInfoSection.innerHTML = `
      <h3>Video Information</h3>
      <table class="info-table">
        ${this.createInfoRows(videoInfo)}
      </table>
    `;
    
    const audioInfoSection = document.createElement('div');
    audioInfoSection.className = 'info-section';
    
    if (Object.keys(audioInfo).length > 0) {
      audioInfoSection.innerHTML = `
        <h3>Audio Information</h3>
        <table class="info-table">
          ${this.createInfoRows(audioInfo)}
        </table>
      `;
    } else {
      audioInfoSection.innerHTML = `
        <h3>Audio Information</h3>
        <p>No audio track detected.</p>
      `;
    }
    
    this.elements.infoContainer.appendChild(videoInfoSection);
    this.elements.infoContainer.appendChild(audioInfoSection);
  }
  
  createInfoRows(info) {
    return Object.entries(info)
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `
          <tr>
            <td>${label}:</td>
            <td>${value}</td>
          </tr>
        `;
      })
      .join('');
  }
  
  extractFromLogs(logs, regex, groupIndex = 1) {
    for (const log of logs) {
      const match = log.match(regex);
      if (match && match[groupIndex]) {
        return match[groupIndex];
      }
    }
    return null;
  }
  
  formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return null;
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : '00',
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  }
}

export function initTool() {
  const tool = new VideoInfoTool({
    id: 'info',
    name: 'Video Info'
  });
  
  return tool.init();
} 