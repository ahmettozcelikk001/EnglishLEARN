import { describe, it, expect } from 'vitest'
import { computeStreak } from './streak'

const TODAY = '2026-08-17'

describe('computeStreak', () => {
  it('bugün dahil kesintisiz 3 gün', () => {
    expect(computeStreak(['2026-08-15', '2026-08-16', '2026-08-17'], TODAY)).toBe(3)
  })

  it('bugün çalışılmadıysa dünkü streak korunur', () => {
    // dün ve önceki gün aktif, bugün değil -> 2
    expect(computeStreak(['2026-08-15', '2026-08-16'], TODAY)).toBe(2)
  })

  it('iki gün boşlukta streak 0', () => {
    // en son aktif gün 2 gün önce -> 0
    expect(computeStreak(['2026-08-14', '2026-08-15'], TODAY)).toBe(0)
  })

  it('hiç aktif gün yoksa 0', () => {
    expect(computeStreak([], TODAY)).toBe(0)
  })

  it('sadece bugün aktifse 1', () => {
    expect(computeStreak(['2026-08-17'], TODAY)).toBe(1)
  })

  it('ortadaki boşluk streaki keser', () => {
    // bugün, dün aktif; 3 gün önce aktif ama 2 gün önce boş -> 2
    expect(computeStreak(['2026-08-14', '2026-08-16', '2026-08-17'], TODAY)).toBe(2)
  })
})
