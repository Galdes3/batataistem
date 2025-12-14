# 🔧 Resolver Erro: "Can't reach database server"

O erro mudou! Agora o `.env` está sendo lido, mas não consegue conectar ao Supabase.

## ✅ Diagnóstico

**Erro anterior:** `Environment variable not found: DATABASE_URL` ❌  
**Erro atual:** `Can't reach database server` ⚠️

Isso significa:
- ✅ O `.env` está sendo lido corretamente
- ✅ A `DATABASE_URL` está configurada
- ❌ Mas não consegue conectar ao banco Supabase

## 🔍 Soluções

### Solução 1: Verificar se o Projeto Supabase está Ativo

**Projetos gratuitos do Supabase podem pausar após inatividade!**

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login
3. Verifique se seu projeto aparece na lista
4. Se estiver **pausado** (aparece como "Paused" ou "Pausado"):
   - Clique no projeto
   - Clique em **"Restore"** ou **"Restaurar"**
   - Aguarde alguns minutos para o projeto voltar

### Solução 2: Verificar a Senha do Banco

1. No Supabase, vá em **Settings** → **Database**
2. Role até **Database password**
3. Se não lembrar a senha:
   - Clique em **"Reset database password"**
   - Defina uma nova senha
   - **Atualize o `.env`** com a nova senha
   - Reinicie o servidor

### Solução 3: Verificar a Connection String

1. No Supabase, vá em **Settings** → **Database**
2. Na seção **Connection string**, selecione a aba **URI**
3. Copie a string novamente
4. Verifique se está igual no `.env`

**Formato correto:**
```
postgresql://postgres:SENHA@db.PROJETO_ID.supabase.co:5432/postgres
```

### Solução 4: Testar Conexão Diretamente

Você pode testar a conexão usando o Prisma:

```bash
npx prisma db pull
```

Se funcionar, a conexão está OK. Se não, o problema é de conectividade.

### Solução 5: Verificar Firewall/Rede

- Certifique-se de que não há firewall bloqueando a conexão
- Tente de outra rede (ex: celular como hotspot)
- Verifique se o antivírus não está bloqueando

### Solução 6: Usar Connection Pooling (Alternativa)

O Supabase oferece Connection Pooling na porta **6543**:

1. No Supabase, vá em **Settings** → **Database**
2. Na seção **Connection string**, selecione **Connection pooling**
3. Copie a URL (porta 6543)
4. Atualize o `.env`:

```env
DATABASE_URL=postgresql://postgres.xxxxx:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Nota:** A URL de pooling é diferente da URL direta.

## 🔄 Passos para Resolver

1. **Verificar projeto Supabase:**
   - [ ] Projeto está ativo (não pausado)?
   - [ ] Consigo acessar o painel do projeto?

2. **Verificar credenciais:**
   - [ ] Senha do banco está correta?
   - [ ] Connection string está correta?

3. **Testar conexão:**
   ```bash
   npx prisma db pull
   ```

4. **Se não funcionar:**
   - Resetar senha do banco no Supabase
   - Atualizar `.env` com nova senha
   - Reiniciar servidor

5. **Alternativa:**
   - Usar Connection Pooling (porta 6543)

## 📝 Exemplo de .env Correto

```env
# URL Direta (porta 5432)
DATABASE_URL=postgresql://postgres:teste1234@db.mbjudnbjnbfqellasksu.supabase.co:5432/postgres

# OU URL com Pooling (porta 6543) - mais estável
# DATABASE_URL=postgresql://postgres.mbjudnbjnbfqellasksu:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## ⚠️ Problemas Comuns

### "Projeto pausado"
- **Causa:** Projetos gratuitos pausam após 7 dias de inatividade
- **Solução:** Restaurar o projeto no painel do Supabase

### "Password authentication failed"
- **Causa:** Senha incorreta no `.env`
- **Solução:** Resetar senha e atualizar `.env`

### "Connection timeout"
- **Causa:** Firewall ou rede bloqueando
- **Solução:** Verificar firewall/antivírus ou usar outra rede

## 🆘 Ainda Não Funciona?

1. Verifique os logs do Supabase no painel
2. Tente criar um novo projeto Supabase (se necessário)
3. Use Connection Pooling em vez de conexão direta

---

**Dica:** Connection Pooling (porta 6543) é mais estável e recomendado para produção! 🚀

