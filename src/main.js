import { handleRoute } from './router.js';
import './styles/main.css';
import './index.css';

// Router functionality
function initRouter() {
  // Handle initial page load
  const currentPath = window.location.pathname;
  handleRoute(currentPath);

  // Handle browser navigation (back/forward)
  window.addEventListener('popstate', () => {
    const newPath = window.location.pathname;
    handleRoute(newPath);
  });

  // Handle link clicks for SPA routing
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/')) {
      // Don't interfere with external links or links with target="_blank"
      if (link.getAttribute('target') === '_blank' || link.hostname !== window.location.hostname) {
        return;
      }
      
      e.preventDefault();
      const href = link.getAttribute('href');
      
      // Update URL and handle route
      window.history.pushState({}, '', href);
      handleRoute(href);
    }
  });
}

// Enhanced flyout menu functionality
function initFlyoutMenus() {
  const flyoutItems = document.querySelectorAll('nav li.group');
  
  flyoutItems.forEach(item => {
    const trigger = item.querySelector('a');
    const flyout = item.querySelector('div[class*="absolute"]');
    
    if (!trigger || !flyout) return;
    
    let timeout;
    
    // Enhanced hover behavior with delay
    item.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      flyout.classList.remove('opacity-0', 'invisible');
      flyout.classList.add('opacity-100', 'visible');
    });
    
    item.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => {
        flyout.classList.add('opacity-0', 'invisible');
        flyout.classList.remove('opacity-100', 'visible');
      }, 150); // Small delay before hiding
    });
    
    // Touch/click behavior for mobile
    trigger.addEventListener('click', (e) => {
      // On mobile, only prevent navigation if the flyout is closed
      // and the click is specifically on the dropdown arrow area
      if (window.innerWidth < 768) {
        const isOpen = flyout.classList.contains('opacity-100');
        const clickedOnArrow = e.target.closest('svg');
        
        // Only prevent navigation if clicking the arrow or if menu is closed
        if (!isOpen || clickedOnArrow) {
          e.preventDefault();
          
          // Close other flyouts first
          flyoutItems.forEach(otherItem => {
            if (otherItem !== item) {
              const otherFlyout = otherItem.querySelector('div[class*="absolute"]');
              if (otherFlyout) {
                otherFlyout.classList.add('opacity-0', 'invisible');
                otherFlyout.classList.remove('opacity-100', 'visible');
              }
            }
          });
          
          // Toggle this flyout
          if (isOpen) {
            flyout.classList.add('opacity-0', 'invisible');
            flyout.classList.remove('opacity-100', 'visible');
          } else {
            flyout.classList.remove('opacity-0', 'invisible');
            flyout.classList.add('opacity-100', 'visible');
          }
        }
      }
    });
  });
  
  // Close flyouts when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav li.group')) {
      flyoutItems.forEach(item => {
        const flyout = item.querySelector('div[class*="absolute"]');
        if (flyout) {
          flyout.classList.add('opacity-0', 'invisible');
          flyout.classList.remove('opacity-100', 'visible');
        }
      });
    }
  });
  
  // Close flyouts on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      flyoutItems.forEach(item => {
        const flyout = item.querySelector('div[class*="absolute"]');
        if (flyout) {
          flyout.classList.add('opacity-0', 'invisible');
          flyout.classList.remove('opacity-100', 'visible');
        }
      });
    }
  });
}

// Theme functionality
function initThemeToggle() {
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(initialTheme);
  
  // Add theme toggle button event listener
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add js-loaded class to body to make content visible
  document.body.classList.add('js-loaded');
  
  initRouter();
  initFlyoutMenus();
  initThemeToggle();
  
  // Send page view to Google Analytics after LCP
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href
        });
      }
    }, 1000);
  });
}); 