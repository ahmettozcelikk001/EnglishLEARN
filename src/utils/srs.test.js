import { describe, it, expect } from 'vitest'
import { reviewCard, DEFAULT_EASE, MIN_EASE } from './srs'

const TODAY = '2026-08-17'

describe('reviewCard — ilk tekrar (yeni kart, interval 0)', () => {
  const newCard = { interval: 0, ease_factor: DEFAULT_EASE }

  it('Zor: interval 1, ease 0.2 düşer', () => {
    const r = reviewCard(newCard, 'hard', TODAY)
    expect(r.interval).toBe(1)
    expect(r.ease_factor).toBe(2.3)
    expect(r.next_review_date).toBe('2026-08-18')
  })

  it('Orta: interval 1, ease sabit', () => {
    const r = reviewCard(newCard, 'medium', TODAY)
    expect(r.interval).toBe(1)
    expect(r.ease_factor).toBe(2.5)
    expect(r.next_review_date).toBe('2026-08-18')
  })

  it('Kolay: interval 3, ease 0.15 artar', () => {
    const r = reviewCard(newCard, 'easy', TODAY)
    expect(r.interval).toBe(3)
    expect(r.ease_factor).toBe(2.65)
    expect(r.next_review_date).toBe('2026-08-20')
  })
})

describe('reviewCard — tekrar edilmiş kart', () => {
  it('Orta: interval = round(interval * ease)', () => {
    const r = reviewCard({ interval: 4, ease_factor: 2.5 }, 'medium', TODAY)
    expect(r.interval).toBe(10) // 4 * 2.5
    expect(r.ease_factor).toBe(2.5)
  })

  it('Kolay: interval = round(interval * ease * 1.3)', () => {
    const r = reviewCard({ interval: 4, ease_factor: 2.5 }, 'easy', TODAY)
    expect(r.interval).toBe(13) // round(4 * 2.5 * 1.3 = 13)
    expect(r.ease_factor).toBe(2.65)
  })

  it('Zor: her zaman interval 1e döner', () => {
    const r = reviewCard({ interval: 30, ease_factor: 2.5 }, 'hard', TODAY)
    expect(r.interval).toBe(1)
  })
})

describe('reviewCard — ease alt sınırı', () => {
  it('ease 1.3ün altına inmez', () => {
    let card = { interval: 5, ease_factor: 1.4 }
    const r1 = reviewCard(card, 'hard', TODAY) // 1.4 - 0.2 = 1.2 -> 1.3
    expect(r1.ease_factor).toBe(MIN_EASE)
    const r2 = reviewCard({ interval: 5, ease_factor: 1.3 }, 'hard', TODAY)
    expect(r2.ease_factor).toBe(MIN_EASE)
  })
})

describe('reviewCard — geçersiz girdi', () => {
  it('bilinmeyen rating hata verir', () => {
    expect(() => reviewCard({ interval: 0, ease_factor: 2.5 }, 'foo', TODAY)).toThrow()
  })
})
