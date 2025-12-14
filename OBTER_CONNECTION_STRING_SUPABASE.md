# 🔗 Como Obter a Connection String do Supabase

Se você não encontra a opção de Connection Pooling, vamos usar a conexão direta com algumas configurações.

## 📍 Onde Encontrar a Connection String

### Método 1: Via Settings → Database

1. No Supabase Dashboard, vá em **Settings** (⚙️) no menu lateral
2. Clique em **Database**
3. Role a página até encontrar a seção **"Connection string"** ou **"Connection info"**
4. Você verá diferentes abas:
   - **URI** - Conexão direta (porta 5432)
   - **Connection pooling** - Pooling (porta 6543) - pode não aparecer em projetos gratuitos

### Método 2: Via Botão "Connect"

1. No topo do dashboard, há um botão **"Connect"**
2. Clique nele
3. Uma janela/modal aparecerá com opções de conexão
4. Procure por **"Connection string"** ou **"Database URL"**

### Método 3: Construir Manualmente

Se não encontrar, você pode construir a URL manualmente:

**Formato:**
```
postgresql://postgres:[SENHA]@db.[PROJETO-ID].supabase.co:5432/postgres
```

**Exemplo com seus dados:**
```
postgresql://postgres:!1V]lujd96f0@db.mbjudnbjnbfqellasksu.supabase.co:5432/postgres
```

## 🔧 Solução Alternativa: Verificar Configurações

### 1. Verificar se o Projeto está Ativo

1. No dashboard do Supabase, verifique se o projeto aparece como **"Active"** ou **"Running"**
2. Se aparecer **"Paused"**, clique para restaurar

### 2. Verificar Network Restrictions

Nas imagens que você mostrou, vi que há uma seção **"Network Restrictions"**. 

**IMPORTANTE:** Se houver restrições de IP, isso pode estar bloqueando sua conexão!

1. Vá em **Settings** → **Database**
2. Role até **"Network Restrictions"**
3. **Se houver alguma restrição:**
   - Adicione seu IP atual
   - Ou temporariamente remova as restrições para testar

### 3. Verificar Network Bans

Vi que há um IP banido na lista. Isso pode estar causando problemas.

1. Vá em **Settings** → **Database**
2. Role até **"Network Bans"**
3. Verifique se seu IP não está banido
4. Se estiver, clique em **"Unban IP"**

## 🎯 Solução: Usar URL Direta com Configurações

Como você não tem acesso ao Connection Pooling, vamos usar a URL direta:

### 1. Obter a Senha do Banco

1. Em **Settings** → **Database**
2. Role até **"Database password"**
3. Se não lembrar, clique em **"Reset database password"**
4. Defina uma nova senha e anote

### 2. Construir a URL Manualmente

Use este formato no seu `.env`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.mbjudnbjnbfqellasksu.supabase.co:5432/postgres
```

**Substitua `SUA_SENHA_AQUI` pela senha que você definiu.**

### 3. Se a Senha tiver Caracteres Especiais

Se a senha tiver caracteres especiais (como `!`, `@`, `#`, `%`), você pode precisar fazer encoding:

**Caracteres que precisam ser codificados:**
- `:` → `%3A`
- `/` → `%2F`
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- ` ` (espaço) → `%20` ou `+`

**Exemplo:**
Se sua senha é `senha!123`, a URL seria:
```
postgresql://postgres:senha%21123@db.mbjudnbjnbfqellasksu.supabase.co:5432/postgres
```

## 🔍 Testar Conexão

Após configurar, teste:

```bash
npm run test-db
```

## ⚠️ Se Ainda Não Funcionar

### Verificar Status do Projeto

1. No dashboard, verifique se o projeto está **"Active"**
2. Se estiver pausado, restaure-o

### Verificar Firewall

1. Tente desabilitar temporariamente o firewall do Windows
2. Teste novamente

### Tentar de Outra Rede

1. Use seu celular como hotspot
2. Conecte seu computador ao hotspot
3. Teste novamente

### Verificar se o Projeto está na Região Correta

1. No dashboard, verifique a região do projeto
2. Certifique-se de que está em uma região próxima (ex: South America)

## 📝 Checklist

- [ ] Projeto Supabase está ativo (não pausado)
- [ ] Senha do banco está correta no `.env`
- [ ] Não há Network Restrictions bloqueando
- [ ] Seu IP não está banido
- [ ] URL está no formato correto
- [ ] Caracteres especiais na senha estão codificados (se necessário)

---

**Dica:** Se você conseguir acessar o SQL Editor do Supabase e executar queries, significa que o banco está funcionando. O problema pode ser apenas de conectividade externa ou configuração de rede.

