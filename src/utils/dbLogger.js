/**
 * Utilitário para logging detalhado de conexão com banco de dados
 */

export function logDatabaseConnection() {
    const dbUrl = process.env.DATABASE_URL;
    
    console.log('\n🔍 === DIAGNÓSTICO DE CONEXÃO COM BANCO ===');
    
    // Verificar se DATABASE_URL existe
    if (!dbUrl) {
        console.error('❌ DATABASE_URL não encontrado no .env');
        return;
    }
    
    console.log('✅ DATABASE_URL encontrado');
    
    // Extrair informações da URL (sem mostrar senha completa)
    try {
        const url = new URL(dbUrl.replace('postgresql://', 'http://'));
        const maskedPassword = dbUrl.match(/:\/\/[^:]+:([^@]+)@/);
        const passwordLength = maskedPassword ? maskedPassword[1].length : 0;
        
        console.log('📊 Informações da conexão:');
        console.log(`   - Host: ${url.hostname}`);
        console.log(`   - Porta: ${url.port || '5432 (padrão)'}`);
        console.log(`   - Database: ${url.pathname.replace('/', '') || 'postgres'}`);
        console.log(`   - Usuário: ${url.username || 'postgres'}`);
        console.log(`   - Senha: ${'*'.repeat(passwordLength)} (${passwordLength} caracteres)`);
        
        // Verificar formato da URL
        if (!dbUrl.startsWith('postgresql://')) {
            console.warn('⚠️  URL não começa com "postgresql://"');
        }
        
        // Verificar se tem caracteres especiais na senha que podem causar problemas
        const passwordMatch = dbUrl.match(/:\/\/[^:]+:([^@]+)@/);
        if (passwordMatch) {
            const password = passwordMatch[1];
            if (password.includes(' ') && !password.startsWith('"') && !password.endsWith('"')) {
                console.warn('⚠️  Senha contém espaços - pode precisar de aspas na URL');
            }
            if (password.includes('@') || password.includes('#')) {
                console.warn('⚠️  Senha contém caracteres especiais (@ ou #) - pode precisar de encoding');
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao analisar DATABASE_URL:', error.message);
        console.log('   URL completa (mascarada):', dbUrl.replace(/:\/\/[^:]+:([^@]+)@/, '://***:***@'));
    }
    
    console.log('==========================================\n');
}

export function logPrismaError(error) {
    console.error('\n❌ === ERRO DO PRISMA ===');
    console.error('Mensagem:', error.message);
    
    if (error.code) {
        console.error('Código do erro:', error.code);
    }
    
    // Erros comuns e suas soluções
    const errorMessages = {
        'P1001': 'Não foi possível conectar ao servidor de banco de dados',
        'P1000': 'Falha na autenticação',
        'P1017': 'Servidor fechou a conexão',
        'P2002': 'Violação de constraint única',
        'P2025': 'Registro não encontrado'
    };
    
    if (error.code && errorMessages[error.code]) {
        console.error('\n💡 Possível causa:', errorMessages[error.code]);
    }
    
    // Informações adicionais
    if (error.meta) {
        console.error('Metadados:', JSON.stringify(error.meta, null, 2));
    }
    
    console.error('==========================\n');
}

