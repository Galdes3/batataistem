# 🎯 Como Gerar Token Específico do Instagram

O token do Facebook não funciona diretamente com `graph.instagram.com`. Você precisa gerar um token **específico do Instagram**.

## ✅ Solução: Usar o Botão "Generate Instagram Access Token"

Vejo que no Graph API Explorer há um botão especial para Instagram!

### Passo 1: Gerar Token do Instagram

1. No **Graph API Explorer**, no painel direito
2. Procure pelo botão **"Generate Instagram Access Token"** (abaixo do campo "Token de Acesso")
3. **Clique nesse botão** (não use o botão genérico "Generate Access Token")

### Passo 2: Autorizar Aplicação

1. Uma janela popup aparecerá pedindo autorização
2. Você precisará autorizar o app a acessar sua conta do Instagram
3. Siga as instruções na tela

### Passo 3: Copiar o Token

1. Após autorizar, um novo token será gerado
2. **Esse token é específico para Instagram**
3. Copie o token completo

### Passo 4: Testar no Explorer

1. No Explorer, certifique-se de que está usando `graph.instagram.com` (não `graph.facebook.com`)
2. Endpoint: `me?fields=id,username`
3. Cole o novo token
4. Clique em "Enviar"
5. Deve retornar seus dados do Instagram

### Passo 5: Atualizar .env

1. Abra o `.env`
2. Substitua `INSTAGRAM_ACCESS_TOKEN` pelo novo token do Instagram
3. Salve e reinicie o servidor

## 🔄 Alternativa: Se Não Aparecer o Botão

Se o botão "Generate Instagram Access Token" não aparecer:

### Método 1: Via Facebook Login

1. No Graph API Explorer, clique em "Generate Access Token"
2. Selecione permissões do Instagram:
   - ✅ `instagram_basic`
   - ✅ `pages_read_engagement`
3. **IMPORTANTE**: Após gerar, você precisa fazer login no Instagram
4. O token gerado será específico para Instagram

### Método 2: Via OAuth Flow Completo

Para produção, você precisaria implementar o fluxo OAuth completo, mas para desenvolvimento/teste, o método acima funciona.

## ⚠️ Diferença Importante

- **Token do Facebook**: Funciona com `graph.facebook.com`
- **Token do Instagram**: Funciona com `graph.instagram.com`
- **São diferentes!** Você precisa do token específico do Instagram

## 📝 Checklist

- [ ] Usei o botão "Generate Instagram Access Token" (não o genérico)
- [ ] Autorizei o app a acessar minha conta do Instagram
- [ ] Testei o token no Explorer com `graph.instagram.com/me`
- [ ] Token funcionou no Explorer
- [ ] Copiei o token completo para o `.env`
- [ ] Reiniciei o servidor
- [ ] Testei com `npm run test-instagram`

---

**Dica:** O botão "Generate Instagram Access Token" gera um token que já está configurado para trabalhar com a API do Instagram! 🎯

