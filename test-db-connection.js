// Script para testar conexão com o banco de dados
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logDatabaseConnection, logPrismaError } from './src/utils/dbLogger.js';

dotenv.config();

console.log('🧪 === TESTE DE CONEXÃO COM BANCO DE DADOS ===\n');

// Log detalhado da configuração
logDatabaseConnection();

const prisma = new PrismaClient({
    log: [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'info' },
    ],
});

async function testConnection() {
    try {
        console.log('🔄 Tentando conectar ao banco...\n');
        
        // Teste 1: Conexão simples
        console.log('Teste 1: Verificando conexão...');
        await prisma.$connect();
        console.log('✅ Conexão estabelecida com sucesso!\n');
        
        // Teste 2: Query simples
        console.log('Teste 2: Executando query de teste...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Query executada:', result);
        
        // Teste 3: Verificar se as tabelas existem
        console.log('\nTeste 3: Verificando tabelas...');
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('📊 Tabelas encontradas:', tables);
        
        // Teste 4: Contar registros nas tabelas
        if (tables.length > 0) {
            console.log('\nTeste 4: Contando registros...');
            try {
                const profileCount = await prisma.profile.count();
                console.log(`   - Profiles: ${profileCount}`);
            } catch (e) {
                console.log('   - Profiles: tabela não existe ou erro ao contar');
            }
            
            try {
                const eventCount = await prisma.event.count();
                console.log(`   - Events: ${eventCount}`);
            } catch (e) {
                console.log('   - Events: tabela não existe ou erro ao contar');
            }
        }
        
        console.log('\n✅ === TODOS OS TESTES PASSARAM ===');
        console.log('🎉 Conexão com o banco está funcionando corretamente!\n');
        
    } catch (error) {
        console.error('\n❌ === ERRO NO TESTE ===');
        logPrismaError(error);
        
        // Sugestões baseadas no erro
        if (error.message.includes('authentication')) {
            console.log('\n💡 SUGESTÕES:');
            console.log('   1. Verifique se a senha no .env está correta');
            console.log('   2. Tente resetar a senha no Supabase');
            console.log('   3. Certifique-se de que não há espaços extras na URL');
        } else if (error.message.includes('Can\'t reach')) {
            console.log('\n💡 SUGESTÕES:');
            console.log('   1. Verifique se o projeto Supabase está ativo (não pausado)');
            console.log('   2. Verifique sua conexão com a internet');
            console.log('   3. Tente usar Connection Pooling (porta 6543)');
        } else if (error.message.includes('does not exist')) {
            console.log('\n💡 SUGESTÕES:');
            console.log('   1. Execute as migrações: npm run prisma:migrate');
            console.log('   2. Ou crie as tabelas manualmente no Supabase');
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('\n🔌 Conexão fechada.');
    }
}

testConnection();

