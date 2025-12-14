# 🔄 Configurar Métodos Alternativos

O sistema agora suporta **3 métodos** para buscar posts do Instagram:

1. **API Oficial** (Instagram Graph API) - ✅ Recomendado
2. **Instagram Private API** - 📱 Simula app móvel (mais estável)
3. **Web Scraping** - 🔍 Último recurso

## ⚙️ Configuração no .env

```env
# Método de fallback preferido
INSTAGRAM_FALLBACK_METHOD=private_api  # 'private_api' ou 'scraping'

# Ativar/desativar métodos
USE_SCRAPING_FALLBACK=false           # true/false
USE_PRIVATE_API_FALLBACK=true         # true/false

# Para Private API (requer login)
INSTAGRAM_USERNAME=seu_usuario
INSTAGRAM_PASSWORD=sua_senha
```

## 📱 Método 1: Instagram Private API (Recomendado como Fallback)

### Vantagens:
- ✅ Mais estável que scraping
- ✅ Simula app móvel (menos detectável)
- ✅ Acessa perfis públicos e privados (se você seguir)
- ✅ Menos bloqueios

### Desvantagens:
- ⚠️ Requer login com conta real
- ⚠️ Risco de bloqueio da conta
- ⚠️ Ainda viola ToS

### Configuração:

1. **Adicione no .env:**
```env
INSTAGRAM_USERNAME=seu_usuario_instagram
INSTAGRAM_PASSWORD=sua_senha_instagram
USE_PRIVATE_API_FALLBACK=true
INSTAGRAM_FALLBACK_METHOD=private_api
INSTAGRAM_AUTO_FOLLOW=true  # Seguir automaticamente perfis que quer monitorar
```

2. **⚠️ IMPORTANTE:**
   - Use uma conta **secundária** (não sua conta principal)
   - A conta pode ser bloqueada
   - Não use conta de negócios importante

## 🔍 Método 2: Web Scraping

### Vantagens:
- ✅ Não requer login
- ✅ Funciona com perfis públicos

### Desvantagens:
- ❌ Instável (Instagram muda formato)
- ❌ Fácil de detectar
- ❌ Alto risco de bloqueio

### Configuração:

```env
USE_SCRAPING_FALLBACK=true
INSTAGRAM_FALLBACK_METHOD=scraping
```

## 🎯 Método 3: Envio Manual (Nova Funcionalidade)

Estabelecimentos podem enviar seus próprios posts!

### Como Funciona:

1. **API Endpoint:**
   ```
   POST /manual/submit-post
   ```

2. **Body:**
   ```json
   {
     "profile_id": "uuid-do-perfil",
     "caption": "Texto do post",
     "media_url": "https://...",
     "permalink": "https://instagram.com/p/...",
     "date": "2025-12-12T10:00:00Z"
   }
   ```

3. **Listar Perfis:**
   ```
   GET /manual/profiles
   ```

### Vantagens:
- ✅ 100% legal
- ✅ Estável
- ✅ Sem riscos
- ✅ Estabelecimentos controlam seus dados

### Desvantagens:
- ⚠️ Requer que estabelecimentos enviem manualmente
- ⚠️ Não é automático

## 🔄 Ordem de Tentativas

O sistema tenta nesta ordem:

1. **API Oficial** (sempre primeiro)
2. Se falhar:
   - **Private API** (se `USE_PRIVATE_API_FALLBACK=true`)
   - **Scraping** (se `USE_SCRAPING_FALLBACK=true`)
3. Se todos falharem:
   - Erro retornado

## 📋 Recomendações

### Para Produção:

1. **Priorize API Oficial:**
   - Consegua autorizações dos estabelecimentos
   - Configure OAuth flow

2. **Fallback: Private API:**
   - Use conta secundária
   - Monitore por bloqueios

3. **Último Recurso: Scraping:**
   - Apenas se necessário
   - Monitore constantemente

4. **Envio Manual:**
   - Ofereça aos estabelecimentos
   - Crie interface web para facilitar

## 🛠️ Testar Métodos

### Testar Private API:

```bash
# Certifique-se de ter configurado no .env:
# INSTAGRAM_USERNAME=...
# INSTAGRAM_PASSWORD=...
# USE_PRIVATE_API_FALLBACK=true

npm start
# Tente sincronizar um perfil
```

### Testar Scraping:

```bash
# No .env:
# USE_SCRAPING_FALLBACK=true
# INSTAGRAM_FALLBACK_METHOD=scraping

npm start
```

### Testar Envio Manual:

```bash
curl -X POST http://localhost:3000/manual/submit-post \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "uuid-aqui",
    "caption": "Teste de post manual",
    "media_url": "https://example.com/image.jpg"
  }'
```

## ⚠️ Avisos Importantes

1. **Private API:**
   - ⚠️ Use conta secundária
   - ⚠️ Risco de bloqueio
   - ⚠️ Monitore constantemente

2. **Scraping:**
   - ⚠️ Instável
   - ⚠️ Pode parar de funcionar
   - ⚠️ Alto risco de bloqueio

3. **Envio Manual:**
   - ✅ Sem riscos
   - ✅ Recomendado para produção

---

**Qual método você quer usar?** Configure no `.env` e teste! 🚀

