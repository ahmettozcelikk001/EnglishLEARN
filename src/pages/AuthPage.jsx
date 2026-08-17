import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Giriş + Kayıt ekranı (tek formda, mod değiştirilebilir).
export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Başarılıysa AuthContext otomatik yönlendirir.
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // E-posta onayı açıksa oturum hemen açılmaz.
        if (!data.session) {
          setInfo('Kayıt alındı. E-posta onayı gerekiyorsa gelen kutunu kontrol et.')
        }
      }
    } catch (err) {
      setError(cevirHata(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900">İngilizce Platform</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLogin ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="ornek@eposta.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="En az 6 karakter"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Lütfen bekle...' : isLogin ? 'Giriş yap' : 'Kayıt ol'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
          <button
            onClick={() => {
              setMode(isLogin ? 'signup' : 'login')
              setError('')
              setInfo('')
            }}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            {isLogin ? 'Kayıt ol' : 'Giriş yap'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Supabase'in İngilizce hata mesajlarını sadeleştir/çevir.
function cevirHata(msg) {
  if (!msg) return 'Bir hata oluştu.'
  if (msg.includes('Invalid login credentials')) return 'E-posta veya şifre hatalı.'
  if (msg.includes('User already registered')) return 'Bu e-posta zaten kayıtlı.'
  if (msg.includes('Password should be')) return 'Şifre en az 6 karakter olmalı.'
  if (msg.includes('Email not confirmed')) return 'E-posta henüz onaylanmadı.'
  return msg
}
