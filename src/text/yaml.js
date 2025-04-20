/**
 * YAML Validator and JSON converter
 * Dynamically imports js-yaml for validation and parsing
 */

// Sample YAML for demonstration - smaller but with diverse field types
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

// Keep track of whether we've loaded the js-yaml library
let jsYaml = null;
let isLoadingLibrary = false;

/**
 * Initialize the YAML validator tool
 */
export function initTool() {
  const elements = {
    yamlInput: document.getElementById('yamlInput'),
    jsonOutput: document.getElementById('jsonOutput'),
    yamlStatus: document.getElementById('yamlStatus'),
    errorContainer: document.getElementById('errorContainer'),
    errorContent: document.getElementById('errorContent'),
    clearYamlBtn: document.getElementById('clearYamlBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    expandAllBtn: document.getElementById('expandAllBtn'),
    collapseAllBtn: document.getElementById('collapseAllBtn'),
    copyOutputBtn: document.getElementById('copyOutputBtn'),
    autoValidate: document.getElementById('autoValidate'),
    prettyPrint: document.getElementById('prettyPrint'),
    formatJson: document.getElementById('formatJson'),
    formatPython: document.getElementById('formatPython')
  };

  let validationTimeout;
  let lastValidJson = null;

  // Lazy load the js-yaml library
  async function loadYamlLibrary() {
    if (jsYaml) return jsYaml;
    if (isLoadingLibrary) return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (jsYaml) {
          clearInterval(checkInterval);
          resolve(jsYaml);
        }
      }, 100);
    });

    isLoadingLibrary = true;
    showLoadingIndicator('Loading YAML parser...');

    try {
      // Dynamically import the js-yaml library
      const module = await import('js-yaml');
      jsYaml = module;
      hideLoadingIndicator();
      return jsYaml;
    } catch (error) {
      console.error('Failed to load js-yaml library:', error);
      showError('Failed to load YAML parser library. Please try again later.');
      isLoadingLibrary = false;
      hideLoadingIndicator();
      throw error;
    }
  }

  // Show loading indicator
  function showLoadingIndicator(message) {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-indicator';
    loadingEl.innerHTML = `
      <div class="loading-spinner"></div>
      <p>${message}</p>
    `;
    loadingEl.id = 'yaml-loading';
    elements.jsonOutput.innerHTML = '';
    elements.jsonOutput.appendChild(loadingEl);
    elements.yamlStatus.textContent = 'Loading library...';
  }

  // Hide loading indicator
  function hideLoadingIndicator() {
    const loadingEl = document.getElementById('yaml-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  // Show error message
  function showError(message) {
    elements.errorContainer.classList.add('active');
    elements.errorContent.textContent = message;
    elements.yamlStatus.textContent = 'Error';
    elements.yamlStatus.className = 'status-bar error';
  }

  // Initialize the editor
  function initEditor() {
    // Set tab key behavior to insert spaces instead of changing focus
    elements.yamlInput.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
      }
    });

    // Auto-validate on input
    elements.yamlInput.addEventListener('input', function() {
      clearTimeout(validationTimeout);
      updateCharCount();
      
      if (elements.autoValidate.checked) {
        validationTimeout = setTimeout(() => {
          validateYaml();
        }, 300); // Debounce validation
      }
    });

    // Clear button
    elements.clearYamlBtn.addEventListener('click', function() {
      elements.yamlInput.value = '';
      elements.jsonOutput.innerHTML = '';
      elements.yamlStatus.textContent = '';
      elements.yamlStatus.className = 'status-bar';
      elements.errorContainer.classList.remove('active');
      updateCharCount();
    });

    // Load sample button
    elements.loadSampleBtn.addEventListener('click', function() {
      elements.yamlInput.value = SAMPLE_YAML;
      validateYaml();
      updateCharCount();
    });

    // Expand all button
    elements.expandAllBtn.addEventListener('click', function() {
      const collapsibles = document.querySelectorAll('.json-tree details');
      collapsibles.forEach(detail => {
        detail.open = true;
      });
    });

    // Collapse all button
    elements.collapseAllBtn.addEventListener('click', function() {
      const collapsibles = document.querySelectorAll('.json-tree details');
      collapsibles.forEach(detail => {
        detail.open = false;
      });
    });

    // Copy output button
    elements.copyOutputBtn.addEventListener('click', function() {
      if (!lastValidJson) return;
      
      let outputString;
      if (elements.formatJson.checked) {
        // JSON format
        outputString = elements.prettyPrint.checked
          ? JSON.stringify(lastValidJson, null, 2)
          : JSON.stringify(lastValidJson);
      } else {
        // Python format
        outputString = elements.prettyPrint.checked
          ? toPythonString(lastValidJson, true)
          : toPythonString(lastValidJson, false);
      }
        
      navigator.clipboard.writeText(outputString).then(() => {
        // Show temporary success message
        const originalText = elements.copyOutputBtn.querySelector('.icon').textContent;
        elements.copyOutputBtn.querySelector('.icon').textContent = '✓';
        setTimeout(() => {
          elements.copyOutputBtn.querySelector('.icon').textContent = originalText;
        }, 1000);
      });
    });

    // Manual validate on checkbox change
    elements.autoValidate.addEventListener('change', function() {
      if (this.checked && elements.yamlInput.value) {
        validateYaml();
      }
    });

    // Format change handler
    elements.formatJson.addEventListener('change', function() {
      if (lastValidJson) {
        renderOutput(lastValidJson);
      }
    });
    
    elements.formatPython.addEventListener('change', function() {
      if (lastValidJson) {
        renderOutput(lastValidJson);
      }
    });

    // Re-render on pretty print change
    elements.prettyPrint.addEventListener('change', function() {
      if (lastValidJson) {
        renderOutput(lastValidJson);
      }
    });
  }

  // Validate YAML and convert to JSON
  async function validateYaml() {
    const yamlText = elements.yamlInput.value.trim();
    
    // Clear previous messages
    elements.errorContainer.classList.remove('active');
    
    // Handle empty input
    if (!yamlText) {
      elements.jsonOutput.innerHTML = '';
      elements.yamlStatus.textContent = 'Empty input';
      elements.yamlStatus.className = 'status-bar';
      return;
    }
    
    try {
      // Load the YAML library if not loaded
      const yaml = await loadYamlLibrary();
      
      // Parse YAML to JSON
      const json = yaml.load(yamlText);
      lastValidJson = json;
      
      // Display success message
      elements.yamlStatus.textContent = 'Valid YAML';
      elements.yamlStatus.className = 'status-bar valid';
      
      // Render output in selected format
      renderOutput(json);
    } catch (error) {
      // Handle parse error
      elements.jsonOutput.innerHTML = '';
      elements.yamlStatus.textContent = 'Invalid YAML';
      elements.yamlStatus.className = 'status-bar error';
      
      // Display detailed error
      elements.errorContainer.classList.add('active');
      
      // Check if it's a YAML parsing error with mark info
      if (error.mark) {
        elements.errorContent.textContent = formatYamlError(error, yamlText);
      } else {
        // Otherwise show general error
        elements.errorContent.textContent = error.message || 'An error occurred while parsing YAML';
      }
      
      lastValidJson = null;
    }
  }

  // Format YAML error with line context
  function formatYamlError(error, yamlText) {
    if (!error || !error.mark) {
      return error.message || 'Unknown error';
    }
    
    const { line, column, position } = error.mark;
    const lines = yamlText.split('\n');
    
    let errorMessage = `${error.reason || 'Parse error'} at line ${line + 1}, column ${column + 1}\n\n`;
    
    // Add context lines before the error
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

  // Update character count
  function updateCharCount() {
    const text = elements.yamlInput.value;
    elements.yamlStatus.textContent = `Characters: ${text.length}`;
    elements.yamlStatus.className = 'status-bar';
  }

  // Render output based on selected format
  function renderOutput(json) {
    if (elements.formatJson.checked) {
      renderJson(json);
    } else {
      renderPython(json);
    }
  }

  // Render JSON as interactive tree view
  function renderJson(json) {
    if (elements.prettyPrint.checked) {
      elements.jsonOutput.innerHTML = buildJsonTree(json);
    } else {
      // Simple stringified output
      elements.jsonOutput.textContent = JSON.stringify(json, null, 2);
    }
  }

  // Build HTML for JSON tree view
  function buildJsonTree(data, isRoot = true) {
    if (data === null) {
      return '<span class="json-null">null</span>';
    }
    
    if (typeof data !== 'object') {
      return formatPrimitive(data);
    }
    
    const isArray = Array.isArray(data);
    let html = isRoot ? '<ul class="json-tree">' : '<ul>';
    
    // For empty objects/arrays
    if (Object.keys(data).length === 0) {
      return isArray ? '[]' : '{}';
    }
    
    // Build tree items
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
              ${isArray ? '' : `<span class="json-key">${escapeHtml(key)}:</span> `}
              <span class="json-${valueType}-summary">${summary}</span>
            </summary>
            ${buildJsonTree(value, false)}
          </details>`;
        } else {
          html += isArray 
            ? formatPrimitive(value)
            : `<span class="json-key">${escapeHtml(key)}:</span> ${formatPrimitive(value)}`;
        }
        
        html += '</li>';
      }
    }
    
    html += '</ul>';
    return html;
  }

  // Format primitive values with appropriate class
  function formatPrimitive(value) {
    if (value === null) return '<span class="json-null">null</span>';
    
    switch (typeof value) {
      case 'string':
        return `<span class="json-string">"${escapeHtml(value)}"</span>`;
      case 'number':
        return `<span class="json-number">${value}</span>`;
      case 'boolean':
        return `<span class="json-boolean">${value}</span>`;
      default:
        return `<span>${escapeHtml(String(value))}</span>`;
    }
  }

  // Render Python dictionary
  function renderPython(json) {
    if (elements.prettyPrint.checked) {
      elements.jsonOutput.innerHTML = buildPythonTree(json);
    } else {
      // Simple stringified output
      elements.jsonOutput.textContent = toPythonString(json, true);
    }
  }

  // Convert JSON to Python string
  function toPythonString(data, pretty = false, indent = 0) {
    const spaces = pretty ? ' '.repeat(indent) : '';
    const newline = pretty ? '\n' : '';
    const spacing = pretty ? ' ' : '';
    const nextIndent = indent + 2;
    
    if (data === null) return 'None';
    
    switch (typeof data) {
      case 'string':
        // Escape single quotes and backslashes
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
                     toPythonString(data[i], pretty, nextIndent) + comma + newline;
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
                     toPythonString(data[key], pretty, nextIndent) + comma + newline;
          }
          result += spaces + '}';
          return result;
        }
      default:
        return String(data);
    }
  }

  // Build HTML for Python tree view
  function buildPythonTree(data, isRoot = true) {
    if (data === null) {
      return '<span class="python-none">None</span>';
    }
    
    if (typeof data !== 'object') {
      return formatPythonPrimitive(data);
    }
    
    const isArray = Array.isArray(data);
    let html = isRoot ? '<ul class="json-tree python-dict">' : '<ul>';
    
    // For empty objects/arrays
    if (Object.keys(data).length === 0) {
      return isArray ? '[]' : '{}';
    }
    
    // Build tree items
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
              ${isArray ? '' : `<span class="python-key">'${escapeHtml(key)}':</span> `}
              <span class="python-${valueType}-summary">${summary}</span>
            </summary>
            ${buildPythonTree(value, false)}
          </details>`;
        } else {
          html += isArray 
            ? formatPythonPrimitive(value)
            : `<span class="python-key">'${escapeHtml(key)}':</span> ${formatPythonPrimitive(value)}`;
        }
        
        html += '</li>';
      }
    }
    
    html += '</ul>';
    return html;
  }

  // Format Python primitive values with appropriate class
  function formatPythonPrimitive(value) {
    if (value === null) return '<span class="python-none">None</span>';
    
    switch (typeof value) {
      case 'string':
        return `<span class="python-string">'${escapeHtml(value)}'</span>`;
      case 'number':
        return `<span class="python-number">${value}</span>`;
      case 'boolean':
        return `<span class="python-boolean">${value ? 'True' : 'False'}</span>`;
      default:
        return `<span>${escapeHtml(String(value))}</span>`;
    }
  }

  // Escape HTML special characters
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize the editor
  initEditor();
  
  // Update character count on load
  updateCharCount();
  
  // Initialize with pretty print disabled
  elements.prettyPrint.checked = false;
  
  // Load sample YAML if the editor is empty and validate immediately
  if (!elements.yamlInput.value) {
    elements.yamlInput.value = SAMPLE_YAML;
    // Validate immediately to show output when page loads
    validateYaml();
  }
} 