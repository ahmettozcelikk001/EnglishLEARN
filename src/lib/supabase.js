import { createClient } from '@supabase/supabase-js'

// Supabase bağlantısı. Gerçek değerler .env dosyasından okunur (VITE_ öneki zorunlu).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Anahtarlar eksikse geliştirici erken uyarılsın.
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY tanımlı değil. .env dosyasını doldurun.'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
