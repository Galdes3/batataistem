# 🔧 Resolver Erro: "Environment variable not found: DATABASE_URL"

## ✅ Solução Rápida

### 1. Verificar se o arquivo .env existe e está correto

O arquivo `.env` deve estar na **raiz do projeto** (mesmo nível que `package.json`).

### 2. Verificar o conteúdo do .env

Abra o arquivo `.env` e certifique-se de que tem esta linha:

```env
DATABASE_URL=postgresql://postgres:teste1234@db.mbjudnbjnbfqellasksu.supabase.co:5432/postgres
```

**IMPORTANTE:**
- Não deve ter espaços antes ou depois do `=`
- Não deve ter aspas extras (a menos que necessário)
- A senha deve estar correta

### 3. Verificar se o .env está sendo lido

Execute este comando para verificar:

```bash
npm run check-env
```

Isso mostrará se o `.env` está sendo carregado corretamente.

### 4. **REINICIAR O SERVIDOR** (MUITO IMPORTANTE!)

Após criar ou editar o `.env`, você **DEVE** reiniciar o servidor:

1. **Pare o servidor:**
   - No terminal onde o servidor está rodando
   - Pressione `Ctrl+C`

2. **Reinicie o servidor:**
   ```bash
   npm start
   ```

### 5. Verificar se funcionou

Acesse: `http://localhost:3000/health`

Deve retornar: `{"status":"ok","message":"Sistema de eventos Batatais-SP está funcionando"}`

## 🔍 Troubleshooting

### Problema: "Ainda mostra o erro após reiniciar"

**Solução 1:** Verificar se o arquivo está salvo
- Certifique-se de salvar o arquivo `.env` no editor
- Verifique se o arquivo realmente existe na raiz do projeto

**Solução 2:** Verificar encoding do arquivo
- O arquivo deve estar em **UTF-8**
- No Notepad++, vá em **Codificação** → **Codificar em UTF-8**

**Solução 3:** Verificar se há espaços ou caracteres especiais
- Remova espaços antes/depois do `=`
- Remova aspas desnecessárias

**Solução 4:** Verificar caminho do arquivo
- O `.env` deve estar em: `C:\Users\Usuário\Desktop\Projetos\batataistem\.env`
- Não deve estar em subpastas

### Problema: "O servidor não inicia"

Execute o verificador:
```bash
npm run check-env
```

Isso mostrará exatamente qual variável está faltando.

## 📝 Exemplo de .env Correto

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:teste1234@db.mbjudnbjnbfqellasksu.supabase.co:5432/postgres
INSTAGRAM_ACCESS_TOKEN=EAAWFnxeVYzUBQOxGW9kTZBC7TcSPHC8m8f8XuakU4r4eZAE7UwSeLdYUbOOS5075FTw6CbyBeYo8J29dp0ZBJZB70jYV91PCxYxlHrCEzY4dIJiW0hI080I9ULaxdxR2Rgf3vXn8tmRRb9Yc4QbW5SWehqQGuRAOxd5sXYbRF9yJXYP19T5jXchpf5eeF2YFZAkQrUinJS6RZBW0sJg8fKGgpG0ASxO0sarSbdL605NgzyIYPBtb408EuqZAPxQgcVee2dfP92xAZAUZD
INSTAGRAM_APP_ID=1554293225513781
INSTAGRAM_APP_SECRET=85584f1a10d45b5a8ee412119102807b
GEMINI_API_KEY=AIzaSyAQ8HtAXw4rxbiBVLk9pJ106Y05MN8E2po
CRON_SCHEDULE="0 * * * *"
```

## ✅ Checklist

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `DATABASE_URL` está configurado no `.env`
- [ ] Não há espaços antes/depois do `=`
- [ ] Arquivo está salvo
- [ ] Servidor foi **REINICIADO** após criar/editar o `.env`
- [ ] Executei `npm run check-env` e mostrou que DATABASE_URL está configurado

---

**Lembre-se:** Sempre reinicie o servidor após modificar o `.env`! 🔄

