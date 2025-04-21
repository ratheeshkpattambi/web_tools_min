/**
 * Image resize module using HTML Canvas
 */
import { addLog, formatFileSize, updateProgress, showLogs } from '../common/utils.js';

/**
 * Initialize the image resize functionality
 */
export function initPage() {
  const dropZone = document.getElementById('dropZone');
  const imageInput = document.getElementById('imageInput');
  const preview = document.getElementById('preview');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const keepRatioCheckbox = document.getElementById('keepRatio');
  const formatSelect = document.getElementById('format');
  const qualityInput = document.getElementById('quality');
  const qualityValue = document.getElementById('qualityValue');
  const resizeBtn = document.getElementById('resizeBtn');
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const sizeModeSelect = document.getElementById('size-mode');

  let originalImage = null;
  let aspectRatio = 1;

  function updateQualityValue() {
    qualityValue.textContent = qualityInput.value;
  }

  function updateDimensions(isWidth) {
    if (!keepRatioCheckbox.checked || !originalImage) return;

    if (isWidth) {
      const newWidth = parseInt(widthInput.value) || 0;
      heightInput.value = Math.round(newWidth / aspectRatio);
    } else {
      const newHeight = parseInt(heightInput.value) || 0;
      widthInput.value = Math.round(newHeight * aspectRatio);
    }
  }

  function handleImageLoad(file) {
    if (!file || !file.type.startsWith('image/')) {
      addLog('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        originalImage = img;
        aspectRatio = img.width / img.height;
        
        // Set initial dimensions
        widthInput.value = img.width;
        heightInput.value = img.height;
        
        // Show preview
        preview.src = e.target.result;
        preview.style.display = 'block';
        
        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.classList.add('active');
        
        // Enable resize button
        resizeBtn.disabled = false;
        
        addLog(`Image loaded: ${file.name} (${formatFileSize(file.size)})`, 'success');
      };
      
      img.onerror = () => {
        addLog('Failed to load image', 'error');
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      addLog('Failed to read file', 'error');
    };
    
    reader.readAsDataURL(file);
  }

  function processImage() {
    if (!originalImage) {
      addLog('No image selected', 'error');
      return;
    }

    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const format = formatSelect.value;
    const quality = parseFloat(qualityInput.value);

    if (!width || !height || width <= 0 || height <= 0) {
      addLog('Please enter valid dimensions', 'error');
      return;
    }

    if (quality < 0 || quality > 1) {
      addLog('Quality must be between 0 and 1', 'error');
      return;
    }

    addLog('Processing image...', 'info');
    updateProgress(0);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // Draw image with smooth interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(originalImage, 0, 0, width, height);

    updateProgress(50);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        addLog('Failed to process image', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized-image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      updateProgress(100);
      addLog('Image processed successfully!', 'success');
    }, `image/${format}`, quality);
  }

  // Event Listeners
  dropZone.addEventListener('click', () => imageInput.click());

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
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageLoad(file);
    }
  });

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageLoad(file);
    }
  });

  widthInput.addEventListener('input', () => updateDimensions(true));
  heightInput.addEventListener('input', () => updateDimensions(false));
  qualityInput.addEventListener('input', updateQualityValue);
  resizeBtn.addEventListener('click', processImage);

  // Initialize
  addLog('Image resizer ready', 'info');
} 