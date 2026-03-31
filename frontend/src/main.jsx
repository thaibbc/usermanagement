import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { message } from 'antd'

// Cấu hình global cho antd message để chống spam notification
message.config({
  maxCount: 1, // Chỉ hiển thị tối đa 1 thông báo tại cùng một thời điểm
});

// react-query providers
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, localStoragePersistor } from './queryClient';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersistor,
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>,
)
