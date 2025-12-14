-- Adicionar campo status na tabela events
-- Execute este script no SQL Editor do Supabase

ALTER TABLE "events" 
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';

-- Status possíveis: 'pending' (pendente), 'approved' (aprovado), 'rejected' (rejeitado)

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status");

-- Atualizar eventos existentes para 'approved' (já publicados)
UPDATE "events" SET "status" = 'approved' WHERE "status" = 'pending';

