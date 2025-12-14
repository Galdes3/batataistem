# ✅ Configuração Final - Próximos Passos

Como você já criou as tabelas manualmente no Supabase e configurou o `.env`, siga estes passos:

## 1. Parar o servidor (se estiver rodando)

Pressione `Ctrl+C` no terminal onde o servidor está rodando.

## 2. Gerar o cliente Prisma

```bash
npm run prisma:generate
```

Isso gera o cliente Prisma baseado no seu schema.

## 3. Criar migração inicial do Prisma

Como você já criou as tabelas manualmente, precisamos marcar a migração como aplicada:

```bash
npx prisma migrate dev --name init --create-only
```

Isso cria o arquivo de migração sem executá-la (já que as tabelas existem).

Depois, marque como aplicada:

```bash
npx prisma migrate resolve --applied init
```

**OU**, se preferir uma abordagem mais simples, você pode usar:

```bash
npx prisma db push
```

Isso sincroniza o schema com o banco sem criar arquivos de migração.

## 4. Verificar conexão

Teste se está tudo funcionando:

```bash
npm start
```

Acesse: `http://localhost:3000/health`

Deve retornar: `{"status":"ok","message":"Sistema de eventos Batatais-SP está funcionando"}`

## 5. Testar endpoints

### Listar perfis (deve retornar array vazio inicialmente)
```bash
curl http://localhost:3000/profiles
```

### Criar um perfil de teste
```bash
curl -X POST http://localhost:3000/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "instagram_id": "123456789",
    "url": "https://instagram.com/teste"
  }'
```

## Troubleshooting

### Erro: "EPERM: operation not permitted"
- Pare o servidor completamente
- Feche qualquer IDE ou editor que possa estar usando os arquivos
- Tente novamente

### Erro: "Environment variable not found: DATABASE_URL"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme que a variável `DATABASE_URL` está configurada
- Reinicie o terminal após criar/editar o `.env`

### Erro ao conectar com o banco
- Verifique se a `DATABASE_URL` está correta no `.env`
- Confirme que substituiu `[YOUR-PASSWORD]` e `[PROJETO-ID]` pelos valores reais
- Teste a conexão no painel do Supabase

## Próximos passos após configuração

1. ✅ Configurar credenciais do Instagram Graph API no `.env`
2. ✅ Configurar chave do Google Gemini no `.env`
3. ✅ Cadastrar perfis do Instagram via `POST /profiles`
4. ✅ Testar sincronização manual via `POST /instagram/sync`
5. ✅ O job cron rodará automaticamente a cada hora

---

**Dica**: Use `npm run prisma:studio` para visualizar e gerenciar os dados do banco através de uma interface gráfica!

