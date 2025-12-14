# 🚀 Guia de Hospedagem Gratuita - Batataistem

Este guia apresenta as melhores opções para hospedar o sistema Batataistem de forma gratuita.

## 📋 Requisitos do Sistema

- **Node.js 18+** (runtime)
- **PostgreSQL** (já usando Supabase - gratuito)
- **Processamento contínuo** (jobs cron)
- **API REST** (Express)
- **Arquivos estáticos** (frontend)

---

## 🏆 Melhores Opções (Recomendadas)

### 1. **Render.com** ⭐ RECOMENDADO

**Por que escolher:**
- ✅ Plano gratuito generoso
- ✅ Suporta Node.js nativamente
- ✅ Deploy automático via GitHub
- ✅ SSL gratuito
- ✅ Suporta variáveis de ambiente
- ✅ Jobs cron (scheduled jobs)
- ✅ Sem dormência (com algumas limitações)

**Limitações do plano gratuito:**
- ⚠️ Aplicação "dorme" após 15 minutos de inatividade (primeira requisição pode demorar ~30s)
- ⚠️ 750 horas/mês de processamento (suficiente para 24/7)
- ⚠️ 512MB RAM

**Como fazer deploy:**
1. Crie conta em [render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Selecione "New Web Service"
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** `Node`
5. Adicione variáveis de ambiente do `.env`
6. Para jobs cron, crie um "Scheduled Job" separado

**Custo:** Gratuito (com limitações)

---

### 2. **Railway.app** ⭐ ALTERNATIVA EXCELENTE

**Por que escolher:**
- ✅ Muito fácil de usar
- ✅ Deploy via GitHub
- ✅ $5 de crédito grátis/mês (suficiente para apps pequenos)
- ✅ SSL automático
- ✅ Suporta PostgreSQL (mas você já usa Supabase)
- ✅ Sem dormência no plano pago (gratuito tem limitações)

**Limitações:**
- ⚠️ Crédito limitado (mas $5/mês é generoso)
- ⚠️ Após crédito, pode parar

**Como fazer deploy:**
1. Crie conta em [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Selecione seu repositório
4. Railway detecta Node.js automaticamente
5. Adicione variáveis de ambiente
6. Para cron jobs, use "Cron Job" service

**Custo:** $5 crédito grátis/mês (geralmente suficiente)

---

### 3. **Fly.io** ⭐ PARA APPS MAIS COMPLEXOS

**Por que escolher:**
- ✅ Muito flexível
- ✅ Suporta Docker
- ✅ Regiões globais
- ✅ SSL gratuito
- ✅ 3 VMs grátis compartilhadas

**Limitações:**
- ⚠️ Configuração mais complexa
- ⚠️ Requer Dockerfile (opcional)

**Como fazer deploy:**
1. Crie conta em [fly.io](https://fly.io)
2. Instale CLI: `npm install -g @fly/cli`
3. Execute: `fly launch`
4. Configure variáveis de ambiente

**Custo:** Gratuito (3 VMs compartilhadas)

---

### 4. **Cyclic.sh** ⭐ SIMPLES E RÁPIDO

**Por que escolher:**
- ✅ Deploy super rápido
- ✅ Sem configuração complexa
- ✅ Deploy via GitHub
- ✅ SSL automático

**Limitações:**
- ⚠️ Aplicação dorme após inatividade
- ⚠️ Primeira requisição pode demorar

**Como fazer deploy:**
1. Crie conta em [cyclic.sh](https://cyclic.sh)
2. Conecte GitHub
3. Selecione repositório
4. Adicione variáveis de ambiente

**Custo:** Gratuito

---

### 5. **Vercel** (Apenas Frontend) + **Backend Separado**

**Por que escolher:**
- ✅ Excelente para frontend estático
- ✅ CDN global
- ✅ Deploy instantâneo
- ⚠️ **Limitação:** Não suporta processos longos (cron jobs)

**Solução híbrida:**
- Frontend no Vercel (gratuito)
- Backend em Render/Railway (gratuito)
- API REST no backend

**Custo:** Gratuito para ambos

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente

Todas as plataformas permitem configurar variáveis de ambiente. Você precisará adicionar:

```env
# Server
PORT=3000
NODE_ENV=production

# Database (Supabase)
SUPABASE_URL=sua_url
SUPABASE_SERVICE_ROLE_KEY=sua_chave

# Instagram
INSTAGRAM_ACCESS_TOKEN=seu_token
INSTAGRAM_APP_ID=seu_app_id
INSTAGRAM_APP_SECRET=seu_secret

# Gemini
GEMINI_API_KEY=sua_chave

# Apify (opcional)
APIFY_API_TOKEN=seu_token

# Cron
CRON_SCHEDULE=0 * * * *
```

### Arquivo de Configuração para Deploy

Crie um arquivo `render.yaml` (para Render) ou `railway.json` (para Railway) para facilitar o deploy:

**render.yaml:**
```yaml
services:
  - type: web
    name: batataistem
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

---

## 📝 Passo a Passo: Deploy no Render (Recomendado)

### 1. Preparar o Repositório

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Preparar para deploy"
git push origin main
```

### 2. Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Clique em "Get Started for Free"
3. Conecte com GitHub

### 3. Criar Web Service

1. Clique em "New +" → "Web Service"
2. Conecte seu repositório
3. Configure:
   - **Name:** `batataistem`
   - **Region:** `Oregon (US West)` (mais próximo do Brasil)
   - **Branch:** `main`
   - **Root Directory:** `.` (raiz)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

### 4. Configurar Variáveis de Ambiente

Na seção "Environment", adicione todas as variáveis do seu `.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INSTAGRAM_ACCESS_TOKEN`
- `GEMINI_API_KEY`
- etc.

### 5. Configurar Cron Job (Opcional)

Para jobs cron, crie um "Scheduled Job":
1. "New +" → "Cron Job"
2. Configure:
   - **Name:** `batataistem-sync`
   - **Schedule:** `0 * * * *` (a cada hora)
   - **Command:** `node src/jobs/syncProfiles.js`
   - **Environment:** Mesmas variáveis do web service

### 6. Deploy

1. Clique em "Create Web Service"
2. Aguarde o build (5-10 minutos na primeira vez)
3. Acesse a URL fornecida (ex: `https://batataistem.onrender.com`)

---

## 🎯 Recomendação Final

**Para começar:** Use **Render.com**
- Mais fácil de configurar
- Plano gratuito generoso
- Suporta tudo que você precisa
- Documentação excelente

**Se precisar de mais recursos:** Use **Railway.app**
- $5 crédito grátis/mês
- Mais flexível
- Melhor performance

---

## ⚠️ Limitações Importantes

### Aplicações que "Dormem"

Algumas plataformas gratuitas colocam a aplicação em "sleep" após inatividade:
- **Render:** Dorme após 15 min (primeira requisição demora ~30s)
- **Cyclic:** Dorme após inatividade
- **Railway:** No plano gratuito pode ter limitações

**Soluções:**
1. Use um serviço de "ping" gratuito (ex: [UptimeRobot](https://uptimerobot.com)) para manter ativo
2. Configure para fazer requisição a cada 10-14 minutos
3. Ou aceite o delay na primeira requisição

### Jobs Cron

Para jobs cron, você tem duas opções:
1. **Scheduled Jobs** (Render, Railway) - melhor opção
2. **API externa** (ex: [cron-job.org](https://cron-job.org)) que chama sua API

---

## 🔒 Segurança

**Importante:**
- ✅ Nunca commite o arquivo `.env` no Git
- ✅ Use variáveis de ambiente da plataforma
- ✅ Adicione `.env` ao `.gitignore`
- ✅ Use HTTPS sempre (SSL gratuito nas plataformas)

---

## 📊 Comparação Rápida

| Plataforma | Facilidade | Performance | Cron Jobs | Custo |
|------------|------------|-------------|-----------|-------|
| **Render** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Sim | Grátis |
| **Railway** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Sim | $5 crédito |
| **Fly.io** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Sim | Grátis |
| **Cyclic** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⚠️ Limitado | Grátis |
| **Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ Não | Grátis |

---

## 🚀 Próximos Passos

1. Escolha uma plataforma (recomendo Render)
2. Siga o passo a passo acima
3. Configure variáveis de ambiente
4. Faça o deploy
5. Teste a aplicação
6. Configure cron jobs se necessário

**Dúvidas?** Consulte a documentação oficial de cada plataforma ou abra uma issue no repositório.

