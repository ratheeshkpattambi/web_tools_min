import { handleRoute } from './router.js';
import './styles/main.css';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize routing
  handleRoute(window.location.pathname);
  document.body.classList.add('js-loaded');

  // Handle navigation
  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });

  // Handle link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href.startsWith(window.location.origin)) {
      e.preventDefault();
      const path = new URL(link.href).pathname;
      window.history.pushState({}, '', path);
      handleRoute(path);
    }
  });
}); 