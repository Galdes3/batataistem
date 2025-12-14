# Adicionar Campo Featured (Destaque)

Este guia explica como adicionar o campo `featured` na tabela `events` para permitir marcar eventos em destaque fixo.

## Passo a Passo

1. **Acesse o Supabase SQL Editor:**
   - Vá para o seu projeto no Supabase
   - Clique em "SQL Editor" no menu lateral
   - Clique em "New Query"

2. **Execute o SQL:**
   - Copie e cole o conteúdo do arquivo `prisma/add_featured_field.sql`
   - Clique em "Run" ou pressione `Ctrl+Enter`

3. **Verifique se funcionou:**
   - O campo `featured` deve aparecer na tabela `events`
   - Todos os eventos existentes terão `featured = false` por padrão

## O que o campo faz?

- **`featured = true`**: Evento aparece em destaque fixo na seção "Eventos em Foco"
- **`featured = false`**: Evento aparece normalmente (pode aparecer em "Eventos em Foco" se for um dos últimos cadastrados)

## Como usar

1. **Como Administrador:**
   - Abra os detalhes de um evento
   - Clique no botão "⭐ Marcar como Destaque" (visível apenas para admins)
   - O evento será marcado como destaque e aparecerá fixo na seção "Eventos em Foco"

2. **Lógica de Exibição:**
   - Primeiro, mostra todos os eventos com `featured = true` (ordenados por data de criação, mais recentes primeiro)
   - Depois, completa com os últimos eventos cadastrados (até 4 eventos no total)

## SQL para Executar

```sql
-- Adicionar campo featured (destaque) na tabela events
ALTER TABLE "events" 
ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS "events_featured_idx" ON "events"("featured");

-- Comentário na coluna
COMMENT ON COLUMN "events"."featured" IS 'Indica se o evento está em destaque fixo';
```

