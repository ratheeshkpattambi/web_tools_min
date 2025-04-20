import { generateToolCard } from './common/template.js';
import { 
  getToolTemplate, 
  get404Template, 
  getErrorTemplate 
} from './common/toolTemplates.js';

// Central tool configuration - all tools defined in one place
const TOOLS_CONFIG = {
  video: {
    name: 'Video Tools',
    description: 'Process and convert your videos with ease',
    tools: [
      {
        id: 'resize',
        name: 'Video Resize',
        icon: '📐',
        description: 'Resize videos while maintaining quality',
        modulePath: './video/resize.js',
        initFunction: 'initTool'
      },
      {
        id: 'reencode',
        name: 'Video Re-encode',
        icon: '🎥',
        description: 'Convert videos to different formats',
        modulePath: './video/reencode.js',
        initFunction: 'initTool'
      },
      {
        id: 'info',
        name: 'Video Info',
        icon: 'ℹ️',
        description: 'View detailed video metadata and properties',
        modulePath: './video/info.js',
        initFunction: 'initTool'
      }
    ]
  },
  image: {
    name: 'Image Tools',
    description: 'Edit and optimize your images',
    tools: [
      {
        id: 'resize',
        name: 'Image Resize',
        icon: '🖼️',
        description: 'Resize and optimize images while maintaining quality',
        modulePath: './image/resize.js',
        initFunction: 'initPage'
      }
    ]
  },
  text: {
    name: 'Text Tools',
    description: 'Simple text editing and formatting tools',
    tools: [
      {
        id: 'editor',
        name: 'Text Editor',
        icon: '📝',
        description: 'Simple text editing with formatting options',
        modulePath: './text/editor.js',
        initFunction: 'initPage'
      }
    ]
  }
};

/**
 * Find a tool based on the path
 * @param {string} path - The URL path
 * @returns {Object|null} The tool data or null if not found
 */
function findTool(path) {
  // Parse the path to extract category and tool ID
  const pathParts = path.split('/').filter(part => part);
  if (pathParts.length < 1) return null;
  
  const category = pathParts[0];
  const toolId = pathParts.length > 1 ? pathParts[1] : null;
  
  // Get the category config
  const categoryConfig = TOOLS_CONFIG[category];
  if (!categoryConfig) return null;
  
  // If no specific tool requested, return the category
  if (!toolId) return { category: categoryConfig, type: 'category', id: category };
  
  // Find the specific tool
  const tool = categoryConfig.tools.find(t => t.id === toolId);
  if (!tool) return null;
  
  return { category: categoryConfig, tool, type: 'tool', id: category };
}

/**
 * Generate content for the home page
 * @returns {string} HTML for the home page
 */
function generateHomeContent() {
  return `
    <div class="tool-container">
      <h1>Welcome to SafeWebTool</h1>
      <p class="section-description">A collection of privacy-focused tools that process your data locally in your browser.</p>
      
      ${Object.entries(TOOLS_CONFIG).map(([category, config]) => `
        <section class="tools-section">
          <h2>${config.name}</h2>
          <p class="section-description">${config.description}</p>
          <div class="tool-grid">
            ${config.tools.map(tool => `
              <a href="/${category}/${tool.id}" class="tool-card">
                <div class="tool-icon">${tool.icon}</div>
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
              </a>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;
}

/**
 * Generate content for a category page
 * @param {Object} categoryConfig - The category configuration
 * @param {string} categoryId - The category ID
 * @returns {string} HTML for the category page
 */
function generateCategoryContent(categoryConfig, categoryId) {
  return `
    <div class="tool-container">
      <h1>${categoryConfig.name}</h1>
      <p class="section-description">${categoryConfig.description}</p>
      <div class="tool-grid">
        ${categoryConfig.tools.map(tool => `
          <a href="/${categoryId}/${tool.id}" class="tool-card">
            <div class="tool-icon">${tool.icon}</div>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Main route handler
 * @param {string} path - The URL path
 */
export async function handleRoute(path) {
  const main = document.querySelector('main');
  if (!main) return;

  let content = '';
  let pageTitle = 'SafeWebTool';
  
  // Handle root path
  if (path === '/' || path === '/home') {
    content = generateHomeContent();
  } else {
    // Find the requested tool or category
    const result = findTool(path);
    
    if (!result) {
      // 404 page
      content = get404Template();
    } else if (result.type === 'category') {
      // Category page (e.g., /video)
      content = generateCategoryContent(result.category, result.id);
      pageTitle = `${result.category.name} | SafeWebTool`;
    } else {
      // Specific tool page (e.g., /video/resize)
      const category = path.split('/')[1];
      const toolId = path.split('/')[2];
      
      // Get the template for this tool
      const toolTemplate = getToolTemplate(category, toolId);
      
      if (!toolTemplate) {
        content = getErrorTemplate('Tool Not Found', `The tool "${toolId}" could not be found in category "${category}".`);
      } else {
        content = toolTemplate;
        pageTitle = `${result.tool.name} | SafeWebTool`;
      }
    }
  }
  
  // Update page title and content
  document.title = pageTitle;
  main.innerHTML = content;
  
  // Initialize tool AFTER DOM elements are available
  if (path !== '/' && path !== '/home') {
    const result = findTool(path);
    if (result && result.type === 'tool') {
      try {
        // Small delay to ensure DOM is fully updated
        setTimeout(async () => {
          try {
            // Import the tool module
            const modulePath = result.tool.modulePath;
            const initFunctionName = result.tool.initFunction;
            
            const module = await import(/* @vite-ignore */ modulePath);
            if (module[initFunctionName]) {
              module[initFunctionName]();
            }
          } catch (error) {
            console.error(`Failed to load tool module: ${error.message}`);
            main.innerHTML = getErrorTemplate(
              'Error Loading Tool', 
              'The requested tool could not be loaded.', 
              error.message
            );
          }
        }, 10);
      } catch (error) {
        console.error(`Failed to initialize tool: ${error.message}`);
      }
    }
  }
} 