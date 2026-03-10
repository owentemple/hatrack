import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import App from './App'
import './index.css'

// Skip React in archival contexts — pre-rendered HTML is already visible
const isArchive = window.location.hostname === 'web.archive.org' || !!(window as any).__wm
if (!isArchive) {
  const root = document.getElementById('root')!
  const app = (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  )

  if (root.children.length > 0) {
    hydrateRoot(root, app)
  } else {
    createRoot(root).render(app)
  }
}
