import { supabase } from './supabase'
import { reviewCard } from '../utils/srs'
import { todayStr } from '../utils/date'
import { bumpStat } from './stats'

// Tüm kartları getir (en yeni önce). user_id filtresini RLS zaten zorunlu kılıyor
// ama açıkça yazmak sorguyu net tutar.
export async function listFlashcards(userId) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Bugün tekrar edilecek kartlar: next_review_date <= bugün.
export async function listDueFlashcards(userId) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review_date', todayStr())
    .order('next_review_date', { ascending: true })
  if (error) throw error
  return data
}

// Yeni kart ekle. new_words_added sayacını artırır.
export async function addFlashcard(userId, fields) {
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      user_id: userId,
      word: fields.word,
      meaning: fields.meaning,
      example_sentence: fields.example_sentence || null,
      note: fields.note || null,
      tag: fields.tag || null,
      // SRS başlangıç değerleri (DB defaultları ile aynı; açıkça yazıyoruz)
      interval: 0,
      ease_factor: 2.5,
      next_review_date: todayStr(),
    })
    .select()
    .single()
  if (error) throw error

  await bumpStat(userId, 'new_words_added', 1)
  return data
}

// Bir kartı değerlendir: SM-2 hesapla, kartı güncelle, cards_reviewed sayacını artır.
export async function applyReview(userId, card, rating) {
  const next = reviewCard(card, rating)
  const { error } = await supabase
    .from('flashcards')
    .update({
      interval: next.interval,
      ease_factor: next.ease_factor,
      next_review_date: next.next_review_date,
    })
    .eq('id', card.id)
  if (error) throw error

  await bumpStat(userId, 'cards_reviewed', 1)
  return next
}

export async function deleteFlashcard(cardId) {
  const { error } = await supabase.from('flashcards').delete().eq('id', cardId)
  if (error) throw error
}

// "Örnek veri yükle" — boş veritabanıyla test kolaylığı için birkaç kart ekler.
// Üretim öncesi bu butonu kaldırmak/gizlemek yeterli.
const SAMPLE_CARDS = [
  { word: 'ubiquitous', meaning: 'her yerde bulunan', example_sentence: 'Smartphones are ubiquitous today.', tag: 'kelime' },
  { word: 'to procrastinate', meaning: 'ertelemek', example_sentence: 'I tend to procrastinate before deadlines.', tag: 'fiil' },
  { word: 'resilient', meaning: 'dayanıklı, çabuk toparlanan', example_sentence: 'Children are remarkably resilient.', tag: 'sıfat' },
  { word: 'to come up with', meaning: 'bulmak, ortaya atmak (fikir)', example_sentence: 'She came up with a brilliant idea.', tag: 'phrasal verb' },
  { word: 'meticulous', meaning: 'titiz, çok dikkatli', example_sentence: 'He is meticulous about details.', tag: 'sıfat' },
]

export async function seedSampleData(userId) {
  const rows = SAMPLE_CARDS.map((c) => ({
    user_id: userId,
    ...c,
    interval: 0,
    ease_factor: 2.5,
    next_review_date: todayStr(),
  }))
  const { error } = await supabase.from('flashcards').insert(rows)
  if (error) throw error
  await bumpStat(userId, 'new_words_added', rows.length)
}
