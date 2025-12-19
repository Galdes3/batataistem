# 📦 Configurar Supabase Storage para Imagens

Este guia mostra como configurar o Supabase Storage para armazenar imagens dos eventos.

## 🎯 Por que usar Supabase Storage?

- ✅ **Funciona em produção** (Render.com, GitHub, etc.)
- ✅ **URLs públicas** que não expiram
- ✅ **CDN global** para carregamento rápido
- ✅ **Gratuito** até 1GB de armazenamento
- ✅ **Integrado** com seu projeto Supabase

## 📋 Passo a Passo

### 1. Acessar o Supabase Dashboard

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login
3. Selecione seu projeto

### 2. Criar o Bucket

1. No menu lateral, clique em **Storage** (ícone de pasta)
2. Clique em **New bucket** (ou "Novo bucket")
3. Preencha:
   - **Name**: `event-images` (exatamente este nome)
   - **Public bucket**: ✅ **Marque como público** (importante!)
4. Clique em **Create bucket**

### 3. Configurar Políticas (Opcional)

O sistema já usa `service_role` key, então as políticas não são necessárias. Mas se quiser configurar:

1. Vá em **Storage** → **Policies**
2. Selecione o bucket `event-images`
3. Adicione uma política para permitir leitura pública:
   - **Policy name**: `Public read access`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: `true` (permite tudo)

## ✅ Verificar Configuração

Após criar o bucket, teste fazendo uma sincronização:

```bash
npm start
```

Ou execute manualmente:

```bash
node -e "import('./src/jobs/syncProfiles.js').then(m => m.syncAllProfiles())"
```

Você deve ver nos logs:
- `📦 Criando bucket event-images no Supabase Storage...` (se for a primeira vez)
- `✅ Bucket event-images criado com sucesso`
- `📥 Baixando imagem para Supabase Storage: ...`
- `✅ Imagem salva no Supabase Storage: ...`

## 🔍 Verificar Imagens no Supabase

1. Vá em **Storage** → **event-images**
2. Você verá pastas com IDs de eventos
3. Dentro de cada pasta, há a imagem do evento

## 📝 URLs das Imagens

As imagens serão armazenadas com URLs públicas no formato:
```
https://[seu-projeto].supabase.co/storage/v1/object/public/event-images/[event-id]/[event-id].jpg
```

Essas URLs são:
- ✅ **Públicas** (não precisam de autenticação)
- ✅ **Permanentes** (não expiram)
- ✅ **Acessíveis de qualquer lugar** (CORS configurado)

## ⚠️ Troubleshooting

### Erro: "Bucket não está disponível"

**Solução**: Crie o bucket manualmente no Supabase Dashboard:
1. Storage → New bucket
2. Nome: `event-images`
3. Public: ✅ true

### Erro: "403 Forbidden" ao acessar imagem

**Solução**: Verifique se o bucket está marcado como **público**:
1. Storage → event-images
2. Settings → Public bucket: ✅ true

### Imagens não aparecem

**Solução**: 
1. Verifique se o bucket foi criado
2. Verifique se as imagens foram baixadas (veja os logs)
3. Verifique se a URL no banco de dados está correta

## 💡 Dicas

- O bucket é criado automaticamente na primeira sincronização (se tiver permissões)
- Se não tiver permissões, crie manualmente seguindo o passo 2
- O sistema tenta baixar imagens, mas se falhar, usa a URL original do Instagram
- Imagens antigas podem não aparecer até fazer uma nova sincronização

