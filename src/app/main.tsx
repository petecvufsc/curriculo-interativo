import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { registrarServiceWorker } from './registrarServiceWorker';
// Fontes empacotadas no app (licença SIL OFL): funcionam offline. Só o subconjunto latino.
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-sans-3/latin-700.css';
import './estilos/index.css';

registrarServiceWorker();

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);