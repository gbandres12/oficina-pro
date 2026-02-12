/**
 * Testes unitários para utilitários de formatação
 * Execute com: npm test ou node --test src/lib/__tests__/formatters.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
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

describe('Formatação de Moeda (BRL)', () => {
    it('deve formatar valor em reais corretamente', () => {
        assert.strictEqual(formatBRL(1234.56), 'R$ 1.234,56');
        assert.strictEqual(formatBRL(0), 'R$ 0,00');
        assert.strictEqual(formatBRL(85000), 'R$ 85.000,00');
    });

    it('deve formatar valor de centavos corretamente', () => {
        assert.strictEqual(formatBRL(123456, true), 'R$ 1.234,56');
        assert.strictEqual(formatBRL(8500000, true), 'R$ 85.000,00');
    });

    it('deve converter reais para centavos', () => {
        assert.strictEqual(toBRLCents(1234.56), 123456);
        assert.strictEqual(toBRLCents(85000), 8500000);
    });

    it('deve converter centavos para reais', () => {
        assert.strictEqual(fromBRLCents(123456), 1234.56);
        assert.strictEqual(fromBRLCents(8500000), 85000);
    });
});

describe('Formatação de Placa', () => {
    it('deve normalizar placas removendo hífens e uppercase', () => {
        assert.strictEqual(normalizePlate('abc-1234'), 'ABC1234');
        assert.strictEqual(normalizePlate('ABC1D23'), 'ABC1D23');
        assert.strictEqual(normalizePlate('abc 1234'), 'ABC1234');
        assert.strictEqual(normalizePlate('  abc-1234  '), 'ABC1234');
    });

    it('deve formatar placa antiga com hífen', () => {
        assert.strictEqual(formatPlate('ABC1234'), 'ABC-1234');
        assert.strictEqual(formatPlate('abc1234'), 'ABC-1234');
    });

    it('deve formatar placa Mercosul sem hífen', () => {
        assert.strictEqual(formatPlate('ABC1D23'), 'ABC1D23');
        assert.strictEqual(formatPlate('abc1d23'), 'ABC1D23');
    });

    it('deve validar placas corretamente', () => {
        assert.strictEqual(isValidPlate('ABC1234'), true);
        assert.strictEqual(isValidPlate('ABC-1234'), true);
        assert.strictEqual(isValidPlate('ABC1D23'), true);
        assert.strictEqual(isValidPlate('abc1d23'), true);
        assert.strictEqual(isValidPlate('INVALID'), false);
        assert.strictEqual(isValidPlate('123ABCD'), false);
    });
});

describe('Formatação de Telefone', () => {
    it('deve normalizar telefones removendo caracteres especiais', () => {
        assert.strictEqual(normalizePhone('(11) 99999-9999'), '11999999999');
        assert.strictEqual(normalizePhone('+55 11 99999-9999'), '5511999999999');
        assert.strictEqual(normalizePhone('11999999999'), '11999999999');
    });

    it('deve formatar celular com DDD', () => {
        assert.strictEqual(formatPhoneBR('11999999999'), '(11) 99999-9999');
    });

    it('deve formatar fixo com DDD', () => {
        assert.strictEqual(formatPhoneBR('1133334444'), '(11) 3333-4444');
    });

    it('deve formatar telefone com DDI', () => {
        assert.strictEqual(formatPhoneBR('5511999999999'), '+55 (11) 99999-9999');
    });

    it('deve formatar telefone sem DDD', () => {
        assert.strictEqual(formatPhoneBR('999999999'), '99999-9999');
        assert.strictEqual(formatPhoneBR('33334444'), '3333-4444');
    });

    it('deve validar telefones brasileiros', () => {
        assert.strictEqual(isValidPhoneBR('11999999999'), true);
        assert.strictEqual(isValidPhoneBR('1133334444'), true);
        assert.strictEqual(isValidPhoneBR('5511999999999'), true);
        assert.strictEqual(isValidPhoneBR('999999999'), true);
        assert.strictEqual(isValidPhoneBR('123'), false);
        assert.strictEqual(isValidPhoneBR(''), false);
    });
});

describe('Formatação de Email', () => {
    it('deve normalizar emails com trim e lowercase', () => {
        assert.strictEqual(normalizeEmail('  USER@EXAMPLE.COM  '), 'user@example.com');
        assert.strictEqual(normalizeEmail('User@Example.com'), 'user@example.com');
    });

    it('deve validar emails corretamente', () => {
        assert.strictEqual(isValidEmail('user@example.com'), true);
        assert.strictEqual(isValidEmail('user.name@example.co.uk'), true);
        assert.strictEqual(isValidEmail('invalid@'), false);
        assert.strictEqual(isValidEmail('@example.com'), false);
        assert.strictEqual(isValidEmail('notanemail'), false);
    });
});

describe('Formatação de Texto', () => {
    it('deve normalizar texto colapsando espaços', () => {
        assert.strictEqual(normalizeText('  João   da  Silva  '), 'João da Silva');
        assert.strictEqual(normalizeText('Texto    normal'), 'Texto normal');
    });

    it('deve capitalizar nomes corretamente', () => {
        assert.strictEqual(capitalizeName('joão da silva'), 'João Da Silva');
        assert.strictEqual(capitalizeName('MARIA SANTOS'), 'Maria Santos');
        assert.strictEqual(capitalizeName('  pedro   ferreira  '), 'Pedro Ferreira');
    });
});

console.log('✅ Todos os testes de formatação passaram!');
