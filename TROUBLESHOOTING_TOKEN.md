# 🔧 Troubleshooting: Não Consigo Encontrar o INSTAGRAM_ACCESS_TOKEN

Este guia ajuda a resolver problemas comuns ao tentar gerar o token de acesso do Instagram.

## ❌ Problema: "Não encontro o botão Gerar Token"

### Solução 1: Verificar se está no lugar certo

1. **NÃO procure nas "Configurações"** - O token não aparece lá diretamente
2. **Vá em "Ferramentas" → "Explorador da API Graph"** (Tools → Graph API Explorer)
3. O botão está no **canto superior direito** da página do Graph API Explorer

### Solução 2: Link Direto

Acesse diretamente:
```
https://developers.facebook.com/tools/explorer/
```

### Solução 3: Verificar Permissões da Conta

1. No menu lateral do seu app, vá em **"Funções"** ou **"Roles"**
2. Verifique se sua conta está listada como:
   - **Administrador** (Admin)
   - **Desenvolvedor** (Developer)
3. Se não estiver, adicione sua conta:
   - Clique em **"Adicionar Pessoas"** ou **"Add People"**
   - Digite seu email do Facebook
   - Selecione a função **"Desenvolvedor"**
   - Salve

## ❌ Problema: "O token não aparece após clicar em Gerar"

### Solução 1: Verificar se o App está Ativo

1. Vá em **Configurações** → **Básico**
2. Verifique se o app não está em **"Modo de Desenvolvimento"** restrito
3. Se estiver, você pode continuar usando, mas precisa adicionar testadores

### Solução 2: Adicionar Testadores (Modo Desenvolvimento)

1. Vá em **Funções** → **Funções** (Roles → Roles)
2. Clique em **"Adicionar Pessoas"**
3. Adicione sua conta do Facebook como **"Testador"** ou **"Desenvolvedor"**
4. Tente gerar o token novamente

### Solução 3: Verificar se o Produto está Adicionado

1. No menu lateral, procure por **"Instagram Graph API"**
2. Se não aparecer, você precisa adicionar o produto:
   - Clique em **"Adicionar Produto"** ou **"Add Product"**
   - Procure por **"Instagram Graph API"**
   - Clique em **"Configurar"** ou **"Set Up"**

## ❌ Problema: "Token gerado mas expira muito rápido"

### Solução: Converter para Token de Longa Duração

1. **Copie o token temporário** que você gerou
2. Acesse: [Facebook Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
3. Cole o token no campo
4. Clique em **"Estender Token"** ou **"Extend Token"**
5. Isso criará um token válido por 60 dias

**OU** use este endpoint via curl:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=SEU_APP_ID&client_secret=SEU_APP_SECRET&fb_exchange_token=TOKEN_TEMPORARIO"
```

Substitua:
- `SEU_APP_ID` pelo ID do seu app
- `SEU_APP_SECRET` pela chave secreta do app
- `TOKEN_TEMPORARIO` pelo token que você gerou

## ❌ Problema: "Erro ao usar o token no sistema"

### Verificar se o Token está Correto

1. Teste o token diretamente:
```bash
curl "https://graph.instagram.com/me?fields=id,username&access_token=SEU_TOKEN"
```

2. Se retornar erro, o token pode estar:
   - Expirado (gere um novo)
   - Sem permissões adequadas (gere com mais permissões)
   - Inválido (copie novamente)

### Verificar Permissões do Token

1. Acesse: [Facebook Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
2. Cole o token
3. Veja quais permissões estão ativas
4. Se faltar alguma, gere um novo token com todas as permissões necessárias

## ✅ Passo a Passo Visual (Texto)

### Como Gerar Token - Passo a Passo:

1. **Login no Facebook Developers**
   ```
   https://developers.facebook.com/
   ```

2. **Selecione seu App**
   - Clique em "Meus Apps" (canto superior direito)
   - Escolha o app que você criou

3. **Abra o Graph API Explorer**
   - Menu lateral → "Ferramentas" → "Explorador da API Graph"
   - OU: https://developers.facebook.com/tools/explorer/

4. **Selecione o App no Dropdown**
   - Canto superior direito → Dropdown "Meta App"
   - Escolha seu app

5. **Clique em "Gerar Token de Acesso"**
   - Botão ao lado do dropdown do app
   - Canto superior direito

6. **Selecione Permissões**
   - Marque: `instagram_basic`
   - Marque: `pages_read_engagement` (se usar páginas)
   - Clique em "Gerar Token de Acesso"

7. **Copie o Token**
   - Aparece no campo "Token de Acesso"
   - Copie TUDO (é uma string longa)

8. **Cole no .env**
   ```env
   INSTAGRAM_ACCESS_TOKEN=cole_o_token_aqui
   ```

## 🆘 Ainda Não Funciona?

### Checklist Final:

- [ ] Estou logado no Facebook Developers?
- [ ] Criei um app?
- [ ] Adicionei o produto "Instagram Graph API"?
- [ ] Minha conta está como Administrador/Desenvolvedor do app?
- [ ] Estou no Graph API Explorer (não nas Configurações)?
- [ ] Selecionei o app correto no dropdown?
- [ ] Cliquei em "Gerar Token de Acesso" (não apenas "Token")?

### Se Nada Funcionar:

1. **Tente criar um novo app** do zero
2. **Use uma conta diferente** do Facebook (às vezes há restrições)
3. **Aguarde algumas horas** (às vezes há delays do Facebook)
4. **Contate o suporte do Facebook Developers** se persistir

## 📞 Links Úteis

- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Suporte Facebook Developers](https://developers.facebook.com/support/)

---

**Dica:** O token é uma string muito longa (mais de 100 caracteres). Certifique-se de copiar tudo, incluindo o início e o fim!

