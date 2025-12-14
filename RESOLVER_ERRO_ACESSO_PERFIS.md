# 🔧 Resolver: Token Só Acessa Própria Conta

## 🔍 Problema Identificado

O token funciona para `/me` (sua própria conta), mas **não consegue acessar outros perfis** do Instagram.

**Erro:** `Código: 2 - An unexpected error has occurred`

## ⚠️ Causa

O token gerado no **Instagram Business API Setup** pode estar limitado apenas à sua própria conta. Para acessar outros perfis, você precisa:

1. **Conta Profissional do Instagram** conectada a uma **Página do Facebook**
2. **Token com permissões de Página** (não apenas token de usuário)

## ✅ Solução: Usar API de Páginas do Facebook

### Passo 1: Conectar Instagram a uma Página do Facebook

1. **Crie ou use uma Página do Facebook:**
   - Acesse [Facebook Pages](https://www.facebook.com/pages/create)
   - Crie uma nova página ou use uma existente

2. **Conecte sua conta do Instagram à Página:**
   - Vá em **Configurações da Página** → **Instagram**
   - Conecte sua conta do Instagram profissional

3. **Verifique a conexão:**
   - A conta do Instagram deve aparecer conectada à página

### Passo 2: Gerar Token com Permissões de Página

1. **No Graph API Explorer:**
   - Selecione seu app
   - Clique em **"Gerar Token de Acesso"**
   - Selecione **"Token da Página"** (não "Token do Usuário")

2. **Selecione as permissões:**
   - ✅ `pages_read_engagement`
   - ✅ `pages_show_list`
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_comments` (opcional)

3. **Selecione a Página:**
   - Escolha a página conectada ao Instagram
   - Gere o token

### Passo 3: Obter Instagram Business Account ID

1. **Via API:**
   ```bash
   curl "https://graph.facebook.com/v24.0/me/accounts?access_token=SEU_TOKEN_PAGINA"
   ```

2. **Ou no Graph API Explorer:**
   - Endpoint: `me/accounts`
   - Isso retornará as páginas conectadas
   - Cada página terá um `instagram_business_account` ID

### Passo 4: Usar o Instagram Business Account ID

Para acessar perfis do Instagram, você precisa usar o **Instagram Business Account ID** da página, não o ID do perfil diretamente.

## 🔄 Alternativa: Usar Instagram Basic Display API (Limitado)

Se você só precisa acessar sua própria conta, o token atual funciona. Mas para monitorar outros perfis, você precisa da solução acima.

## 📝 Estrutura Correta

```
Facebook Page (conectada ao Instagram)
  └── Instagram Business Account ID
      └── Acesso a posts, insights, etc.
```

## ⚠️ Limitações da API do Instagram

A Instagram Graph API tem limitações:

- ✅ Você pode acessar perfis de contas **conectadas à sua página**
- ✅ Você pode acessar perfis que **autorizaram seu app**
- ❌ Você **NÃO pode** acessar perfis públicos aleatórios sem autorização

## 🎯 Para o Seu Caso Específico

Se você quer monitorar perfis como `@deck_sportbar`:

1. **Opção A: Pedir autorização**
   - O dono do perfil precisa autorizar seu app
   - Conectar o perfil a uma página que você gerencia

2. **Opção B: Usar Instagram Basic Display API**
   - Só funciona para sua própria conta
   - Não permite monitorar outros perfis

3. **Opção C: Web Scraping** (não recomendado)
   - Viola termos de serviço
   - Pode resultar em bloqueio

## 🔍 Verificar se Está Configurado Corretamente

Execute este teste:

```bash
# 1. Testar token de página
curl "https://graph.facebook.com/v24.0/me/accounts?access_token=SEU_TOKEN"

# 2. Se retornar páginas, pegue o ID da página
# 3. Obter Instagram Business Account ID
curl "https://graph.facebook.com/v24.0/PAGE_ID?fields=instagram_business_account&access_token=SEU_TOKEN"
```

## 📚 Documentação Oficial

- [Instagram Graph API - Getting Started](https://developers.facebook.com/docs/instagram-api/getting-started)
- [Instagram Business Account](https://developers.facebook.com/docs/instagram-api/overview#instagram-business-account)

---

**Resumo:** Para acessar outros perfis, você precisa de uma Página do Facebook conectada ao Instagram e usar tokens de página, não tokens de usuário.

