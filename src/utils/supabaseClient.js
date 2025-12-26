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

