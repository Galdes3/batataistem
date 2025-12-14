# 🔄 Alternativas de Conexão com Supabase

Além da conexão direta PostgreSQL, existem outras formas de conectar ao Supabase.

## 📋 Métodos Disponíveis

### 1. Supabase Client (JavaScript) - RECOMENDADO ✅

O Supabase oferece uma biblioteca JavaScript oficial que funciona via REST API.

**Vantagens:**
- ✅ Não precisa de conexão direta PostgreSQL
- ✅ Funciona via HTTPS (porta 443)
- ✅ Não bloqueado por firewall
- ✅ Mais fácil de usar
- ✅ Suporta autenticação, storage, etc.

**Desvantagens:**
- ⚠️ Requer mudança na estrutura do código
- ⚠️ Não usa Prisma diretamente

### 2. REST API do Supabase

Acesso direto via HTTP/HTTPS.

**Vantagens:**
- ✅ Funciona via HTTPS (não bloqueado)
- ✅ Simples de usar
- ✅ Não precisa de driver PostgreSQL

**Desvantagens:**
- ⚠️ Mais verboso que Prisma
- ⚠️ Requer mudança no código

### 3. Connection Pooling (via PgBouncer)

O Supabase oferece Connection Pooling, mas pode não estar disponível em planos gratuitos.

### 4. Supabase CLI

Para desenvolvimento local e migrações.

## 🚀 Implementação: Supabase Client

Vou mostrar como implementar usando o Supabase Client JavaScript.

### Passo 1: Instalar Biblioteca

```bash
npm install @supabase/supabase-js
```

### Passo 2: Configurar no .env

```env
SUPABASE_URL=https://mbjudnbjnbfqellasksu.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

**Onde encontrar as chaves:**
1. Supabase Dashboard → **Settings** → **API**
2. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (mantenha secreta!)

### Passo 3: Criar Cliente Supabase

Criar arquivo `src/utils/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service_role para operações admin

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Passo 4: Adaptar os Serviços

Exemplo de como adaptar `profileService.js`:

```javascript
import { supabase } from '../utils/supabaseClient.js';

export async function createProfile(profileData) {
    const { username, instagram_id, url } = profileData;

    // Verifica se já existe
    const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.eq.${username},instagram_id.eq.${instagram_id}`)
        .single();

    if (existing) {
        throw new Error('Perfil já cadastrado');
    }

    // Cria novo perfil
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            username,
            instagram_id,
            url
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function listProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, events(count)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
```

## 📊 Comparação dos Métodos

| Método | Complexidade | Firewall | Performance | Prisma |
|--------|-------------|----------|-------------|--------|
| **PostgreSQL Direto** | ⭐⭐ | ❌ Pode bloquear | ⭐⭐⭐⭐⭐ | ✅ Sim |
| **Supabase Client** | ⭐⭐⭐ | ✅ Não bloqueia | ⭐⭐⭐⭐ | ❌ Não |
| **REST API** | ⭐⭐⭐⭐ | ✅ Não bloqueia | ⭐⭐⭐ | ❌ Não |
| **Connection Pooling** | ⭐⭐ | ⚠️ Depende | ⭐⭐⭐⭐⭐ | ✅ Sim |

## 🎯 Recomendação para Seu Caso

Como você está tendo problemas com conexão direta PostgreSQL:

**Opção 1: Migrar para Supabase Client** (Melhor a longo prazo)
- Não depende de conexão direta
- Mais estável
- Requer refatoração do código

**Opção 2: Resolver Conexão PostgreSQL** (Mais rápido)
- Manter Prisma
- Resolver problema de firewall/rede
- Menos mudanças no código

## 🔧 Implementação Rápida: Supabase Client

Posso ajudar a migrar o código para usar Supabase Client. Isso resolveria o problema de conexão imediatamente!

Quer que eu implemente a migração para Supabase Client?

---

**Próximo passo:** Decida se quer migrar para Supabase Client ou continuar tentando resolver a conexão PostgreSQL.

