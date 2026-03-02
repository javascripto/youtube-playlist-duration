import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OptionsApp } from './options-app';
import './styles.css';

const rootElement = document.querySelector('#root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <OptionsApp />
  </StrictMode>,
);
