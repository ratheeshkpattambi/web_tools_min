/**
 * Main entry point for the application
 * Handles routing and page rendering
 */
import { generatePageHTML, generateToolCard } from './common/template.js';

// Lazy-load module imports
const loadVideoResize = () => import('./video/resize.js');
const loadImageResize = () => import('./image/resize.js');

/**
 * Generate the home page HTML
 * @returns {string} - The home page HTML
 */
function generateHomePage() {
  const videoToolsSection = `
    <section>
      <h2>Video Tools</h2>
      <div class="tool-cards">
        ${generateToolCard(
          'Video Resize',
          'Resize any video file to your desired dimensions with high quality compression.',
          '📹',
          '/video/resize'
        )}
      </div>
    </section>
  `;

  const imageToolsSection = `
    <section>
      <h2>Image Tools</h2>
      <div class="tool-cards">
        ${generateToolCard(
          'Image Resize',
          'Quickly resize images with options for format and quality.',
          '🖼️',
          '/image/resize'
        )}
      </div>
    </section>
  `;

  const content = `
    <div class="hero">
      <h2>Online Media Editing Tools</h2>
      <p>Free, browser-based tools for video and image editing - no uploads required!</p>
    </div>
    
    ${videoToolsSection}
    ${imageToolsSection}
  `;

  return generatePageHTML('Media Editing Tools', content);
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
      document.title = 'Media Editing Tools';
      
      // Generate and set the home page HTML
      appContainer.innerHTML = generateHomePage();
      
      // Add styles for the home page
      const style = document.createElement('style');
      style.textContent = `
        .hero {
          background-color: var(--primary-color);
          color: white;
          padding: 40px 20px;
          text-align: center;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .hero h2 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .tool-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        section {
          margin-bottom: 40px;
        }
        
        section h2 {
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
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
      
    } else if (path === '/video') {
      // Render video tools index page
      const content = `
        <div class="tool-cards">
          ${generateToolCard(
            'Video Resize',
            'Resize any video file to your desired dimensions with high quality compression.',
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
            'Quickly resize images with options for format and quality.',
            '🖼️',
            '/image/resize'
          )}
        </div>
      `;
      
      appContainer.innerHTML = generatePageHTML('Image Tools', content);
      
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