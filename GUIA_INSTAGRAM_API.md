# 🔑 Guia Completo: Como Obter Credenciais do Instagram Graph API

Este guia mostra passo a passo como obter todas as credenciais necessárias para integrar com o Instagram Graph API.

## 📋 Pré-requisitos

- Conta no Facebook
- Conta no Instagram (pode ser pessoal ou de negócios)
- Acesso ao [Facebook Developers](https://developers.facebook.com/)

## 🚀 Passo a Passo

### 1. Criar um App no Facebook Developers

1. Acesse [https://developers.facebook.com/](https://developers.facebook.com/)
2. Faça login com sua conta do Facebook
3. Clique em **Meus Apps** (My Apps) no canto superior direito
4. Clique em **Criar App** (Create App)
5. Escolha o tipo de app:
   - Selecione **Outro** (Other)
   - Clique em **Próximo** (Next)
6. Preencha os dados:
   - **Nome do App**: Ex: "Batataistem" ou "Sistema de Eventos Batatais"
   - **Email de contato**: Seu email
   - **Finalidade do App**: Escolha uma opção (ex: "Para uso próprio")
7. Clique em **Criar App**

### 2. Adicionar o Produto "Instagram Graph API"

1. No painel do seu app, procure por **Instagram Graph API**
2. Clique em **Configurar** (Set Up)
3. Se aparecer uma tela de boas-vindas, clique em **Continuar**

### 3. Obter o App ID e App Secret

1. No menu lateral esquerdo, vá em **Configurações** → **Básico** (Settings → Basic)
2. Você verá:
   - **ID do App** (App ID) - Esta é a `INSTAGRAM_APP_ID`
   - **Chave secreta do app** (App Secret) - Clique em **Mostrar** para revelar
     - Esta é a `INSTAGRAM_APP_SECRET`
3. **Copie e guarde essas informações** (você precisará delas no `.env`)

### 4. Configurar Domínios e URLs

1. Ainda em **Configurações** → **Básico**, role até a seção **Configurações do App**
2. Adicione:
   - **Domínios do App**: `localhost` (para desenvolvimento)
   - **URLs do Site**: `http://localhost:3000`
3. Clique em **Salvar alterações**

### 5. Criar um Token de Acesso (INSTAGRAM_ACCESS_TOKEN)

#### ⚠️ IMPORTANTE: Onde Encontrar o Token

Você tem **duas opções** para gerar o token:

1. **Instagram Business API Setup** (Recomendado - Mais fácil) ✅
2. **Graph API Explorer** (Alternativa)

🔧 **Problemas?** Consulte [TROUBLESHOOTING_TOKEN.md](./TROUBLESHOOTING_TOKEN.md) para ajuda detalhada.

#### Opção A: Via Instagram Business API Setup (RECOMENDADO) ⭐

**Esta é a forma mais fácil e direta!**

1. **Acesse a página de configuração:**
   - No menu lateral, vá em **Produtos** → **Instagram** → **Configuração da API**
   - OU acesse diretamente: `https://developers.facebook.com/apps/SEU_APP_ID/instagram-business/API-Setup/`

2. **Na seção "1. Gere tokens de acesso":**
   - Você verá sua conta do Instagram listada
   - Ao lado da conta, há um botão **"Gerar token"**
   - **Clique em "Gerar token"**

3. **Autorizar (se necessário):**
   - Uma janela popup pode aparecer
   - Autorize o app a acessar sua conta do Instagram

4. **Copiar o Token:**
   - O token aparecerá na tabela
   - **Copie o token completo**
   - Este é o seu `INSTAGRAM_ACCESS_TOKEN`

5. **Vantagens deste método:**
   - ✅ Token específico do Instagram Business API
   - ✅ Funciona diretamente com `graph.instagram.com`
   - ✅ Não precisa de configurações extras
   - ✅ Mais simples e direto

📖 **Guia completo:** [GERAR_TOKEN_INSTAGRAM_BUSINESS.md](./GERAR_TOKEN_INSTAGRAM_BUSINESS.md)

#### Opção B: Via Graph API Explorer (Alternativa)

**Passo a Passo Detalhado:**

1. **Acesse o Graph API Explorer:**
   - No menu lateral esquerdo do seu app, procure por **"Ferramentas"** ou **"Tools"**
   - Clique em **"Explorador da API Graph"** ou **"Graph API Explorer"**
   - OU acesse diretamente: [https://developers.facebook.com/tools/explorer/](https://developers.facebook.com/tools/explorer/)

2. **Selecione seu App:**
   - No canto superior direito da página, há um dropdown que diz **"Meta App"** ou **"Selecionar App"**
   - Clique nele e escolha o app que você criou (ex: "Batataistem")

3. **Mudar para Instagram API:**
   - No campo de endpoint, selecione **`graph.instagram.com`** (não `graph.facebook.com`)
   - Isso é importante para gerar um token específico do Instagram

4. **Gerar Token Específico do Instagram:**
   - No painel direito, procure pelo botão **"Generate Instagram Access Token"** ou **"Gerar Token do Instagram"**
   - ⚠️ **IMPORTANTE**: Use este botão específico (não o botão genérico "Generate Access Token")
   - Clique neste botão

5. **Autorizar e Selecionar Permissões:**
   - Uma janela popup aparecerá pedindo autorização
   - Você precisará autorizar o app a acessar sua conta do Instagram
   - Marque as seguintes permissões:
     - ✅ `instagram_basic` (obrigatório)
     - ✅ `pages_read_engagement` (se usar páginas do Facebook)
   - Complete o processo de autorização

6. **Copiar o Token:**
   - O token aparecerá no campo **"Token de Acesso"** ou **"Access Token"**
   - **COPIE ESTE TOKEN COMPLETO** - Este é o seu `INSTAGRAM_ACCESS_TOKEN`
   - ⚠️ **ATENÇÃO**: Este token expira em algumas horas (é temporário)

7. **Testar o Token:**
   - No Explorer, certifique-se de que está usando `graph.instagram.com`
   - Endpoint: `me?fields=id,username`
   - Cole o token e clique em "Enviar"
   - Se retornar seus dados do Instagram, o token está correto!

6. **Se não aparecer o botão "Gerar Token":**
   - Certifique-se de que você está logado com uma conta que tem acesso ao app
   - Verifique se o app está ativo (não em modo de desenvolvimento restrito)
   - Tente adicionar sua conta como "Administrador" ou "Desenvolvedor" do app

#### Opção B: Via Configurações do App (Alternativa)

1. No menu lateral, vá em **"Configurações"** → **"Básico"** (Settings → Basic)
2. Role até a seção **"Token de Acesso"** ou **"Access Tokens"**
3. Se houver um botão **"Adicionar Token"** ou **"Generate Token"**, clique nele
4. Siga os passos para gerar o token

#### Opção C: Token de Longa Duração (Produção)

Para um token que dura mais tempo (60 dias), você precisa:

1. **Converter sua conta do Instagram em Conta Profissional:**
   - Abra o Instagram no celular
   - Vá em **Configurações** → **Conta** → **Mudar para conta profissional**
   - Escolha **Criador** ou **Negócios**

2. **Criar/Conectar uma Página do Facebook:**
   - Acesse [facebook.com/pages/create](https://www.facebook.com/pages/create)
   - Crie uma página simples
   - No Instagram, conecte sua conta à página do Facebook

3. **Obter Token de Longa Duração:**
   - Use a ferramenta: [Facebook Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
   - Ou siga o processo completo de OAuth (mais complexo)

#### Opção B: Token de Longa Duração (Produção)

**IMPORTANTE**: Tokens de teste expiram rapidamente. Para produção, você precisa:

1. **Converter sua conta do Instagram em Conta Profissional**:
   - Abra o Instagram no celular
   - Vá em **Configurações** → **Conta** → **Mudar para conta profissional**
   - Escolha **Criador** ou **Negócios**
   - Complete o processo

2. **Criar uma Página do Facebook** (se não tiver):
   - Acesse [facebook.com/pages/create](https://www.facebook.com/pages/create)
   - Crie uma página simples
   - Conecte sua conta do Instagram à página

3. **Obter Token de Longa Duração**:
   - Use ferramentas como [Facebook Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
   - Ou siga o processo de OAuth completo (mais complexo)

### 6. Obter o Instagram ID de um Perfil

Para cadastrar perfis no sistema, você precisa do **Instagram ID** (não é o username).

📖 **Guia completo**: Veja [COMO_OBTER_INSTAGRAM_ID.md](./COMO_OBTER_INSTAGRAM_ID.md) para métodos detalhados.

💡 **Dica**: A interface web do sistema tem um botão "🔍 Buscar ID" que tenta encontrar o ID automaticamente quando você digita o username!

#### Método 1: Via API (Recomendado)

```bash
# Use seu ACCESS_TOKEN
curl "https://graph.instagram.com/me?fields=id,username&access_token=SEU_TOKEN"
```

#### Método 2: Via Ferramentas Online

1. Acesse [https://www.instagram.com/web/search/topsearch/?query=username](https://www.instagram.com/web/search/topsearch/?query=username)
2. Substitua `username` pelo username do perfil
3. Procure o ID no resultado

#### Método 3: Via Facebook Graph API Explorer

1. Acesse [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Selecione seu app
3. Use o endpoint: `/{username}?fields=id`
4. Ou use: `https://graph.instagram.com/{username}?access_token=SEU_TOKEN`

### 7. Configurar no Projeto

Edite seu arquivo `.env`:

```env
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_APP_ID=seu_app_id_aqui
INSTAGRAM_APP_SECRET=seu_app_secret_aqui
```

## ⚠️ Limitações e Considerações

### Tokens de Teste
- Expira em algumas horas
- Funciona apenas com contas que você adicionou como "Testadores"
- Ideal para desenvolvimento

### Tokens de Produção
- Requer revisão do Facebook (processo mais longo)
- Funciona com qualquer perfil público
- Válido por 60 dias (pode ser renovado)

### Limites da API
- **Rate Limits**: O Instagram limita o número de requisições por hora
- **Permissões**: Algumas funcionalidades requerem aprovação do Facebook
- **Contas Profissionais**: Algumas APIs só funcionam com contas profissionais

## 🔧 Troubleshooting

### Erro: "Invalid Access Token"
- Verifique se o token não expirou
- Confirme que está usando o token correto
- Tokens de teste expiram rapidamente

### Erro: "User does not have permission"
- Adicione sua conta como testadora no app
- Vá em **Roles** → **Roles** → **Add People**
- Adicione seu Facebook/Instagram

### Erro: "Instagram ID not found"
- Confirme que o ID está correto (não é o username)
- Use a API para buscar o ID correto
- Verifique se o perfil é público ou você tem acesso

### Como Renovar Token Expirado
1. Vá em **Graph API Explorer**
2. Gere um novo token
3. Atualize no `.env`
4. Reinicie o servidor

## 📚 Recursos Úteis

- [Documentação Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Facebook Developers Console](https://developers.facebook.com/apps/)

## 🎯 Resumo Rápido

1. ✅ Criar app no Facebook Developers
2. ✅ Adicionar produto "Instagram Graph API"
3. ✅ Copiar App ID e App Secret
4. ✅ Gerar Access Token (teste ou produção)
5. ✅ Obter Instagram IDs dos perfis
6. ✅ Configurar no `.env`
7. ✅ Testar com `GET /instagram/test`

---

**Dica**: Para desenvolvimento, comece com tokens de teste. Quando estiver pronto para produção, migre para tokens de longa duração seguindo o processo completo de OAuth.

