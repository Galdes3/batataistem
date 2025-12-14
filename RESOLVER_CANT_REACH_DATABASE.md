# 🔧 Resolver: "Can't reach database server"

O erro indica que o sistema não consegue alcançar o servidor do Supabase na porta 5432.

## 🔍 Diagnóstico dos Logs

Pelos logs, vemos:
- ✅ DATABASE_URL está configurado
- ✅ Informações da conexão estão corretas
- ❌ Não consegue alcançar o servidor na porta 5432

## ✅ Soluções (em ordem de probabilidade)

### Solução 1: Verificar se o Projeto está Ativo (MAIS PROVÁVEL)

**Projetos gratuitos do Supabase pausam automaticamente após inatividade!**

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login
3. Procure seu projeto na lista
4. **Se aparecer "Paused" ou "Pausado":**
   - Clique no projeto
   - Clique em **"Restore"** ou **"Restaurar"**
   - Aguarde 1-2 minutos para o projeto voltar
   - Tente conectar novamente

### Solução 2: Usar Connection Pooling (RECOMENDADO)

A conexão direta (porta 5432) pode estar bloqueada. Use Connection Pooling (porta 6543):

1. **No Supabase:**
   - Vá em **Settings** → **Database**
   - Role até **Connection string**
   - Selecione a aba **"Connection pooling"** (não "URI")
   - Copie a URL (ela usa porta 6543)

2. **Formato da URL de Pooling:**
   ```
   postgresql://postgres.mbjudnbjnbfqellasksu:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
   
   **Diferenças:**
   - Usa `postgres.PROJETO_ID` em vez de `postgres`
   - Host é `aws-0-sa-east-1.pooler.supabase.com` (não `db.PROJETO_ID.supabase.co`)
   - Porta é `6543` (não `5432`)

3. **Atualize o `.env`:**
   ```env
   DATABASE_URL=postgresql://postgres.mbjudnbjnbfqellasksu:!1V]lujd96f0@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```

4. **Reinicie o servidor e teste:**
   ```bash
   npm run test-db
   ```

### Solução 3: Verificar Firewall/Antivírus

1. **Firewall do Windows:**
   - Verifique se não está bloqueando conexões de saída na porta 5432
   - Tente desabilitar temporariamente para testar

2. **Antivírus:**
   - Alguns antivírus bloqueiam conexões de banco de dados
   - Adicione exceção para Node.js ou desabilite temporariamente

3. **Rede Corporativa:**
   - Se estiver em rede corporativa, pode haver bloqueio
   - Tente de outra rede (ex: celular como hotspot)

### Solução 4: Testar Conexão Manual

Teste se consegue alcançar o servidor:

**Windows PowerShell:**
```powershell
Test-NetConnection -ComputerName db.mbjudnbjnbfqellasksu.supabase.co -Port 5432
```

**Ou use telnet:**
```powershell
telnet db.mbjudnbjnbfqellasksu.supabase.co 5432
```

Se não conseguir conectar, o problema é de rede/firewall.

### Solução 5: Verificar Status do Supabase

1. Acesse [https://status.supabase.com](https://status.supabase.com)
2. Verifique se há problemas conhecidos
3. Verifique se a região do seu projeto está operacional

## 🎯 Passo a Passo Recomendado

1. **Primeiro:** Verifique se o projeto está ativo no Supabase
2. **Segundo:** Tente usar Connection Pooling (porta 6543)
3. **Terceiro:** Verifique firewall/antivírus
4. **Quarto:** Teste de outra rede

## 📝 Como Obter URL de Connection Pooling

1. No Supabase Dashboard → Seu Projeto
2. **Settings** (⚙️) → **Database**
3. Role até **"Connection string"**
4. Selecione **"Connection pooling"** (não "URI")
5. Copie a URL completa
6. Cole no `.env` substituindo `DATABASE_URL`

**Exemplo de URL de Pooling:**
```
postgresql://postgres.mbjudnbjnbfqellasksu:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Substitua `[YOUR-PASSWORD]` pela senha do banco.**

## 🔄 Após Mudar para Pooling

1. Atualize o `.env` com a URL de pooling
2. Reinicie o servidor:
   ```bash
   npm start
   ```
3. Teste novamente:
   ```bash
   npm run test-db
   ```

## ⚠️ Diferenças entre Conexão Direta e Pooling

| Aspecto | Conexão Direta (5432) | Connection Pooling (6543) |
|---------|----------------------|---------------------------|
| Porta | 5432 | 6543 |
| Host | `db.PROJETO_ID.supabase.co` | `aws-0-REGIAO.pooler.supabase.com` |
| Usuário | `postgres` | `postgres.PROJETO_ID` |
| Estabilidade | Pode ser bloqueada | Mais estável |
| Recomendação | Desenvolvimento | Produção |

## 🆘 Ainda Não Funciona?

Se nenhuma solução funcionar:

1. Crie um novo projeto no Supabase
2. Copie a nova Connection String
3. Atualize o `.env`
4. Execute as migrações novamente

---

**Dica:** Connection Pooling é mais confiável e recomendado para produção! 🚀

