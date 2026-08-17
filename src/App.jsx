import { supabase } from './lib/supabase'

// Stage 1: iskeletin çalıştığını doğrulayan basit başlangıç ekranı.
// Sonraki aşamalarda buraya routing + auth + modüller eklenecek.
export default function App() {
  const envReady =
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://YOUR-PROJECT-ref.supabase.co'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900">İngilizce Platform</h1>
        <p className="mt-2 text-slate-500">Kişisel İngilizce öğrenme uygulaması</p>

        <div className="mt-6 space-y-2 text-sm">
          <StatusRow label="React + Vite" ok />
          <StatusRow label="TailwindCSS" ok />
          <StatusRow label="Supabase client" ok={!!supabase} />
          <StatusRow
            label={envReady ? '.env yapılandırıldı' : '.env henüz doldurulmadı'}
            ok={envReady}
          />
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Stage 1 tamam. Sıradaki adım: Supabase tabloları + kimlik doğrulama.
        </p>
      </div>
    </div>
  )
}

function StatusRow({ label, ok }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          ok ? 'bg-emerald-500' : 'bg-amber-400'
        }`}
      />
      <span className={ok ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
    </div>
  )
}
