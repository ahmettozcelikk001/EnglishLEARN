// Quiz üretimi — kullanıcının kendi kartlarından otomatik sorular.
// Saf fonksiyonlar: rng (rastgelelik) dışarıdan verilebildiği için test edilebilir.
//
// İki soru tipi:
//   - 'mc'   : çoktan seçmeli (doğru anlamı 3 yanlış arasından bul)
//   - 'blank': boşluk doldurma (örnek cümledeki kelimeyi tahmin et)

// Fisher-Yates karıştırma (rng enjekte edilebilir).
export function shuffle(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Çoktan seçmeli: doğru anlam + başka kartlardan 3 çeldirici anlam.
// En az 4 kart yoksa null döner (yeterli çeldirici yok).
export function buildMultipleChoice(card, allCards, rng = Math.random) {
  const distractors = allCards
    .filter((c) => c.id !== card.id && c.meaning && c.meaning !== card.meaning)
    .map((c) => c.meaning)

  const unique = [...new Set(distractors)]
  if (unique.length < 3) return null

  const chosen = shuffle(unique, rng).slice(0, 3)
  const options = shuffle([card.meaning, ...chosen], rng)

  return {
    type: 'mc',
    cardId: card.id,
    prompt: card.word,
    options,
    answer: card.meaning,
  }
}

// Boşluk doldurma: örnek cümlede kelimeyi "_____" ile gizle.
// Cümle yoksa veya kelime cümlede geçmiyorsa null döner.
export function buildFillBlank(card) {
  if (!card.example_sentence || !card.word) return null
  // Kelimenin ilk parçası (phrasal verb / "to run" gibi çok kelimeliyse ilk anlamlı kısım)
  const target = card.word.trim()
  const re = new RegExp(escapeRegExp(target), 'i')
  if (!re.test(card.example_sentence)) return null

  const sentence = card.example_sentence.replace(re, '_____')
  return {
    type: 'blank',
    cardId: card.id,
    prompt: sentence,
    answer: target,
    hint: card.meaning,
  }
}

// Bir kart listesinden karışık quiz üretir (en fazla `count` soru).
export function generateQuiz(cards, count = 10, rng = Math.random) {
  const pool = shuffle(cards, rng)
  const questions = []

  for (const card of pool) {
    if (questions.length >= count) break
    // Önce boşluk doldurma dene (cümle varsa), yoksa çoktan seçmeli.
    const blank = buildFillBlank(card)
    const mc = buildMultipleChoice(card, cards, rng)
    const q = blank && (!mc || rng() < 0.5) ? blank : mc
    if (q) questions.push(q)
  }

  return questions
}

// Cevabı karşılaştır (büyük/küçük harf ve boşluk duyarsız).
export function checkAnswer(question, given) {
  return normalize(given) === normalize(question.answer)
}

function normalize(s) {
  return String(s || '').trim().toLowerCase()
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
