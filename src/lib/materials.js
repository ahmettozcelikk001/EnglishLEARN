import { supabase } from './supabase'

// Materyalleri getir (en yeni önce).
export async function listMaterials(userId) {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addMaterial(userId, fields) {
  const { data, error } = await supabase
    .from('materials')
    .insert({
      user_id: userId,
      title: fields.title,
      url: fields.url || null,
      notes: fields.notes || null,
      status: 'reading',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Not alanını güncelle (materyal okunurken not tutmak için).
export async function updateMaterialNotes(id, notes) {
  const { error } = await supabase.from('materials').update({ notes }).eq('id', id)
  if (error) throw error
}

// Durum değiştir: reading <-> completed.
export async function updateMaterialStatus(id, status) {
  const { error } = await supabase.from('materials').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteMaterial(id) {
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}
