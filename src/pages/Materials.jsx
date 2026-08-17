import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  listMaterials,
  addMaterial,
  updateMaterialNotes,
  updateMaterialStatus,
  deleteMaterial,
} from '../lib/materials'
import { addFlashcard } from '../lib/flashcards'

const emptyForm = { title: '', url: '', notes: '' }

export default function Materials() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      setItems(await listMaterials(user.id))
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

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('Başlık zorunlu.')
      return
    }
    setSaving(true)
    try {
      await addMaterial(user.id, form)
      setForm(emptyForm)
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
        <h1 className="text-xl font-bold text-slate-900">Materyaller</h1>
        <span className="text-sm text-slate-400">{items.length} materyal</span>
      </div>

      {/* Ekleme formu */}
      <form onSubmit={handleAdd} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Başlık * (ör. TED Talk: The power of vulnerability)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="Link (video/makale/podcast) — opsiyonel"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Not — opsiyonel"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Materyal ekle'}
        </button>
      </form>

      {/* Liste */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-slate-400">Yükleniyor...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-400">Henüz materyal yok.</p>
        ) : (
          items.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              userId={user.id}
              onChanged={refresh}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MaterialCard({ material, userId, onChanged }) {
  const [notes, setNotes] = useState(material.notes || '')
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState('')
  const notesRef = useRef(null)

  // Nottan kelime ekleme mini-formu
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [adding, setAdding] = useState(false)

  const isDone = material.status === 'completed'

  async function saveNotes() {
    await updateMaterialNotes(material.id, notes)
    setDirty(false)
    setMsg('Not kaydedildi')
    setTimeout(() => setMsg(''), 1500)
  }

  async function toggleStatus() {
    await updateMaterialStatus(material.id, isDone ? 'reading' : 'completed')
    onChanged()
  }

  async function handleDelete() {
    if (!confirm('Bu materyal silinsin mi?')) return
    await deleteMaterial(material.id)
    onChanged()
  }

  // Not alanında seçili metni "kelime" kutusuna al.
  function pullSelection() {
    const el = notesRef.current
    if (!el) return
    const sel = notes.substring(el.selectionStart, el.selectionEnd).trim()
    if (sel) setWord(sel)
  }

  // Kelimeyi flashcard olarak ekle (etiket = materyal başlığı).
  async function addWordAsCard(e) {
    e.preventDefault()
    if (!word.trim() || !meaning.trim()) return
    setAdding(true)
    try {
      await addFlashcard(userId, {
        word: word.trim(),
        meaning: meaning.trim(),
        tag: material.title.slice(0, 30),
      })
      setWord('')
      setMeaning('')
      setMsg('Karta eklendi ✔')
      setTimeout(() => setMsg(''), 1500)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{material.title}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isDone ? 'tamamlandı' : 'okunuyor'}
            </span>
          </div>
          {material.url && (
            <a
              href={material.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:underline break-all"
            >
              {material.url}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleStatus} className="text-xs text-slate-500 hover:text-slate-800">
            {isDone ? '↩ okunuyor yap' : '✓ tamamlandı'}
          </button>
          <button onClick={handleDelete} className="text-xs text-slate-300 hover:text-red-500">
            Sil
          </button>
        </div>
      </div>

      {/* Not alanı */}
      <div className="mt-3">
        <textarea
          ref={notesRef}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setDirty(true)
          }}
          rows={3}
          placeholder="Notların... (yeni kelimeleri işaretleyip aşağıdan karta ekleyebilirsin)"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white"
        />
        {dirty && (
          <button
            onClick={saveNotes}
            className="mt-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
          >
            Notu kaydet
          </button>
        )}
      </div>

      {/* Nottan kelimeyi karta ekle */}
      <form onSubmit={addWordAsCard} className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-slate-400 mb-0.5">Kelime</label>
          <div className="flex gap-1">
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="kelime"
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={pullSelection}
              title="Nottan seçili kelimeyi al"
              className="rounded-lg border border-slate-300 px-2 text-xs text-slate-500 hover:bg-slate-50"
            >
              ↑ seçili
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-slate-400 mb-0.5">Anlam</label>
          <input
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="anlam"
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={adding || !word.trim() || !meaning.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Karta ekle
        </button>
      </form>

      {msg && <p className="mt-2 text-xs text-emerald-600">{msg}</p>}
    </div>
  )
}
