import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Dynamic basename detection for Apache subdirectories
const getBasename = () => {
  if (import.meta.env.VITE_ROUTER_BASE) {
    return import.meta.env.VITE_ROUTER_BASE.replace(/\/+$/, '')
  }

  // When running on dev server or direct localhost / IP ports, never assume subdirectory basename
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'

  if (import.meta.env.DEV || isLocalhost) {
    return undefined
  }

  const path = window.location.pathname
  if (!path || path === '/') return undefined
  const segments = path.split('/').filter(Boolean)
  const knownAppRoutes = [
    'login',
    'register',
    'dashboard',
    'applications',
    'transactions',
    'payment-gateways',
    'checkout',
    'docs',
    'iauth-api-docs',
    'apps',
  ]
  if (segments.length > 0 && !knownAppRoutes.includes(segments[0])) {
    return `/${segments[0]}`
  }
  return undefined
}

const basename = getBasename()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
