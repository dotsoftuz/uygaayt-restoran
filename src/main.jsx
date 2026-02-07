import { Toaster } from '@/components/ui/sonner';
import { AppContextProvider } from '@/context/AppContext.jsx';
import { NotificationProvider } from '@/context/NotificationContext.jsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './i18n';
import './index.css';
import { ThemeProvider } from './provider/ThemeProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <AppContextProvider>
        <NotificationProvider>
          <App />
          <Toaster />
        </NotificationProvider>
      </AppContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
