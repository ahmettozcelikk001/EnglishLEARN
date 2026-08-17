import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Placeholder from './components/Placeholder'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

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
          <Route
            path="/flashcards"
            element={<Placeholder title="Kartlar" description="Kelime kartları — Stage 4'te gelecek." />}
          />
          <Route
            path="/review"
            element={<Placeholder title="Tekrar" description="Aralıklı tekrar — Stage 4'te gelecek." />}
          />
          <Route
            path="/materials"
            element={<Placeholder title="Materyaller" description="Okuma/dinleme materyalleri — Stage 6'da gelecek." />}
          />
          <Route
            path="/quiz"
            element={<Placeholder title="Quiz" description="Alıştırma/quiz — Stage 7'de gelecek." />}
          />
        </Route>

        {/* Bilinmeyen yol → panele */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
