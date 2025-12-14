// Script para testar token do Instagram detalhadamente
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_API_BASE = 'https://graph.instagram.com';

console.log('🧪 === TESTE DETALHADO DO TOKEN INSTAGRAM ===\n');

if (!token) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN não encontrado no .env');
    process.exit(1);
}

console.log('✅ Token encontrado no .env');
console.log(`📏 Tamanho do token: ${token.length} caracteres`);
console.log(`🔑 Token (primeiros 20 chars): ${token.substring(0, 20)}...`);

// Verificar formato do token
if (token.startsWith('IGAA')) {
    console.warn('⚠️  Token começa com "IGAA" - pode ser token do Instagram Basic Display (só acessa própria conta)');
    console.warn('   Para acessar outros perfis, precisa de token do Instagram Business API');
} else if (!token.startsWith('EAA') && !token.startsWith('EAB')) {
    console.warn('⚠️  Token não começa com "EAA" ou "EAB" - pode estar incorreto');
}

if (token.length < 100) {
    console.warn('⚠️  Token muito curto - pode estar incompleto');
}

if (token.includes(' ') || token.includes('\n')) {
    console.warn('⚠️  Token contém espaços ou quebras de linha - remova-os!');
}

console.log();

async function testToken() {
    // Teste 1: Verificar token com /me
    console.log('Teste 1: Validando token com /me...');
    try {
        const response = await axios.get(`${INSTAGRAM_API_BASE}/me`, {
            params: {
                fields: 'id,username',
                access_token: token
            }
        });
        
        console.log('✅ Token válido!');
        console.log('   Conta:', response.data);
    } catch (error) {
        const errorData = error.response?.data?.error;
        console.error('❌ Token inválido!');
        console.error('   Código:', errorData?.code);
        console.error('   Mensagem:', errorData?.message);
        console.error('   Tipo:', errorData?.type);
        
        if (errorData?.code === 190) {
            console.log('\n💡 SOLUÇÃO:');
            console.log('   1. O token está inválido ou expirado');
            console.log('   2. Gere um novo token no Graph API Explorer');
            console.log('   3. Certifique-se de selecionar permissões do Instagram:');
            console.log('      - instagram_basic');
            console.log('      - pages_read_engagement (se usar páginas)');
        }
        
        return false;
    }

    // Teste 2: Verificar permissões do token
    console.log('\nTeste 2: Verificando permissões do token...');
    try {
        const response = await axios.get('https://graph.facebook.com/me/permissions', {
            params: {
                access_token: token
            }
        });
        
        const permissions = response.data.data || [];
        const instagramPerms = permissions.filter(p => p.permission.includes('instagram'));
        
        console.log('📋 Permissões encontradas:');
        permissions.forEach(p => {
            console.log(`   - ${p.permission}: ${p.status}`);
        });
        
        if (instagramPerms.length === 0) {
            console.warn('\n⚠️  ATENÇÃO: Nenhuma permissão do Instagram encontrada!');
            console.warn('   O token precisa ter permissões do Instagram para funcionar.');
            console.warn('   Gere um novo token e selecione: instagram_basic');
        } else {
            console.log('\n✅ Permissões do Instagram encontradas!');
        }
    } catch (error) {
        console.warn('⚠️  Não foi possível verificar permissões:', error.message);
    }

    // Teste 3: Testar com Instagram ID específico
    console.log('\nTeste 3: Testando com Instagram ID...');
    const testInstagramId = '47348527196'; // ID do deck_sportbar
    
    try {
        const response = await axios.get(`${INSTAGRAM_API_BASE}/${testInstagramId}`, {
            params: {
                fields: 'id,username',
                access_token: token
            }
        });
        
        console.log('✅ Conseguiu acessar perfil do Instagram!');
        console.log('   Perfil:', response.data);
    } catch (error) {
        const errorData = error.response?.data?.error;
        console.error('❌ Erro ao acessar perfil do Instagram');
        console.error('   Código:', errorData?.code);
        console.error('   Mensagem:', errorData?.message);
        
        if (errorData?.code === 190) {
            console.log('\n💡 O token não tem permissões para acessar perfis do Instagram');
            console.log('   Gere um novo token com permissão: instagram_basic');
        } else if (errorData?.code === 2) {
            console.log('\n💡 PROBLEMA IDENTIFICADO:');
            console.log('   O token só permite acessar sua própria conta.');
            console.log('   Para acessar outros perfis, você precisa:');
            console.log('   1. Conectar sua conta do Instagram a uma Página do Facebook');
            console.log('   2. Usar a API de Páginas para acessar perfis do Instagram');
            console.log('   3. Ou usar um token com permissões de Página');
            console.log('\n   Consulte: RESOLVER_ERRO_ACESSO_PERFIS.md');
        }
    }

    console.log('\n✅ Teste concluído!\n');
}

testToken().catch(console.error);

