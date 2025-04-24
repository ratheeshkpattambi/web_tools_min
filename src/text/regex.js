/**
 * Regex Tester Tool
 * Test and validate regular expressions with real-time highlighting
 */
import { Tool } from '../common/base.js';

// Sample text for demonstration
const SAMPLE_TEXT = `Here are some examples to test your regex patterns:

Email addresses:
user@example.com
john.doe123@company-name.co.uk
invalid@email

URLs:
https://www.example.com
http://subdomain.example.org/path/to/page.html
ftp://files.example.net
www.example.com

Phone numbers:
+1-555-123-4567
(555) 987-6543
555.123.4567
5551234567

Dates:
2023-04-25
04/25/2023
25.04.2023
April 25, 2023

IPv4 addresses:
192.168.1.1
10.0.0.255
172.16.254.1
256.0.0.1 (invalid)

Social Security Numbers (US):
123-45-6789
123 45 6789

Product codes:
ABC-12345-Z
XY-9876-B
`;

// Default regex example to show whitespace separation
const DEFAULT_REGEX = "\\S+";
const DEFAULT_FLAGS = "g";

class RegexTesterTool extends Tool {
  constructor(config = {}) {
    super({
      ...config,
      category: 'text',
      needsFileUpload: false,
      hasOutput: true,
      needsProcessButton: false
    });
    
    this.matchCount = 0;
    this.lastRegex = null;
    this.lastPattern = '';
    this.lastFlags = '';
    this.updateTimeout = null;
  }

  getElementsMap() {
    return {
      regexInput: 'regexInput',
      regexFlags: 'regexFlags',
      sampleText: 'sampleText',
      matchCount: 'matchCount',
      errorDisplay: 'errorDisplay',
      clearRegexBtn: 'clearRegexBtn',
      loadSampleBtn: 'loadSampleBtn',
      toggleHighlight: 'toggleHighlight',
      toggleLineNumbers: 'toggleLineNumbers',
      highlightContainer: 'highlightContainer',
      logHeader: 'logHeader',
      logContent: 'logContent',
      wordModeBtn: 'wordModeBtn',
      copyRegexBtn: 'copyRegexBtn'
    };
  }

  async setup() {
    const elements = this.elements;

    // Set up regex input handling with default word separator pattern
    if (elements.regexInput) {
      elements.regexInput.value = DEFAULT_REGEX; // Set default word separator pattern
      elements.regexInput.addEventListener('input', () => this.debouncedUpdateRegex());
    }
    
    // Set up flags input handling with global flag by default
    if (elements.regexFlags) {
      elements.regexFlags.value = DEFAULT_FLAGS; // Set default global flag
      elements.regexFlags.addEventListener('input', () => this.debouncedUpdateRegex());
    }
    
    // Set up sample text handling
    if (elements.sampleText) {
      elements.sampleText.addEventListener('input', () => this.debouncedUpdateRegex());
      
      // Load sample text by default if input is empty
      if (!elements.sampleText.value) {
        this.loadSample();
      }
    }
    
    // Button handlers
    if (elements.clearRegexBtn) {
      elements.clearRegexBtn.addEventListener('click', () => this.clearRegex());
    }
    
    if (elements.loadSampleBtn) {
      elements.loadSampleBtn.addEventListener('click', () => this.loadSample());
    }
    
    if (elements.wordModeBtn) {
      elements.wordModeBtn.addEventListener('click', () => this.setWordMode());
    }
    
    if (elements.copyRegexBtn) {
      elements.copyRegexBtn.addEventListener('click', () => this.copyRegex());
    }
    
    // Toggle options
    if (elements.toggleHighlight) {
      elements.toggleHighlight.addEventListener('change', () => this.updateRegex());
    }
    
    if (elements.toggleLineNumbers) {
      elements.toggleLineNumbers.addEventListener('change', () => this.updateDisplay());
    }

    this.log('Regex tester ready', 'info');
    this.log('Default pattern will match all words using whitespace as separator', 'info');
    
    // Initial regex update with default pattern
    this.updateRegex();
  }

  debouncedUpdateRegex() {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => this.updateRegex(), 300);
  }

  updateRegex() {
    const elements = this.elements;
    const pattern = elements.regexInput.value;
    const flags = elements.regexFlags.value;
    const text = elements.sampleText.value;
    
    elements.errorDisplay.textContent = '';
    elements.errorDisplay.style.display = 'none';
    
    if (!pattern) {
      this.clearHighlighting();
      elements.matchCount.textContent = '0 matches';
      return;
    }
    
    try {
      const regex = new RegExp(pattern, flags);
      this.lastRegex = regex;
      this.lastPattern = pattern;
      this.lastFlags = flags;
      
      // Display matches
      this.highlightMatches(text, regex);
      
    } catch (error) {
      this.showError(error.message);
      this.clearHighlighting();
    }
  }
  
  highlightMatches(text, regex) {
    const elements = this.elements;
    
    // Find all matches
    let match;
    let matches = [];
    let hasGlobalFlag = regex.flags.includes('g');
    
    if (hasGlobalFlag) {
      // Reset lastIndex to ensure we start from the beginning
      regex.lastIndex = 0;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          lastIndex: regex.lastIndex,
          text: match[0],
          groups: match
        });
      }
    } else {
      match = regex.exec(text);
      if (match) {
        matches.push({
          index: match.index,
          lastIndex: match.index + match[0].length,
          text: match[0],
          groups: match
        });
      }
    }
    
    // Update match count
    this.matchCount = matches.length;
    elements.matchCount.textContent = `${this.matchCount} match${this.matchCount !== 1 ? 'es' : ''}`;
    
    if (elements.toggleHighlight && elements.toggleHighlight.checked) {
      this.displayWithHighlighting(text, matches);
    } else {
      elements.highlightContainer.innerHTML = '';
    }
  }
  
  displayWithHighlighting(text, matches) {
    const elements = this.elements;
    const showLineNumbers = elements.toggleLineNumbers && elements.toggleLineNumbers.checked;
    
    if (matches.length === 0) {
      elements.highlightContainer.innerHTML = this.formatTextWithoutHighlights(text, showLineNumbers);
      return;
    }
    
    // Create highlighted HTML
    let html = '';
    let lastIndex = 0;
    let lineNum = 1;
    
    if (showLineNumbers) {
      html += `<span class="line-number">${lineNum}</span> `;
    }
    
    // Sort matches by their index to ensure correct order
    matches.sort((a, b) => a.index - b.index);
    
    for (const match of matches) {
      // Add text before the match
      const beforeMatch = text.substring(lastIndex, match.index);
      html += this.escapeHtml(beforeMatch).replace(/\n/g, () => {
        lineNum++;
        return `\n${showLineNumbers ? `<span class="line-number">${lineNum}</span> ` : ''}`;
      });
      
      // Add the matched text with group highlighting
      const matchedText = text.substring(match.index, match.lastIndex);
      
      // Add tooltip with group information if there are capturing groups
      let tooltipContent = '';
      if (match.groups.length > 1) {
        tooltipContent = ` title="Match: ${this.escapeHtml(match.text)}\n${match.groups.slice(1).map((g, i) => `Group ${i+1}: ${g}`).join('\n')}"`;
      }
      
      html += `<span class="regex-match"${tooltipContent}>${this.escapeHtml(matchedText)}</span>`;
      
      lastIndex = match.lastIndex;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      html += this.escapeHtml(text.substring(lastIndex)).replace(/\n/g, () => {
        lineNum++;
        return `\n${showLineNumbers ? `<span class="line-number">${lineNum}</span> ` : ''}`;
      });
    }
    
    elements.highlightContainer.innerHTML = `<pre class="regex-highlight">${html}</pre>`;
  }
  
  formatTextWithoutHighlights(text, showLineNumbers) {
    if (!showLineNumbers) {
      return `<pre>${this.escapeHtml(text)}</pre>`;
    }
    
    const lines = text.split('\n');
    let html = '<pre>';
    
    for (let i = 0; i < lines.length; i++) {
      html += `<span class="line-number">${i + 1}</span> ${this.escapeHtml(lines[i])}\n`;
    }
    
    html += '</pre>';
    return html;
  }
  
  clearHighlighting() {
    const elements = this.elements;
    if (elements.highlightContainer) {
      elements.highlightContainer.innerHTML = '';
    }
  }
  
  updateDisplay() {
    if (this.lastRegex) {
      const text = this.elements.sampleText.value;
      this.highlightMatches(text, this.lastRegex);
    }
  }
  
  clearRegex() {
    const elements = this.elements;
    elements.regexInput.value = '';
    elements.regexFlags.value = 'g';
    elements.errorDisplay.textContent = '';
    elements.errorDisplay.style.display = 'none';
    elements.matchCount.textContent = '0 matches';
    this.clearHighlighting();
    
    this.lastRegex = null;
    this.lastPattern = '';
    this.lastFlags = '';
    this.matchCount = 0;
  }
  
  loadSample() {
    this.elements.sampleText.value = SAMPLE_TEXT;
    this.updateRegex();
  }
  
  setWordMode() {
    // Set the regex pattern to match words with whitespace as separator
    this.elements.regexInput.value = "\\S+";
    this.elements.regexFlags.value = "g";
    this.updateRegex();
    this.log('Word matching mode activated: highlighting all non-whitespace sequences', 'info');
  }
  
  copyRegex() {
    const pattern = this.elements.regexInput.value;
    const flags = this.elements.regexFlags.value;
    
    if (!pattern) {
      this.log('No regex pattern to copy', 'error');
      return;
    }
    
    const regexString = `/${pattern}/${flags}`;
    navigator.clipboard.writeText(regexString)
      .then(() => this.log('Regex copied to clipboard', 'success'))
      .catch(err => this.log('Failed to copy: ' + err, 'error'));
  }
  
  showError(message) {
    const elements = this.elements;
    elements.errorDisplay.textContent = `Error: ${message}`;
    elements.errorDisplay.style.display = 'block';
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
  const tool = new RegexTesterTool({
    id: 'regex',
    name: 'Regex Tester'
  });
  
  return tool.init();
}