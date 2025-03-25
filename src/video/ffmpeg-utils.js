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
    ffmpeg = new FFmpeg();
    
    ffmpeg.on('log', ({ message }) => {
      addLog(message, 'info');
    });

    ffmpeg.on('progress', ({ progress }) => {
      const percentage = Math.round(progress * 100);
      updateProgress(percentage);
    });

    // Load from CDN - this is the only working solution, do not change
    await ffmpeg.load({
      coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      workerURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.worker.js'
    });
    
    addLog('FFmpeg loaded successfully!', 'success');
    return ffmpeg;
  } catch (error) {
    addLog(`Failed to load FFmpeg: ${error.message}`, 'error');
    throw error;
  }
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