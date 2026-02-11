
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lpklungmdugkdqzzxaul.supabase.co';
// Esta é a chave ANON que estava no código
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwa2x1bmdtZHVna2Rxenp4YXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDA2OTcsImV4cCI6MjA4NjA3NjY5N30.4KspExRxzvtlc6ajx0uWrGL_n4Eh3Y3BNWO7w0aGCOA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log('Testando busca de usuário via Supabase SDK (HTTP)...');

    const email = 'admin@andres.com';

    try {
        const { data, error } = await supabase
            .from('User')
            .select('id, email, password, role')
            .eq('email', email)
            .single();

        if (error) {
            console.error('ERRO Supabase:', error);
            if (error.code === 'PGRST116') {
                console.error('Obs: PGRST116 significa que a query não retornou linhas (Usuário não encontrado ou RLS bloqueando).');
            }
        } else {
            console.log('SUCESSO! Usuário encontrado:');
            console.log('ID:', data.id);
            console.log('Email:', data.email);
            console.log('Role:', data.role);
            console.log('Has Password:', !!data.password);
        }
    } catch (err) {
        console.error('Erro de execução:', err);
    }
}

test();
