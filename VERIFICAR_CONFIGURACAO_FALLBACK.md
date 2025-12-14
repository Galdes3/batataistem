# 🔍 Verificar Configuração de Fallback

## ⚠️ Problema Identificado

O sistema está tentando apenas scraping, mas não está tentando Private API ou Apify.

## ✅ Verificar Configuração no .env

Verifique se seu `.env` tem estas configurações:

```env
# Método de fallback preferido
INSTAGRAM_FALLBACK_METHOD=private_api  # ou 'apify' ou 'scraping'

# Ativar/desativar métodos
USE_PRIVATE_API_FALLBACK=true   # true = ativado (padrão)
USE_SCRAPING_FALLBACK=false     # false = desativado (recomendado)
USE_APIFY_FALLBACK=false        # true se tiver token do Apify

# Para Private API (necessário)
INSTAGRAM_USERNAME=batataistem_ev
INSTAGRAM_PASSWORD=sua_senha

# Para Apify (opcional)
APIFY_API_TOKEN=seu_token_aqui
```

## 🔍 Ordem de Tentativas

Com a configuração acima, o sistema tenta:

1. **API Oficial** → Se falhar
2. **Private API** → Se falhar
3. **Scraping** (se ativado) → Se falhar
4. **Apify** (se configurado) → Se falhar
5. **Cache** → Sempre disponível

## 🐛 Se Private API Não Está Sendo Tentado

### Verificar:

1. **Token está configurado?**
   ```bash
   npm run check-env
   ```

2. **Private API está ativado?**
   - `USE_PRIVATE_API_FALLBACK=true` no .env

3. **FALLBACK_METHOD está correto?**
   - `INSTAGRAM_FALLBACK_METHOD=private_api`

### Testar Private API Diretamente:

Crie um arquivo de teste:

```javascript
// test-private-api.js
import dotenv from 'dotenv';
dotenv.config();

import { getProfilePostsViaPrivateAPI } from './src/services/instagramPrivateAPI.js';

try {
  const posts = await getProfilePostsViaPrivateAPI('deck_sportbar', 5);
  console.log('Posts encontrados:', posts.length);
} catch (error) {
  console.error('Erro:', error.message);
}
```

Execute: `node test-private-api.js`

## 📝 Logs Esperados

Se tudo estiver configurado corretamente, você deve ver:

```
⚠️  API oficial falhou, tentando métodos alternativos...
🔄 Tentando Private API...
📱 Usando Instagram Private API para buscar posts
✅ Login no Instagram realizado com sucesso
📌 Não está seguindo @deck_sportbar, seguindo agora...
✅ Agora está seguindo @deck_sportbar
✅ Encontrados X post(s) via Private API
```

## 🆘 Se Ainda Não Funcionar

1. **Verifique se a conta do Instagram está ativa**
2. **Complete verificações de segurança** (se houver)
3. **Aguarde alguns dias** (contas novas têm restrições)
4. **Use Apify** como alternativa (mais estável)

---

**Dica:** Execute `npm run check-env` para verificar todas as configurações! 🔍

