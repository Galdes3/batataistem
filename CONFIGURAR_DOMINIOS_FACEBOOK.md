# 🌐 Configurar Domínios do App Facebook para Localhost e Produção

## ⚠️ Importante sobre Domínios

Os **"App Domains"** no Facebook são usados principalmente para:
- Validação de OAuth (redirecionamentos)
- Segurança (whitelist de domínios permitidos)
- Validação de URLs de callback

**Boa notícia:** Para uso da API do Instagram (como estamos fazendo), os domínios **NÃO bloqueiam** o funcionamento em localhost!

## ✅ Configuração Recomendada

### Opção 1: Adicionar localhost aos Domínios (Recomendado)

No Facebook Developers → Settings → Basic:

1. Em **"Domínios do aplicativo"** (App Domains):
   - Adicione: `localhost`
   - Adicione: `batataistem.com.br` (seu domínio de produção)
   - Clique em **"Salvar alterações"**

**Exemplo:**
```
localhost
batataistem.com.br
```

### Opção 2: Deixar Vazio Durante Desenvolvimento

Se você não está usando OAuth flows completos (apenas tokens diretos):

1. **Remova** `batataistem.com.br` dos domínios temporariamente
2. Deixe vazio ou adicione apenas `localhost`
3. Quando for para produção, adicione o domínio real

### Opção 3: Usar Ambos (Ideal)

Para desenvolvimento e produção funcionarem:

```
localhost
127.0.0.1
batataistem.com.br
```

## 🔍 O que os Domínios Afetam?

### ✅ NÃO Afetam:
- ✅ Uso direto da API com tokens (como estamos fazendo)
- ✅ Requisições de `graph.instagram.com` via código do servidor
- ✅ Funcionamento em localhost para desenvolvimento

### ⚠️ Afetam:
- ⚠️ OAuth flows (redirecionamentos de login)
- ⚠️ Validação de URLs de callback
- ⚠️ Segurança de redirecionamentos

## 📝 Configuração Atual do Seu App

Vejo que você tem:
- **App Domains:** `batataistem.com.br`
- **Modo:** Desenvolvimento

### Para Funcionar em Localhost:

1. Vá em **Settings** → **Basic**
2. Em **"Domínios do aplicativo"**:
   - Adicione `localhost` (além do `batataistem.com.br`)
   - Ou remova temporariamente o `batataistem.com.br` durante desenvolvimento
3. Clique em **"Salvar alterações"**

## 🎯 Recomendação para Seu Caso

Como você está usando tokens diretos (não OAuth completo), pode:

**Opção A: Adicionar localhost**
```
localhost
batataistem.com.br
```

**Opção B: Deixar vazio durante desenvolvimento**
```
(vazio)
```

Quando for para produção, adicione o domínio real.

## ⚠️ Importante

- **App Domains** não bloqueia requisições da API do servidor
- Funciona normalmente em localhost mesmo com domínio de produção configurado
- Só afeta OAuth flows e validações de URL

## 🔧 Se Tiver Problemas

Se mesmo assim tiver problemas:

1. **Remova temporariamente** o domínio `batataistem.com.br`
2. Deixe apenas `localhost` ou vazio
3. Teste novamente
4. Quando for para produção, adicione o domínio real

---

**Resumo:** Você pode usar o domínio do batataistem E adicionar localhost. Ambos funcionarão! 🚀

