-- Criar tabela para rastrear eventos excluídos
-- Execute este script no SQL Editor do Supabase

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

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS "deleted_events_source_url_idx" ON "deleted_events"("source_url");
CREATE INDEX IF NOT EXISTS "deleted_events_profile_id_idx" ON "deleted_events"("profile_id");
CREATE INDEX IF NOT EXISTS "deleted_events_deleted_at_idx" ON "deleted_events"("deleted_at");

-- Comentário na tabela
COMMENT ON TABLE "deleted_events" IS 'Rastreia eventos excluídos para evitar recriação na sincronização';




