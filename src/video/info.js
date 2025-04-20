/**
 * Video info module using FFmpeg WASM
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { addLog, formatFileSize, updateProgress, showLogs } from '../common/utils.js';
import { loadFFmpeg, writeInputFile, executeFFmpeg, getExtension } from './ffmpeg-utils.js';

let inputVideo = null;

/**
 * Initialize the video info tool
 */
export async function initTool() {
  const elements = {
    dropZone: document.getElementById('videoDropZone'),
    fileInput: document.getElementById('videoFileInput'),
    inputVideo: document.getElementById('video-preview'),
    infoContainer: document.getElementById('videoInfoContainer'),
    progress: document.getElementById('videoProgress')
  };

  // Handle file selection
  function handleFile(file) {
    if (!file.type.startsWith('video/')) {
      addLog('Please select a valid video file', 'error');
      return;
    }

    inputVideo = file;
    const url = URL.createObjectURL(file);
    elements.inputVideo.src = url;
    elements.inputVideo.style.display = 'block';
    elements.dropZone.style.display = 'none';

    // Display basic file info immediately
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
    elements.infoContainer.innerHTML = '';
    elements.infoContainer.appendChild(basicInfo);
    elements.infoContainer.style.display = 'block';

    // Process metadata with FFmpeg
    getVideoMetadata(file);
  }

  async function getVideoMetadata(file) {
    try {
      elements.progress.style.display = 'block';
      updateProgress(10);

      const ffmpeg = await loadFFmpeg();
      updateProgress(30);

      const inputFileName = 'input' + getExtension(file.name);
      await writeInputFile(ffmpeg, inputFileName, file);
      updateProgress(50);

      // Store logs for parsing
      const ffmpegLogs = [];
      
      // Capture detailed FFmpeg logs
      ffmpeg.on('log', ({ message }) => {
        ffmpegLogs.push(message);
        
        if (message.includes('Stream') || 
            message.includes('Duration') || 
            message.includes('Video:') || 
            message.includes('Audio:') ||
            message.includes('Input #0')) {
          addLog(message, 'info');
        }
      });

      // Get basic file info from FFmpeg 
      await executeFFmpeg(ffmpeg, ['-i', inputFileName]);
      
      // Extract data from video frames to get more accurate info
      // This mimics part of what ffprobe does
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vframes', '1',  // Only process first frame for quick analysis
        '-f', 'null',
        '-'
      ]);
      
      updateProgress(80);

      // Extract video properties directly from element when possible
      // This is more reliable than parsing text logs
      const videoEl = elements.inputVideo;
      const videoInfo = {
        // Try to get from video element first, fallback to parsing logs
        width: videoEl.videoWidth || extractFromLogs(ffmpegLogs, /(\d+)x\d+/, 1),
        height: videoEl.videoHeight || extractFromLogs(ffmpegLogs, /\d+x(\d+)/, 1),
        duration: formatDuration(videoEl.duration) || extractFromLogs(ffmpegLogs, /Duration:\s*([^,]+)/, 1)
      };
      
      // Calculate aspect ratio
      if (videoInfo.width && videoInfo.height) {
        videoInfo.aspectRatio = (parseInt(videoInfo.width) / parseInt(videoInfo.height)).toFixed(3);
      }
      
      // Extract container format
      videoInfo.container = extractFromLogs(ffmpegLogs, /Input #0,\s*([^,]+)/, 1);
      
      // Extract video stream info
      const videoStream = ffmpegLogs.find(log => log.includes('Stream') && log.includes('Video:'));
      if (videoStream) {
        // Extract codec info
        const codecMatch = videoStream.match(/Video:\s*([^(,]+)/);
        if (codecMatch) videoInfo.codec = codecMatch[1].trim();
        
        // Extract frame rate
        const fpsMatch = videoStream.match(/(\d+(?:\.\d+)?) fps/);
        if (fpsMatch) videoInfo.frameRate = fpsMatch[1] + ' fps';
        
        // Extract bitrate for video
        const bitrateMatch = videoStream.match(/(\d+) kb\/s/);
        if (bitrateMatch) videoInfo.bitrate = bitrateMatch[1] + ' kbps';
        
        // Fallback to overall bitrate if video bitrate not found
        if (!videoInfo.bitrate) {
          const overallBitrateMatch = ffmpegLogs.find(log => log.includes('bitrate:'));
          if (overallBitrateMatch) {
            const match = overallBitrateMatch.match(/bitrate:\s*([^ ]+)/);
            if (match) videoInfo.bitrate = match[1];
          }
        }
        
        // Extract pixel format
        const pixFmtMatch = videoStream.match(/yuv\w+/);
        if (pixFmtMatch) videoInfo.pixFmt = pixFmtMatch[0];
        
        // Extract profile
        const profileMatch = videoStream.match(/\(([^)]+)\)/);
        if (profileMatch) videoInfo.profile = profileMatch[1];
        
        // Extract DAR (Display Aspect Ratio) if available
        const darMatch = videoStream.match(/DAR (\d+:\d+)/);
        if (darMatch) videoInfo.displayAspectRatio = darMatch[1];
        
        // Extract SAR (Sample Aspect Ratio) if available
        const sarMatch = videoStream.match(/SAR (\d+:\d+)/);
        if (sarMatch) videoInfo.sampleAspectRatio = sarMatch[1];
        
        // Extract color space and range
        const colorSpaceMatch = videoStream.match(/\b(bt\d+|srgb|bt2020nc)\b/i);
        if (colorSpaceMatch) videoInfo.colorSpace = colorSpaceMatch[0];
        
        const colorRangeMatch = videoStream.match(/\b(limited|full)\b/i);
        if (colorRangeMatch) videoInfo.colorRange = colorRangeMatch[0];
      }
      
      // Extract audio info
      const audioInfo = {};
      const audioStream = ffmpegLogs.find(log => log.includes('Stream') && log.includes('Audio:'));
      if (audioStream) {
        // Extract audio codec
        const codecMatch = audioStream.match(/Audio:\s*([^,]+)/);
        if (codecMatch) audioInfo.codec = codecMatch[1].trim();
        
        // Extract sample rate
        const sampleRateMatch = audioStream.match(/(\d+) Hz/);
        if (sampleRateMatch) {
          const sampleRate = parseInt(sampleRateMatch[1]);
          audioInfo.sampleRate = (sampleRate / 1000).toFixed(1) + ' kHz';
        }
        
        // Extract channels
        const channelsMatch = audioStream.match(/(\d+\.\d+|mono|stereo|5\.1)/);
        if (channelsMatch) audioInfo.channels = channelsMatch[1];
        
        // Extract audio bitrate
        const bitrateMatch = audioStream.match(/(\d+) kb\/s/);
        if (bitrateMatch) audioInfo.bitrate = bitrateMatch[1] + ' kbps';
      }
      
      updateProgress(90);

      // Create video properties section
      const videoInfoElement = document.createElement('div');
      videoInfoElement.className = 'info-section';
      videoInfoElement.innerHTML = `
        <h3>Video Properties</h3>
        <table class="info-table">
          <tr>
            <td>Resolution:</td>
            <td>${videoInfo.width || 'Unknown'} × ${videoInfo.height || 'Unknown'} pixels</td>
          </tr>
          <tr>
            <td>Duration:</td>
            <td>${videoInfo.duration || 'Unknown'}</td>
          </tr>
          <tr>
            <td>Container Format:</td>
            <td>${videoInfo.container || 'Unknown'}</td>
          </tr>
          <tr>
            <td>Frame Rate:</td>
            <td>${videoInfo.frameRate || 'Unknown'}</td>
          </tr>
          <tr>
            <td>Video Codec:</td>
            <td>${videoInfo.codec || 'Unknown'}</td>
          </tr>
          <tr>
            <td>Video Bitrate:</td>
            <td>${videoInfo.bitrate || 'Unknown'}</td>
          </tr>
          <tr>
            <td>Aspect Ratio:</td>
            <td>${videoInfo.aspectRatio || (videoInfo.displayAspectRatio ? 'DAR ' + videoInfo.displayAspectRatio : 'Unknown')}</td>
          </tr>
          ${videoInfo.sampleAspectRatio ? `
          <tr>
            <td>Sample Aspect Ratio:</td>
            <td>${videoInfo.sampleAspectRatio}</td>
          </tr>` : ''}
          <tr>
            <td>Pixel Format:</td>
            <td>${videoInfo.pixFmt || 'Unknown'}</td>
          </tr>
          ${videoInfo.colorSpace ? `
          <tr>
            <td>Color Space:</td>
            <td>${videoInfo.colorSpace}</td>
          </tr>` : ''}
          ${videoInfo.colorRange ? `
          <tr>
            <td>Color Range:</td>
            <td>${videoInfo.colorRange}</td>
          </tr>` : ''}
          ${videoInfo.profile ? `
          <tr>
            <td>Profile:</td>
            <td>${videoInfo.profile}</td>
          </tr>` : ''}
        </table>
      `;
      
      // Add audio properties if available
      if (audioInfo.codec) {
        const audioInfoElement = document.createElement('div');
        audioInfoElement.className = 'info-section';
        audioInfoElement.innerHTML = `
          <h3>Audio Properties</h3>
          <table class="info-table">
            <tr>
              <td>Audio Codec:</td>
              <td>${audioInfo.codec}</td>
            </tr>
            ${audioInfo.sampleRate ? `
            <tr>
              <td>Sample Rate:</td>
              <td>${audioInfo.sampleRate}</td>
            </tr>` : ''}
            ${audioInfo.channels ? `
            <tr>
              <td>Channels:</td>
              <td>${audioInfo.channels}</td>
            </tr>` : ''}
            ${audioInfo.bitrate ? `
            <tr>
              <td>Audio Bitrate:</td>
              <td>${audioInfo.bitrate}</td>
            </tr>` : ''}
          </table>
        `;
        elements.infoContainer.appendChild(audioInfoElement);
      }
      
      elements.infoContainer.appendChild(videoInfoElement);
      addLog('Video analysis complete!', 'success');
      
    } catch (error) {
      addLog(`Error analyzing video: ${error.message}`, 'error');
      console.error('Analysis error:', error);
    } finally {
      elements.progress.style.display = 'none';
      updateProgress(100);
    }
  }

  // Helper function to extract info from logs with regex
  function extractFromLogs(logs, regex, groupIndex = 1) {
    for (const log of logs) {
      const match = log.match(regex);
      if (match && match[groupIndex]) {
        return match[groupIndex].trim();
      }
    }
    return null;
  }

  // Helper function to format duration
  function formatDuration(seconds) {
    if (!seconds) return null;
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
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

  // Initialize log toggle
  showLogs();
} 