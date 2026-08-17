import { supabase } from './supabase'
import { bumpStat } from './stats'

// Tek bir soru cevabını kaydet.
export async function recordAnswer(userId, cardId, correct) {
  const { error } = await supabase.from('quiz_results').insert({
    user_id: userId,
    flashcard_id: cardId,
    correct,
  })
  if (error) throw error
}

// Quiz tamamlandığında günlük "çözülen quiz" sayacını artır.
export async function finishQuiz(userId) {
  await bumpStat(userId, 'quizzes_completed', 1)
}
