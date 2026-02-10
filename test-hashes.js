const { compare } = require('bcrypt-ts');

async function testHashes() {
    const adminMatch = await compare('admin123', '$2b$10$YrHBMCEGqVq9sbO6vqTfnu4UXIcnxHwKocLofIfTgeCgMHXQ8kxHa');
    const userMatch = await compare('user123', '$2b$10$to10DPUkx74qHe3yWkMrNet3DrwF9EVNZHfBAhVkm9Z.iRvXLMqKK');

    console.log('Senha admin123 confere:', adminMatch);
    console.log('Senha user123 confere:', userMatch);
}

testHashes();
