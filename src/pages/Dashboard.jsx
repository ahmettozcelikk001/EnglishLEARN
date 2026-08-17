import { useAuth } from '../context/AuthContext'

// Panel — Stage 5'te ilerleme takibi (streak, haftalık grafik) burada dolacak.
export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Panel</h1>
      <p className="mt-1 text-slate-500">Hoş geldin, {user?.email}</p>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-400">
        İlerleme takibi (streak + haftalık grafik) sonraki aşamada burada olacak.
      </div>
    </div>
  )
}
