# 📦 Sistema de Cache Inteligente

## 🎯 O que é

Sistema que **reutiliza posts já salvos** quando novas buscas falham.

## ✅ Vantagens

- ✅ **Funciona mesmo quando APIs falham**
- ✅ **Reduz requisições** (menos bloqueios)
- ✅ **Mais rápido** (dados já estão no banco)
- ✅ **Backup automático** de posts

## 🔄 Como Funciona

### Fluxo Normal:

1. **Tenta buscar posts novos** (API oficial → Private API → Scraping)
2. **Se conseguir:** Salva novos posts
3. **Se falhar:** Usa posts do cache (últimos 7 dias)

### Exemplo:

```
1. Tenta API oficial → ❌ Falha
2. Tenta Private API → ❌ Falha  
3. Tenta Scraping → ❌ Falha
4. ✅ Usa cache (posts já salvos anteriormente)
```

## ⚙️ Configuração

O cache é **automático** e **sempre ativo**. Não precisa configurar nada!

### Parâmetros (no código):

- **Idade máxima:** 7 dias (padrão)
- **Limite:** 25 posts (padrão)

## 📊 Quando o Cache é Usado

O cache é usado quando:
- ✅ Todas as APIs falham
- ✅ Token expirado
- ✅ Perfil privado
- ✅ Instagram bloqueou
- ✅ Erro de rede

## 🎯 Benefícios para Seu Caso

### Com Conta Nova:

1. **Primeira sincronização:** Busca posts novos
2. **Salva no banco**
3. **Próximas sincronizações:** Se falhar, usa cache
4. **Sempre tem dados** para mostrar

### Para Produção:

1. **Reduz dependência** de APIs instáveis
2. **Melhor experiência** do usuário
3. **Dados sempre disponíveis**

## 📝 Logs

O sistema mostra quando usa cache:

```
⚠️  Falha ao buscar posts novos: Erro...
📦 Tentando usar cache como fallback...
✅ Usando 15 post(s) do cache
ℹ️  Usando posts do cache (não foram criados novos eventos)
```

## 🔧 Personalizar

Se quiser mudar a idade máxima do cache, edite:

```javascript
// Em src/jobs/syncProfiles.js
posts = await getCachedPosts(profile.id, 25, 7); // 7 = dias
```

## 💡 Dicas

1. **Primeira vez:** Faça uma sincronização manual quando tudo estiver funcionando
2. **Isso preenche o cache** com posts reais
3. **Depois:** Mesmo se APIs falharem, cache terá dados

---

**Resumo:** Sistema inteligente que sempre tenta buscar novos posts, mas se falhar, usa dados já salvos! 🎯

