import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Oturum durumunu tüm uygulamaya sağlayan context.
// session/user null ise kullanıcı giriş yapmamış demektir.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1) Sayfa açılışında mevcut oturumu al
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 2) Giriş/çıkış olduğunda oturumu güncelle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Kısayol hook
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı')
  return ctx
}
