// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App, { AuthProvider } from './App.jsx'; // ← ! важно: { AuthProvider }
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>   {/* ← обёртка обязана быть */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);