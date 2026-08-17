import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Oturum yoksa /login'e yönlendirir. Oturum yükleniyorsa bekleme ekranı gösterir.
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Yükleniyor...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
