# 📋 Como Copiar o Token Corretamente

Vejo que você tem `instagram_basic` nas permissões no Graph API Explorer, mas o token ainda não funciona. O problema pode ser que o token no `.env` não é o mesmo que está funcionando no Explorer.

## ✅ Passo a Passo Correto

### 1. No Graph API Explorer

1. **Veja o token que está funcionando:**
   - No painel direito, há um campo "Token de Acesso"
   - O token visível é o que está funcionando (você conseguiu fazer a query `/me`)

2. **Copie o token COMPLETO:**
   - Clique no campo do token
   - Selecione tudo (Ctrl+A)
   - Copie (Ctrl+C)
   - ⚠️ **IMPORTANTE**: Copie o token INTEIRO, sem cortar

### 2. Verificar o Token no Explorer

Antes de copiar, teste se o token funciona:

1. No Explorer, o endpoint está: `/me?fields=id,name`
2. Você conseguiu ver a resposta: `{"id": "26021821234092811", "name": "Lucas Silva"}`
3. Isso significa que o token está funcionando no Explorer

### 3. Copiar para .env

1. Abra o arquivo `.env` no Notepad++ ou editor de texto
2. Encontre a linha: `INSTAGRAM_ACCESS_TOKEN=`
3. **Apague o token antigo completamente**
4. Cole o novo token (sem espaços antes ou depois)
5. **Salve o arquivo**

**Formato correto:**
```env
INSTAGRAM_ACCESS_TOKEN=EAAWFnxeVYzUBQE1qIVKLKyrBPGZCme2BQLbpSCsGscLgjjPu6iOmm1KhyoY3Y8c2kFrS4...
```

**⚠️ NÃO faça:**
- ❌ Não deixe espaços antes ou depois do `=`
- ❌ Não quebre o token em múltiplas linhas
- ❌ Não adicione aspas ao redor do token

### 4. Verificar se Copiou Corretamente

O token deve ter aproximadamente **200-250 caracteres**. Se tiver muito menos, pode estar incompleto.

### 5. Reiniciar Servidor

1. **Pare o servidor completamente** (Ctrl+C)
2. **Reinicie:** `npm start`
3. **Teste:** `npm run test-instagram`

## 🔍 Verificar Token no .env

Para verificar se o token está correto no `.env`:

1. Abra o `.env`
2. Veja a linha `INSTAGRAM_ACCESS_TOKEN=`
3. O token deve começar com `EAA` (tokens do Facebook começam assim)
4. Deve ser uma string muito longa (200+ caracteres)
5. Não deve ter quebras de linha ou espaços extras

## 🆘 Se Ainda Não Funcionar

### Problema: Token Expira Muito Rápido

Tokens de teste expiram em algumas horas. Se o token funcionar no Explorer mas não no sistema:

1. **Gere um novo token** no Explorer
2. **Copie IMEDIATAMENTE** para o `.env`
3. **Reinicie o servidor** imediatamente
4. **Teste** antes que expire

### Problema: Token Diferente

O token no Explorer pode ser diferente do token no `.env`:

1. **No Explorer:** Veja qual token está no campo "Token de Acesso"
2. **Copie esse token exato**
3. **Cole no .env** substituindo o antigo
4. **Salve e reinicie**

## 📝 Checklist

- [ ] Token no Explorer funciona (conseguiu fazer query `/me`)
- [ ] Token tem permissão `instagram_basic` marcada
- [ ] Copiei o token COMPLETO do Explorer
- [ ] Colei no `.env` sem espaços extras
- [ ] Token no `.env` tem ~200-250 caracteres
- [ ] Salvei o arquivo `.env`
- [ ] Reiniciei o servidor completamente
- [ ] Testei com `npm run test-instagram`

---

**Dica:** Se o token funciona no Explorer mas não no sistema, o problema é quase sempre que o token no `.env` é diferente ou está mal formatado!

