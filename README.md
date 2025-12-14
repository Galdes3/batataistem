# 🎉 Batataistem - Sistema de Monitoramento de Eventos

Sistema automatizado para monitorar perfis do Instagram em Batatais-SP e transformar posts em eventos organizados usando inteligência artificial.

## 📋 Funcionalidades

- ✅ Monitoramento automático de perfis do Instagram
- ✅ Extração automática de posts (imagens, vídeos, legendas)
- ✅ Transformação de legendas usando Google Gemini AI
- ✅ Criação automática de eventos a partir dos posts
- ✅ CRUD manual de eventos
- ✅ Jobs automáticos com node-cron
- ✅ API REST completa

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **Supabase (PostgreSQL)** - Banco de dados em nuvem
- **Instagram Graph API** - Integração com Instagram
- **Google Gemini AI** - Processamento de texto com IA
- **node-cron** - Agendamento de tarefas

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com) (banco de dados)
- Conta no Facebook Developers (para Instagram Graph API)
- Chave de API do Google Gemini

### Passo a passo

1. **Clone o repositório** (ou crie o projeto)

```bash
cd batataistem
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha com suas credenciais:

```env
# Server
PORT=3000
NODE_ENV=development

# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_APP_ID=seu_app_id_aqui
INSTAGRAM_APP_SECRET=seu_app_secret_aqui

# Google Gemini API
GEMINI_API_KEY=sua_chave_gemini_aqui

# Database (Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Cron Job (formato cron)
CRON_SCHEDULE="0 * * * *"  # A cada hora
```

4. **Configure o banco de dados Supabase**

   a. Crie uma conta no [Supabase](https://supabase.com)
   
   b. Crie um novo projeto
   
   c. Vá em **Settings** → **Database** e copie a **Connection String**
   
   d. Cole a URL no arquivo `.env` na variável `DATABASE_URL`
   
   Exemplo de URL do Supabase:
   ```
   postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres
   ```
   
   e. Gere o cliente Prisma e execute as migrações:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Inicie o servidor**

```bash
npm start
```

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

**Interface Web:**
Acesse `http://localhost:3000` no navegador para usar a interface visual do sistema.

## 🔑 Como obter as credenciais

### Instagram Graph API

📖 **Guia completo**: Veja [GUIA_INSTAGRAM_API.md](./GUIA_INSTAGRAM_API.md) para instruções detalhadas passo a passo.

🔄 **Alternativas**: Consulte [ALTERNATIVAS_INSTAGRAM_API.md](./ALTERNATIVAS_INSTAGRAM_API.md) para conhecer outras opções de APIs.

**Resumo rápido:**
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um novo app
3. Adicione o produto "Instagram Graph API"
4. Em **Configurações** → **Básico**, copie o **App ID** e **App Secret**
5. Gere um **Access Token** em **Ferramentas** → **Explorador da API Graph**
6. Para cada perfil que deseja monitorar, você precisará do `instagram_id` (não é o username)

**Como obter o instagram_id:**
- Use a API: `GET https://graph.instagram.com/me?fields=id,username&access_token=SEU_TOKEN`
- Ou consulte o guia completo para mais métodos

### Google Gemini API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Copie a chave para o `.env`

### Supabase (Banco de Dados)

📖 **Guia completo**: Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para instruções detalhadas.

**Resumo rápido:**
1. Acesse [Supabase](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings** → **Database**
4. Copie a **Connection String** (aba "URI")
5. Substitua `[YOUR-PASSWORD]` pela senha do seu banco de dados
6. Cole a URL completa no `.env` na variável `DATABASE_URL`

**Formato da URL:**
```
postgresql://postgres:[SENHA]@db.[PROJETO-ID].supabase.co:5432/postgres
```

## 📡 Endpoints da API

### Perfis

- `POST /profiles` - Cadastra um perfil para monitoramento
  ```json
  {
    "username": "perfil_exemplo",
    "instagram_id": "123456789",
    "url": "https://instagram.com/perfil_exemplo"
  }
  ```

- `GET /profiles` - Lista todos os perfis cadastrados
- `GET /profiles/:id` - Busca um perfil específico
- `DELETE /profiles/:id` - Deleta um perfil

### Eventos

- `POST /events/manual` - Cria um evento manualmente
  ```json
  {
    "title": "Festa de Aniversário",
    "description": "Descrição do evento",
    "date": "2024-12-31T20:00:00",
    "location": "Local do evento",
    "media_url": "https://exemplo.com/imagem.jpg",
    "source_url": "https://instagram.com/p/abc123"
  }
  ```

- `GET /events` - Lista eventos (com paginação)
  - Query params: `page`, `limit`, `type`, `profileId`
- `GET /events/:id` - Busca um evento específico
- `PUT /events/:id` - Atualiza um evento
- `DELETE /events/:id` - Deleta um evento

### Instagram

- `POST /instagram/sync` - Força sincronização manual de todos os perfis
- `GET /instagram/test` - Testa conexão com Instagram API

### Health Check

- `GET /health` - Verifica status do servidor

## ⏰ Jobs Automáticos

O sistema possui um job cron que roda automaticamente para sincronizar os perfis cadastrados. Por padrão, executa **a cada hora**.

O schedule pode ser configurado no `.env` através da variável `CRON_SCHEDULE` usando formato cron:

- `0 * * * *` - A cada hora
- `0 */6 * * *` - A cada 6 horas
- `0 0 * * *` - Uma vez por dia (meia-noite)
- `*/30 * * * *` - A cada 30 minutos

## 🗄️ Estrutura do Banco de Dados

### Tabela: Profile
- `id` (UUID)
- `username` (String, único)
- `instagram_id` (String, único)
- `url` (String)
- `created_at` (DateTime)

### Tabela: Event
- `id` (UUID)
- `profile_id` (UUID, nullable - null para eventos manuais)
- `title` (String)
- `description` (String)
- `original_caption` (Text, nullable)
- `date` (DateTime, nullable)
- `location` (String, nullable)
- `media_url` (String, nullable)
- `source_url` (String, nullable)
- `type` (String: "auto" ou "manual")
- `created_at` (DateTime)

## 🔄 Fluxo de Funcionamento

1. **Cadastro de Perfis**: Você cadastra manualmente os perfis do Instagram que deseja monitorar
2. **Monitoramento Automático**: O job cron busca novos posts periodicamente
3. **Processamento com IA**: Cada legenda é enviada para o Gemini que extrai informações estruturadas
4. **Criação de Eventos**: Eventos são criados automaticamente no banco de dados
5. **API REST**: Você pode consultar, editar ou criar eventos manualmente via API

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor
- `npm run dev` - Inicia com auto-reload (watch mode)
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa migrações do banco
- `npm run prisma:studio` - Abre Prisma Studio (interface visual do banco)

## 📝 Exemplo de Uso

### 1. Cadastrar um perfil

```bash
curl -X POST http://localhost:3000/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "username": "balada_batatais",
    "instagram_id": "123456789",
    "url": "https://instagram.com/balada_batatais"
  }'
```

### 2. Forçar sincronização

```bash
curl -X POST http://localhost:3000/instagram/sync
```

### 3. Listar eventos

```bash
curl http://localhost:3000/events
```

## ⚠️ Observações Importantes

- O Instagram Graph API requer tokens válidos e permissões adequadas
- Cada perfil precisa ter o `instagram_id` correto (não apenas o username)
- A API do Gemini tem limites de uso (verifique seu plano)
- O sistema evita duplicatas verificando o `source_url` antes de criar eventos

## 🐛 Troubleshooting

### Erro ao conectar com Instagram
- Verifique se o `INSTAGRAM_ACCESS_TOKEN` está válido
- Confirme que o token tem as permissões necessárias
- Teste a conexão com `GET /instagram/test`

### Erro ao processar com Gemini
- Verifique se a `GEMINI_API_KEY` está correta
- Confirme que há créditos disponíveis na conta
- O sistema retorna valores padrão em caso de erro

### Erro ao conectar com Supabase
- Verifique se a `DATABASE_URL` está correta e completa
- Confirme que substituiu `[YOUR-PASSWORD]` pela senha real
- Teste a conexão no painel do Supabase
- Execute `npm run prisma:migrate` para criar as tabelas
- Verifique se o projeto do Supabase está ativo

## 📄 Licença

ISC

## 👨‍💻 Desenvolvimento

Para contribuir ou reportar problemas, verifique a estrutura do projeto:

```
batataistem/
├── src/
│   ├── routes/       # Rotas da API
│   ├── services/     # Lógica de negócio
│   └── jobs/         # Jobs e tarefas agendadas
├── prisma/
│   └── schema.prisma # Schema do banco de dados
├── server.js         # Ponto de entrada
└── package.json
```

---

Desenvolvido para monitorar eventos em Batatais-SP 🎊

