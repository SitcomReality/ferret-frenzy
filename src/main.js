import { Application } from './core/Application.js';

// Initialize and start the application
const app = new Application();
app.initialize().then(() => {
  console.log('Game initialized successfully');
}).catch(error => {
  console.error('Failed to initialize game:', error);
});

// Make app available globally for debugging
window.app = app;