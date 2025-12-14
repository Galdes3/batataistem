/**
 * Serviço de OCR (Optical Character Recognition) usando Tesseract.js
 * Extrai texto de imagens para melhorar a detecção de informações de eventos
 */

import Tesseract from 'tesseract.js';
import axios from 'axios';

/**
 * Extrai texto de uma imagem usando OCR
 * @param {string} imageUrl - URL da imagem
 * @returns {Promise<string>} Texto extraído da imagem
 */
export async function extractTextFromImage(imageUrl) {
  try {
    if (!imageUrl) {
      console.log('⚠️  URL da imagem não fornecida para OCR');
      return '';
    }

    console.log(`📸 Iniciando OCR na imagem: ${imageUrl.substring(0, 50)}...`);

    // Baixa a imagem
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000 // 10 segundos de timeout
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // Executa OCR com Tesseract.js
    // Usa 'por' (português) como idioma principal
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'por', {
      logger: (m) => {
        // Log apenas progresso importante
        if (m.status === 'recognizing text') {
          console.log(`   OCR: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const extractedText = text.trim();

    if (extractedText.length > 0) {
      console.log(`✅ OCR extraiu ${extractedText.length} caracteres da imagem`);
      console.log(`   Texto extraído: ${extractedText.substring(0, 100)}...`);
    } else {
      console.log('⚠️  OCR não encontrou texto na imagem');
    }

    return extractedText;
  } catch (error) {
    console.error('❌ Erro ao extrair texto da imagem:', error.message);
    // Não lança erro, apenas retorna string vazia para não quebrar o fluxo
    return '';
  }
}

/**
 * Extrai texto de múltiplas imagens (para posts com carrossel)
 * @param {Array<string>} imageUrls - Array de URLs das imagens
 * @returns {Promise<string>} Texto extraído de todas as imagens combinado
 */
export async function extractTextFromImages(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return '';
  }

  try {
    // Extrai texto de todas as imagens em paralelo (limitado a 3 para não sobrecarregar)
    const limitedUrls = imageUrls.slice(0, 3);
    const texts = await Promise.all(
      limitedUrls.map(url => extractTextFromImage(url))
    );

    // Combina todos os textos, removendo duplicatas
    const combinedText = texts
      .filter(text => text && text.trim().length > 0)
      .join('\n\n')
      .trim();

    return combinedText;
  } catch (error) {
    console.error('Erro ao extrair texto de múltiplas imagens:', error.message);
    return '';
  }
}



