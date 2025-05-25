import * as vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js';
import { addLog, resetTool } from '../common/utils.js';

export const template = `
  <div class="tool-container">
    <h1>Face Detection</h1>
    <div class="mb-4">
      <label for="imageInput" class="block font-medium mb-2">Select an image</label>
      <input type="file" id="imageInput" accept="image/*" class="file-input" />
    </div>
    <div id="previewContainer" class="mb-4"></div>
    <div id="resultContainer" class="mb-4"></div>
    <button id="resetBtn" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-5 rounded-md shadow-sm transition-colors mb-4">🔄 Reset</button>
    <div id="logHeader" class="mt-2 bg-slate-100 p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-colors">
      <span class="font-medium text-slate-700">Logs</span>
      <span id="logToggle" class="text-slate-500 transform transition-transform">▼</span>
    </div>
    <textarea id="logContent" class="w-full h-32 p-4 rounded-b-md mt-px font-mono text-xs resize-none bg-slate-100 text-slate-700 border-0 focus:outline-none transition-colors" readonly placeholder="Logs will appear here..."></textarea>
  </div>
`;

export function initTool() {
  const logHeader = document.getElementById('logHeader');
  const logContent = document.getElementById('logContent');
  const logToggle = document.getElementById('logToggle');
  logHeader.addEventListener('click', () => {
    logContent.classList.toggle('active');
    logToggle.textContent = logContent.classList.contains('active') ? '▲' : '▼';
  });

  addLog('Version: ESM - Face Detection tool loaded');

  const input = document.getElementById('imageInput');
  const preview = document.getElementById('previewContainer');
  const result = document.getElementById('resultContainer');
  const resetBtn = document.getElementById('resetBtn');

  let faceDetector = null;

  async function setupDetector() {
    if (!vision.FilesetResolver) throw new Error('FilesetResolver not found in vision object');
    if (!faceDetector) {
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
      );
      faceDetector = await vision.FaceDetector.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.5
      });
      addLog('FaceDetector initialized successfully.');
    }
    return faceDetector;
  }

  async function runDetectionOnImage(img, filename = '') {
    result.innerHTML = 'Detecting faces...';
    addLog(`Detecting faces in: ${filename}`);
    try {
      const detector = await setupDetector();
      const detections = await detector.detect(img);
      if (!detections || !detections.detections || detections.detections.length === 0) {
        result.innerHTML = '<span style="color:#c00">No faces detected.</span>';
        addLog('No faces detected.', 'error');
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = '#00e';
      ctx.lineWidth = 3;
      detections.detections.forEach(det => {
        const box = det.boundingBox;
        ctx.strokeRect(box.originX, box.originY, box.width, box.height);
      });
      result.innerHTML = '';
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '300px';
      result.appendChild(canvas);
      addLog(`detected ${detections.detections.length} face(s).`);
    } catch (err) {
      result.innerHTML = '<span style="color:#c00">Error running face detection.</span>';
      addLog('Error running face detection: ' + err.message, 'error');
    }
  }

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    logContent.value = '';
    result.innerHTML = '';
    preview.innerHTML = '';
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<img id="previewImg" src="${url}" style="max-width:100%;max-height:300px;" />`;
    const img = document.getElementById('previewImg');
    img.onload = () => runDetectionOnImage(img, file.name);
    img.onerror = () => {
      result.innerHTML = '<span style="color:#c00">Failed to load image.</span>';
      addLog('Failed to load image', 'error');
    };
  });

  resetBtn.addEventListener('click', () => {
    logContent.value = '';
    result.innerHTML = '';
    preview.innerHTML = '';
    input.value = '';
    addLog('Tool reset.');
  });
} 