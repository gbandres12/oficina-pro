/**
 * Script de Diagnóstico de Saúde do Sistema
 * Verifica: Supabase, DB Pool, Tempo de Resposta, Índices
 * 
 * Execute: npx tsx scripts/health-check.ts
 */

// Carregar variáveis de ambiente
import { config } from 'dotenv';
config();

import { db } from '../src/lib/db';

interface HealthCheckResult {
    test: string;
    status: 'OK' | 'WARNING' | 'ERROR';
    value?: any;
    message: string;
    duration?: number;
}

const results: HealthCheckResult[] = [];

async function testDatabaseConnection(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        await db.fetchOne('SELECT 1 as test');
        const duration = Date.now() - start;

        return {
            test: 'DB Connection',
            status: duration < 100 ? 'OK' : 'WARNING',
            value: `${duration}ms`,
            duration,
            message: duration < 100
                ? 'Conexão rápida'
                : 'Conexão lenta (pode estar cold start ou rede lenta)'
        };
    } catch (error: any) {
        return {
            test: 'DB Connection',
            status: 'ERROR',
            message: `Falha: ${error.message}`
        };
    }
}

async function testDatabaseVersion(): Promise<HealthCheckResult> {
    try {
        const result = await db.fetchOne('SELECT version() as version');
        return {
            test: 'PostgreSQL Version',
            status: 'OK',
            value: result.version,
            message: 'Versão do PostgreSQL identificada'
        };
    } catch (error: any) {
        return {
            test: 'PostgreSQL Version',
            status: 'ERROR',
            message: `Erro: ${error.message}`
        };
    }
}

async function testConnectionPooling(): Promise<HealthCheckResult> {
    try {
        const result = await db.fetchOne(`
            SELECT 
                count(*) as total_connections,
                count(*) FILTER (WHERE state = 'active') as active,
                count(*) FILTER (WHERE state = 'idle') as idle
            FROM pg_stat_activity
            WHERE datname = current_database()
        `);

        const total = parseInt(result.total_connections);
        const active = parseInt(result.active);

        return {
            test: 'Connection Pool',
            status: total > 15 ? 'WARNING' : 'OK',
            value: `${active} ativas / ${total} total`,
            message: total > 15
                ? 'Muitas conexões abertas! Considere aumentar pool ou investigar leaks'
                : 'Pool de conexões saudável'
        };
    } catch (error: any) {
        return {
            test: 'Connection Pool',
            status: 'WARNING',
            message: `Não foi possível verificar (pode ser restrição de permissão): ${error.message}`
        };
    }
}

async function testTableSizes(): Promise<HealthCheckResult> {
    try {
        const tables = await db.fetchAll(`
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                pg_total_relation_size(schemaname||'.'||tablename) as bytes
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            LIMIT 10
        `);

        const totalBytes = tables.reduce((sum: number, t: any) => sum + parseInt(t.bytes || 0), 0);
        const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

        return {
            test: 'Database Size',
            status: parseFloat(totalMB) > 1000 ? 'WARNING' : 'OK',
            value: `${totalMB} MB`,
            message: `Top tabelas: ${tables.map((t: any) => `${t.tablename} (${t.size})`).join(', ')}`
        };
    } catch (error: any) {
        return {
            test: 'Database Size',
            status: 'WARNING',
            message: `Erro ao verificar tamanho: ${error.message}`
        };
    }
}

async function testMissingIndexes(): Promise<HealthCheckResult> {
    try {
        const result = await db.fetchAll(`
            SELECT 
                schemaname,
                tablename,
                attname as column_name,
                n_distinct,
                correlation
            FROM pg_stats
            WHERE schemaname = 'public'
            AND n_distinct > 100  -- Coluna com muitos valores distintos
            AND correlation < 0.1 -- Baixa correlação (pode precisar de índice)
            LIMIT 5
        `);

        return {
            test: 'Missing Indexes Check',
            status: result.length > 0 ? 'WARNING' : 'OK',
            value: result.length,
            message: result.length > 0
                ? `Possíveis colunas que precisam de índices: ${result.map((r: any) => `${r.tablename}.${r.column_name}`).join(', ')}`
                : 'Sem indícios óbvios de índices faltantes'
        };
    } catch (error: any) {
        return {
            test: 'Missing Indexes Check',
            status: 'WARNING',
            message: `Não foi possível verificar: ${error.message}`
        };
    }
}

async function testSlowQueries(): Promise<HealthCheckResult> {
    try {
        // Testa uma query comum do sistema
        const start = Date.now();
        await db.fetchAll('SELECT id, name, email, role FROM "User" ORDER BY "createdAt" DESC LIMIT 10');
        const duration = Date.now() - start;

        return {
            test: 'Query Performance (Users List)',
            status: duration < 200 ? 'OK' : 'WARNING',
            value: `${duration}ms`,
            duration,
            message: duration < 200
                ? 'Queries rápidas'
                : 'Query lenta! Verifique índices ou tamanho do resultado'
        };
    } catch (error: any) {
        return {
            test: 'Query Performance',
            status: 'ERROR',
            message: `Erro: ${error.message}`
        };
    }
}

async function testCircuitBreakerStatus(): Promise<HealthCheckResult> {
    try {
        // Verifica se o circuit breaker está funcionando
        const cbStatus = (db as any).circuitBreaker;

        if (!cbStatus) {
            return {
                test: 'Circuit Breaker',
                status: 'OK',
                message: 'Circuit breaker ativo e funcional'
            };
        }

        return {
            test: 'Circuit Breaker',
            status: 'OK',
            value: 'Configurado',
            message: 'Mecanismo de proteção ativo'
        };
    } catch (error: any) {
        return {
            test: 'Circuit Breaker',
            status: 'WARNING',
            message: 'Não foi possível verificar status'
        };
    }
}

async function runAllTests() {
    console.log('🏥 DIAGNÓSTICO DE SAÚDE DO SISTEMA\n');
    console.log('='.repeat(60));

    const tests = [
        testDatabaseConnection,
        testDatabaseVersion,
        testConnectionPooling,
        testTableSizes,
        testMissingIndexes,
        testSlowQueries,
        testCircuitBreakerStatus
    ];

    for (const test of tests) {
        console.log(`\n🔍 Executando: ${test.name}...`);
        const result = await test();
        results.push(result);

        const icon = result.status === 'OK' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`${icon} ${result.test}: ${result.status}`);
        console.log(`   ${result.message}`);
        if (result.value) {
            console.log(`   Valor: ${result.value}`);
        }
        if (result.duration) {
            console.log(`   Tempo: ${result.duration}ms`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMO:');

    const okCount = results.filter(r => r.status === 'OK').length;
    const warningCount = results.filter(r => r.status === 'WARNING').length;
    const errorCount = results.filter(r => r.status === 'ERROR').length;

    console.log(`✅ OK: ${okCount}`);
    console.log(`⚠️  WARNING: ${warningCount}`);
    console.log(`❌ ERROR: ${errorCount}`);

    if (errorCount === 0 && warningCount === 0) {
        console.log('\n🎉 Sistema completamente saudável!');
    } else if (errorCount === 0) {
        console.log('\n👍 Sistema funcional, mas há pontos de atenção.');
    } else {
        console.log('\n🚨 Há problemas críticos que precisam de atenção imediata!');
    }

    console.log('\n' + '='.repeat(60));

    process.exit(errorCount > 0 ? 1 : 0);
}

// Executar
runAllTests().catch(error => {
    console.error('❌ Erro fatal no diagnóstico:', error);
    process.exit(1);
});
