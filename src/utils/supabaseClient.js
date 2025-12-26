import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
    console.error('📝 Obtenha essas chaves em: Supabase Dashboard → Settings → API');
    throw new Error('Configuração do Supabase incompleta');
}

// Validar e normalizar a URL do Supabase
// Garantir que começa com https://
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    supabaseUrl = `https://${supabaseUrl}`;
    console.log(`⚠️ URL do Supabase ajustada para: ${supabaseUrl}`);
}

// Remover barra final se houver
supabaseUrl = supabaseUrl.replace(/\/$/, '');

// Validar formato da URL
try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase.co')) {
        console.warn(`⚠️ Aviso: O hostname "${url.hostname}" não parece ser do Supabase`);
    }
} catch (error) {
    console.error('❌ URL do Supabase inválida:', supabaseUrl);
    throw new Error('URL do Supabase inválida');
}

console.log(`🔗 Conectando ao Supabase: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}`);

// Usa service_role para operações administrativas (bypass RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    // Configurações adicionais para melhor estabilidade
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'x-client-info': 'batataistem@1.0.0'
        }
    }
});

console.log('✅ Cliente Supabase inicializado');

// Teste de conexão inicial (não bloqueia a inicialização)
(async () => {
  try {
    // Tenta uma query simples para verificar se a conexão funciona
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      // Se for erro de DNS/conexão, loga mas não quebra
      if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND') || error.details?.includes('ENOTFOUND')) {
        console.error('⚠️  AVISO: Não foi possível conectar ao Supabase na inicialização');
        console.error('   Verifique se:');
        console.error('   1. O projeto Supabase está ativo (não pausado)');
        console.error('   2. A URL SUPABASE_URL está correta no formato: https://[projeto].supabase.co');
        console.error('   3. As variáveis de ambiente estão configuradas corretamente');
        console.error(`   URL configurada: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}`);
      } else {
        // Outros erros (ex: tabela não existe) são normais na primeira execução
        console.log('ℹ️  Supabase conectado (algumas tabelas podem não existir ainda)');
      }
    } else {
      console.log('✅ Teste de conexão com Supabase: OK');
    }
  } catch (error) {
    // Erro de conexão DNS
    if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND') || error.details?.includes('ENOTFOUND')) {
      console.error('⚠️  AVISO: Erro de DNS ao conectar ao Supabase');
      console.error('   O servidor iniciará, mas as operações de banco podem falhar');
      console.error('   Verifique se o projeto Supabase está ativo no dashboard');
    } else {
      console.warn('⚠️  Erro ao testar conexão Supabase:', error.message);
    }
  }
})();

