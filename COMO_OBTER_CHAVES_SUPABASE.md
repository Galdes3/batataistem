# 🔑 Como Obter as Chaves do Supabase

Para usar o Supabase Client, você precisa de duas chaves do seu projeto.

## 📍 Onde Encontrar

### Passo 1: Acessar o Dashboard

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login
3. Selecione seu projeto (ex: "batataistem")

### Passo 2: Ir em Settings → API

1. No menu lateral esquerdo, clique em **Settings** (⚙️)
2. Clique em **API** (ou role até encontrar a seção "API")

### Passo 3: Copiar as Chaves

Você verá uma seção chamada **"Project API keys"** com várias chaves:

#### 1. SUPABASE_URL (Project URL)

- Procure por **"Project URL"** ou **"Reference ID"**
- Copie a URL completa (ex: `https://mbjudnbjnbfqellasksu.supabase.co`)
- Esta é a `SUPABASE_URL`

#### 2. SUPABASE_SERVICE_ROLE_KEY (service_role secret)

- Procure por **"service_role"** (secret)
- ⚠️ **IMPORTANTE**: Use a chave **service_role** (não a `anon` ou `public`)
- Clique em **"Reveal"** ou **"Mostrar"** para revelar a chave
- Copie a chave completa (é uma string longa)
- Esta é a `SUPABASE_SERVICE_ROLE_KEY`

**Por que service_role?**
- A chave `service_role` tem permissões administrativas
- Bypassa Row Level Security (RLS)
- Permite criar, ler, atualizar e deletar dados sem restrições
- ⚠️ **MANTENHA SECRETA** - nunca exponha no frontend!

## 📝 Configurar no .env

Adicione estas linhas ao seu arquivo `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://mbjudnbjnbfqellasksu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

**Substitua:**
- `mbjudnbjnbfqellasksu` pelo ID do seu projeto
- `sua_chave_service_role_aqui` pela chave service_role que você copiou

## 🔒 Segurança

- ✅ **SUPABASE_SERVICE_ROLE_KEY** deve estar apenas no `.env` (backend)
- ❌ **NUNCA** exponha no frontend ou em repositórios públicos
- ✅ O arquivo `.env` já está no `.gitignore` (não será commitado)

## ✅ Verificar se Está Correto

Após configurar, teste:

```bash
npm start
```

Se aparecer "✅ Cliente Supabase inicializado", está tudo certo!

---

**Dica:** Se não encontrar a seção API, procure por "Project Settings" ou "Configuration" no menu lateral.

