import { createClient } from '@supabase/supabase-js'
import { fetchVigiado } from './avisoErro'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill in your Supabase project credentials.')
}

// fetchVigiado avisa a tela quando uma leitura ou gravacao no banco da errado.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { fetch: fetchVigiado } })
