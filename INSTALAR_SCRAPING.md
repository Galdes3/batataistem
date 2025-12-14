# 📦 Instalar Dependências para Web Scraping

## 🚀 Instalação Rápida

```bash
npm install
```

Isso instalará automaticamente:
- `puppeteer` - Para fazer scraping do Instagram

## ⚙️ O que Foi Implementado

### 1. Sistema de Fallback Automático

O sistema agora:
1. **Tenta API oficial primeiro** (`graph.instagram.com`)
2. **Se falhar**, usa scraping automaticamente
3. **Mostra avisos** quando usa scraping

### 2. Rate Limiting

- Máximo de **10 requisições por minuto**
- Evita sobrecarga e detecção
- Aguarda automaticamente entre requisições

### 3. Proteções

- User-Agent real (simula navegador)
- Delays entre requisições
- Tratamento de erros

## 📝 Configuração

No arquivo `.env`, você pode controlar o scraping:

```env
# Ativar/desativar scraping como fallback
USE_SCRAPING_FALLBACK=true  # true = ativado (padrão), false = desativado
```

## 🧪 Testar

Após instalar, teste a sincronização:

```bash
npm start
```

Depois, acesse a interface web e clique em "Sincronizar".

## ⚠️ Avisos Importantes

1. **Leia `AVISO_SCRAPING.md`** antes de usar
2. **Scraping viola ToS do Instagram**
3. **Use por sua conta e risco**
4. **Priorize conseguir autorizações para API oficial**

## 🔧 Requisitos do Sistema

- Node.js 18+
- Espaço em disco para Chromium (puppeteer baixa ~200MB)

## 🐛 Problemas Comuns

### Puppeteer não instala

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro "Chromium not found"

```bash
# Forçar download do Chromium
npx puppeteer browsers install chrome
```

### Erro de permissão (Linux)

```bash
# Instalar dependências do Chromium
sudo apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libxss1 \
  libasound2
```

## 📚 Arquivos Criados

- `src/services/instagramScraper.js` - Serviço de scraping
- `AVISO_SCRAPING.md` - Avisos e riscos
- `INSTALAR_SCRAPING.md` - Este guia

---

**Próximo passo:** Instale as dependências com `npm install` e teste! 🚀

