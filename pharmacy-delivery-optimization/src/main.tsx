import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';
import fr_FR from 'antd/locale/fr_FR';
import 'antd/dist/reset.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={fr_FR}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
