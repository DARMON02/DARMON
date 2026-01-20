
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n/LanguageProvider';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* GLOBAL PROVIDER WRAPPER - The Single Source of Truth */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </React.StrictMode>
  );
}
