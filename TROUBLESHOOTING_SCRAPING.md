# 🔧 Troubleshooting: Problemas com Scraping

## ❌ Erro: "Nenhum post encontrado"

### Possíveis Causas:

1. **Perfil Privado**
   - Instagram não mostra posts de perfis privados sem login
   - **Solução:** Perfil precisa ser público

2. **Instagram Mudou o Formato**
   - Instagram atualiza o HTML frequentemente
   - O código pode precisar ser atualizado
   - **Solução:** Atualizar código de scraping

3. **Bloqueio do Instagram**
   - Instagram pode estar bloqueando requisições
   - **Solução:** Aguardar ou usar VPN

4. **Perfil Não Existe**
   - Username pode estar incorreto
   - **Solução:** Verificar se o perfil existe

## 🔍 Como Diagnosticar

### 1. Verificar se o Perfil é Público

Acesse manualmente: `https://www.instagram.com/deck_sportbar/`

- ✅ Se conseguir ver posts → Perfil é público
- ❌ Se pedir login → Perfil é privado

### 2. Verificar se o Perfil Existe

- Acesse a URL no navegador
- Se aparecer "Página não encontrada" → Perfil não existe

### 3. Testar Scraping Manualmente

Crie um arquivo de teste:

```javascript
// test-scraping.js
import { getProfilePostsViaScraping } from './src/services/instagramScraper.js';

try {
  const posts = await getProfilePostsViaScraping('deck_sportbar', 5);
  console.log('Posts encontrados:', posts.length);
} catch (error) {
  console.error('Erro:', error.message);
}
```

Execute: `node test-scraping.js`

## 🛠️ Soluções

### Solução 1: Usar Perfis Públicos

Certifique-se de que os perfis que você quer monitorar são **públicos**.

### Solução 2: Atualizar Código de Scraping

O Instagram pode ter mudado o formato. Se isso acontecer:

1. Acesse o perfil no navegador
2. Abra DevTools (F12)
3. Procure por scripts com `type="application/json"`
4. Encontre a estrutura de dados
5. Atualize o código de scraping

### Solução 3: Usar Login (Não Recomendado)

Você pode fazer login no Instagram via Puppeteer, mas:
- ⚠️ Risco muito alto de bloqueio
- ⚠️ Viola ToS
- ⚠️ Não recomendado

### Solução 4: Desativar Scraping

Se scraping não funcionar, desative:

```env
USE_SCRAPING_FALLBACK=false
```

E foque em conseguir autorizações para API oficial.

## 📝 Logs Úteis

O sistema mostra logs quando tenta scraping:

```
⚠️  API oficial falhou, tentando scraping como fallback...
⚠️  Usando web scraping (não oficial) para buscar posts
🔍 Acessando perfil via scraping: https://www.instagram.com/deck_sportbar/
⚠️  Nenhum post encontrado via scraping
```

## 🎯 Próximos Passos

1. **Verificar se perfil é público**
2. **Testar scraping manualmente**
3. **Se não funcionar, focar em API oficial**
4. **Pedir autorização aos donos dos perfis**

---

**Lembre-se:** Scraping é instável. A melhor solução é conseguir autorizações para API oficial! 🎯

