import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
    console.error('📝 Obtenha essas chaves em: Supabase Dashboard → Settings → API');
    throw new Error('Configuração do Supabase incompleta');
}

// Usa service_role para operações administrativas (bypass RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('✅ Cliente Supabase inicializado');

