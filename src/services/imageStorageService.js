/**
 * Serviço para baixar e armazenar imagens do Instagram
 * Evita problemas com URLs que expiram ou são bloqueadas
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório para armazenar imagens
const IMAGES_DIR = path.join(__dirname, '../../public/images/cached');
const IMAGES_URL_BASE = '/images/cached';

/**
 * Garante que o diretório de imagens existe
 */
async function ensureImagesDirectory() {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de imagens:', error);
  }
}

/**
 * Baixa uma imagem e salva localmente
 * @param {string} imageUrl - URL da imagem
 * @param {string} eventId - ID do evento (para nomear o arquivo)
 * @returns {Promise<string|null>} URL local da imagem ou null se falhar
 */
export async function downloadAndStoreImage(imageUrl, eventId) {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return null;
  }

  try {
    await ensureImagesDirectory();

    // Extrair extensão da URL
    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname) || '.jpg';
    
    // Nome do arquivo baseado no ID do evento
    const filename = `${eventId}${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);

    // Headers para parecer um navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://www.instagram.com/',
      'Origin': 'https://www.instagram.com',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
    };

    console.log(`📥 Baixando imagem para cache: ${imageUrl.substring(0, 100)}...`);

    // Baixar imagem
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers,
      maxRedirects: 5,
    });

    // Salvar arquivo
    await fs.writeFile(filepath, response.data);
    
    console.log(`✅ Imagem salva localmente: ${filename}`);
    
    // Retornar URL local
    return `${IMAGES_URL_BASE}/${filename}`;
  } catch (error) {
    console.error(`❌ Erro ao baixar imagem ${imageUrl.substring(0, 100)}...:`, error.message);
    return null;
  }
}

/**
 * Verifica se uma imagem já está em cache
 * @param {string} eventId - ID do evento
 * @returns {Promise<string|null>} URL local da imagem ou null se não existir
 */
export async function getCachedImageUrl(eventId) {
  try {
    await ensureImagesDirectory();
    
    const files = await fs.readdir(IMAGES_DIR);
    const imageFile = files.find(file => file.startsWith(eventId));
    
    if (imageFile) {
      return `${IMAGES_URL_BASE}/${imageFile}`;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao verificar cache de imagem:', error);
    return null;
  }
}

/**
 * Renomeia uma imagem no cache
 * @param {string} oldEventId - ID antigo do evento
 * @param {string} newEventId - ID novo do evento
 * @returns {Promise<string|null>} Nova URL local ou null se falhar
 */
export async function renameCachedImage(oldEventId, newEventId) {
  try {
    await ensureImagesDirectory();
    
    const files = await fs.readdir(IMAGES_DIR);
    const oldImageFile = files.find(file => file.startsWith(oldEventId));
    
    if (oldImageFile) {
      const ext = path.extname(oldImageFile);
      const newFilename = `${newEventId}${ext}`;
      const oldFilepath = path.join(IMAGES_DIR, oldImageFile);
      const newFilepath = path.join(IMAGES_DIR, newFilename);
      
      await fs.rename(oldFilepath, newFilepath);
      console.log(`🔄 Imagem renomeada: ${oldImageFile} → ${newFilename}`);
      
      return `${IMAGES_URL_BASE}/${newFilename}`;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao renomear imagem no cache:', error);
    return null;
  }
}

/**
 * Remove imagem do cache
 * @param {string} eventId - ID do evento
 */
export async function removeCachedImage(eventId) {
  try {
    await ensureImagesDirectory();
    
    const files = await fs.readdir(IMAGES_DIR);
    const imageFile = files.find(file => file.startsWith(eventId));
    
    if (imageFile) {
      const filepath = path.join(IMAGES_DIR, imageFile);
      await fs.unlink(filepath);
      console.log(`🗑️ Imagem removida do cache: ${imageFile}`);
    }
  } catch (error) {
    console.error('Erro ao remover imagem do cache:', error);
  }
}

