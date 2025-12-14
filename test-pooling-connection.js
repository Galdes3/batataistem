// Script para testar Connection Pooling do Supabase
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logDatabaseConnection } from './src/utils/dbLogger.js';

dotenv.config();

console.log('🧪 === TESTE DE CONNECTION POOLING ===\n');

// Verificar se está usando pooling
const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl.includes('pooler') && !dbUrl.includes('6543')) {
    console.log('⚠️  Você não está usando Connection Pooling!');
    console.log('📝 Para usar pooling, atualize DATABASE_URL no .env para usar porta 6543\n');
    console.log('📋 Como obter URL de Pooling:');
    console.log('   1. Supabase Dashboard → Settings → Database');
    console.log('   2. Selecione "Connection pooling" (não "URI")');
    console.log('   3. Copie a URL e cole no .env\n');
}

logDatabaseConnection();

const prisma = new PrismaClient({
    log: ['error', 'warn', 'info'],
});

async function testPooling() {
    try {
        console.log('🔄 Tentando conectar via Connection Pooling...\n');
        
        await prisma.$connect();
        console.log('✅ Conexão estabelecida!\n');
        
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Query executada:', result);
        
        console.log('\n🎉 Connection Pooling está funcionando!\n');
        
    } catch (error) {
        console.error('\n❌ Erro ao conectar:', error.message);
        
        if (error.message.includes('Can\'t reach')) {
            console.log('\n💡 SUGESTÕES:');
            console.log('   1. Verifique se o projeto Supabase está ativo (não pausado)');
            console.log('   2. Certifique-se de estar usando a URL de Connection Pooling');
            console.log('   3. Verifique se a URL está no formato correto:');
            console.log('      postgresql://postgres.PROJETO_ID:[SENHA]@aws-0-REGIAO.pooler.supabase.com:6543/postgres');
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testPooling();

