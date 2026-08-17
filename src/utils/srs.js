// SM-2 (basitleştirilmiş) aralıklı tekrar mantığı.
// Saf fonksiyon: yan etkisi yok, sadece yeni SRS alanlarını hesaplar → kolayca test edilir.
//
// Kurallar (proje şartnamesinden):
//   Zor:  interval = 1, ease -= 0.2 (min 1.3)
//   Orta: ilk tekrarsa interval = 1; değilse interval = round(interval * ease). ease değişmez.
//   Kolay: ilk tekrarsa interval = 3; değilse interval = round(interval * ease * 1.3). ease += 0.15.
//   next_review_date = bugün (yerel) + interval gün

import { addDaysStr, todayStr } from './date'

export const MIN_EASE = 1.3
export const DEFAULT_EASE = 2.5

const clampEase = (e) => Math.max(MIN_EASE, Number(e.toFixed(2)))

// card: { interval, ease_factor }  (yeni kartta interval = 0)
// rating: 'hard' | 'medium' | 'easy'
// today: test için override edilebilir (YYYY-MM-DD)
export function reviewCard(card, rating, today = todayStr()) {
  const prevInterval = Number(card.interval) || 0
  let ease = Number(card.ease_factor) || DEFAULT_EASE
  const isFirst = prevInterval <= 0 // hiç tekrar edilmemiş kart

  let interval

  if (rating === 'hard') {
    interval = 1
    ease = clampEase(ease - 0.2)
  } else if (rating === 'medium') {
    interval = isFirst ? 1 : Math.round(prevInterval * ease)
    // ease değişmez
  } else if (rating === 'easy') {
    interval = isFirst ? 3 : Math.round(prevInterval * ease * 1.3)
    ease = clampEase(ease + 0.15)
  } else {
    throw new Error(`Geçersiz değerlendirme: ${rating}`)
  }

  if (interval < 1) interval = 1

  return {
    interval,
    ease_factor: ease,
    next_review_date: addDaysStr(today, interval),
  }
}
