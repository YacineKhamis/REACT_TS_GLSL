import { createRoot } from 'react-dom/client';
import './css/style.css';
import App from './App';

// Entry point for the application. We attach the React component tree
// under the #root element. StrictMode helps catch potential issues in
// development but does not affect production.
createRoot(document.getElementById('root')!).render(
  <App />
);
