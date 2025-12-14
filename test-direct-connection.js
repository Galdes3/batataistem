// Script para testar conexão direta (sem pooling)
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logDatabaseConnection } from './src/utils/dbLogger.js';

dotenv.config();

console.log('🧪 === TESTE DE CONEXÃO DIRETA (SEM POOLING) ===\n');

logDatabaseConnection();

const dbUrl = process.env.DATABASE_URL || '';

// Verificar formato da URL
if (!dbUrl.includes('postgresql://')) {
    console.error('❌ URL não está no formato correto!');
    console.error('   Deve começar com: postgresql://');
    process.exit(1);
}

if (!dbUrl.includes(':5432')) {
    console.warn('⚠️  URL não usa porta 5432 (conexão direta)');
    console.warn('   Se estiver usando pooling (6543), isso está correto');
}

const prisma = new PrismaClient({
    log: ['error', 'warn', 'info'],
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

async function testDirectConnection() {
    try {
        console.log('🔄 Tentando conectar diretamente ao banco...\n');
        
        // Tentar conectar
        await prisma.$connect();
        console.log('✅ Conexão estabelecida!\n');
        
        // Teste simples
        const result = await prisma.$queryRaw`SELECT version() as version`;
        console.log('✅ Query executada com sucesso!');
        console.log('📊 Versão do PostgreSQL:', result[0]?.version || 'N/A');
        
        // Verificar tabelas
        console.log('\n📋 Verificando tabelas...');
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        if (tables.length > 0) {
            console.log('✅ Tabelas encontradas:');
            tables.forEach(t => console.log(`   - ${t.table_name}`));
        } else {
            console.log('⚠️  Nenhuma tabela encontrada');
            console.log('   Execute: npm run prisma:migrate');
        }
        
        console.log('\n🎉 === CONEXÃO FUNCIONANDO! ===\n');
        
    } catch (error) {
        console.error('\n❌ === ERRO NA CONEXÃO ===');
        console.error('Mensagem:', error.message);
        
        if (error.code) {
            console.error('Código:', error.code);
        }
        
        // Análise específica do erro
        if (error.message.includes('Can\'t reach')) {
            console.log('\n💡 PROBLEMA: Não consegue alcançar o servidor');
            console.log('\n🔧 SOLUÇÕES:');
            console.log('   1. Verifique se o projeto Supabase está ATIVO (não pausado)');
            console.log('   2. Verifique Network Restrictions em Settings → Database');
            console.log('   3. Verifique se seu IP não está banido');
            console.log('   4. Tente desabilitar firewall temporariamente');
            console.log('   5. Tente de outra rede (ex: celular como hotspot)');
        } else if (error.message.includes('authentication')) {
            console.log('\n💡 PROBLEMA: Autenticação falhou');
            console.log('\n🔧 SOLUÇÕES:');
            console.log('   1. Verifique se a senha no .env está correta');
            console.log('   2. Reset a senha em Settings → Database → Reset database password');
            console.log('   3. Se a senha tem caracteres especiais, pode precisar de encoding');
        } else if (error.message.includes('does not exist')) {
            console.log('\n💡 PROBLEMA: Banco ou tabela não existe');
            console.log('\n🔧 SOLUÇÕES:');
            console.log('   1. Execute: npm run prisma:migrate');
            console.log('   2. Ou crie as tabelas manualmente no Supabase SQL Editor');
        }
        
        console.log('\n📝 URL atual (mascarada):');
        const masked = dbUrl.replace(/:\/\/[^:]+:([^@]+)@/, '://***:***@');
        console.log('   ' + masked);
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Conexão fechada.');
    }
}

testDirectConnection();

