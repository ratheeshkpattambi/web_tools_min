/**
 * YAML Validator Tool
 * Validate YAML and convert it to JSON or Python dictionary with interactive view
 */
import { Tool } from '../common/base.js';
import jsyaml from 'js-yaml';

// YAML validator tool template
export const template = `
    <div class="tool-container">
      <style>
        /* JSON Tree View styles for syntax highlighting */
        .json-tree {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }
        .json-tree ul {
          margin-left: 1.5rem;
          padding: 0;
          list-style-type: none;
        }
        .json-tree-item {
          margin: 0.25rem 0;
          position: relative;
        }
        .json-key {
          color: #2563eb;
          font-weight: 500;
        }
        .dark .json-key {
          color: #60a5fa;
        }
        .json-string {
          color: #16a34a;
        }
        .dark .json-string {
          color: #4ade80;
        }
        .json-number {
          color: #9333ea;
        }
        .dark .json-number {
          color: #c084fc;
        }
        .json-boolean {
          color: #f59e0b;
        }
        .dark .json-boolean {
          color: #fbbf24;
        }
        .json-null {
          color: #94a3b8;
          font-style: italic;
        }
        .dark .json-null {
          color: #64748b;
        }
        .collapsible-marker {
          cursor: pointer;
          user-select: none;
          color: #64748b;
          margin-right: 0.25rem;
        }
        .dark .collapsible-marker {
          color: #94a3b8;
        }
        .python-dict {
          color: #0f172a;
        }
        .dark .python-dict {
          color: #f1f5f9;
        }
        .python-key {
          color: #1e40af;
          font-weight: 500;
        }
        .dark .python-key {
          color: #60a5fa;
        }
        .python-string {
          color: #16a34a;
        }
        .dark .python-string {
          color: #4ade80;
        }
        .python-number {
          color: #9333ea;
        }
        .dark .python-number {
          color: #c084fc;
        }
        .python-boolean {
          color: #f59e0b;
        }
        .dark .python-boolean {
          color: #fbbf24;
        }
        .python-none {
          color: #6c757d;
        }
        .dark .python-none {
          color: #9ca3af;
        }
        .status-bar.valid {
          color: #16a34a;
        }
        .dark .status-bar.valid {
          color: #4ade80;
        }
        .status-bar.error {
          color: #dc2626;
        }
        .dark .status-bar.error {
          color: #f87171;
        }
      </style>
      
      <p class="text-slate-600 dark:text-slate-300 mb-6">Validate YAML and convert it to JSON or Python dictionary with interactive view</p>
      
      <div class="grid md:grid-cols-2 gap-6 mb-6 min-h-[500px] h-[60vh]">
        <div class="flex flex-col bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg overflow-hidden transition-colors">
          <div class="flex justify-between items-center bg-slate-100 dark:bg-gray-700 py-3 px-4 border-b border-slate-200 dark:border-gray-600 transition-colors">
            <h3 class="m-0 text-base font-medium text-slate-700 dark:text-slate-300">YAML Input</h3>
            <div class="flex space-x-1">
              <button id="clearYamlBtn" class="p-1.5 rounded bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white transition-colors" title="Clear">
                <span class="text-sm">❌</span>
              </button>
              <button id="loadSampleBtn" class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-slate-400 transition-colors" title="Load Sample">
                <span class="text-sm">📋</span>
              </button>
            </div>
          </div>
          <textarea id="yamlInput" class="flex-grow p-4 font-mono text-sm leading-normal resize-none border-none focus:outline-none focus:ring-0 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-gray-500 transition-colors" placeholder="Paste your YAML here..."></textarea>
          <div id="yamlStatus" class="p-2 bg-slate-50 dark:bg-gray-700 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-gray-600 text-xs transition-colors">Ready</div>
        </div>
        
        <div class="flex flex-col bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg overflow-hidden transition-colors">
          <div class="flex justify-between items-center bg-slate-100 dark:bg-gray-700 py-3 px-4 border-b border-slate-200 dark:border-gray-600 transition-colors">
            <h3 class="m-0 text-base font-medium text-slate-700 dark:text-slate-300">Output</h3>
            <div class="flex space-x-1">
              <button id="expandAllBtn" class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-slate-400 transition-colors" title="Expand All">
                <span class="text-sm">🔽</span>
              </button>
              <button id="collapseAllBtn" class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-slate-400 transition-colors" title="Collapse All">
                <span class="text-sm">◀</span>
              </button>
              <button id="copyOutputBtn" class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-slate-400 transition-colors" title="Copy">
                <span class="text-sm">📋</span>
              </button>
            </div>
          </div>
          <div id="jsonOutput" class="flex-grow p-4 font-mono text-sm leading-normal overflow-auto bg-slate-50 dark:bg-gray-750 text-slate-900 dark:text-slate-100 whitespace-pre-wrap min-h-[300px] transition-colors"></div>
        </div>
      </div>
      
      <div id="errorContainer" class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg mb-6 overflow-hidden hidden transition-colors">
        <div class="bg-red-500 dark:bg-red-600 text-white py-2 px-4 font-medium">Error</div>
        <div id="errorContent" class="p-4 text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap"></div>
      </div>
      
      <div class="flex flex-wrap gap-x-6 gap-y-3 bg-slate-100 dark:bg-gray-700 p-4 rounded-lg mb-6 items-center transition-colors">
        <div class="flex items-center">
          <input type="checkbox" id="autoValidate" checked class="h-4 w-4 rounded border-slate-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700">
          <label for="autoValidate" class="ml-2 text-sm text-slate-700 dark:text-slate-300">Auto-validate</label>
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="prettyPrint" class="h-4 w-4 rounded border-slate-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700">
          <label for="prettyPrint" class="ml-2 text-sm text-slate-700 dark:text-slate-300">Pretty print</label>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-700 dark:text-slate-300">Format:</span>
          <label class="flex items-center gap-1 cursor-pointer px-2 py-1 bg-slate-200 dark:bg-gray-600 rounded-md hover:bg-slate-300 dark:hover:bg-gray-500 text-sm text-slate-700 dark:text-slate-300 transition-colors">
            <input type="radio" name="outputFormat" id="formatJson" checked class="form-radio h-3 w-3 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-700 border-slate-300 dark:border-gray-600">
            JSON
          </label>
          <label class="flex items-center gap-1 cursor-pointer px-2 py-1 bg-slate-200 dark:bg-gray-600 rounded-md hover:bg-slate-300 dark:hover:bg-gray-500 text-sm text-slate-700 dark:text-slate-300 transition-colors">
            <input type="radio" name="outputFormat" id="formatPython" class="form-radio h-3 w-3 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-700 border-slate-300 dark:border-gray-600">
            Python Dict
          </label>
        </div>
      </div>

      <div id="logHeader" class="mt-6 bg-slate-100 dark:bg-gray-700 p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-colors">
        <span class="font-medium text-slate-700 dark:text-slate-300">Logs</span>
        <span id="logToggle" class="text-slate-500 dark:text-slate-400 transform transition-transform">▼</span>
      </div>
      <textarea id="logContent" class="w-full h-48 p-4 rounded-b-md mt-px font-mono text-xs resize-none bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 border-0 focus:outline-none transition-colors" readonly placeholder="Logs will appear here..."></textarea>
    </div>
`;

// Sample YAML for demonstration
const SAMPLE_YAML = `# Simple YAML Example
---
# String
name: Example Project
# Number
version: 2.1
# Boolean
active: true
# Null value
previous_version: null
# Date
release_date: 2023-06-15
# Array of strings
tags:
  - web
  - tool
  - yaml
# Nested object
config:
  debug: false
  timeout: 30
  # Array of objects
  environments:
    - name: production
      url: https://example.com
    - name: staging
      url: https://staging.example.com
# Multi-line string
description: >
  This is a multi-line string
  that will be joined with spaces.
# Literal block
log_format: |
  time: %H:%M:%S
  user: %username
  action: %action
`;

class YamlValidatorTool extends Tool {
  constructor(config = {}) {
    super({
      ...config,
      category: 'text',
      needsFileUpload: false,
      hasOutput: true,
      needsProcessButton: false,
      template // Use the local template
    });

    this.lastValidJson = null;
    this.validationTimeout = null;
  }

  getElementsMap() {
    return {
      yamlInput: 'yamlInput',
      jsonOutput: 'jsonOutput',
      yamlStatus: 'yamlStatus',
      errorContainer: 'errorContainer',
      errorContent: 'errorContent',
      clearYamlBtn: 'clearYamlBtn',
      loadSampleBtn: 'loadSampleBtn',
      expandAllBtn: 'expandAllBtn',
      collapseAllBtn: 'collapseAllBtn',
      copyOutputBtn: 'copyOutputBtn',
      autoValidate: 'autoValidate',
      prettyPrint: 'prettyPrint',
      formatJson: 'formatJson',
      formatPython: 'formatPython',
      logHeader: 'logHeader',
      logContent: 'logContent'
    };
  }

  async setup() {
    const elements = this.elements;

    // Set tab key behavior
    if (elements.yamlInput) {
      elements.yamlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          e.target.value = e.target.value.substring(0, start) + '  ' + e.target.value.substring(end);
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
      });

      // Auto-validate on input
      elements.yamlInput.addEventListener('input', () => {
        clearTimeout(this.validationTimeout);
        this.updateCharCount();
        
        if (elements.autoValidate.checked) {
          this.validationTimeout = setTimeout(() => {
            this.validateYaml();
          }, 300);
        }
      });

      // Load sample YAML by default if input is empty
      if (!elements.yamlInput.value) {
        this.loadSample();
      }
    }

    // Button handlers
    if (elements.clearYamlBtn) {
      elements.clearYamlBtn.addEventListener('click', () => this.clearYaml());
    }
    if (elements.loadSampleBtn) {
      elements.loadSampleBtn.addEventListener('click', () => this.loadSample());
    }
    if (elements.expandAllBtn) {
      elements.expandAllBtn.addEventListener('click', () => this.expandAll());
    }
    if (elements.collapseAllBtn) {
      elements.collapseAllBtn.addEventListener('click', () => this.collapseAll());
    }
    if (elements.copyOutputBtn) {
      elements.copyOutputBtn.addEventListener('click', () => this.copyOutput());
    }

    // Format change handlers
    if (elements.formatJson) {
      elements.formatJson.addEventListener('change', () => {
        if (this.lastValidJson) {
          this.renderOutput(this.lastValidJson);
        }
      });
    }
    if (elements.formatPython) {
      elements.formatPython.addEventListener('change', () => {
        if (this.lastValidJson) {
          this.renderOutput(this.lastValidJson);
        }
      });
    }
    if (elements.prettyPrint) {
      elements.prettyPrint.addEventListener('change', () => {
        if (this.lastValidJson) {
          this.renderOutput(this.lastValidJson);
        }
      });
    }

    this.log('YAML validator ready', 'info');
  }

  clearYaml() {
    const elements = this.elements;
    elements.yamlInput.value = '';
    elements.jsonOutput.innerHTML = '';
    elements.yamlStatus.textContent = '';
    elements.yamlStatus.className = 'status-bar';
    elements.errorContainer.classList.remove('active');
    this.updateCharCount();
  }

  loadSample() {
    this.elements.yamlInput.value = SAMPLE_YAML;
    this.validateYaml();
    this.updateCharCount();
  }

  expandAll() {
    const collapsibles = document.querySelectorAll('.json-tree details');
    collapsibles.forEach(detail => detail.open = true);
  }

  collapseAll() {
    const collapsibles = document.querySelectorAll('.json-tree details');
    collapsibles.forEach(detail => detail.open = false);
  }

  copyOutput() {
    if (!this.lastValidJson) return;
    
    let outputString;
    if (this.elements.formatJson.checked) {
      outputString = this.elements.prettyPrint.checked
        ? JSON.stringify(this.lastValidJson, null, 2)
        : JSON.stringify(this.lastValidJson);
    } else {
      outputString = this.elements.prettyPrint.checked
        ? this.toPythonString(this.lastValidJson, true)
        : this.toPythonString(this.lastValidJson, false);
    }
      
    navigator.clipboard.writeText(outputString).then(() => {
      const iconSpan = this.elements.copyOutputBtn.querySelector('span');
      const originalText = iconSpan.textContent;
      iconSpan.textContent = '✓';
      setTimeout(() => {
        iconSpan.textContent = originalText;
      }, 1000);
    });
  }

  updateCharCount() {
    const text = this.elements.yamlInput.value;
    this.elements.yamlStatus.textContent = `Characters: ${text.length}`;
    this.elements.yamlStatus.className = 'p-2 bg-slate-50 text-slate-600 border-t border-slate-200 text-xs';
  }

  showError(message) {
    const elements = this.elements;
    elements.errorContainer.classList.remove('hidden');
    elements.errorContainer.classList.add('block');
    elements.errorContent.textContent = message;
    elements.yamlStatus.textContent = 'Error';
    elements.yamlStatus.className = 'p-2 bg-slate-50 border-t border-slate-200 text-xs status-bar error';
  }

  async validateYaml() {
    const elements = this.elements;
    const yamlText = elements.yamlInput.value.trim();
    
    elements.errorContainer.classList.remove('block');
    elements.errorContainer.classList.add('hidden');
    
    if (!yamlText) {
      elements.jsonOutput.innerHTML = '';
      elements.yamlStatus.textContent = 'Empty input';
      elements.yamlStatus.className = 'p-2 bg-slate-50 text-slate-600 border-t border-slate-200 text-xs';
      return;
    }
    
    try {
      const json = jsyaml.load(yamlText);
      this.lastValidJson = json;
      
      elements.yamlStatus.textContent = 'Valid YAML';
      elements.yamlStatus.className = 'p-2 bg-slate-50 border-t border-slate-200 text-xs status-bar valid';
      
      this.renderOutput(json);
    } catch (error) {
      elements.jsonOutput.innerHTML = '';
      elements.yamlStatus.textContent = 'Invalid YAML';
      elements.yamlStatus.className = 'p-2 bg-slate-50 border-t border-slate-200 text-xs status-bar error';
      
      if (error.mark) {
        this.showError(this.formatYamlError(error, yamlText));
      } else {
        this.showError(error.message || 'An error occurred while parsing YAML');
      }
      
      this.lastValidJson = null;
    }
  }

  formatYamlError(error, yamlText) {
    if (!error || !error.mark) {
      return error.message || 'Unknown error';
    }
    
    const { line, column, position } = error.mark;
    const lines = yamlText.split('\n');
    
    let errorMessage = `${error.reason || 'Parse error'} at line ${line + 1}, column ${column + 1}\n\n`;
    
    const startLine = Math.max(0, line - 2);
    const endLine = Math.min(lines.length - 1, line + 2);
    
    for (let i = startLine; i <= endLine; i++) {
      const isErrorLine = i === line;
      const lineNum = `${i + 1}`.padStart(4, ' ');
      errorMessage += `${lineNum}: ${lines[i]}\n`;
      
      if (isErrorLine) {
        errorMessage += '      ' + ' '.repeat(column) + '^\n';
      }
    }
    
    return errorMessage;
  }

  renderOutput(json) {
    if (this.elements.formatJson.checked) {
      this.renderJson(json);
    } else {
      this.renderPython(json);
    }
  }

  renderJson(json) {
    if (this.elements.prettyPrint.checked) {
      this.elements.jsonOutput.innerHTML = this.buildJsonTree(json);
    } else {
      this.elements.jsonOutput.textContent = JSON.stringify(json, null, 2);
    }
  }

  renderPython(json) {
    if (this.elements.prettyPrint.checked) {
      this.elements.jsonOutput.innerHTML = this.buildPythonTree(json);
    } else {
      this.elements.jsonOutput.textContent = this.toPythonString(json, true);
    }
  }

  buildJsonTree(data, isRoot = true) {
    if (data === null) {
      return '<span class="json-null">null</span>';
    }
    
    if (typeof data !== 'object') {
      return this.formatPrimitive(data);
    }
    
    const isArray = Array.isArray(data);
    let html = isRoot ? '<ul class="json-tree">' : '<ul>';
    
    if (Object.keys(data).length === 0) {
      return isArray ? '[]' : '{}';
    }
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const isComplex = value !== null && typeof value === 'object';
        
        html += '<li class="json-tree-item">';
        
        if (isComplex) {
          const valueType = Array.isArray(value) ? 'array' : 'object';
          const summary = Array.isArray(value) 
            ? `[${value.length} items]` 
            : `{${Object.keys(value).length} properties}`;
          
          html += `<details>
            <summary>
              ${isArray ? '' : `<span class="json-key">${this.escapeHtml(key)}:</span> `}
              <span class="json-${valueType}-summary">${summary}</span>
            </summary>
            ${this.buildJsonTree(value, false)}
          </details>`;
        } else {
          html += isArray 
            ? this.formatPrimitive(value)
            : `<span class="json-key">${this.escapeHtml(key)}:</span> ${this.formatPrimitive(value)}`;
        }
        
        html += '</li>';
      }
    }
    
    html += '</ul>';
    return html;
  }

  buildPythonTree(data, isRoot = true) {
    if (data === null) {
      return '<span class="python-none">None</span>';
    }
    
    if (typeof data !== 'object') {
      return this.formatPythonPrimitive(data);
    }
    
    const isArray = Array.isArray(data);
    let html = isRoot ? '<ul class="json-tree python-dict">' : '<ul>';
    
    if (Object.keys(data).length === 0) {
      return isArray ? '[]' : '{}';
    }
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const isComplex = value !== null && typeof value === 'object';
        
        html += '<li class="json-tree-item">';
        
        if (isComplex) {
          const valueType = Array.isArray(value) ? 'array' : 'dict';
          const summary = Array.isArray(value) 
            ? `[${value.length} items]` 
            : `{${Object.keys(value).length} items}`;
          
          html += `<details>
            <summary>
              ${isArray ? '' : `<span class="python-key">'${this.escapeHtml(key)}':</span> `}
              <span class="python-${valueType}-summary">${summary}</span>
            </summary>
            ${this.buildPythonTree(value, false)}
          </details>`;
        } else {
          html += isArray 
            ? this.formatPythonPrimitive(value)
            : `<span class="python-key">'${this.escapeHtml(key)}':</span> ${this.formatPythonPrimitive(value)}`;
        }
        
        html += '</li>';
      }
    }
    
    html += '</ul>';
    return html;
  }

  formatPrimitive(value) {
    if (value === null) return '<span class="json-null">null</span>';
    
    switch (typeof value) {
      case 'string':
        return `<span class="json-string">"${this.escapeHtml(value)}"</span>`;
      case 'number':
        return `<span class="json-number">${value}</span>`;
      case 'boolean':
        return `<span class="json-boolean">${value}</span>`;
      default:
        return `<span>${this.escapeHtml(String(value))}</span>`;
    }
  }

  formatPythonPrimitive(value) {
    if (value === null) return '<span class="python-none">None</span>';
    
    switch (typeof value) {
      case 'string':
        return `<span class="python-string">'${this.escapeHtml(value)}'</span>`;
      case 'number':
        return `<span class="python-number">${value}</span>`;
      case 'boolean':
        return `<span class="python-boolean">${value ? 'True' : 'False'}</span>`;
      default:
        return `<span>${this.escapeHtml(String(value))}</span>`;
    }
  }

  toPythonString(data, pretty = false, indent = 0) {
    const spaces = pretty ? ' '.repeat(indent) : '';
    const newline = pretty ? '\n' : '';
    const spacing = pretty ? ' ' : '';
    const nextIndent = indent + 2;
    
    if (data === null) return 'None';
    
    switch (typeof data) {
      case 'string':
        const escaped = data.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `'${escaped}'`;
      case 'number':
        return data.toString();
      case 'boolean':
        return data ? 'True' : 'False';
      case 'object':
        if (Array.isArray(data)) {
          if (data.length === 0) return '[]';
          
          let result = '[' + newline;
          for (let i = 0; i < data.length; i++) {
            const comma = i < data.length - 1 ? ',' : '';
            result += spaces + (pretty ? '  ' : '') + 
                     this.toPythonString(data[i], pretty, nextIndent) + comma + newline;
          }
          result += spaces + ']';
          return result;
        } else {
          if (Object.keys(data).length === 0) return '{}';
          
          let result = '{' + newline;
          const keys = Object.keys(data);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const comma = i < keys.length - 1 ? ',' : '';
            result += spaces + (pretty ? '  ' : '') + 
                     `'${key}'${spacing}:${spacing}` + 
                     this.toPythonString(data[key], pretty, nextIndent) + comma + newline;
          }
          result += spaces + '}';
          return result;
        }
      default:
        return String(data);
    }
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export function initTool() {
  const tool = new YamlValidatorTool({
    id: 'yaml',
    name: 'YAML Validator'
  });
  
  return tool.init();
} 