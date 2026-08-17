import { describe, it, expect } from 'vitest'
import { addDaysStr, diffDays, toLocalDateStr } from './date'

describe('addDaysStr', () => {
  it('gün ekler', () => {
    expect(addDaysStr('2026-08-17', 3)).toBe('2026-08-20')
  })
  it('ay sınırını geçer', () => {
    expect(addDaysStr('2026-08-30', 3)).toBe('2026-09-02')
  })
  it('yıl sınırını geçer', () => {
    expect(addDaysStr('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('diffDays', () => {
  it('bugün - dün = 1', () => {
    expect(diffDays('2026-08-17', '2026-08-16')).toBe(1)
  })
  it('aynı gün = 0', () => {
    expect(diffDays('2026-08-17', '2026-08-17')).toBe(0)
  })
})

describe('toLocalDateStr', () => {
  it('yerel Y-A-G üretir (sıfır dolgulu)', () => {
    expect(toLocalDateStr(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
