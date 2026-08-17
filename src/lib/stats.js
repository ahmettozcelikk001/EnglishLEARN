import { supabase } from './supabase'
import { todayStr } from '../utils/date'

// Bugünün daily_stats satırındaki bir sayacı artırır (yoksa oluşturur).
// field: 'cards_reviewed' | 'new_words_added' | 'quizzes_completed'
// Tek kullanıcı olduğu için basit "oku → artır → yaz" yeterli (yarış durumu ihmal edilebilir).
export async function bumpStat(userId, field, amount = 1) {
  const date = todayStr()

  const { data: existing, error: selErr } = await supabase
    .from('daily_stats')
    .select('id, cards_reviewed, new_words_added, quizzes_completed')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (selErr) throw selErr

  if (existing) {
    const { error } = await supabase
      .from('daily_stats')
      .update({ [field]: (existing[field] ?? 0) + amount })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('daily_stats').insert({
      user_id: userId,
      date,
      [field]: amount,
    })
    if (error) throw error
  }
}
