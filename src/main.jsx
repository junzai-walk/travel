import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'

// 在开发环境中加载测试工具
if (import.meta.env.DEV) {
  import('./utils/testAxiosConfig.js').then(() => {
    console.log('🔧 开发环境：Axios测试工具已加载');
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
