# 🔄 Como Trocar Token por um de Longa Duração (60 dias)

Tokens de teste expiram em 1 hora. Você pode trocá-los por tokens de **60 dias** usando o endpoint `/access_token`.

## 🎯 Como Funcionar

### Passo 1: Obter Token de Curta Duração

1. No Graph API Explorer, gere um token usando **"Generate Instagram Access Token"**
2. Este token expira em **1 hora**
3. Copie este token

### Passo 2: Trocar por Token de Longa Duração

Você tem duas opções:

#### Opção A: Via API do Sistema (Recomendado)

1. **Certifique-se de que `INSTAGRAM_APP_SECRET` está no `.env`:**
   ```env
   INSTAGRAM_APP_SECRET=sua_chave_secreta_aqui
   ```

2. **Use o endpoint do sistema:**
   ```bash
   curl -X POST http://localhost:3000/instagram/exchange-token \
     -H "Content-Type: application/json" \
     -d '{"shortLivedToken": "SEU_TOKEN_CURTA_DURACAO"}'
   ```

3. **Ou via interface web:**
   - Acesse `http://localhost:3000`
   - Use a aba de sincronização (em breve adicionaremos botão para trocar token)

#### Opção B: Via cURL Direto

```bash
curl -X GET "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=SUA_APP_SECRET&access_token=TOKEN_CURTA_DURACAO"
```

**Substitua:**
- `SUA_APP_SECRET` pela chave secreta do app (encontre em Settings → Basic → App Secret)
- `TOKEN_CURTA_DURACAO` pelo token que você gerou

### Passo 3: Atualizar .env

1. Você receberá um novo token no formato:
   ```json
   {
     "access_token": "novo_token_aqui",
     "token_type": "bearer",
     "expires_in": 5184000
   }
   ```

2. **Copie o `access_token`** (é o novo token de longa duração)

3. **Atualize o `.env`:**
   ```env
   INSTAGRAM_ACCESS_TOKEN=novo_token_de_longa_duracao_aqui
   ```

4. **Salve e reinicie o servidor**

## 📋 Requisitos

- ✅ Token de curta duração válido (não expirado)
- ✅ `INSTAGRAM_APP_SECRET` configurado no `.env`
- ✅ Token deve ter permissão `instagram_graph_user_profile`

## ⚠️ Importante

- **NUNCA** exponha `INSTAGRAM_APP_SECRET` no frontend
- **NUNCA** compartilhe a chave secreta
- Use apenas no código do servidor (já está implementado assim)

## 🔄 Renovação Automática (Futuro)

Posso implementar renovação automática do token quando estiver próximo de expirar. Quer que eu adicione isso?

## 📝 Exemplo Completo

```bash
# 1. Obter token de curta duração no Graph API Explorer
# Token: EAAWFnxeVYzUBQ...

# 2. Trocar por token de longa duração
curl -X POST http://localhost:3000/instagram/exchange-token \
  -H "Content-Type: application/json" \
  -d '{"shortLivedToken": "EAAWFnxeVYzUBQ..."}'

# 3. Resposta:
# {
#   "message": "Token trocado com sucesso! Válido por 60 dias.",
#   "longLivedToken": "lZAfb2dhVW...",
#   "expiresIn": 5184000,
#   "expiresAt": "2025-02-10T..."
# }

# 4. Atualizar .env com longLivedToken
```

---

**Dica:** Use tokens de longa duração para evitar ter que gerar novos tokens constantemente! 🎯

