const { compare } = require('bcrypt-ts');

async function verify() {
    const hash = '$2b$10$buRmSB64bXkZQpKpWAPq8OVlmRNmQ3LH5iNv5XwlpxRqroabjRkhq';
    const match = await compare('admin123', hash);
    console.log('Senha admin123 + hash real da Supabase confere?', match);
}

verify();
