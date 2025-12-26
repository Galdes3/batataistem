# 🔧 Resolver Erro DNS do Supabase (ENOTFOUND)

O erro `ENOTFOUND mbjudnbjnbfqellasksu.supabase.co` indica que o DNS não consegue resolver o hostname do Supabase.

## 🔍 Diagnóstico

**Erro típico:**
```
Error: getaddrinfo ENOTFOUND mbjudnbjnbfqellasksu.supabase.co (ENOTFOUND)
```

Isso significa que o servidor não consegue encontrar o endereço IP do hostname do Supabase.

## ✅ Soluções (em ordem de probabilidade)

### Solução 1: Verificar se o Projeto Supabase está Ativo ⚠️ MAIS PROVÁVEL

**Projetos gratuitos do Supabase pausam automaticamente após inatividade!**

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login
3. Procure seu projeto na lista
4. **Se aparecer "Paused" ou "Pausado":**
   - Clique no projeto
   - Clique em **"Restore"** ou **"Restaurar"**
   - Aguarde 1-2 minutos para o projeto voltar
   - O hostname voltará a funcionar

### Solução 2: Verificar a URL no Render

1. No Render Dashboard, vá em **Environment**
2. Verifique a variável `SUPABASE_URL`
3. **Deve estar no formato:**
   ```
   https://mbjudnbjnbfqellasksu.supabase.co
   ```
4. **NÃO deve ter:**
   - Barra final (`/`)
   - `http://` (deve ser `https://`)
   - Espaços ou caracteres especiais

### Solução 3: Verificar se o Projeto Existe

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Verifique se o projeto `mbjudnbjnbfqellasksu` ainda existe
3. Se não existir:
   - Crie um novo projeto
   - Atualize a `SUPABASE_URL` no Render com a nova URL

### Solução 4: Verificar Network Restrictions no Supabase

1. No Supabase Dashboard → Seu Projeto
2. Vá em **Settings** → **Database**
3. Role até **"Network Restrictions"**
4. **Se houver restrições:**
   - Adicione o IP do Render (ou remova temporariamente)
   - Salve as alterações

### Solução 5: Verificar Status do Supabase

1. Acesse [https://status.supabase.com](https://status.supabase.com)
2. Verifique se há problemas conhecidos
3. Verifique se a região do seu projeto está operacional

## 🎯 Passo a Passo Recomendado

1. **Primeiro:** Verifique se o projeto está ativo no Supabase Dashboard
2. **Segundo:** Verifique a URL no Render (formato correto)
3. **Terceiro:** Verifique se o projeto ainda existe
4. **Quarto:** Verifique Network Restrictions
5. **Quinto:** Verifique status do Supabase

## 📝 Como Obter a URL Correta do Supabase

1. No Supabase Dashboard → Seu Projeto
2. **Settings** (⚙️) → **API**
3. Copie a **Project URL** (formato: `https://xxxxx.supabase.co`)
4. Cole no Render como `SUPABASE_URL`

**Exemplo correto:**
```
SUPABASE_URL=https://mbjudnbjnbfqellasksu.supabase.co
```

**Exemplos INCORRETOS:**
```
SUPABASE_URL=https://mbjudnbjnbfqellasksu.supabase.co/  ❌ (barra final)
SUPABASE_URL=mbjudnbjnbfqellasksu.supabase.co          ❌ (sem https://)
SUPABASE_URL=http://mbjudnbjnbfqellasksu.supabase.co    ❌ (http ao invés de https)
```

## 🔄 Após Corrigir

1. Salve as alterações no Render
2. O Render fará deploy automaticamente
3. Verifique os logs do Render
4. Procure por: `✅ Teste de conexão com Supabase: OK`

## ⚠️ Se o Problema Persistir

Se após todas as verificações o erro continuar:

1. **Crie um novo projeto Supabase:**
   - Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Clique em **New Project**
   - Crie um novo projeto
   - Copie a nova URL
   - Atualize `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no Render

2. **Migre os dados:**
   - Exporte os dados do projeto antigo (se ainda acessível)
   - Importe no novo projeto

## 📊 Logs Úteis

Após o deploy, verifique os logs do Render. Você deve ver:

**✅ Sucesso:**
```
🔗 Conectando ao Supabase: https://***@mbjudnbjnbfqellasksu.supabase.co
✅ Cliente Supabase inicializado
✅ Teste de conexão com Supabase: OK
```

**❌ Erro:**
```
⚠️  AVISO: Não foi possível conectar ao Supabase na inicialização
   Verifique se:
   1. O projeto Supabase está ativo (não pausado)
   2. A URL SUPABASE_URL está correta no formato: https://[projeto].supabase.co
   3. As variáveis de ambiente estão configuradas corretamente
```

