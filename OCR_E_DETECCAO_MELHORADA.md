# 📸 OCR e Detecção Melhorada de Eventos

## 🎯 O que foi implementado

Sistema de OCR (Optical Character Recognition) usando **Tesseract.js** para extrair texto das imagens dos posts do Instagram e melhorar a detecção de nomes de eventos, datas e locais pela IA do Gemini.

## ✅ Funcionalidades

### 1. **OCR com Tesseract.js**
- Extrai texto de imagens automaticamente
- Suporta português (idioma principal)
- Processa imagens em background sem bloquear o fluxo
- Logs detalhados do progresso

### 2. **Integração com Gemini**
- Texto extraído da imagem é enviado junto com a legenda para o Gemini
- Melhora significativamente a detecção de:
  - **Nome do evento** (quando escrito na imagem)
  - **Data** (quando escrita na imagem)
  - **Local** (quando escrito na imagem)
  - **Preços e informações adicionais**

### 3. **Fallback de Local**
- Quando não houver local detectado, usa o **@username do Instagram** como local
- Exemplo: Se o post for de `@deck_sportbar` e não tiver local, o local será `@deck_sportbar`

## 🔧 Como Funciona

### Fluxo de Processamento:

1. **Post é sincronizado** do Instagram
2. **OCR extrai texto** da imagem (se disponível)
3. **Legenda + Texto da Imagem** são enviados ao Gemini
4. **Gemini analisa** ambos os textos para detectar:
   - Nome do evento
   - Data
   - Local
   - Descrição formatada
5. **Se não houver local**, usa `@username` como fallback
6. **Evento é criado** com todas as informações

## 📦 Dependências

- **tesseract.js**: `^5.0.4` (já instalado)

## ⚙️ Configuração

Não é necessária nenhuma configuração adicional. O OCR funciona automaticamente quando há uma imagem disponível.

## 🚀 Uso

O sistema funciona automaticamente durante a sincronização de perfis. Quando um novo post é encontrado:

1. A imagem é processada com OCR
2. O texto extraído é combinado com a legenda
3. Tudo é enviado ao Gemini para análise
4. O evento é criado com informações melhoradas

## 📊 Exemplo

**Antes (sem OCR):**
- Legenda: "Hoje às 22h! 🎉"
- Resultado: Título genérico, sem local

**Depois (com OCR):**
- Legenda: "Hoje às 22h! 🎉"
- Texto da imagem: "FESTA NO DECK SPORT BAR - 10/12/2025 - 22h"
- Resultado: 
  - Título: "Festa no Deck Sport Bar"
  - Data: 10/12/2025 22:00
  - Local: "Deck Sport Bar" (ou "@deck_sportbar" se não detectado)

## ⚠️ Notas Importantes

- **Performance**: OCR pode levar alguns segundos por imagem
- **Precisão**: Depende da qualidade da imagem e do texto
- **Fallback**: Se OCR falhar, o sistema continua normalmente sem o texto da imagem
- **Idioma**: Configurado para português, mas pode detectar outros idiomas

## 🔍 Logs

O sistema mostra logs detalhados:
- `📸 Iniciando OCR na imagem...`
- `✅ OCR extraiu X caracteres da imagem`
- `⚠️  OCR não encontrou texto na imagem`
- `❌ Erro ao extrair texto da imagem`

## 💡 Melhorias Futuras

- Suporte a múltiplas imagens (carrossel)
- Cache de resultados OCR para evitar reprocessamento
- Configuração de idiomas adicionais
- Processamento em paralelo para múltiplas imagens









