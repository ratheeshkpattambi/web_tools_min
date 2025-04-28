/**
 * Text Editor Tool
 * The plainest text editor - just type and download
 */
import { Tool } from '../common/base.js';

// Text editor tool template
export const template = `
    <div class="tool-container">
      <h1>Text Editor</h1>
      <p class="tool-description">The plainest text editor - just type and download</p>

      <textarea id="editor" class="text-editor" placeholder="Start typing..."></textarea>

      <div class="editor-footer">
        <div class="word-count">
          Words: <span id="wordCount">0</span>
        </div>
        <div class="char-count">
          Characters: <span id="charCount">0</span>
        </div>
      </div>

      <div id="downloadContainer"></div>

      <div id="logHeader" class="log-header">
        <span>Logs</span>
        <span id="logToggle">▼</span>
      </div>
      <div id="logContent" class="log-content"></div>
    </div>
`;

class TextEditorTool extends Tool {
  constructor(config = {}) {
    super({
      ...config,
      category: 'text',
      needsFileUpload: false,
      hasOutput: true,
      needsProcessButton: false,
      template // Use the local template
    });
    
    this.wordCount = 0;
    this.charCount = 0;
  }

  getElementsMap() {
    return {
      editor: 'editor',
      downloadContainer: 'downloadContainer',
      wordCount: 'wordCount',
      charCount: 'charCount',
      logHeader: 'logHeader',
      logContent: 'logContent'
    };
  }

  async setup() {
    // Set up editor input handling
    if (this.elements.editor) {
      this.elements.editor.addEventListener('input', () => this.updateCounts());
      
      // Add download button after editor
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn';
      downloadBtn.textContent = 'Download Text';
      downloadBtn.addEventListener('click', () => this.downloadText());
      this.elements.downloadContainer.appendChild(downloadBtn);
    }

    this.log('Text editor ready', 'info');
  }

  updateCounts() {
    if (!this.elements.editor) return;
    
    const text = this.elements.editor.value;
    this.wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    this.charCount = text.length;
    
    if (this.elements.wordCount) {
      this.elements.wordCount.textContent = this.wordCount;
    }
    if (this.elements.charCount) {
      this.elements.charCount.textContent = this.charCount;
    }
  }

  downloadText() {
    if (!this.elements.editor) return;

    const text = this.elements.editor.value;
    if (!text.trim()) {
      this.log('Please enter some text before downloading', 'error');
      return;
    }

    // Create and trigger download directly
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-editor-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.log('Text downloaded!', 'success');
  }
}

export function initTool() {
  const tool = new TextEditorTool({
    id: 'editor',
    name: 'Text Editor'
  });
  
  return tool.init();
} 