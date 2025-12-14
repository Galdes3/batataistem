# ⚠️ AVISO IMPORTANTE: Web Scraping do Instagram

## 🚨 Aviso Legal

O sistema agora inclui funcionalidade de **web scraping** como fallback quando a API oficial não funciona.

**IMPORTANTE:**
- ⚠️ **Web scraping viola os Termos de Serviço do Instagram**
- ⚠️ Você pode ter sua conta bloqueada
- ⚠️ Você pode ter seu IP bloqueado
- ⚠️ Pode haver consequências legais
- ⚠️ O código pode parar de funcionar a qualquer momento

## 📋 Como Funciona

O sistema tenta usar a **API oficial primeiro**. Se falhar, usa scraping como fallback.

### Fluxo:

1. **Tenta API oficial** (`graph.instagram.com`)
2. **Se falhar** (token inválido, sem permissões, etc.)
3. **Usa scraping** automaticamente (se `USE_SCRAPING_FALLBACK=true`)

## ⚙️ Configuração

No arquivo `.env`:

```env
# Ativar/desativar scraping como fallback
USE_SCRAPING_FALLBACK=true  # true para ativar, false para desativar
```

**Por padrão:** Scraping está **ativado** como fallback.

## 🛡️ Proteções Implementadas

1. **Rate Limiting:**
   - Máximo de 10 requisições por minuto
   - Evita sobrecarga e detecção

2. **User-Agent Real:**
   - Simula navegador real
   - Reduz chance de detecção

3. **Delays:**
   - Aguarda entre requisições
   - Evita requisições muito rápidas

## ⚠️ Riscos

### Bloqueios Possíveis:

1. **Bloqueio de IP:**
   - Instagram pode bloquear seu IP
   - Solução: Usar VPN ou proxies

2. **Bloqueio de Conta:**
   - Se usar login, conta pode ser bloqueada
   - Solução: Não usar login (scraping público)

3. **Mudanças no Instagram:**
   - Instagram muda HTML frequentemente
   - Código pode parar de funcionar
   - Solução: Manter código atualizado

## ✅ Recomendações

1. **Use apenas quando necessário:**
   - Priorize conseguir autorizações para API oficial
   - Use scraping apenas como último recurso

2. **Monitore bloqueios:**
   - Verifique logs regularmente
   - Se houver muitos erros, desative scraping

3. **Respeite rate limits:**
   - Não aumente o limite de requisições
   - Mantenha delays entre requisições

4. **Considere alternativas:**
   - Pedir autorização aos donos dos perfis
   - Usar APIs pagas de terceiros
   - Implementar sistema OAuth

## 🔧 Desativar Scraping

Se quiser desativar completamente:

1. No `.env`:
   ```env
   USE_SCRAPING_FALLBACK=false
   ```

2. Reinicie o servidor

3. O sistema só usará API oficial (pode falhar se não tiver permissões)

## 📝 Logs

O sistema mostra avisos quando usa scraping:

```
⚠️  API oficial falhou, tentando scraping como fallback...
⚠️  Usando web scraping (não oficial) para buscar posts
⚠️  Isso pode violar os Termos de Serviço do Instagram
```

## 🆘 Se For Bloqueado

1. **IP Bloqueado:**
   - Use VPN
   - Mude de rede
   - Aguarde algumas horas

2. **Conta Bloqueada:**
   - Entre em contato com suporte do Instagram
   - Explique o uso legítimo (se aplicável)

3. **Código Parou de Funcionar:**
   - Instagram mudou o HTML
   - Atualize o código de scraping
   - Ou use apenas API oficial

---

**Lembre-se:** Este código é fornecido apenas para fins educacionais. Use por sua conta e risco.

