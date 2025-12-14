# 🔷 Configurar Apify Instagram Scraper

## ✅ Sim, Apify Resolve!

O [Apify Instagram Scraper](https://apify.com/apify/instagram-scraper) é uma excelente alternativa:

- ✅ **Muito mais estável** que scraping próprio
- ✅ **Mantido profissionalmente** (Apify)
- ✅ **156K usuários** (confiável)
- ✅ **API fácil de usar**
- ✅ **Suporte a perfis públicos**

## 💰 Custo

- **$1.50 por 1.000 resultados**
- **$5 grátis** por mês (plano free)
- **~2.100 posts grátis** por mês

Para seu caso (monitorar alguns perfis):
- **Custo estimado:** $5-15/mês
- **Muito acessível** para produção

## 🚀 Como Configurar

### Passo 1: Criar Conta no Apify

1. Acesse: https://apify.com/
2. Clique em **"Sign up"** ou **"Get started"**
3. Crie uma conta (pode usar GitHub, Google, etc.)
4. Confirme o email

### Passo 2: Obter API Token

1. Acesse: https://console.apify.com/account/integrations
2. Procure por **"API tokens"**
3. Clique em **"Create token"**
4. Copie o token gerado

### Passo 3: Configurar .env

Adicione no seu `.env`:

```env
# Apify Configuration
APIFY_API_TOKEN=seu_token_aqui
USE_APIFY_FALLBACK=true
INSTAGRAM_FALLBACK_METHOD=apify  # Usar Apify como método principal de fallback
```

### Passo 4: Instalar Dependências

```bash
npm install
```

Isso instalará `apify-client`.

### Passo 5: Testar

```bash
npm start
```

Tente sincronizar um perfil. O sistema usará Apify se outras APIs falharem.

## ⚙️ Ordem de Tentativas

Com Apify configurado, o sistema tenta nesta ordem:

1. **API Oficial** (Instagram Graph API)
2. **Apify** (se configurado)
3. **Private API** (se configurado)
4. **Scraping** (se configurado)
5. **Cache** (sempre disponível)

## 📊 Comparação

| Método | Estabilidade | Custo | Legal | Configuração |
|--------|--------------|-------|-------|--------------|
| **API Oficial** | ⭐⭐⭐⭐⭐ | Grátis | ✅ | Complexa |
| **Apify** | ⭐⭐⭐⭐ | $1.50/1K | ⚠️ | Fácil |
| **Private API** | ⭐⭐⭐ | Grátis | ⚠️ | Média |
| **Scraping** | ⭐⭐ | Grátis | ❌ | Fácil |

## 🎯 Recomendação

### Para Seu Caso (Conta Nova):

1. **Use Apify como fallback principal**
2. **Custo baixo** ($5-15/mês)
3. **Muito mais estável** que scraping próprio
4. **Funciona imediatamente** (sem esperar conta "aquecer")

### Configuração Recomendada:

```env
# Método principal de fallback
INSTAGRAM_FALLBACK_METHOD=apify
USE_APIFY_FALLBACK=true

# Outros métodos como backup
USE_PRIVATE_API_FALLBACK=true
USE_SCRAPING_FALLBACK=false  # Desativar scraping (instável)
```

## 📝 Exemplo de Uso

Após configurar, o sistema automaticamente:

1. Tenta API oficial
2. Se falhar → Usa Apify
3. Se Apify falhar → Tenta Private API
4. Se tudo falhar → Usa Cache

## 💡 Vantagens do Apify

- ✅ **Não precisa seguir perfis**
- ✅ **Funciona com contas novas**
- ✅ **Sem risco de bloqueio** (Apify gerencia)
- ✅ **Rotação de IPs** automática
- ✅ **Suporte profissional**

## ⚠️ Limitações

- ⚠️ **Custo** (mas baixo)
- ⚠️ **Ainda pode violar ToS** (mas Apify gerencia riscos)
- ⚠️ **Dependência de serviço externo**

## 🔗 Links Úteis

- [Apify Instagram Scraper](https://apify.com/apify/instagram-scraper)
- [Apify Console](https://console.apify.com/)
- [Apify API Docs](https://docs.apify.com/api/v2)
- [Pricing](https://apify.com/pricing)

---

**Resumo:** Apify é uma excelente solução! Mais estável que scraping próprio e com custo acessível. 🎯

