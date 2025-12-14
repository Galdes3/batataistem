-- Adicionar campo featured (destaque) na tabela events
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE "events" 
ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS "events_featured_idx" ON "events"("featured");

-- Comentário na coluna
COMMENT ON COLUMN "events"."featured" IS 'Indica se o evento está em destaque fixo';

