import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listFlashcards } from '../lib/flashcards'
import { generateQuiz, checkAnswer } from '../utils/quiz'
import { recordAnswer, finishQuiz } from '../lib/quiz'

export default function Quiz() {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [questions, setQuestions] = useState(null) // null = başlanmadı
  const [index, setIndex] = useState(0)
  const [answered, setAnswered] = useState(null) // {correct, given}
  const [score, setScore] = useState(0)
  const [blankInput, setBlankInput] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        setCards(await listFlashcards(user.id))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function start() {
    const qs = generateQuiz(cards, 10)
    setQuestions(qs)
    setIndex(0)
    setScore(0)
    setAnswered(null)
    setBlankInput('')
  }

  const current = questions?.[index]

  async function submitAnswer(given) {
    if (answered) return
    const correct = checkAnswer(current, given)
    setAnswered({ correct, given })
    if (correct) setScore((s) => s + 1)
    try {
      await recordAnswer(user.id, current.cardId, correct)
    } catch {
      // kayıt hatası quiz akışını bozmasın
    }
  }

  async function next() {
    if (index + 1 >= questions.length) {
      // Quiz bitti
      try {
        await finishQuiz(user.id)
      } catch {
        /* yoksay */
      }
      setIndex(questions.length) // bitiş ekranını tetikle
    } else {
      setIndex((i) => i + 1)
      setAnswered(null)
      setBlankInput('')
    }
  }

  if (loading) return <p className="text-slate-400">Yükleniyor...</p>
  if (error) return <p className="text-red-600">{error}</p>

  // Başlangıç ekranı
  if (questions === null) {
    return (
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quiz</h1>
        {cards.length < 4 ? (
          <p className="mt-4 text-slate-500">
            Quiz için en az birkaç kart gerekli (çoktan seçmeli 4 kart ister). Önce{' '}
            <span className="font-medium">Kartlar</span> sekmesinden kelime ekle.
          </p>
        ) : (
          <div className="mt-4">
            <p className="text-slate-500">
              {cards.length} kartından otomatik quiz üretilecek (çoktan seçmeli + boşluk doldurma).
            </p>
            <button
              onClick={start}
              className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
            >
              Quiz'e başla
            </button>
          </div>
        )}
      </div>
    )
  }

  // Bitiş ekranı
  if (index >= questions.length) {
    const total = questions.length
    return (
      <div className="text-center py-10">
        <h1 className="text-xl font-bold text-slate-900">Quiz bitti 🎉</h1>
        <p className="mt-4 text-3xl font-bold text-indigo-600">
          {score} / {total}
        </p>
        <p className="mt-1 text-slate-500">doğru cevap</p>
        <button
          onClick={start}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          Tekrar çöz
        </button>
      </div>
    )
  }

  // Soru ekranı
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Quiz</h1>
        <span className="text-sm text-slate-400">
          {index + 1} / {questions.length} · Skor: {score}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {current.type === 'mc' ? (
          <>
            <p className="text-sm text-slate-400">Bu kelimenin anlamı nedir?</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{current.prompt}</p>
            <div className="mt-5 space-y-2">
              {current.options.map((opt) => {
                const isCorrect = opt === current.answer
                const isPicked = answered?.given === opt
                let cls = 'border-slate-200 hover:bg-slate-50'
                if (answered) {
                  if (isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  else if (isPicked) cls = 'border-red-300 bg-red-50 text-red-700'
                  else cls = 'border-slate-200 opacity-60'
                }
                return (
                  <button
                    key={opt}
                    disabled={!!answered}
                    onClick={() => submitAnswer(opt)}
                    className={`w-full text-left rounded-lg border px-4 py-2.5 transition ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-400">Boşluğa gelen kelimeyi yaz:</p>
            <p className="mt-2 text-lg text-slate-800">{current.prompt}</p>
            <p className="mt-1 text-xs text-slate-400">İpucu: {current.hint}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!answered) submitAnswer(blankInput)
              }}
              className="mt-4 flex gap-2"
            >
              <input
                value={blankInput}
                onChange={(e) => setBlankInput(e.target.value)}
                disabled={!!answered}
                placeholder="cevabın"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />
              {!answered && (
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
                >
                  Kontrol et
                </button>
              )}
            </form>
            {answered && (
              <p
                className={`mt-3 text-sm ${
                  answered.correct ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {answered.correct
                  ? 'Doğru! ✔'
                  : `Yanlış. Doğru cevap: ${current.answer}`}
              </p>
            )}
          </>
        )}

        {answered && (
          <button
            onClick={next}
            className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
          >
            {index + 1 >= questions.length ? 'Bitir' : 'Sonraki soru'}
          </button>
        )}
      </div>
    </div>
  )
}
