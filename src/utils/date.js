// Tarih yardımcıları — TÜM "gün" hesapları kullanıcının YEREL tarihine göre
// YYYY-MM-DD biçiminde yapılır (UTC değil). Bu, streak ve "bugün tekrar" mantığının
// kullanıcının gerçek gününe göre çalışmasını sağlar.

// Bir Date nesnesini yerel YYYY-MM-DD string'ine çevirir.
export function toLocalDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Bugünün yerel tarihi (YYYY-MM-DD).
export function todayStr() {
  return toLocalDateStr(new Date())
}

// Bir YYYY-MM-DD string'ine gün ekler, yine YYYY-MM-DD döner.
export function addDaysStr(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toLocalDateStr(dt)
}

// İki YYYY-MM-DD arasındaki tam gün farkı (a - b). Örn. bugün - dün = 1.
export function diffDays(aStr, bStr) {
  const [ay, am, ad] = aStr.split('-').map(Number)
  const [by, bm, bd] = bStr.split('-').map(Number)
  const a = new Date(ay, am - 1, ad)
  const b = new Date(by, bm - 1, bd)
  return Math.round((a - b) / (1000 * 60 * 60 * 24))
}
