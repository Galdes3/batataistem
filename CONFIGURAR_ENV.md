# ⚙️ Como Configurar o Arquivo .env

O erro "Environment variable not found: DATABASE_URL" significa que o arquivo `.env` não está configurado corretamente.

## 🔧 Passo a Passo para Resolver

### 1. Verificar se o arquivo .env existe

O arquivo `.env` deve estar na **raiz do projeto** (mesmo nível que `package.json` e `server.js`).

### 2. Configurar a DATABASE_URL do Supabase

1. **Acesse seu projeto no Supabase:**
   - Vá em [https://supabase.com](https://supabase.com)
   - Faça login e selecione seu projeto

2. **Obter a Connection String:**
   - No menu lateral, clique em **Settings** (⚙️)
   - Clique em **Database**
   - Role até a seção **Connection string**
   - Selecione a aba **URI**
   - Você verá algo como:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
     ```

3. **Copiar e Configurar:**
   - Copie a string completa
   - Abra o arquivo `.env` no projeto
   - Cole na linha `DATABASE_URL=`
   - **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha real do seu banco
   - **IMPORTANTE**: Substitua `[PROJETO-ID]` pelo ID real do seu projeto Supabase

**Exemplo:**
```env
DATABASE_URL=postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 3. Reiniciar o Servidor

Após configurar o `.env`:

1. **Pare o servidor** (se estiver rodando):
   - Pressione `Ctrl+C` no terminal

2. **Reinicie o servidor:**
   ```bash
   npm start
   ```

### 4. Verificar se Funcionou

Acesse: `http://localhost:3000/health`

Deve retornar: `{"status":"ok","message":"Sistema de eventos Batatais-SP está funcionando"}`

## 📝 Exemplo Completo de .env

```env
# Server
PORT=3000
NODE_ENV=development

# Instagram Graph API (preencha quando tiver)
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_APP_ID=seu_app_id_aqui
INSTAGRAM_APP_SECRET=seu_app_secret_aqui

# Google Gemini API (preencha quando tiver)
GEMINI_API_KEY=sua_chave_gemini_aqui

# Database (SUPABASE - OBRIGATÓRIO)
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.SEU_PROJETO_ID.supabase.co:5432/postgres

# Cron Job
CRON_SCHEDULE="0 * * * *"
```

## ⚠️ Problemas Comuns

### Erro: "password authentication failed"
- Verifique se substituiu `[YOUR-PASSWORD]` pela senha real
- A senha pode ter caracteres especiais - certifique-se de copiar tudo

### Erro: "connection timeout"
- Verifique se o projeto do Supabase está ativo (não pausado)
- Verifique se a URL está correta
- Tente resetar a senha do banco no Supabase

### Erro: "Environment variable not found"
- Certifique-se de que o arquivo se chama exatamente `.env` (com o ponto no início)
- Verifique se está na raiz do projeto
- Reinicie o servidor após criar/editar o `.env`

## 🔍 Como Verificar se o .env Está Sendo Carregado

Adicione temporariamente no `server.js` (após `dotenv.config()`):

```javascript
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado ✅' : 'NÃO encontrado ❌');
```

Se aparecer "NÃO encontrado", o arquivo `.env` não está sendo lido corretamente.

---

**Dica**: O arquivo `.env` não deve ser commitado no Git (já está no `.gitignore`). Mantenha suas credenciais seguras!

