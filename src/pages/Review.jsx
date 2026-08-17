import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listDueFlashcards, applyReview } from '../lib/flashcards'

// Aralıklı tekrar ekranı: bugün vadesi gelen kartları tek tek gösterir.
export default function Review() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [doneCount, setDoneCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        setQueue(await listDueFlashcards(user.id))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = queue[0]

  async function rate(rating) {
    if (!current) return
    try {
      await applyReview(user.id, current, rating)
      setQueue((prev) => prev.slice(1)) // kartı kuyruktan çıkar
      setRevealed(false)
      setDoneCount((n) => n + 1)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <p className="text-slate-400">Yükleniyor...</p>

  if (error) return <p className="text-red-600">{error}</p>

  // Kuyruk bittiğinde
  if (!current) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-slate-900">Tekrar</h1>
        <p className="mt-4 text-slate-500">
          {doneCount > 0
            ? `Bugünlük bitti 🎉 ${doneCount} kart tekrar edildi.`
            : 'Bugün tekrar edilecek kart yok. 🎉'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Tekrar</h1>
        <span className="text-sm text-slate-400">Kalan: {queue.length}</span>
      </div>

      {/* Kart */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {current.tag && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {current.tag}
          </span>
        )}
        <p className="mt-3 text-2xl font-bold text-slate-900">{current.word}</p>

        {revealed ? (
          <div className="mt-4">
            <p className="text-lg text-slate-700">{current.meaning}</p>
            {current.example_sentence && (
              <p className="mt-2 text-slate-400 italic">{current.example_sentence}</p>
            )}
            {current.note && <p className="mt-1 text-sm text-slate-400">Not: {current.note}</p>}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-6 rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Cevabı göster
          </button>
        )}
      </div>

      {/* Değerlendirme butonları */}
      {revealed && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <RateButton onClick={() => rate('hard')} className="bg-red-100 text-red-700 hover:bg-red-200">
            Zor
          </RateButton>
          <RateButton onClick={() => rate('medium')} className="bg-amber-100 text-amber-700 hover:bg-amber-200">
            Orta
          </RateButton>
          <RateButton onClick={() => rate('easy')} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
            Kolay
          </RateButton>
        </div>
      )}
    </div>
  )
}

function RateButton({ onClick, className, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl py-3 font-semibold transition ${className}`}
    >
      {children}
    </button>
  )
}
