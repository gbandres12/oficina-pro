/**
 * Script de teste manual dos formatadores
 * Execute com: npx tsx src/lib/__tests__/test-formatters.ts
 */

import {
    formatBRL,
    toBRLCents,
    fromBRLCents,
    normalizePlate,
    formatPlate,
    isValidPlate,
    normalizePhone,
    formatPhoneBR,
    isValidPhoneBR,
    normalizeEmail,
    isValidEmail,
    normalizeText,
    capitalizeName
} from '../formatters';

console.log('\n🧪 Testando Formatadores...\n');

// Testes de Moeda
console.log('💰 MOEDA (BRL)');
console.log('formatBRL(1234.56):', formatBRL(1234.56));
console.log('formatBRL(85000):', formatBRL(85000));
console.log('formatBRL(123456, true):', formatBRL(123456, true));
console.log('toBRLCents(1234.56):', toBRLCents(1234.56));
console.log('fromBRLCents(123456):', fromBRLCents(123456));

// Testes de Placa
console.log('\n🚗 PLACAS');
console.log('normalizePlate("abc-1234"):', normalizePlate('abc-1234'));
console.log('normalizePlate("ABC1D23"):', normalizePlate('ABC1D23'));
console.log('formatPlate("ABC1234"):', formatPlate('ABC1234'));
console.log('formatPlate("ABC1D23"):', formatPlate('ABC1D23'));
console.log('isValidPlate("ABC-1234"):', isValidPlate('ABC-1234'));
console.log('isValidPlate("ABC1D23"):', isValidPlate('ABC1D23'));
console.log('isValidPlate("INVALID"):', isValidPlate('INVALID'));

// Testes de Telefone
console.log('\n📞 TELEFONES');
console.log('normalizePhone("(11) 99999-9999"):', normalizePhone('(11) 99999-9999'));
console.log('formatPhoneBR("11999999999"):', formatPhoneBR('11999999999'));
console.log('formatPhoneBR("1133334444"):', formatPhoneBR('1133334444'));
console.log('formatPhoneBR("5511999999999"):', formatPhoneBR('5511999999999'));
console.log('isValidPhoneBR("11999999999"):', isValidPhoneBR('11999999999'));
console.log('isValidPhoneBR("123"):', isValidPhoneBR('123'));

// Testes de Email
console.log('\n📧 EMAILS');
console.log('normalizeEmail("  USER@EXAMPLE.COM  "):', normalizeEmail('  USER@EXAMPLE.COM  '));
console.log('isValidEmail("user@example.com"):', isValidEmail('user@example.com'));
console.log('isValidEmail("invalid@"):', isValidEmail('invalid@'));

// Testes de Texto
console.log('\n📝 TEXTOS');
console.log('normalizeText("  João   da  Silva  "):', normalizeText('  João   da  Silva  '));
console.log('capitalizeName("joão da silva"):', capitalizeName('joão da silva'));

console.log('\n✅ Todos os testes manuais executados!\n');
