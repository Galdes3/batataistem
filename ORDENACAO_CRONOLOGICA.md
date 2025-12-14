# 📅 Ordenação Cronológica por Data de Publicação do Instagram

## 🎯 Problema Resolvido

As postagens estavam sendo exibidas na ordem em que foram sincronizadas (campo `created_at`), não na ordem cronológica real em que foram publicadas no Instagram.

## ✅ Solução Implementada

Foi adicionado um novo campo `published_at` na tabela `events` para armazenar a **data de publicação real do Instagram**, e todas as ordenações foram atualizadas para usar esse campo.

## 🗄️ Passo 1: Executar Migração SQL

**IMPORTANTE:** Execute este SQL no Supabase SQL Editor antes de usar o sistema:

```sql
-- Adicionar campo published_at na tabela events para armazenar data de publicação do Instagram
ALTER TABLE "events" 
ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3);

-- Criar índice para melhor performance na ordenação
CREATE INDEX IF NOT EXISTS "events_published_at_idx" ON "events"("published_at");

-- Atualizar eventos existentes: usar created_at como published_at se não tiver
-- (para eventos já criados, a data de publicação será aproximada pela data de criação)
UPDATE "events" 
SET "published_at" = "created_at" 
WHERE "published_at" IS NULL;
```

## 🔧 Mudanças no Código

### 1. **eventService.js**
- ✅ `createEventFromPost()` agora salva `published_at` com a data de publicação do Instagram (`postData.timestamp` ou `postData.created_time`)
- ✅ `listEvents()` ordena por `published_at` > `date` > `created_at` (nesta ordem de prioridade)

### 2. **cacheService.js**
- ✅ `getCachedPosts()` ordena por `published_at` quando disponível
- ✅ Retorna `published_at` no campo `timestamp` dos posts do cache

### 3. **app.js (Frontend)**
- ✅ Eventos em destaque ordenados por `published_at`
- ✅ Últimos eventos ordenados por `published_at`

## 📊 Ordem de Prioridade na Ordenação

Quando o campo `published_at` não estiver disponível, o sistema usa esta ordem de fallback:

1. **`published_at`** - Data de publicação no Instagram (preferencial)
2. **`date`** - Data do evento extraída pelo Gemini
3. **`created_at`** - Data de criação no sistema (último recurso)

## 🎯 Resultado

Agora as postagens são exibidas na **ordem cronológica real** em que foram publicadas no Instagram, independentemente de quando foram sincronizadas pelo sistema.

## 📝 Notas

- Eventos criados **antes** desta atualização terão `published_at = created_at` (aproximação)
- Eventos criados **depois** desta atualização terão a data real de publicação do Instagram
- A ordenação funciona tanto para novos eventos quanto para eventos do cache



