import './styles/theme.css';
import './styles/auth.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Amplify Gen 2 설정 임포트
import { Amplify } from 'aws-amplify'
import amplifyconfig from './amplifyconfiguration.json'

// Amplify Gen 2 초기화
Amplify.configure(amplifyconfig)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
