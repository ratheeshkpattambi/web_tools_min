/**
 * YAML Validator Tool
 * Validate YAML and convert it to JSON or Python dictionary with interactive view
 */
import { Tool } from '../common/base.js';
import jsyaml from 'js-yaml';

// YAML validator tool template
export const template = `
    <div class="tool-container">
      <h1>YAML Validator</h1>
      <p class="section-description">Validate YAML and convert it to JSON or Python dictionary with interactive view</p>
      
      <div class="yaml-editor-container">
        <div class="editor-panel">
          <div class="panel-header">
            <h3>YAML Input</h3>
            <div class="panel-actions">
              <button id="clearYamlBtn" class="btn-icon" title="Clear">
                <span class="icon">❌</span>
              </button>
              <button id="loadSampleBtn" class="btn-icon" title="Load Sample">
                <span class="icon">📋</span>
              </button>
            </div>
          </div>
          <textarea id="yamlInput" class="yaml-editor" placeholder="Paste your YAML here..."></textarea>
          <div id="yamlStatus" class="status-bar"></div>
        </div>
        
        <div class="output-panel">
          <div class="panel-header">
            <h3>Output</h3>
            <div class="panel-actions">
              <button id="expandAllBtn" class="btn-icon" title="Expand All">
                <span class="icon">🔽</span>
              </button>
              <button id="collapseAllBtn" class="btn-icon" title="Collapse All">
                <span class="icon">◀</span>
              </button>
              <button id="copyOutputBtn" class="btn-icon" title="Copy">
                <span class="icon">📋</span>
              </button>
            </div>
          </div>
          <div id="jsonOutput" class="json-output"></div>
        </div>
      </div>
      
      <div id="errorContainer" class="error-container">
        <div class="error-header">Error</div>
        <div id="errorContent" class="error-content"></div>
      </div>
      
      <div class="tool-options">
        <div class="option-group">
          <label>
            <input type="checkbox" id="autoValidate" checked>
            Auto-validate
          </label>
        </div>
        <div class="option-group">
          <label>
            <input type="checkbox" id="prettyPrint">
            Pretty print
          </label>
        </div>
        <div class="option-group format-selector">
          <span>Format:</span>
          <label class="radio-label">
            <input type="radio" name="outputFormat" id="formatJson" checked>
            JSON
          </label>
          <label class="radio-label">
            <input type="radio" name="outputFormat" id="formatPython">
            Python Dict
          </label>
        </div>
      </div>
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
      const originalText = this.elements.copyOutputBtn.querySelector('.icon').textContent;
      this.elements.copyOutputBtn.querySelector('.icon').textContent = '✓';
      setTimeout(() => {
        this.elements.copyOutputBtn.querySelector('.icon').textContent = originalText;
      }, 1000);
    });
  }

  updateCharCount() {
    const text = this.elements.yamlInput.value;
    this.elements.yamlStatus.textContent = `Characters: ${text.length}`;
    this.elements.yamlStatus.className = 'status-bar';
  }

  showError(message) {
    const elements = this.elements;
    elements.errorContainer.classList.add('active');
    elements.errorContent.textContent = message;
    elements.yamlStatus.textContent = 'Error';
    elements.yamlStatus.className = 'status-bar error';
  }

  async validateYaml() {
    const elements = this.elements;
    const yamlText = elements.yamlInput.value.trim();
    
    elements.errorContainer.classList.remove('active');
    
    if (!yamlText) {
      elements.jsonOutput.innerHTML = '';
      elements.yamlStatus.textContent = 'Empty input';
      elements.yamlStatus.className = 'status-bar';
      return;
    }
    
    try {
      const json = jsyaml.load(yamlText);
      this.lastValidJson = json;
      
      elements.yamlStatus.textContent = 'Valid YAML';
      elements.yamlStatus.className = 'status-bar valid';
      
      this.renderOutput(json);
    } catch (error) {
      elements.jsonOutput.innerHTML = '';
      elements.yamlStatus.textContent = 'Invalid YAML';
      elements.yamlStatus.className = 'status-bar error';
      
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