import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Lazy import to catch module-level errors
import('./App').then(({ default: App }) => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((err) => {
  root.render(
    <div style={{ padding: 40, fontFamily: 'monospace', color: 'red' }}>
      <h1>App failed to load</h1>
      <pre>{String(err)}</pre>
      <pre>{err?.stack}</pre>
    </div>
  );
});