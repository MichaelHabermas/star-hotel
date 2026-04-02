import { initPostHog, initRendererSentry } from '@renderer/telemetry/renderer-telemetry';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './assets/main.css';

initRendererSentry();
initPostHog();

const el = document.getElementById('root');
if (!el) {
  throw new Error('Root element #root not found');
}

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
