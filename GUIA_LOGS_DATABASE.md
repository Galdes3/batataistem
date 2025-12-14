# 📊 Guia de Logs para Diagnóstico de Conexão com Banco

Sistema de logs detalhado foi implementado para ajudar a diagnosticar problemas de conexão com o Supabase.

## 🔍 Como Usar os Logs

### 1. Teste de Conexão Standalone

Execute este comando para testar a conexão isoladamente:

```bash
npm run test-db
```

Este script vai:
- ✅ Verificar se o `.env` está sendo lido
- ✅ Mostrar informações detalhadas da conexão (sem mostrar senha completa)
- ✅ Tentar conectar ao banco
- ✅ Executar queries de teste
- ✅ Verificar se as tabelas existem
- ✅ Contar registros nas tabelas
- ✅ Mostrar sugestões específicas baseadas no erro

### 2. Logs no Servidor

Quando você iniciar o servidor com `npm start`, você verá:

```
🔍 === DIAGNÓSTICO DE CONEXÃO COM BANCO ===
✅ DATABASE_URL encontrado
📊 Informações da conexão:
   - Host: db.mbjudnbjnbfqellasksu.supabase.co
   - Porta: 5432
   - Database: postgres
   - Usuário: postgres
   - Senha: ******** (X caracteres)
==========================================
```

### 3. Logs de Erros do Prisma

Quando ocorrer um erro de conexão, você verá logs detalhados:

```
❌ === ERRO DO PRISMA ===
Mensagem: Authentication failed...
Código do erro: P1000

💡 Possível causa: Falha na autenticação

Metadados: { ... }
==========================
```

## 📋 O que os Logs Mostram

### Informações da Conexão
- Host do banco
- Porta
- Nome do banco
- Usuário
- Tamanho da senha (sem mostrar a senha)

### Avisos Automáticos
- Se a URL não está no formato correto
- Se a senha tem espaços (pode precisar de aspas)
- Se a senha tem caracteres especiais que podem causar problemas

### Erros Detalhados
- Mensagem completa do erro
- Código do erro Prisma
- Metadados adicionais
- Sugestões baseadas no tipo de erro

## 🎯 Interpretando os Erros

### Erro P1000: "Authentication failed"
**Causa:** Senha incorreta ou usuário inválido

**Solução:**
1. Resetar senha no Supabase
2. Atualizar `.env` com nova senha
3. Verificar se não há espaços extras

### Erro P1001: "Can't reach database server"
**Causa:** Não consegue conectar ao servidor

**Solução:**
1. Verificar se projeto Supabase está ativo (não pausado)
2. Verificar conexão com internet
3. Tentar usar Connection Pooling

### Erro: "does not exist"
**Causa:** Tabelas não foram criadas

**Solução:**
1. Executar `npm run prisma:migrate`
2. Ou criar tabelas manualmente no Supabase

## 🚀 Próximos Passos

1. **Execute o teste:**
   ```bash
   npm run test-db
   ```

2. **Copie os logs completos** que aparecerem

3. **Analise as sugestões** que o script mostrar

4. **Se ainda não funcionar**, compartilhe os logs para análise detalhada

## 📝 Exemplo de Saída Esperada

```
🧪 === TESTE DE CONEXÃO COM BANCO DE DADOS ===

🔍 === DIAGNÓSTICO DE CONEXÃO COM BANCO ===
✅ DATABASE_URL encontrado
📊 Informações da conexão:
   - Host: db.mbjudnbjnbfqellasksu.supabase.co
   - Porta: 5432
   - Database: postgres
   - Usuário: postgres
   - Senha: ******** (12 caracteres)
==========================================

🔄 Tentando conectar ao banco...

Teste 1: Verificando conexão...
✅ Conexão estabelecida com sucesso!

Teste 2: Executando query de teste...
✅ Query executada: [ { test: 1 } ]

Teste 3: Verificando tabelas...
📊 Tabelas encontradas: [ { table_name: 'profiles' }, { table_name: 'events' } ]

Teste 4: Contando registros...
   - Profiles: 0
   - Events: 0

✅ === TODOS OS TESTES PASSARAM ===
🎉 Conexão com o banco está funcionando corretamente!

🔌 Conexão fechada.
```

## ⚠️ Se o Teste Falhar

O script mostrará sugestões específicas baseadas no erro. Siga as sugestões e tente novamente.

---

**Dica:** Execute `npm run test-db` sempre que tiver problemas de conexão para obter diagnóstico detalhado! 🔍

