import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';
import './styles/variables.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingScreen>
        <App />
      </LoadingScreen>
    </BrowserRouter>
  </StrictMode>,
);
