-- Criar tabela para armazenar subscriptions de notificações push
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "subscription" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS "push_subscriptions_created_at_idx" ON "push_subscriptions"("created_at");

-- Comentário na tabela
COMMENT ON TABLE "push_subscriptions" IS 'Subscriptions de usuários para receber notificações push';

