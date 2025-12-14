# PWA e Notificações Push - Implementado ✅

## 📱 O que foi implementado

### 1. **PWA (Progressive Web App)**
- ✅ Manifest.json configurado com metadados do app
- ✅ Service Worker para cache offline e funcionalidades PWA
- ✅ Ícones e configurações para instalação no dispositivo
- ✅ Estratégia de cache: Network First com fallback para cache

### 2. **Notificações Push**
- ✅ Service Worker configurado para receber notificações
- ✅ Sistema de subscriptions (inscrições) de usuários
- ✅ Integração com web-push para envio de notificações
- ✅ Envio automático de notificações quando novos eventos são criados
- ✅ Interface para usuários ativarem notificações

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
1. **`public/manifest.json`** - Configuração do PWA
2. **`public/service-worker.js`** - Service Worker para cache e notificações
3. **`src/services/notificationService.js`** - Serviço de gerenciamento de notificações
4. **`src/routes/notifications.js`** - Rotas da API para notificações
5. **`prisma/create_push_subscriptions_table.sql`** - SQL para criar tabela de subscriptions

### Arquivos Modificados:
1. **`public/index.html`** - Adicionado link para manifest e botão de notificações
2. **`public/app.js`** - Registro do service worker e lógica de notificações
3. **`server.js`** - Adicionada rota `/notifications`
4. **`src/services/eventService.js`** - Integração para enviar notificações ao criar eventos

## 🔧 Configuração Necessária

### 1. **Criar Tabela no Banco de Dados**

Execute o SQL em `prisma/create_push_subscriptions_table.sql` no SQL Editor do Supabase:

```sql
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "subscription" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "push_subscriptions_created_at_idx" ON "push_subscriptions"("created_at");
```

### 2. **Gerar e Configurar VAPID Keys**

As VAPID keys são necessárias para notificações push. Você pode gerá-las de duas formas:

#### Opção A: Deixar o sistema gerar (desenvolvimento)
O sistema gerará automaticamente na primeira execução e mostrará no console. Use essas keys no `.env`.

#### Opção B: Gerar manualmente
```bash
npx web-push generate-vapid-keys
```

Adicione as keys no arquivo `.env`:

```env
VAPID_PUBLIC_KEY=sua_public_key_aqui
VAPID_PRIVATE_KEY=sua_private_key_aqui
```

**⚠️ IMPORTANTE:** Use as mesmas keys em produção e desenvolvimento para que as subscriptions funcionem.

### 3. **Criar Ícones do PWA**

Você precisa criar dois ícones e colocá-los na pasta `public/`:

- **`icon-192.png`** - 192x192 pixels
- **`icon-512.png`** - 512x512 pixels

Você pode usar ferramentas online como:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Ou criar manualmente com um editor de imagens.

## 🚀 Como Funciona

### PWA (Instalação)
1. Usuário acessa o site
2. Service Worker é registrado automaticamente
3. Navegador pode sugerir instalação do app
4. App funciona offline (com cache)

### Notificações Push
1. Usuário clica em "🔔 Ativar Notificações"
2. Navegador solicita permissão
3. Se concedida, subscription é salva no banco
4. Quando novo evento é criado, notificação é enviada para todos os usuários inscritos
5. Usuário recebe notificação mesmo com o app fechado

## 📡 Endpoints da API

### `GET /notifications/vapid-public-key`
Retorna a chave pública VAPID para o frontend.

**Resposta:**
```json
{
  "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa40HI..."
}
```

### `POST /notifications/subscribe`
Salva subscription de um usuário.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### `POST /notifications/test`
Envia notificação de teste para todos os usuários inscritos.

## 🎯 Funcionalidades

### ✅ Cache Offline
- Arquivos estáticos são cacheados
- App funciona parcialmente offline
- Estratégia: Network First (tenta rede, depois cache)

### ✅ Notificações Automáticas
- Quando um novo evento é criado e aprovado, notificação é enviada automaticamente
- Notificação inclui título do evento e link para ver detalhes

### ✅ Gerenciamento de Subscriptions
- Subscriptions inválidas são removidas automaticamente
- Sistema trata erros de forma não bloqueante

## 🔍 Testando

### Testar PWA:
1. Abra o site no Chrome/Edge
2. Verifique se o Service Worker está registrado (DevTools > Application > Service Workers)
3. Teste instalação: ícone de instalação deve aparecer na barra de endereço

### Testar Notificações:
1. Clique em "🔔 Ativar Notificações"
2. Conceda permissão
3. Envie notificação de teste via API:
   ```bash
   curl -X POST http://localhost:3000/notifications/test
   ```
4. Ou crie um novo evento e veja a notificação automática

## 📝 Próximos Passos (Opcional)

- [ ] Adicionar notificações para eventos próximos (24h antes)
- [ ] Criar página de configurações de notificações
- [ ] Adicionar categorias de notificações (novos eventos, eventos próximos, etc.)
- [ ] Melhorar tratamento de erros e retry logic
- [ ] Adicionar analytics de notificações

## ⚠️ Observações

1. **HTTPS Obrigatório:** Notificações push só funcionam em HTTPS (ou localhost)
2. **VAPID Keys:** Use as mesmas keys em todos os ambientes
3. **Ícones:** Não esqueça de criar os ícones do PWA
4. **Tabela:** Execute o SQL para criar a tabela de subscriptions

## 🐛 Troubleshooting

### Service Worker não registra:
- Verifique se está em HTTPS ou localhost
- Verifique console do navegador para erros

### Notificações não chegam:
- Verifique se VAPID keys estão configuradas
- Verifique se tabela `push_subscriptions` existe
- Verifique logs do servidor para erros
- Teste com endpoint `/notifications/test`

### Permissão negada:
- Usuário precisa ativar manualmente nas configurações do navegador
- Chrome: Configurações > Privacidade > Notificações

---

**Status:** ✅ Implementado e pronto para uso (após configurar VAPID keys e criar ícones)



