import { describe, it, expect } from 'vitest'
import {
  shuffle,
  buildMultipleChoice,
  buildFillBlank,
  generateQuiz,
  checkAnswer,
} from './quiz'

const cards = [
  { id: '1', word: 'resilient', meaning: 'dayanıklı', example_sentence: 'Children are resilient.' },
  { id: '2', word: 'ubiquitous', meaning: 'her yerde bulunan', example_sentence: 'Phones are ubiquitous.' },
  { id: '3', word: 'meticulous', meaning: 'titiz', example_sentence: 'He is meticulous.' },
  { id: '4', word: 'procrastinate', meaning: 'ertelemek', example_sentence: 'I procrastinate a lot.' },
]

// Deterministik rng (hep 0 döner → ilk elemanları seçer)
const rng0 = () => 0

describe('shuffle', () => {
  it('aynı elemanları korur', () => {
    const out = shuffle([1, 2, 3, 4], rng0)
    expect(out.sort()).toEqual([1, 2, 3, 4])
  })
})

describe('buildMultipleChoice', () => {
  it('4 seçenek üretir ve doğru cevap içinde olur', () => {
    const q = buildMultipleChoice(cards[0], cards)
    expect(q.type).toBe('mc')
    expect(q.options).toHaveLength(4)
    expect(q.options).toContain('dayanıklı')
    expect(q.answer).toBe('dayanıklı')
  })

  it('yeterli çeldirici yoksa null', () => {
    const q = buildMultipleChoice(cards[0], [cards[0], cards[1]])
    expect(q).toBeNull()
  })
})

describe('buildFillBlank', () => {
  it('kelimeyi boşlukla değiştirir', () => {
    const q = buildFillBlank(cards[0])
    expect(q.type).toBe('blank')
    expect(q.prompt).toBe('Children are _____.')
    expect(q.answer).toBe('resilient')
  })

  it('örnek cümle yoksa null', () => {
    const q = buildFillBlank({ id: 'x', word: 'test', meaning: 'deneme' })
    expect(q).toBeNull()
  })

  it('kelime cümlede geçmiyorsa null', () => {
    const q = buildFillBlank({ id: 'x', word: 'absent', meaning: 'yok', example_sentence: 'Merhaba dünya.' })
    expect(q).toBeNull()
  })
})

describe('generateQuiz', () => {
  it('en fazla count kadar soru üretir', () => {
    const qs = generateQuiz(cards, 2)
    expect(qs.length).toBeLessThanOrEqual(2)
  })

  it('her soruda tip ve cevap var', () => {
    const qs = generateQuiz(cards, 10)
    for (const q of qs) {
      expect(['mc', 'blank']).toContain(q.type)
      expect(q.answer).toBeTruthy()
    }
  })
})

describe('checkAnswer', () => {
  const q = { answer: 'Resilient' }
  it('büyük/küçük harf duyarsız', () => {
    expect(checkAnswer(q, 'resilient')).toBe(true)
    expect(checkAnswer(q, '  RESILIENT ')).toBe(true)
  })
  it('yanlış cevabı reddeder', () => {
    expect(checkAnswer(q, 'dayanıklı')).toBe(false)
  })
})
