import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yayzmuggdymynaexcdkh.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_1wnblLC-rvxvD1Lh3zPWhw_1KkreUxU'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
