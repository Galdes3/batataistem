# 🔍 Eventos Cadastrados Não Aparecem no Sistema

## 📋 Problema Identificado

Os novos eventos foram criados, mas estão com status `pending` (pendente de aprovação) e o sistema só exibe eventos com status `approved` (aprovados).

## ✅ Solução Rápida

### Opção 1: Aprovar Eventos Pendentes (Recomendado)

1. **Acesse a área administrativa:**
   - Clique no ícone ⚙️ no header
   - Faça login: `admin` / `admin123`

2. **Acesse "Eventos Pendentes":**
   - No menu admin, clique em "⏳ Eventos Pendentes"
   - Você verá todos os eventos aguardando aprovação

3. **Aprove os eventos:**
   - Clique em "✅ Aprovar" em cada evento
   - Ou use "✏️ Editar Data" para corrigir a data e aprovar automaticamente

### Opção 2: Aprovar Todos Automaticamente (via SQL)

Execute este SQL no Supabase para aprovar todos os eventos pendentes:

```sql
UPDATE events 
SET status = 'approved' 
WHERE status = 'pending';
```

### Opção 3: Ajustar Configuração (Para Aprovar Automaticamente)

Se você quiser que eventos sejam aprovados automaticamente mesmo sem data, podemos ajustar o código. Mas isso não é recomendado, pois eventos sem data podem confundir os usuários.

## 🔍 Por que isso acontece?

O sistema marca eventos como `pending` quando:

1. **Não detecta data na legenda** - O Gemini não conseguiu extrair uma data válida
2. **Data está no passado** - A data detectada é anterior a hoje
3. **Data inválida** - A data extraída não faz sentido

Isso é uma **proteção** para garantir que apenas eventos com informações corretas sejam exibidos publicamente.

## 📊 Verificar Status dos Eventos

Para ver quantos eventos estão pendentes:

1. Acesse Admin → Eventos Pendentes
2. Ou execute no SQL Editor do Supabase:

```sql
SELECT 
    status,
    COUNT(*) as total
FROM events
GROUP BY status;
```

## 🎯 Recomendação

**Mantenha o sistema de aprovação**, mas revise os eventos pendentes regularmente:

1. Se a data estiver correta → Aprove
2. Se a data estiver errada → Edite e aprove
3. Se não houver data → Adicione manualmente e aprove

Isso garante qualidade dos eventos exibidos no sistema.

