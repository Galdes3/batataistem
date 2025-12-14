// Script para verificar se o .env está sendo carregado corretamente
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 Verificando variáveis de ambiente...\n');

const vars = {
    'DATABASE_URL': process.env.DATABASE_URL,
    'PORT': process.env.PORT,
    'NODE_ENV': process.env.NODE_ENV,
    'INSTAGRAM_ACCESS_TOKEN': process.env.INSTAGRAM_ACCESS_TOKEN ? 'Configurado ✅' : 'Não configurado',
    'INSTAGRAM_APP_ID': process.env.INSTAGRAM_APP_ID ? 'Configurado ✅' : 'Não configurado',
    'GEMINI_API_KEY': process.env.GEMINI_API_KEY ? 'Configurado ✅' : 'Não configurado',
};

console.log('Variáveis encontradas:');
console.log('─────────────────────────────────────');
Object.entries(vars).forEach(([key, value]) => {
    if (key === 'DATABASE_URL' && value) {
        // Mostrar apenas parte da URL por segurança
        const masked = value.replace(/:([^:@]+)@/, ':****@');
        console.log(`${key}: ${masked}`);
    } else {
        console.log(`${key}: ${value || 'NÃO ENCONTRADO ❌'}`);
    }
});
console.log('─────────────────────────────────────\n');

if (!process.env.DATABASE_URL) {
    console.error('❌ ERRO: DATABASE_URL não encontrado!');
    console.error('📝 Certifique-se de que o arquivo .env existe na raiz do projeto');
    console.error('📝 E que contém a linha: DATABASE_URL=postgresql://...\n');
    process.exit(1);
} else {
    console.log('✅ DATABASE_URL encontrado!');
}

