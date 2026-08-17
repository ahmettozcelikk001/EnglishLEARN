import { supabase } from './supabase'
import { addDaysStr, todayStr } from '../utils/date'

// Son N günün daily_stats satırlarını getirir (eskiden yeniye sıralı).
export async function getRecentStats(userId, days = 7) {
  const from = addDaysStr(todayStr(), -(days - 1))
  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

// Streak hesabı için: cards_reviewed >= 1 olan tüm günlerin tarihleri.
export async function getActiveDates(userId) {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('date, cards_reviewed')
    .eq('user_id', userId)
    .gte('cards_reviewed', 1)
  if (error) throw error
  return data.map((r) => r.date)
}
