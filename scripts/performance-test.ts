/**
 * Script de Teste de Performance de Endpoints
 * Simula requisições reais e mede latência
 * 
 * Execute: npx tsx scripts/performance-test.ts
 */

interface EndpointTest {
    name: string;
    url: string;
    method: 'GET' | 'POST';
    body?: any;
    headers?: Record<string, string>;
}

interface TestResult {
    endpoint: string;
    status: number;
    duration: number;
    size: number;
    success: boolean;
    error?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Endpoints críticos para testar
const endpoints: EndpointTest[] = [
    {
        name: 'Dashboard Stats',
        url: '/api/dashboard/stats',
        method: 'GET'
    },
    {
        name: 'List Users',
        url: '/api/users',
        method: 'GET'
    },
    {
        name: 'List Clients',
        url: '/api/clients/list',
        method: 'GET'
    },
    {
        name: 'List Vehicles',
        url: '/api/vehicles/list',
        method: 'GET'
    },
    {
        name: 'List Service Orders',
        url: '/api/service-orders/list',
        method: 'GET'
    },
    {
        name: 'List Stock',
        url: '/api/stock/import',
        method: 'GET'
    }
];

async function testEndpoint(test: EndpointTest, sessionCookie?: string): Promise<TestResult> {
    const start = Date.now();

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(test.headers || {})
        };

        if (sessionCookie) {
            headers['Cookie'] = sessionCookie;
        }

        const response = await fetch(`${BASE_URL}${test.url}`, {
            method: test.method,
            headers,
            body: test.body ? JSON.stringify(test.body) : undefined
        });

        const duration = Date.now() - start;
        const text = await response.text();
        const size = new Blob([text]).size;

        return {
            endpoint: test.name,
            status: response.status,
            duration,
            size,
            success: response.ok
        };
    } catch (error: any) {
        return {
            endpoint: test.name,
            status: 0,
            duration: Date.now() - start,
            size: 0,
            success: false,
            error: error.message
        };
    }
}

function calculateStats(results: number[]): { p50: number; p95: number; p99: number; avg: number; min: number; max: number } {
    const sorted = [...results].sort((a, b) => a - b);
    const len = sorted.length;

    return {
        min: sorted[0],
        max: sorted[len - 1],
        avg: Math.round(results.reduce((a, b) => a + b, 0) / len),
        p50: sorted[Math.floor(len * 0.5)],
        p95: sorted[Math.floor(len * 0.95)],
        p99: sorted[Math.floor(len * 0.99)]
    };
}

async function runPerformanceTests() {
    console.log('⚡ TESTE DE PERFORMANCE DE ENDPOINTS\n');
    console.log('='.repeat(70));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Número de endpoints: ${endpoints.length}`);
    console.log(`Repetições por endpoint: 5`);
    console.log('='.repeat(70) + '\n');

    const allResults: Record<string, TestResult[]> = {};

    // Executar cada endpoint 5 vezes para ter dados estatísticos
    for (const endpoint of endpoints) {
        console.log(`\n🎯 Testando: ${endpoint.name}`);
        allResults[endpoint.name] = [];

        for (let i = 0; i < 5; i++) {
            process.stdout.write(`   Execução ${i + 1}/5... `);
            const result = await testEndpoint(endpoint);
            allResults[endpoint.name].push(result);

            const icon = result.success ? '✅' : '❌';
            const status = result.success
                ? `${result.status} (${result.duration}ms)`
                : `FALHA: ${result.error}`;
            console.log(`${icon} ${status}`);

            // Pequeno delay entre requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    // Análise dos resultados
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 ANÁLISE DE PERFORMANCE:\n');

    const summary: Array<{
        endpoint: string;
        stats: ReturnType<typeof calculateStats>;
        avgSize: number;
        successRate: number;
    }> = [];

    for (const [name, results] of Object.entries(allResults)) {
        const durations = results.filter(r => r.success).map(r => r.duration);
        const sizes = results.filter(r => r.success).map(r => r.size);
        const successRate = (results.filter(r => r.success).length / results.length) * 100;

        if (durations.length > 0) {
            const stats = calculateStats(durations);
            const avgSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);

            summary.push({ endpoint: name, stats, avgSize, successRate });
        }
    }

    // Ordenar por p95 (mais lento primeiro)
    summary.sort((a, b) => b.stats.p95 - a.stats.p95);

    console.log('┌─────────────────────────────┬────────┬────────┬────────┬────────┬──────────┬────────┐');
    console.log('│ Endpoint                    │  Min   │  P50   │  P95   │  P99   │ Avg Size │ Success│');
    console.log('├─────────────────────────────┼────────┼────────┼────────┼────────┼──────────┼────────┤');

    for (const item of summary) {
        const endpoint = item.endpoint.padEnd(27);
        const min = `${item.stats.min}ms`.padStart(6);
        const p50 = `${item.stats.p50}ms`.padStart(6);
        const p95 = `${item.stats.p95}ms`.padStart(6);
        const p99 = `${item.stats.p99}ms`.padStart(6);
        const size = `${(item.avgSize / 1024).toFixed(1)}KB`.padStart(8);
        const success = `${item.successRate.toFixed(0)}%`.padStart(6);

        console.log(`│ ${endpoint} │ ${min} │ ${p50} │ ${p95} │ ${p99} │ ${size} │ ${success} │`);
    }

    console.log('└─────────────────────────────┴────────┴────────┴────────┴────────┴──────────┴────────┘');

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:\n');

    const slowEndpoints = summary.filter(s => s.stats.p95 > 500);
    if (slowEndpoints.length > 0) {
        console.log('⚠️  Endpoints com P95 > 500ms (lentos):');
        slowEndpoints.forEach(s => {
            console.log(`   - ${s.endpoint}: ${s.stats.p95}ms (considere cache ou otimização de query)`);
        });
        console.log('');
    }

    const largeResponses = summary.filter(s => s.avgSize > 100 * 1024); // > 100KB
    if (largeResponses.length > 0) {
        console.log('⚠️  Respostas grandes (> 100KB):');
        largeResponses.forEach(s => {
            console.log(`   - ${s.endpoint}: ${(s.avgSize / 1024).toFixed(1)}KB (considere paginação)`);
        });
        console.log('');
    }

    const failingEndpoints = summary.filter(s => s.successRate < 100);
    if (failingEndpoints.length > 0) {
        console.log('❌ Endpoints com falhas:');
        failingEndpoints.forEach(s => {
            console.log(`   - ${s.endpoint}: ${s.successRate.toFixed(0)}% sucesso`);
        });
        console.log('');
    }

    if (slowEndpoints.length === 0 && largeResponses.length === 0 && failingEndpoints.length === 0) {
        console.log('✅ Todos os endpoints estão dentro dos parâmetros ideais!');
        console.log('   - Latência: P95 < 500ms');
        console.log('   - Tamanho: < 100KB');
        console.log('   - Sucesso: 100%');
    }

    console.log('\n' + '='.repeat(70));
}

// Note: Este script requer autenticação para alguns endpoints
// Se necessário, adicione lógica de login primeiro

runPerformanceTests().catch(error => {
    console.error('❌ Erro no teste de performance:', error);
    process.exit(1);
});
