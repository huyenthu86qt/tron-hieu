import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import './styles/shell-overrides.css';
import App from './App.tsx';
import { initPlatform } from './repo/platformStore';

void initPlatform();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
