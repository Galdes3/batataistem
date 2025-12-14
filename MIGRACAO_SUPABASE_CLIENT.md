# 🔄 Migração para Supabase Client - Guia de Configuração

A migração foi concluída! Agora o sistema usa Supabase Client em vez de Prisma.

## ✅ O que foi alterado

1. ✅ Removido Prisma Client
2. ✅ Adicionado @supabase/supabase-js
3. ✅ Migrados todos os serviços para Supabase Client
4. ✅ Mantida toda a funcionalidade existente

## 🔧 Configuração Necessária

### 1. Instalar Dependências

```bash
npm install
```

Isso instalará `@supabase/supabase-js`.

### 2. Obter Chaves do Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie as seguintes informações:

   - **Project URL** → `SUPABASE_URL`
   - **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ **IMPORTANTE**: Use `service_role` (não `anon`), pois precisamos de permissões administrativas.

### 3. Atualizar arquivo `.env`

Adicione estas linhas ao seu `.env`:

```env
# Supabase (substitua pelos valores reais)
SUPABASE_URL=https://mbjudnbjnbfqellasksu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

**Você pode manter ou remover a linha DATABASE_URL** (não é mais necessária, mas não causa problemas se estiver lá).

### 4. Reiniciar o Servidor

```bash
npm start
```

## 🎯 Vantagens da Migração

- ✅ **Não precisa de conexão direta PostgreSQL** - funciona via HTTPS
- ✅ **Não bloqueado por firewall** - usa porta 443 (HTTPS)
- ✅ **Mais estável** - não depende de conexão TCP direta
- ✅ **Mesma funcionalidade** - todas as rotas continuam funcionando

## 📋 Estrutura Mantida

Todas as rotas e funcionalidades foram mantidas:

- ✅ `POST /profiles` - Criar perfil
- ✅ `GET /profiles` - Listar perfis
- ✅ `GET /profiles/:id` - Buscar perfil
- ✅ `DELETE /profiles/:id` - Deletar perfil
- ✅ `POST /events/manual` - Criar evento manual
- ✅ `GET /events` - Listar eventos
- ✅ `GET /events/:id` - Buscar evento
- ✅ `PUT /events/:id` - Atualizar evento
- ✅ `DELETE /events/:id` - Deletar evento
- ✅ `POST /instagram/sync` - Sincronizar perfis

## 🧪 Testar

1. Inicie o servidor: `npm start`
2. Acesse: `http://localhost:3000`
3. Tente cadastrar um perfil
4. Deve funcionar normalmente!

## ⚠️ Notas Importantes

- **Service Role Key**: Mantenha essa chave secreta! Ela tem acesso total ao banco.
- **RLS (Row Level Security)**: O service_role bypassa RLS, então funciona normalmente.
- **Tabelas**: As tabelas já criadas no Supabase continuam funcionando normalmente.

## 🔍 Troubleshooting

### Erro: "SUPABASE_URL não encontrado"
- Verifique se adicionou `SUPABASE_URL` no `.env`
- Certifique-se de que o arquivo está salvo

### Erro: "SUPABASE_SERVICE_ROLE_KEY não encontrado"
- Verifique se adicionou `SUPABASE_SERVICE_ROLE_KEY` no `.env`
- Certifique-se de copiar a chave **service_role** (não anon)

### Erro ao criar/ler dados
- Verifique se as tabelas `profiles` e `events` existem no Supabase
- Verifique se o projeto está ativo (não pausado)

## 📝 Próximos Passos

1. ✅ Instalar dependências: `npm install`
2. ✅ Configurar `.env` com as chaves do Supabase
3. ✅ Reiniciar servidor: `npm start`
4. ✅ Testar cadastrando um perfil

---

**Pronto!** O sistema agora usa Supabase Client e não depende mais de conexão direta PostgreSQL! 🎉

