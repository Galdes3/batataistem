-- SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase se preferir criar manualmente
-- Ou use: npm run prisma:migrate (recomendado)

-- Habilitar extensão UUID (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "username" TEXT NOT NULL UNIQUE,
    "instagram_id" TEXT NOT NULL UNIQUE,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS "events" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "profile_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "original_caption" TEXT,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "media_url" TEXT,
    "source_url" TEXT,
    "type" TEXT NOT NULL DEFAULT 'auto',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "events_profile_id_idx" ON "events"("profile_id");
CREATE INDEX IF NOT EXISTS "events_type_idx" ON "events"("type");
CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events"("created_at");
CREATE INDEX IF NOT EXISTS "events_date_idx" ON "events"("date");

-- Comentários nas tabelas (opcional)
COMMENT ON TABLE "profiles" IS 'Perfis do Instagram monitorados pelo sistema';
COMMENT ON TABLE "events" IS 'Eventos extraídos dos posts do Instagram ou criados manualmente';

