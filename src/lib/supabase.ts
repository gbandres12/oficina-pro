import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('SUPABASE_URL_MISSING: defina NEXT_PUBLIC_SUPABASE_URL.');
}

if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY_MISSING: defina NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

const isServer = typeof window === 'undefined';
const supabaseKey = isServer ? (serviceRoleKey ?? supabaseAnonKey) : supabaseAnonKey;

if (isServer && !serviceRoleKey && process.env.NODE_ENV !== 'production') {
    console.warn('[SUPABASE] SUPABASE_SERVICE_ROLE_KEY ausente; usando ANON key no servidor.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});
