# 🔧 Resolver Erro: Token do Instagram Inválido

O erro "Invalid OAuth access token - Cannot parse access token" significa que o token do Instagram expirou ou está inválido.

## 🔍 Diagnóstico

**Erro:** `Invalid OAuth access token - Cannot parse access token`  
**Código:** `190`  
**Causa:** Token do Instagram expirado ou inválido

## ✅ Solução: Gerar Novo Token

### Passo 1: Acessar Graph API Explorer

1. Acesse [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Faça login com sua conta do Facebook

### Passo 2: Selecionar seu App

1. No canto superior direito, clique no dropdown **"Meta App"**
2. Selecione o app que você criou (ex: "Batataistem")

### Passo 3: Gerar Novo Token

1. Clique em **"Gerar Token de Acesso"** ou **"Generate Access Token"**
2. Selecione as permissões:
   - ✅ `instagram_basic`
   - ✅ `pages_read_engagement` (se usar páginas)
3. Clique em **"Gerar Token de Acesso"**

### Passo 4: Copiar o Token

1. O token aparecerá no campo **"Token de Acesso"**
2. **Copie o token completo** (é uma string muito longa)

### Passo 5: Atualizar .env

1. Abra o arquivo `.env`
2. Encontre a linha `INSTAGRAM_ACCESS_TOKEN=`
3. Substitua o token antigo pelo novo:

```env
INSTAGRAM_ACCESS_TOKEN=novo_token_aqui_cole_o_token_completo
```

4. **Salve o arquivo**

### Passo 6: Reiniciar Servidor

1. Pare o servidor (Ctrl+C)
2. Reinicie: `npm start`

### Passo 7: Testar

1. Acesse: `http://localhost:3000/instagram/test`
2. Deve retornar: `{"connected": true, "message": "Conexão com Instagram API OK"}`

## ⚠️ Por que o Token Expira?

- **Tokens de teste** expiram em algumas horas
- **Tokens de produção** podem expirar após 60 dias
- Tokens podem ser revogados se você alterar a senha do Facebook

## 🔄 Solução Permanente: Token de Longa Duração

Para evitar que o token expire frequentemente:

1. **Converter conta do Instagram em Conta Profissional**
2. **Criar/conectar uma Página do Facebook**
3. **Seguir processo completo de OAuth** (mais complexo)

Consulte [GUIA_INSTAGRAM_API.md](./GUIA_INSTAGRAM_API.md) para instruções detalhadas.

## 📝 Verificar Token Atual

Para verificar se seu token está válido:

```bash
# Via API
curl "https://graph.instagram.com/me?fields=id,username&access_token=SEU_TOKEN"
```

Ou acesse: `http://localhost:3000/instagram/test`

## 🆘 Ainda Não Funciona?

1. Verifique se copiou o token completo (sem espaços)
2. Certifique-se de que o token não expirou novamente
3. Verifique se selecionou o app correto no Graph API Explorer
4. Tente gerar um novo token novamente

---

**Dica:** Mantenha o Graph API Explorer aberto para gerar novos tokens rapidamente quando necessário! 🔑

