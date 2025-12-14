# 🗄️ Configuração do Supabase

Este guia mostra como configurar o Supabase como banco de dados para o projeto.

## Passo a Passo

### 1. Criar conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **Start your project** ou **Sign in**
3. Faça login com GitHub, Google ou email

### 2. Criar um novo projeto

1. Clique em **New Project**
2. Preencha:
   - **Name**: Nome do projeto (ex: `batataistem`)
   - **Database Password**: Escolha uma senha forte (guarde bem!)
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
3. Clique em **Create new project**
4. Aguarde alguns minutos enquanto o projeto é criado

### 3. Obter a Connection String

1. No painel do projeto, vá em **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **Database**
3. Role até a seção **Connection string**
4. Selecione a aba **URI**
5. Copie a string que aparece (formato: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

### 4. Configurar no projeto

1. No arquivo `.env`, cole a Connection String na variável `DATABASE_URL`
2. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você definiu ao criar o projeto

Exemplo:
```env
DATABASE_URL="postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### 5. Criar as tabelas

Você tem duas opções:

#### Opção A: Usando Prisma (Recomendado)

Após configurar a `DATABASE_URL`, execute:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Isso criará as tabelas `profiles` e `events` no seu banco Supabase automaticamente.

#### Opção B: Criar manualmente via SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo `prisma/init.sql`
4. Clique em **Run** (ou pressione `Ctrl+Enter`)
5. As tabelas serão criadas imediatamente

**Nota**: Se usar a opção manual, ainda execute `npm run prisma:generate` para gerar o cliente Prisma.

### 6. Verificar no Supabase

1. No painel do Supabase, vá em **Table Editor**
2. Você deve ver as tabelas `profiles` e `events` criadas
3. Pronto! O banco está configurado

## Dicas

- **Senha do banco**: Se você esqueceu a senha, pode resetá-la em **Settings** → **Database** → **Reset database password**
- **Connection Pooling**: Para produção, considere usar a Connection Pooling do Supabase (porta 6543) em vez da conexão direta
- **Backup**: O Supabase faz backups automáticos, mas você pode criar backups manuais em **Settings** → **Database** → **Backups**
- **Projetos Pausados**: Projetos gratuitos podem pausar após inatividade. Se não conseguir conectar, verifique se o projeto está ativo no painel

## 🔧 Problemas de Conexão?

Se você receber erro "Can't reach database server", consulte [RESOLVER_ERRO_CONEXAO_SUPABASE.md](./RESOLVER_ERRO_CONEXAO_SUPABASE.md) para soluções detalhadas.

## Troubleshooting

### Erro: "password authentication failed"
- Verifique se substituiu `[YOUR-PASSWORD]` pela senha real
- Tente resetar a senha do banco no painel do Supabase

### Erro: "connection timeout"
- Verifique se o projeto do Supabase está ativo (não pausado)
- Projetos gratuitos podem pausar após inatividade

### Erro ao executar migrações
- Certifique-se de que a `DATABASE_URL` está entre aspas no `.env`
- Verifique se não há espaços extras na URL
- Confirme que o projeto está ativo no Supabase

