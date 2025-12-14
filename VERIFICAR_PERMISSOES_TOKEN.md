# 🔍 Verificar Permissões do Token do Instagram

O token pode estar sendo gerado sem as permissões corretas do Instagram, OU o token no `.env` pode ser diferente do token que funciona no Graph API Explorer.

## ⚠️ Problema Comum

Mesmo gerando um novo token, se ele não tiver as permissões corretas do Instagram, você receberá erro "Invalid OAuth access token".

## ✅ Solução: Garantir Permissões Corretas

### Passo 1: Gerar Token com Permissões Corretas

1. Acesse [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

2. **Selecione seu App:**
   - No dropdown "Meta App" (canto superior direito)
   - Escolha "Batataistem" (ou o nome do seu app)

3. **Clique em "Gerar Token de Acesso"**

4. **IMPORTANTE: Selecione as Permissões Corretas:**
   
   Na janela que abrir, procure e marque:
   
   ✅ **`instagram_basic`** (obrigatório)
   ✅ **`pages_read_engagement`** (se usar páginas)
   ✅ **`pages_show_list`** (se usar páginas)
   
   ⚠️ **NÃO marque apenas permissões do Facebook** - precisa ter permissões do Instagram!

5. **Clique em "Gerar Token de Acesso"**

6. **Copie o token completo**

### Passo 2: Verificar se o Token Funciona

Antes de usar no sistema, teste diretamente:

**No Graph API Explorer:**
1. Cole o token no campo "Token de Acesso"
2. Mude o endpoint para: `me?fields=id,username`
3. Clique em "Enviar"
4. Se retornar seus dados, o token está OK
5. Se der erro, o token não tem as permissões corretas

### Passo 3: Testar com Instagram ID

Se o token funcionar com `/me`, teste com um Instagram ID:

1. No Graph API Explorer
2. Endpoint: `{instagram_id}?fields=id,username`
3. Substitua `{instagram_id}` pelo ID do perfil (ex: `47348527196`)
4. Clique em "Enviar"
5. Se funcionar, o token está correto

### Passo 4: Copiar Token do Explorer para .env

**IMPORTANTE:** O token que funciona no Explorer pode ser diferente do que está no `.env`!

1. **No Graph API Explorer:**
   - Veja o campo "Token de Acesso" no painel direito
   - Esse é o token que está funcionando (você conseguiu fazer a query)
   - **Copie esse token COMPLETO**

2. **No arquivo `.env`:**
   - Abra o `.env` no editor
   - Encontre: `INSTAGRAM_ACCESS_TOKEN=`
   - **Apague o token antigo completamente**
   - Cole o novo token (sem espaços antes/depois)
   - Certifique-se de que não há quebras de linha
   - **Salve o arquivo**

3. **Verificar:**
   - Token deve ter ~200-250 caracteres
   - Deve começar com `EAA`
   - Não deve ter espaços ou quebras de linha

```env
INSTAGRAM_ACCESS_TOKEN=EAAWFnxeVYzUBQLwguKBCzWiTfSUdUBv7jbapcYAiqpZBoOpKg9nNYksASSf03BndS2h8UMh88ZCBIFWHZBlsDvbxLdEmNVOo1NiY625NBDclk2KeIvxJJc70aLL4Uowosmd61Litq67oZBC5MWXCnmp5kxVQAR7icgsJyaaUELh2GZClB0SkooVlPWErwqSkJyihR8Lvhj4vImf6gpNsGHMN0B6Er4TxsmNhAWg7Ht9ffoAUOjfOM2E0WbQuZCORf5lYfyS5qGY9LK
```

### Passo 5: Reiniciar e Testar

1. Pare o servidor (Ctrl+C)
2. Reinicie: `npm start`
3. Teste: `http://localhost:3000/instagram/test`

## 🔍 Verificar Permissões do Token

Para ver quais permissões o token tem:

1. Acesse [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
2. Cole o token
3. Clique em "Debug"
4. Veja a lista de "Scopes" (permissões)
5. Deve incluir `instagram_basic`

## ⚠️ Problemas Comuns

### Token não tem permissões do Instagram
**Solução:** Gere novo token e certifique-se de marcar `instagram_basic`

### Token é de outro app
**Solução:** Certifique-se de selecionar o app correto no dropdown

### Token está incompleto no .env
**Solução:** Copie o token completo, sem espaços ou quebras de linha

### Token expirou muito rápido
**Solução:** Tokens de teste expiram rápido. Para produção, precisa de token de longa duração

## 📝 Checklist

- [ ] Token foi gerado com permissões `instagram_basic`
- [ ] Token funciona no Graph API Explorer com `/me`
- [ ] Token funciona no Graph API Explorer com Instagram ID
- [ ] Token está completo no `.env` (sem quebras)
- [ ] Servidor foi reiniciado após atualizar `.env`
- [ ] Testei com `GET /instagram/test`

---

**Dica:** Se o token funciona no Graph API Explorer mas não no sistema, pode ser problema de formatação no `.env` (espaços extras, quebras de linha, etc.)

