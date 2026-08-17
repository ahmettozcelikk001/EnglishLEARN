import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Flashcards from './pages/Flashcards'
import Review from './pages/Review'
import Materials from './pages/Materials'
import Quiz from './pages/Quiz'

// Zaten giriş yapmış kullanıcı /login'e giderse panele yönlendir.
function LoginRoute() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/" replace />
  return <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        {/* Korumalı alan: ortak kabuk (Layout) + alt sayfalar */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/review" element={<Review />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/quiz" element={<Quiz />} />
        </Route>

        {/* Bilinmeyen yol → panele */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
