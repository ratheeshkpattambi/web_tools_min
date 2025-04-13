/**
 * Text Editor Tool
 * A simple text editor with basic functionality
 */

import { generatePageHTML } from '../common/template.js';
import { addLog } from '../common/utils.js';

/**
 * Generate the HTML for the text editor page
 * @returns {string} - The HTML content
 */
const content = `
  <div class="tool-container">
    <h1>Text Editor</h1>
    <div id="dropZone" class="drop-zone">
      <p>Drop text file here or click to select</p>
      <input type="file" id="fileInput" accept=".txt" style="display: none;">
    </div>

    <div class="editor-toolbar">
      <button id="formatBold" class="btn-icon" title="Bold">
        <span class="icon">B</span>
      </button>
      <button id="formatItalic" class="btn-icon" title="Italic">
        <span class="icon">I</span>
      </button>
      <button id="formatUnderline" class="btn-icon" title="Underline">
        <span class="icon">U</span>
      </button>
      <button id="clearFormat" class="btn-icon" title="Clear Formatting">
        <span class="icon">T</span>
      </button>
      <div class="toolbar-separator"></div>
      <button id="downloadBtn" class="btn-icon" title="Download">
        <span class="icon">↓</span>
      </button>
    </div>

    <textarea id="editor" class="text-editor" placeholder="Start typing or drop a text file..."></textarea>

    <div class="editor-footer">
      <div class="word-count">
        Words: <span id="wordCount">0</span>
      </div>
      <div class="char-count">
        Characters: <span id="charCount">0</span>
      </div>
    </div>

    <div id="logHeader" class="log-header">
      <span>Logs</span>
      <span id="logToggle">▼</span>
    </div>
    <div id="logContent" class="log-content"></div>
  </div>
`;

export const pageHTML = generatePageHTML('Text Editor', content);

/**
 * Initialize the text editor page
 */
export function initPage() {
  const editor = document.getElementById('editor');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const formatBold = document.getElementById('formatBold');
  const formatItalic = document.getElementById('formatItalic');
  const formatUnderline = document.getElementById('formatUnderline');
  const clearFormat = document.getElementById('clearFormat');
  const downloadBtn = document.getElementById('downloadBtn');
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');

  if (!editor || !wordCount || !charCount || !formatBold || !formatItalic || 
      !formatUnderline || !clearFormat || !downloadBtn || !fileInput || !dropZone) {
    console.error('Required elements not found in the DOM');
    return;
  }

  function updateCounts() {
    const text = editor.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    wordCount.textContent = words;
    charCount.textContent = chars;
  }

  function insertFormat(format) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    let formattedText = '';
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
    }
    
    editor.value = editor.value.substring(0, start) + formattedText + editor.value.substring(end);
    editor.focus();
    updateCounts();
  }

  function clearFormatting() {
    const text = editor.value;
    // Remove markdown formatting
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
      .replace(/_(.*?)_/g, '$1')        // Italic
      .replace(/__(.*?)__/g, '$1');     // Underline
    
    editor.value = cleanText;
    editor.focus();
    updateCounts();
  }

  function downloadText() {
    const text = editor.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-editor-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Text downloaded successfully!', 'success');
  }

  function handleFileLoad(file) {
    if (!file || file.type !== 'text/plain') {
      addLog('Please select a valid text file (.txt)', 'error');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      editor.value = e.target.result;
      updateCounts();
      addLog(`File loaded: ${file.name}`, 'success');
    };
    
    reader.onerror = () => {
      addLog('Failed to read file', 'error');
    };
    
    reader.readAsText(file);
  }

  // Event Listeners
  editor.addEventListener('input', updateCounts);
  formatBold.addEventListener('click', () => insertFormat('bold'));
  formatItalic.addEventListener('click', () => insertFormat('italic'));
  formatUnderline.addEventListener('click', () => insertFormat('underline'));
  clearFormat.addEventListener('click', clearFormatting);
  downloadBtn.addEventListener('click', downloadText);

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileLoad(file);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileLoad(file);
    }
  });

  // Initialize
  updateCounts();
  addLog('Text editor ready', 'info');
} 