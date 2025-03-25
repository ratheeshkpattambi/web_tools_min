import { handleRoute } from './router.js';
import './styles/main.css';

// Initial route
handleRoute(window.location.pathname);

// Handle navigation
window.addEventListener('popstate', () => {
  handleRoute(window.location.pathname);
});

// Handle link clicks
document.addEventListener('click', (e) => {
  if (e.target.matches('a[href^="/"]')) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    window.history.pushState({}, '', href);
    handleRoute(href);
  }
}); 