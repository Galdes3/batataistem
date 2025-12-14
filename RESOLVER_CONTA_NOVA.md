# 🔧 Resolver: Conta Nova do Instagram

## 🔍 Problema Identificado

Contas novas do Instagram podem ter restrições:
- ⚠️ Limitações de ações (seguir, comentar, etc.)
- ⚠️ Período de "quarentena" (alguns dias)
- ⚠️ Pode precisar seguir antes de acessar posts
- ⚠️ Verificações de segurança mais frequentes

## ✅ Solução Implementada

O sistema agora **segue automaticamente** os perfis que você quer monitorar!

### Como Funciona:

1. Quando tentar buscar posts de um perfil
2. Sistema verifica se está seguindo
3. Se não estiver, **segue automaticamente**
4. Depois busca os posts

## ⚙️ Configuração

No arquivo `.env`:

```env
INSTAGRAM_AUTO_FOLLOW=true  # Seguir automaticamente (recomendado)
```

Ou desative se não quiser seguir:

```env
INSTAGRAM_AUTO_FOLLOW=false  # Não seguir automaticamente
```

## 📋 O que Fazer com Conta Nova

### 1. Aguardar Período de Quarentena

Contas novas podem ter restrições por alguns dias:
- ⏳ Aguarde 2-7 dias após criar a conta
- ⏳ Use a conta normalmente (curtir, comentar, seguir)
- ⏳ Evite ações muito rápidas

### 2. Usar a Conta Normalmente

Antes de usar no sistema:
- ✅ Faça login algumas vezes no app/web
- ✅ Siga alguns perfis manualmente
- ✅ Curta algumas fotos
- ✅ Comente em alguns posts
- ✅ Isso "aquenta" a conta

### 3. Verificar Segurança

Se aparecer verificação de segurança:
1. Acesse Instagram no navegador
2. Complete a verificação
3. Depois tente novamente no sistema

### 4. Seguir Perfis Manualmente

Você pode seguir os perfis manualmente antes:
1. Acesse Instagram
2. Siga os perfis que quer monitorar
3. Depois use o sistema

## 🔄 Alternativas

### Opção 1: Usar Conta Antiga

Se você tem uma conta Instagram antiga:
- Use essa conta no sistema
- Contas antigas têm menos restrições
- Mais confiável

### Opção 2: Aguardar

- Aguarde alguns dias
- Use a conta normalmente
- Depois tente novamente

### Opção 3: Usar API Oficial

- Foque em conseguir autorizações
- Use API oficial (mais estável)
- Não precisa seguir perfis

## ⚠️ Limitações de Contas Novas

### Restrições Comuns:

1. **Limite de Seguir:**
   - Contas novas: ~50-100 por dia
   - Contas antigas: ~200-300 por dia

2. **Limite de Ações:**
   - Curtidas, comentários, etc.
   - Mais restritivo em contas novas

3. **Verificações:**
   - Instagram pode pedir verificação
   - Mais frequente em contas novas

## 🎯 Recomendações

### Para Conta Nova:

1. **Aguarde alguns dias** antes de usar no sistema
2. **Use a conta normalmente** (app/web)
3. **Siga perfis manualmente** primeiro
4. **Ative AUTO_FOLLOW** no sistema
5. **Monitore por erros** de verificação

### Para Conta Antiga:

1. **Use diretamente** no sistema
2. **AUTO_FOLLOW** funciona melhor
3. **Menos restrições**

## 📝 Logs Úteis

O sistema mostra quando segue:

```
📌 Não está seguindo @deck_sportbar, seguindo agora...
✅ Agora está seguindo @deck_sportbar
```

Ou se já está seguindo:

```
✅ Já está seguindo @deck_sportbar
```

## 🆘 Se Ainda Não Funcionar

1. **Verifique se a conta está ativa:**
   - Faça login no Instagram
   - Veja se há notificações de segurança

2. **Complete verificações:**
   - Instagram pode pedir verificação
   - Complete no navegador

3. **Aguarde mais tempo:**
   - Contas muito novas podem precisar de mais tempo
   - Tente novamente em alguns dias

4. **Use conta antiga:**
   - Se possível, use uma conta mais antiga
   - Menos restrições

---

**Resumo:** Contas novas têm restrições. Aguarde alguns dias e use a conta normalmente antes de usar no sistema! 🎯

