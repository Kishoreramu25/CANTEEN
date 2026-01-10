
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://xzwvlizzccjimzqvrlbt.supabase.co'
const supabaseKey = 'sb_publishable_ZZBPvPQ_yI2EMImTKxyk9g_TwDUoETC'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }
