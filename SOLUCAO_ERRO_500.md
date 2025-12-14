# 🔧 Solução: Erro 500 ao Carregar Eventos Pendentes

## 🔴 Problema

O erro 500 ocorre porque o campo `status` **não existe** na tabela `events` do banco de dados.

## ✅ Solução Rápida

### Passo 1: Execute o SQL no Supabase

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute este SQL:

```sql
-- Adicionar campo status se não existir
ALTER TABLE "events" 
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status");

-- Atualizar eventos existentes para 'approved' (já publicados)
UPDATE "events" SET "status" = 'approved' WHERE "status" = 'pending';
```

### Passo 2: Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C) e reinicie
npm start
```

### Passo 3: Teste Novamente

1. Recarregue a página (Ctrl+F5)
2. Faça login como admin (ícone ⚙️)
3. Clique em "Eventos Pendentes"
4. Deve funcionar agora! ✅

## 🔍 Verificar se Funcionou

Execute este SQL para verificar:

```sql
-- Verificar se o campo existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'status';

-- Ver quantos eventos estão em cada status
SELECT 
    status,
    COUNT(*) as total
FROM events
GROUP BY status;
```

## 📝 Nota

O código agora trata o caso de o campo não existir (retorna array vazio), mas **é necessário adicionar o campo no banco** para o sistema funcionar corretamente.

Após executar o SQL, o erro 500 será resolvido! 🎉

