import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HatRack from './components/HatRack'
import SessionHistory from './components/SessionHistory'
import AuthForm from './components/AuthForm'
import Settings from './components/Settings'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HatRack />
            </ProtectedRoute>
          }
        />
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
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<AuthForm key="login" mode="login" />} />
        <Route path="/signup" element={<AuthForm key="signup" mode="signup" />} />
      </Route>
    </Routes>
  )
}
