-- Adicionar campo published_at na tabela events para armazenar data de publicação do Instagram
-- Execute este script no SQL Editor do Supabase

ALTER TABLE "events" 
ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3);

-- Criar índice para melhor performance na ordenação
CREATE INDEX IF NOT EXISTS "events_published_at_idx" ON "events"("published_at");

-- Atualizar eventos existentes: usar created_at como published_at se não tiver
-- (para eventos já criados, a data de publicação será aproximada pela data de criação)
UPDATE "events" 
SET "published_at" = "created_at" 
WHERE "published_at" IS NULL;



