import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { addLog, updateProgress } from '../common/utils.js';

let ffmpeg = null;

/**
 * Fetch with timeout to handle slow CDNs
 */
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  addLog(`Fetching: ${url}`, 'info');
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Fetch timeout after ${timeout}ms: ${url}`);
    }
    throw error;
  }
}

/**
 * Try loading FFmpeg from multiple CDNs
 */
async function tryMultipleCDNs() {
  // CRITICAL: This specific CDN and version must be maintained
  const cdns = [
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
    '/video/ffmpeg'  // Fallback to local files
  ];

  for (const baseURL of cdns) {
    try {
      addLog(`Trying CDN: ${baseURL}`, 'info');
      
      // Test if the CDN is responsive
      await fetchWithTimeout(`${baseURL}/ffmpeg-core.js`);
      addLog(`✓ CDN ${baseURL} is responsive`, 'success');

      // Create blob URLs for the FFmpeg files
      const coreURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        'text/javascript'
      );
      addLog('✓ Core JS blob URL created', 'success');

      const wasmURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      );
      addLog('✓ WASM blob URL created', 'success');

      const workerURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        'text/javascript'
      );
      addLog('✓ Worker blob URL created', 'success');

      return { coreURL, wasmURL, workerURL };
    } catch (error) {
      addLog(`Failed to load from ${baseURL}: ${error.message}`, 'error');
      console.error(`CDN ${baseURL} failed:`, error);
      continue;
    }
  }
  throw new Error('All CDNs failed to load FFmpeg core files');
}

/**
 * Load FFmpeg WASM
 */
export async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;
  
  try {
    addLog('Loading FFmpeg...', 'info');
    
    // Update the loading indicator if it exists
    updateLoadingIndicator(10, 'Initializing FFmpeg...');
    
    // Create a new FFmpeg instance
    ffmpeg = new FFmpeg();
    
    ffmpeg.on('log', ({ message }) => {
      addLog(message, 'info');
    });

    ffmpeg.on('progress', ({ progress }) => {
      const percentage = Math.round(progress * 100);
      updateProgress(percentage);
      
      // Also update the loading indicator if it exists
      updateLoadingIndicator(10 + percentage * 0.9, 'Loading FFmpeg WASM...');
    });

    // Notify that we're fetching WASM files
    updateLoadingIndicator(20, 'Fetching FFmpeg WASM components...');
    
    // Try to prefetch FFmpeg files to improve loading performance
    try {
      prefetchFFmpegResources();
    } catch (e) {
      console.warn('Prefetch failed, continuing with normal loading', e);
    }
    
    // Load from CDN - this is the only working solution, do not change
    await ffmpeg.load({
      coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      workerURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.worker.js'
    });
    
    updateLoadingIndicator(100, 'FFmpeg loaded successfully!');
    addLog('FFmpeg loaded successfully!', 'success');
    return ffmpeg;
  } catch (error) {
    addLog(`Failed to load FFmpeg: ${error.message}`, 'error');
    updateLoadingIndicator(100, `Error: ${error.message}`, true);
    throw error;
  }
}

/**
 * Update the loading indicator if it exists
 */
function updateLoadingIndicator(percent, message, isError = false) {
  const loadingEl = document.getElementById('ffmpeg-loading');
  if (loadingEl) {
    const progressFill = loadingEl.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
      progressFill.style.backgroundColor = isError ? '#e74c3c' : '';
    }
    
    const messageEl = loadingEl.querySelector('p');
    if (messageEl && message) {
      messageEl.textContent = message;
      if (isError) {
        messageEl.style.color = '#e74c3c';
      }
    }
  }
}

/**
 * Prefetch FFmpeg resources to improve loading performance
 */
function prefetchFFmpegResources() {
  const resources = [
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.worker.js'
  ];
  
  resources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = url.endsWith('.wasm') ? 'fetch' : 'script';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Get file extension with dot
 */
export function getExtension(filename) {
  return '.' + filename.split('.').pop().toLowerCase();
}

/**
 * Write input file to FFmpeg virtual filesystem
 */
export async function writeInputFile(ffmpeg, fileName, file) {
  try {
    addLog('Writing input file...', 'info');
    await ffmpeg.writeFile(fileName, await fetchFile(file));
    addLog('Input file written successfully', 'success');
  } catch (error) {
    addLog(`Failed to write input file: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Read output file from FFmpeg virtual filesystem
 */
export async function readOutputFile(ffmpeg, fileName) {
  try {
    addLog('Reading output file...', 'info');
    const data = await ffmpeg.readFile(fileName);
    addLog('Output file read successfully', 'success');
    return data;
  } catch (error) {
    addLog(`Failed to read output file: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Execute FFmpeg command with proper logging
 */
export async function executeFFmpeg(ffmpeg, args) {
  try {
    addLog(`Executing FFmpeg command: ffmpeg ${args.join(' ')}`, 'info');
    await ffmpeg.exec(args);
    addLog('FFmpeg command completed successfully', 'success');
  } catch (error) {
    addLog(`FFmpeg command failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Get FFmpeg instance
 */
export function getFFmpeg() {
  return ffmpeg;
} 