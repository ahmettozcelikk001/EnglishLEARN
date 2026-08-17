import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { getRecentStats, getActiveDates } from '../lib/statsQueries'
import { computeStreak } from '../utils/streak'
import { addDaysStr, todayStr } from '../utils/date'

const GUN_KISA = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

// Son 7 günü, veri olmayan günleri 0 ile doldurarak dizi haline getirir.
function build7DaySeries(rows) {
  const byDate = Object.fromEntries(rows.map((r) => [r.date, r]))
  const out = []
  for (let i = 6; i >= 0; i--) {
    const date = addDaysStr(todayStr(), -i)
    const [y, m, d] = date.split('-').map(Number)
    const label = GUN_KISA[new Date(y, m - 1, d).getDay()]
    const row = byDate[date] || {}
    out.push({
      date,
      label,
      tekrar: row.cards_reviewed || 0,
      yeni: row.new_words_added || 0,
      quiz: row.quizzes_completed || 0,
    })
  }
  return out
}

export default function Dashboard() {
  const { user } = useAuth()
  const [series, setSeries] = useState([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [rows, activeDates] = await Promise.all([
          getRecentStats(user.id, 7),
          getActiveDates(user.id),
        ])
        setSeries(build7DaySeries(rows))
        setStreak(computeStreak(activeDates))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = series.find((s) => s.date === todayStr()) || {
    tekrar: 0,
    yeni: 0,
    quiz: 0,
  }
  const haftalikTekrar = series.reduce((sum, s) => sum + s.tekrar, 0)

  if (loading) return <p className="text-slate-400">Yükleniyor...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Panel</h1>

      {/* Özet kartları */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="🔥 Streak" value={`${streak} gün`} />
        <StatCard label="Bugün tekrar" value={today.tekrar} />
        <StatCard label="Bugün yeni kelime" value={today.yeni} />
        <StatCard label="Bu hafta tekrar" value={haftalikTekrar} />
      </div>

      {/* Haftalık grafik */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-700 mb-3">Son 7 gün — tekrar sayısı</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ''}
                formatter={(v) => [v, 'tekrar']}
              />
              <Bar dataKey="tekrar" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geçmiş günler tablosu */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-700 mb-3">Geçmiş 7 gün</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-1.5 pr-4 font-medium">Tarih</th>
                <th className="py-1.5 pr-4 font-medium">Tekrar</th>
                <th className="py-1.5 pr-4 font-medium">Yeni kelime</th>
                <th className="py-1.5 font-medium">Quiz</th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map((s) => (
                <tr key={s.date} className="border-t border-slate-100 text-slate-700">
                  <td className="py-1.5 pr-4">{s.date}</td>
                  <td className="py-1.5 pr-4">{s.tekrar}</td>
                  <td className="py-1.5 pr-4">{s.yeni}</td>
                  <td className="py-1.5">{s.quiz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
