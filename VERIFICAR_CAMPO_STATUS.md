# 🔍 Verificar Campo Status na Tabela Events

## ⚠️ Problema

Se os eventos pendentes não estão carregando, pode ser que o campo `status` não exista na tabela `events` do banco de dados.

## ✅ Solução

Execute este SQL no Supabase SQL Editor para verificar e adicionar o campo se necessário:

```sql
-- Verificar se o campo existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'status';

-- Se não existir, adicionar o campo
ALTER TABLE "events" 
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status");

-- Atualizar eventos existentes para 'approved' (já publicados)
UPDATE "events" SET "status" = 'approved' WHERE "status" = 'pending';
```

## 🧪 Testar

Após executar o SQL:

1. Recarregue a página (Ctrl+F5)
2. Faça login como admin (ícone ⚙️)
3. Clique em "Eventos Pendentes"
4. Deve carregar os eventos pendentes

## 📊 Verificar Eventos Pendentes

Para ver quantos eventos estão pendentes:

```sql
SELECT 
    status,
    COUNT(*) as total
FROM events
GROUP BY status;
```

