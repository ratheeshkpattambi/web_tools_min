/**
 * Main entry point for the application
 * Handles routing and page rendering
 */
import { generatePageHTML, generateToolCard } from './common/template.js';
import { pageHTML as videoResizeHTML, initPage as initVideoResize } from './video/resize.js';
import { pageHTML as imageResizeHTML, initPage as initImageResize } from './image/resize.js';
import { pageHTML as textEditorHTML, initPage as initTextEditor } from './text/editor.js';

// Lazy-load module imports
const loadVideoResize = () => import('./video/resize.js');
const loadImageResize = () => import('./image/resize.js');
const loadTextEditor = () => import('./text/editor.js');

/**
 * Generate the home page HTML
 * @returns {string} - The home page HTML
 */
function generateHomePage() {
  const content = `
    <div class="hero">
      <h1>Web Tools</h1>
      <p>Simple browser-based tools for your needs</p>
    </div>
    
    <div class="tools-grid">
      ${generateToolCard('Video Resize', 'Resize videos', '📹', '/video/resize')}
      ${generateToolCard('Image Resize', 'Resize images', '🖼️', '/image/resize')}
      ${generateToolCard('Text Editor', 'Edit text', '📝', '/text/editor')}
    </div>
  `;

  return generatePageHTML('Web Tools', content);
}

/**
 * Handle routing
 */
async function handleRoute() {
  const path = window.location.pathname;
  
  // Get the main content container
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  try {
    if (path === '/' || path === '/index.html') {
      // Render home page
      document.title = 'Web Tools';
      
      // Generate and set the home page HTML
      appContainer.innerHTML = generateHomePage();
      
      // Add styles for the home page
      const style = document.createElement('style');
      style.textContent = `
        .hero {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .hero p {
          color: #666;
          font-size: 1.1rem;
        }
        
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .tool-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        
        .tool-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .tool-card h2 {
          margin: 0.5rem 0;
          font-size: 1.2rem;
          color: #333;
        }
        
        .tool-card p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .tool-card a {
          text-decoration: none;
          color: inherit;
        }
      `;
      document.head.appendChild(style);
      
    } else if (path === '/video/resize') {
      // Load and render the video resize tool
      const videoModule = await loadVideoResize();
      appContainer.innerHTML = videoModule.pageHTML;
      document.title = 'Video Resize Tool';
      videoModule.initPage();
      
    } else if (path === '/image/resize') {
      // Load and render the image resize tool
      const imageModule = await loadImageResize();
      appContainer.innerHTML = imageModule.pageHTML;
      document.title = 'Image Resize Tool';
      imageModule.initPage();
      
    } else if (path === '/text/editor') {
      // Load and render the text editor tool
      const textModule = await loadTextEditor();
      appContainer.innerHTML = textModule.pageHTML;
      document.title = 'Text Editor Tool';
      textModule.initPage();
      
    } else if (path === '/video') {
      // Render video tools index page
      const content = `
        <div class="tool-cards">
          ${generateToolCard(
            'Video Resize',
            'Resize videos',
            '📹',
            '/video/resize'
          )}
        </div>
      `;
      
      appContainer.innerHTML = generatePageHTML('Video Tools', content);
      
    } else if (path === '/image') {
      // Render image tools index page
      const content = `
        <div class="tool-cards">
          ${generateToolCard(
            'Image Resize',
            'Resize images',
            '🖼️',
            '/image/resize'
          )}
        </div>
      `;
      
      appContainer.innerHTML = generatePageHTML('Image Tools', content);
      
    } else if (path === '/text') {
      // Render text tools index page
      const content = `
        <div class="tool-cards">
          ${generateToolCard(
            'Text Editor',
            'Edit text',
            '📝',
            '/text/editor'
          )}
        </div>
      `;
      
      appContainer.innerHTML = generatePageHTML('Text Tools', content);
      
    } else {
      // 404 page
      const content = `
        <div style="text-align: center; padding: 50px 0;">
          <h2>Page Not Found</h2>
          <p>Sorry, the page you requested could not be found.</p>
          <a href="/" class="btn">Return to Home</a>
        </div>
      `;
      
      appContainer.innerHTML = generatePageHTML('404 Not Found', content);
    }
  } catch (error) {
    console.error('Error handling route:', error);
    appContainer.innerHTML = `
      <div style="text-align: center; padding: 50px 0;">
        <h2>Error</h2>
        <p>Sorry, an error occurred: ${error.message}</p>
        <a href="/" class="btn">Return to Home</a>
      </div>
    `;
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Create the app container if it doesn't exist
  let appContainer = document.getElementById('app');
  if (!appContainer) {
    appContainer = document.createElement('div');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);
  }
  
  // Initial route handling
  handleRoute();
  
  // Handle navigation
  window.addEventListener('popstate', handleRoute);
  
  // Intercept link clicks for SPA navigation
  document.addEventListener('click', (e) => {
    // Check if the clicked element is an anchor tag
    if (e.target.tagName === 'A') {
      const href = e.target.getAttribute('href');
      
      // Only intercept internal links
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault();
        window.history.pushState(null, '', href);
        handleRoute();
      }
    }
  });
}); 