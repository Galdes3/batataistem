# 🗑️ Implementação: Soft Delete para Eventos

## 📋 O que foi implementado

Sistema para evitar que eventos excluídos sejam recriados na próxima sincronização do Instagram.

### Como funciona:

1. **Ao excluir um evento**: O sistema salva o `source_url` e `profile_id` em uma tabela `deleted_events`
2. **Na sincronização**: Antes de criar um novo evento, verifica se o `source_url` está na lista de excluídos
3. **Se estiver excluído**: O post é ignorado e não cria um novo evento

## 🗄️ Passo 1: Criar tabela no banco de dados

Execute o SQL abaixo no **Supabase SQL Editor**:

```sql
-- Criar tabela deleted_events
CREATE TABLE IF NOT EXISTS "deleted_events" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "source_url" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deleted_events_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar índice único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS "deleted_events_source_url_profile_id_idx" 
ON "deleted_events"("source_url", "profile_id");

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "deleted_events_source_url_idx" ON "deleted_events"("source_url");
CREATE INDEX IF NOT EXISTS "deleted_events_profile_id_idx" ON "deleted_events"("profile_id");
CREATE INDEX IF NOT EXISTS "deleted_events_deleted_at_idx" ON "deleted_events"("deleted_at");

-- Comentário na tabela
COMMENT ON TABLE "deleted_events" IS 'Rastreia eventos excluídos para evitar recriação na sincronização';
```

**Ou execute o arquivo:** `prisma/create_deleted_events_table.sql`

## ✅ Funcionalidades implementadas

### 1. **Função `deleteEvent` atualizada**
- Ao excluir um evento, salva automaticamente o `source_url` e `profile_id` na tabela `deleted_events`
- Se o evento não tiver `source_url` (evento manual), apenas deleta normalmente

### 2. **Função `createEventFromPost` atualizada**
- Antes de criar um novo evento, verifica se o `source_url` está na lista de excluídos
- Se estiver, ignora o post e não cria o evento
- Log: `⚠️  Post excluído anteriormente, ignorando: [URL]`

## 🔄 Como usar

1. **Execute o SQL** no Supabase para criar a tabela
2. **Exclua um evento** normalmente pelo sistema
3. **Na próxima sincronização**, o evento não será recriado automaticamente

## 📊 Consultas úteis

### Ver eventos excluídos:
```sql
SELECT 
    de.*,
    p.username,
    p.instagram_id
FROM deleted_events de
LEFT JOIN profiles p ON de.profile_id = p.id
ORDER BY de.deleted_at DESC;
```

### Remover um evento da lista de excluídos (permitir recriação):
```sql
DELETE FROM deleted_events 
WHERE source_url = 'URL_DO_POST' 
AND profile_id = 'ID_DO_PERFIL';
```

### Limpar eventos excluídos antigos (mais de 1 ano):
```sql
DELETE FROM deleted_events 
WHERE deleted_at < NOW() - INTERVAL '1 year';
```

## ⚠️ Observações

- Eventos manuais (sem `source_url`) não são salvos na lista de excluídos
- A exclusão é permanente - o evento é deletado da tabela `events`
- Apenas o `source_url` é rastreado para evitar recriação na sincronização
- Se você quiser permitir que um evento excluído seja recriado, remova o registro da tabela `deleted_events`




