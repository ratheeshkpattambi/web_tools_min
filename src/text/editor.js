/**
 * Text Editor Tool
 * A simple text editor with basic functionality
 */

import { generatePageHTML } from '../common/template.js';

/**
 * Generate the HTML for the text editor page
 * @returns {string} - The HTML content
 */
const content = `
  <div class="tool-description">
    <p>A simple text editor for basic text editing needs.</p>
  </div>
  
  <div class="editor-container">
    <div class="editor-header">
      <div class="editor-controls">
        <button id="clearBtn" class="btn">Clear</button>
        <button id="copyBtn" class="btn">Copy</button>
      </div>
    </div>
    <textarea id="textEditor" class="text-editor" placeholder="Enter your text here..."></textarea>
  </div>
`;

export const pageHTML = generatePageHTML('Text Editor', content);

/**
 * Initialize the text editor page
 */
export function initPage() {
  const textEditor = document.getElementById('textEditor');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  
  // Clear button functionality
  clearBtn.addEventListener('click', () => {
    textEditor.value = '';
  });
  
  // Copy button functionality
  copyBtn.addEventListener('click', () => {
    textEditor.select();
    document.execCommand('copy');
    
    // Show feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
  
  // Auto-resize textarea
  textEditor.addEventListener('input', () => {
    textEditor.style.height = 'auto';
    textEditor.style.height = textEditor.scrollHeight + 'px';
  });
} 