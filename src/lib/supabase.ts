import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpklungmdugkdqzzxaul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwa2x1bmdtZHVna2Rxenp4YXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDA2OTcsImV4cCI6MjA4NjA3NjY5N30.4KspExRxzvtlc6ajx0uWrGL_n4Eh3Y3BNWO7w0aGCOA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
