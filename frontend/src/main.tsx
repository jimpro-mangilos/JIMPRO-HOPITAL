import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global fetch interceptor: auto-attach JWT token to all /api/ requests
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  if (url.includes('/api/')) {
    const token = localStorage.getItem('jimpro-token');
    if (token) {
      init = {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers as Record<string, string> || {},
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
    }
  }

  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);