import { generateToolCard } from './common/template.js';
import { 
  getToolTemplate, 
  get404Template, 
  getErrorTemplate 
} from './common/toolTemplates.js';
import { 
  generateMetaTags, 
  generateStructuredData,
  categories,
  tools,
  getToolMetadata,
  getCategoryMetadata
} from './common/metadata.js';

// Central tool configuration - all tools defined in one place
const TOOLS_CONFIG = {
  video: {
    name: categories.video.name,
    description: categories.video.description,
    tools: [
      {
        id: tools['video/resize'].id,
        name: tools['video/resize'].name,
        icon: tools['video/resize'].icon,
        description: tools['video/resize'].shortDescription,
        modulePath: './video/resize.js',
        initFunction: 'initTool'
      },
      {
        id: tools['video/reencode'].id,
        name: tools['video/reencode'].name,
        icon: tools['video/reencode'].icon,
        description: tools['video/reencode'].shortDescription,
        modulePath: './video/reencode.js',
        initFunction: 'initTool'
      },
      {
        id: tools['video/info'].id,
        name: tools['video/info'].name,
        icon: tools['video/info'].icon,
        description: tools['video/info'].shortDescription,
        modulePath: './video/info.js',
        initFunction: 'initTool'
      },
      {
        id: tools['video/gif'].id,
        name: tools['video/gif'].name,
        icon: tools['video/gif'].icon,
        description: tools['video/gif'].shortDescription,
        modulePath: './video/gif.js',
        initFunction: 'initTool'
      }
    ]
  },
  image: {
    name: categories.image.name,
    description: categories.image.description,
    tools: [
      {
        id: 'resize',
        name: 'Image Resize',
        icon: '🖼️',
        description: 'Resize and optimize images while maintaining quality',
        modulePath: './image/resize.js',
        initFunction: 'initTool'
      }
    ]
  },
  text: {
    name: categories.text.name,
    description: categories.text.description,
    tools: [
      {
        id: 'editor',
        name: 'Text Editor',
        icon: '📝',
        description: 'Simple text editing with formatting options',
        modulePath: './text/editor.js',
        initFunction: 'initTool'
      },
      {
        id: 'yaml',
        name: 'YAML Validator',
        icon: '🔍',
        description: 'Validate and convert YAML to JSON with tree view',
        modulePath: './text/yaml.js',
        initFunction: 'initTool'
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
        <section class="tools-section" itemscope itemtype="https://schema.org/SoftwareApplication">
          <h2 itemprop="applicationCategory">${config.name}</h2>
          <p class="section-description" itemprop="description">${config.description}</p>
          <div class="tool-grid">
            ${config.tools.map(tool => `
              <a href="/${category}/${tool.id}" class="tool-card">
                <div class="tool-icon">${tool.icon}</div>
                <h3 itemprop="name">${tool.name}</h3>
                <p itemprop="description">${tool.description}</p>
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
  const categoryMeta = getCategoryMetadata(categoryId);

  return `
    <div class="tool-container">
      <h1>${categoryConfig.name}</h1>
      <p class="section-description">${categoryConfig.description}</p>
      
      <div class="category-header">
        <div class="category-description">
          <p>${categoryMeta?.metaDescription || ''}</p>
        </div>
      </div>

      <div class="tool-grid" itemscope itemtype="https://schema.org/ItemList">
        ${categoryConfig.tools.map((tool, index) => {
          const toolMeta = getToolMetadata(`${categoryId}/${tool.id}`);
          return `
            <a href="/${categoryId}/${tool.id}" class="tool-card" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <meta itemprop="position" content="${index + 1}">
              <div class="tool-icon">${tool.icon}</div>
              <h3 itemprop="name">${tool.name}</h3>
              <p itemprop="description">${tool.description}</p>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Updates the active class on navigation links
 * @param {string} path - The current URL path
 */
function updateActiveNavigation(path) {
  // Remove active class from all nav links
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current path
  const pathSegment = path === '/' ? '/' : `/${path.split('/')[1]}`;
  const activeLink = document.querySelector(`nav a[href="${pathSegment}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Main route handler
 * @param {string} path - The URL path
 */
export async function handleRoute(path) {
  // Update active navigation
  updateActiveNavigation(path);
  
  // Handle sitemap.xml requests
  if (path === '/sitemap.xml') {
    import('./common/sitemap.js').then(({ serveSitemap }) => {
      document.documentElement.innerHTML = `
        <pre style="word-wrap: break-word; white-space: pre-wrap;">
          ${serveSitemap()}
        </pre>
      `;
      // Set the correct content type if possible
      if (document.contentType) {
        document.contentType = 'application/xml';
      }
    });
    return;
  }

  const main = document.querySelector('main');
  if (!main) return;

  let content = '';
  
  // Update metadata for SEO
  updateMetadata(path);
  
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
    } else {
      // Specific tool page (e.g., /video/resize)
      const category = path.split('/')[1];
      const toolId = path.split('/')[2];
      
      // Get the template for this tool
      const toolTemplate = getToolTemplate(category, toolId);
      
      if (!toolTemplate) {
        content = getErrorTemplate('Tool Not Found', `The tool "${toolId}" could not be found in category "${category}".`);
      } else {
        // Enhance template with SEO content and tool information
        const toolInfo = getToolMetadata(`${category}/${toolId}`);
        if (toolInfo) {
          // Replace the entire content rather than just the h1 tag to ensure proper structure
          // Add some debugging to verify the tool name
          console.log('Tool Name:', toolInfo.name);
          console.log('Tool Description:', toolInfo.description);
          
          content = `
            <div class="tool-page" itemscope itemtype="https://schema.org/SoftwareApplication">
              <meta itemprop="applicationCategory" content="WebApplication">
              <meta itemprop="offers" itemscope itemtype="https://schema.org/Offer">
              <meta itemprop="price" content="0">
              <meta itemprop="priceCurrency" content="USD">
              
              <div class="tool-container">
                <div class="tool-header">
                  <h1>${toolInfo.name}</h1>
                  <p class="tool-description">${toolInfo.description}</p>
                </div>
                ${toolTemplate.replace(/<div class="tool-container">[\s\S]*?<h1>.*?<\/h1>/, '')}
              </div>
            </div>
          `;
        } else {
          content = toolTemplate;
        }
      }
    }
  }
  
  // Update page content
  main.innerHTML = content;
  
  // Initialize tool AFTER DOM elements are available
  if (path !== '/' && path !== '/home') {
    const result = findTool(path);
    if (result && result.type === 'tool') {
      try {
        // Small delay to ensure DOM is fully updated
        setTimeout(async () => {
          try {
            // Determine the correct import path
            const category = path.split('/')[1];
            const toolId = path.split('/')[2];
            
            // Preload common styles and utilities first
            await import('./common/utils.js');
            
            // Check if this is a video tool that requires FFmpeg
            const needsFFmpeg = 
              (category === 'video' && 
              ['resize', 'reencode', 'gif', 'info'].includes(toolId));
              
            // Display loading indicator for FFmpeg tools
            if (needsFFmpeg) {
              const loadingHtml = `
                <div class="loading-ffmpeg">
                  <p>Loading FFmpeg components...</p>
                  <div class="progress">
                    <div class="progress-fill"></div>
                  </div>
                </div>
              `;
              const loadingEl = document.createElement('div');
              loadingEl.innerHTML = loadingHtml;
              loadingEl.style.textAlign = 'center';
              loadingEl.style.padding = '20px';
              loadingEl.id = 'ffmpeg-loading';
              document.querySelector('.tool-container')?.appendChild(loadingEl);
            }
            
            // Use more reliable import paths that work in production
            let moduleToImport;
            
            switch (`${category}/${toolId}`) {
              case 'video/resize':
                moduleToImport = await import('./video/resize.js');
                break;
              case 'video/info':
                moduleToImport = await import('./video/info.js');
                break;
              case 'video/reencode':
                moduleToImport = await import('./video/reencode.js');
                break;
              case 'video/gif':
                moduleToImport = await import('./video/gif.js');
                break;
              case 'image/resize':
                moduleToImport = await import('./image/resize.js');
                break;
              case 'text/editor':
                moduleToImport = await import('./text/editor.js');
                break;
              case 'text/yaml':
                moduleToImport = await import('./text/yaml.js');
                break;
              default:
                throw new Error(`Unknown tool: ${category}/${toolId}`);
            }
            
            // Remove loading indicator if it exists
            document.getElementById('ffmpeg-loading')?.remove();
            
            // Call the initialization function
            const initFunctionName = result.tool.initFunction;
            if (moduleToImport && moduleToImport[initFunctionName]) {
              moduleToImport[initFunctionName]();
            } else {
              throw new Error(`Init function '${initFunctionName}' not found in module`);
            }
          } catch (error) {
            console.error(`Failed to load tool module: ${error.message}`);
            main.innerHTML = getErrorTemplate(
              'Error Loading Tool', 
              'The requested tool could not be loaded.', 
              error.message
            );
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing tool:', error);
      }
    }
  }
}

/**
 * Update page metadata for SEO
 * @param {string} path - Current path
 */
function updateMetadata(path) {
  // Remove existing meta tags we might have added
  document.querySelectorAll('meta[data-dynamic="true"]').forEach(el => el.remove());
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
  
  // Get head element
  const head = document.head;
  
  // Add new meta tags
  const metaContainer = document.createElement('div');
  metaContainer.innerHTML = generateMetaTags(path);
  
  // Add each node to head
  Array.from(metaContainer.children).forEach(node => {
    node.setAttribute('data-dynamic', 'true');
    head.appendChild(node);
  });
  
  // Add structured data for tool pages
  const parts = path.split('/').filter(p => p);
  if (parts.length === 2) {
    const structuredDataContainer = document.createElement('div');
    structuredDataContainer.innerHTML = generateStructuredData(`${parts[0]}/${parts[1]}`);
    
    // Add structured data script to head
    Array.from(structuredDataContainer.children).forEach(node => {
      head.appendChild(node);
    });
  }
  
  // Add sitemap link for SEO
  const sitemapLink = document.createElement('link');
  sitemapLink.rel = 'sitemap';
  sitemapLink.type = 'application/xml';
  sitemapLink.href = '/sitemap.xml';
  sitemapLink.setAttribute('data-dynamic', 'true');
  head.appendChild(sitemapLink);
} 