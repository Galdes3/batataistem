-- Script para adicionar campo status na tabela events
-- Execute este SQL no Supabase SQL Editor

-- Verificar se o campo já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'status'
    ) THEN
        -- Adicionar campo status
        ALTER TABLE "events" 
        ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
        
        -- Criar índice para melhor performance
        CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status");
        
        -- Atualizar eventos existentes para 'approved' (já publicados)
        UPDATE "events" SET "status" = 'approved' WHERE "status" = 'pending';
        
        RAISE NOTICE 'Campo status adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo status já existe na tabela.';
    END IF;
END $$;

-- Verificar resultado
SELECT 
    status,
    COUNT(*) as total
FROM events
GROUP BY status
ORDER BY status;

