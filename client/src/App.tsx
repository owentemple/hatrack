import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HatRack from './components/HatRack'
import LandingPage from './components/LandingPage'
import SessionHistory from './components/SessionHistory'
import AuthForm from './components/AuthForm'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import Settings from './components/Settings'
import About from './components/About'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { hasLocalData } from './lib/localStore'

function HomePage() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <HatRack />
  if (hasLocalData()) return <HatRack />
  return <LandingPage />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <SessionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requireAuth>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<AuthForm key="login" mode="login" />} />
        <Route path="/signup" element={<AuthForm key="signup" mode="signup" />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  )
}
