import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: Forçando valores hardcoded até que as env vars da Vercel sejam corrigidas
// A variável NEXT_PUBLIC_SUPABASE_URL estava recebendo a DATABASE_URL (PostgreSQL) por engano
const DEFAULT_URL = 'https://lpklungmdugkdqzzxaul.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwa2x1bmdtZHVna2Rxenp4YXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDA2OTcsImV4cCI6MjA4NjA3NjY5N30.4KspExRxzvtlc6ajx0uWrGL_n4Eh3Y3BNWO7w0aGCOA';

// Temporariamente usando apenas valores hardcoded
const supabaseUrl = DEFAULT_URL;
const supabaseAnonKey = DEFAULT_ANON_KEY;

console.log('Supabase Client Configured with Hardcoded URL:', supabaseUrl);


// No servidor, usamos a Service Role Key para ter permissão de admin (ignorar RLS)
const isServer = typeof window === 'undefined';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseKey = (isServer && serviceRoleKey) ? serviceRoleKey : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});
