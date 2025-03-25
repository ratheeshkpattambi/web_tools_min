import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export async function initVideoTools() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const outputVideo = document.getElementById('output-video');
  const progress = document.getElementById('progress');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const logElement = document.getElementById('log');

  let ffmpeg = null;

  function debug(message, error = false) {
    const time = new Date().toLocaleTimeString();
    const style = error ? 'color: red;' : '';
    const msg = `[${time}] ${message}`;
    console.log(msg);
    logElement.innerHTML += `<div style="${style}">${msg}</div>`;
    logElement.scrollTop = logElement.scrollHeight;
  }

  async function checkBrowserCompatibility() {
    debug('Checking browser compatibility...');
    
    if (typeof SharedArrayBuffer === 'undefined') {
      throw new Error('SharedArrayBuffer is not supported. This is required for FFmpeg WASM.');
    }
    debug('✓ SharedArrayBuffer is supported');

    if (!crossOriginIsolated) {
      throw new Error('Cross-Origin Isolation is not enabled. Check COOP/COEP headers.');
    }
    debug('✓ Cross-Origin Isolation is enabled');
  }

  async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    debug(`Fetching: ${url}`);
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

  async function tryMultipleCDNs() {
    const cdns = [
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm',
      'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
    ];

    for (const baseURL of cdns) {
      try {
        debug(`Trying CDN: ${baseURL}`);
        
        await fetchWithTimeout(`${baseURL}/ffmpeg-core.js`);
        debug(`✓ CDN ${baseURL} is responsive`);

        const coreURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript'
        );
        debug('✓ Core JS blob URL created');

        const wasmURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        );
        debug('✓ WASM blob URL created');

        const workerURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          'text/javascript'
        );
        debug('✓ Worker blob URL created');

        return { coreURL, wasmURL, workerURL };
      } catch (error) {
        debug(`Failed to load from ${baseURL}: ${error.message}`, true);
        continue;
      }
    }
    throw new Error('All CDNs failed to load FFmpeg core files');
  }

  async function loadFFmpeg() {
    if (ffmpeg !== null) {
      debug('FFmpeg instance already exists, reusing...');
      return;
    }

    try {
      debug('Starting FFmpeg loading process...');
      
      await checkBrowserCompatibility();

      debug('Creating new FFmpeg instance...');
      ffmpeg = new FFmpeg();

      ffmpeg.on('log', ({ message }) => {
        debug(`FFmpeg log: ${message}`);
      });

      ffmpeg.on('progress', ({ progress }) => {
        const percent = Math.round(progress * 100);
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        debug(`Progress: ${percent}%`);
      });

      debug('Loading FFmpeg core files...');
      try {
        const { coreURL, wasmURL, workerURL } = await tryMultipleCDNs();

        debug('Initializing FFmpeg with blob URLs...');
        await ffmpeg.load({
          coreURL,
          wasmURL,
          workerURL
        });
        debug('✓ FFmpeg loaded successfully');
      } catch (error) {
        debug(`Error loading FFmpeg core files: ${error.message}`, true);
        throw error;
      }

    } catch (error) {
      debug(`Fatal error loading FFmpeg: ${error.message}`, true);
      if (error.stack) {
        debug(`Stack trace: ${error.stack}`, true);
      }
      ffmpeg = null;
      throw error;
    }
  }

  async function processVideo(file) {
    if (!ffmpeg) {
      debug('FFmpeg not loaded, cannot process video', true);
      throw new Error('FFmpeg not loaded');
    }

    try {
      progress.style.display = 'block';
      progressFill.style.width = '0%';
      progressText.textContent = '0%';

      debug(`Processing video: ${file.name} (${file.size} bytes)`);
      
      debug('Writing input file...');
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      debug('✓ Input file written');

      debug('Starting video conversion...');
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'scale=iw*0.5:ih*0.5',
        '-c:v', 'libx264',
        '-preset', 'medium',
        'output.mp4'
      ]);
      debug('✓ Video conversion completed');

      debug('Reading output file...');
      const data = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);
      outputVideo.src = videoUrl;
      debug('✓ Output video ready');

      debug('Cleaning up temporary files...');
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
      debug('✓ Cleanup completed');

    } catch (error) {
      debug(`Error processing video: ${error.message}`, true);
      if (error.stack) {
        debug(`Stack trace: ${error.stack}`, true);
      }
      throw error;
    } finally {
      progress.style.display = 'none';
    }
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) {
      debug('Invalid file selected - must be a video file', true);
      return;
    }

    try {
      debug(`Selected file: ${file.name} (${file.type})`);
      await loadFFmpeg();
      await processVideo(file);
    } catch (error) {
      debug(`Error in handle file: ${error.message}`, true);
    }
  }

  // Event listeners
  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
  });

  // Initial checks
  debug('Initializing video tools...');
  try {
    await checkBrowserCompatibility();
    debug('✓ Browser compatibility checks passed');
    debug('Ready to process videos');
  } catch (error) {
    debug(`Initialization failed: ${error.message}`, true);
  }
} 