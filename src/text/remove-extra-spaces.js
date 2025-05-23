import { Tool } from '../common/base.js';

export const template = `
  <div class="tool-container">
    <h1>Remove Extra Spaces</h1>
    <p class="tool-description">Remove extra spaces from text, such as leading/trailing spaces and multiple spaces between words. All processing happens in your browser.</p>

    <div class="form-group">
      <label for="inputText" style="font-weight: bold; font-size: 1.2em;">Input Text</label>
      <textarea id="inputText" class="form-control text-editor" rows="10" placeholder="Paste your text here..."></textarea>
    </div>

    <div class="text-center">
      <button type="button" id="removeSpacesBtn" class="file-select-btn">Remove Extra Spaces</button>
    </div>

    <div class="form-group mt-3">
      <label for="outputText" style="font-weight: bold; font-size: 1.2em;">Output Text</label>
      <textarea id="outputText" class="form-control text-editor" rows="10" readonly placeholder="Cleaned text will appear here..."></textarea>
    </div>

    <div class="text-center mt-3">
      <button id="copyToClipboardBtn" class="btn btn-secondary mr-2" disabled>Copy To Clipboard</button>
      <button id="downloadBtn" class="btn btn-secondary" disabled>Download Text</button>
    </div>

    <div id="logHeader" class="log-header">
      <span>Logs</span>
      <span id="logToggle">▼</span>
    </div>
    <div id="logContent" class="log-content"></div>
  </div>
`;

class RemoveExtraSpacesTool extends Tool {
  constructor() {
    super({
      id: 'remove-extra-spaces',
      name: 'Remove Extra Spaces',
      category: 'text',
      needsFileUpload: false,
      hasOutput: true,
      needsProcessButton: false,
      template
    });
  }

  getElementsMap() {
    return {
      inputText: 'inputText',
      outputText: 'outputText',
      removeSpacesBtn: 'removeSpacesBtn',
      copyToClipboardBtn: 'copyToClipboardBtn',
      downloadBtn: 'downloadBtn'
    };
  }

  async setup() {
    if (this.elements.removeSpacesBtn) {
      this.elements.removeSpacesBtn.addEventListener('click', () => this.processText());
    }

    if (this.elements.copyToClipboardBtn) {
      this.elements.copyToClipboardBtn.addEventListener('click', () => this.copyOutput());
    }
    if (this.elements.downloadBtn) {
      this.elements.downloadBtn.addEventListener('click', () => this.downloadOutput());
    }
    this.log('Remove Extra Spaces tool ready', 'info');
  }

  processText() {
    const text = this.elements.inputText.value;
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/\s+/g, ' ');
    this.elements.outputText.value = cleanedText;
    this.elements.copyToClipboardBtn.disabled = !cleanedText;
    this.elements.downloadBtn.disabled = !cleanedText;
    if (cleanedText !== text) {
        this.log('Extra spaces removed.', 'success');
    } else {
        this.log('No extra spaces found to remove.', 'info');
    }
  }

  async copyOutput() {
    if (this.elements.outputText.value) {
      try {
        await navigator.clipboard.writeText(this.elements.outputText.value);
        this.elements.copyToClipboardBtn.textContent = 'Copied!';
        this.log('Output copied to clipboard.', 'success');
      } catch (err) {
        this.log('Failed to copy text: ' + err, 'error');
        this.elements.copyToClipboardBtn.textContent = 'Error!';
      }
    } else {
      this.log('Nothing to copy.', 'info');
    }
    
    setTimeout(() => {
      this.elements.copyToClipboardBtn.textContent = 'Copy To Clipboard';
    }, 1500);
  }

  downloadOutput() {
    const text = this.elements.outputText.value;
    if (!text.trim()) {
      this.log('Nothing to download.', 'info');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.log('Text downloaded successfully.', 'success');
  }
}

export function initTool() {
  const tool = new RemoveExtraSpacesTool();
  return tool.init();
} 