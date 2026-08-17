// Streak (kesintisiz çalışma günü) hesabı — saf fonksiyon.
//
// Kural (şartnameden):
//   - Bir gün "aktif" = o gün en az 1 kart tekrar edildi (cards_reviewed >= 1).
//   - Streak: bugünden (veya en son aktif günden) geriye doğru boşluksuz aktif gün sayısı.
//   - Bugün henüz çalışılmadıysa streak dünkü değeri korur.
//   - İki takvim günü boşluk olursa sıfırlanır.

import { addDaysStr, todayStr } from './date'

// activeDates: aktif günlerin YYYY-MM-DD listesi (sıralı olması gerekmez)
export function computeStreak(activeDates, today = todayStr()) {
  const active = new Set(activeDates)

  // Başlangıç noktası: bugün aktifse bugünden, değilse dünden başla.
  let cursor = active.has(today) ? today : addDaysStr(today, -1)

  let streak = 0
  while (active.has(cursor)) {
    streak += 1
    cursor = addDaysStr(cursor, -1)
  }
  return streak
}
