import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  listFlashcards,
  addFlashcard,
  deleteFlashcard,
  seedSampleData,
} from '../lib/flashcards'

const emptyForm = { word: '', meaning: '', example_sentence: '', note: '', tag: '' }

export default function Flashcards() {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTag, setActiveTag] = useState('all')

  async function refresh() {
    setLoading(true)
    try {
      setCards(await listFlashcards(user.id))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filtreleme için mevcut etiketler
  const tags = useMemo(() => {
    const set = new Set(cards.map((c) => c.tag).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [cards])

  const visibleCards =
    activeTag === 'all' ? cards : cards.filter((c) => c.tag === activeTag)

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    if (!form.word.trim() || !form.meaning.trim()) {
      setError('Kelime ve anlam zorunlu.')
      return
    }
    setSaving(true)
    try {
      await addFlashcard(user.id, form)
      setForm(emptyForm)
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu kart silinsin mi?')) return
    try {
      await deleteFlashcard(id)
      setCards((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleSeed() {
    setSaving(true)
    try {
      await seedSampleData(user.id)
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Kartlar</h1>
        <span className="text-sm text-slate-400">{cards.length} kart</span>
      </div>

      {/* Ekleme formu */}
      <form
        onSubmit={handleAdd}
        className="mt-4 rounded-xl border border-slate-200 bg-white p-4 space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Kelime / kalıp *" value={form.word} onChange={(v) => setForm({ ...form, word: v })} placeholder="ör. resilient" />
          <Field label="Anlam *" value={form.meaning} onChange={(v) => setForm({ ...form, meaning: v })} placeholder="ör. dayanıklı" />
        </div>
        <Field label="Örnek cümle" value={form.example_sentence} onChange={(v) => setForm({ ...form, example_sentence: v })} placeholder="opsiyonel" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Not" value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="opsiyonel" />
          <Field label="Etiket" value={form.tag} onChange={(v) => setForm({ ...form, tag: v })} placeholder="ör. sıfat" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kart ekle'}
          </button>
          {cards.length === 0 && (
            <button
              type="button"
              onClick={handleSeed}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Örnek veri yükle
            </button>
          )}
        </div>
      </form>

      {/* Etiket filtresi */}
      {tags.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeTag === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'Tümü' : t}
            </button>
          ))}
        </div>
      )}

      {/* Liste */}
      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="text-slate-400">Yükleniyor...</p>
        ) : visibleCards.length === 0 ? (
          <p className="text-slate-400">Henüz kart yok. Yukarıdan ekle veya örnek veri yükle.</p>
        ) : (
          visibleCards.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{c.word}</span>
                  {c.tag && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {c.tag}
                    </span>
                  )}
                </div>
                <p className="text-slate-600">{c.meaning}</p>
                {c.example_sentence && (
                  <p className="mt-1 text-sm text-slate-400 italic">{c.example_sentence}</p>
                )}
                {c.note && <p className="mt-1 text-sm text-slate-400">Not: {c.note}</p>}
                <p className="mt-1 text-xs text-slate-300">
                  Sonraki tekrar: {c.next_review_date}
                </p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-slate-300 hover:text-red-500 text-sm shrink-0"
                title="Sil"
              >
                Sil
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  )
}
