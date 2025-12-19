/**
 * Serviço para baixar e armazenar imagens do Instagram no Supabase Storage
 * Evita problemas com URLs que expiram ou são bloqueadas
 */

import axios from 'axios';
import { supabase } from '../utils/supabaseClient.js';

// Bucket do Supabase Storage para imagens
const STORAGE_BUCKET = 'event-images';

/**
 * Garante que o bucket do Supabase Storage existe
 */
async function ensureStorageBucket() {
  try {
    // Verifica se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      console.log(`📦 Criando bucket ${STORAGE_BUCKET} no Supabase Storage...`);
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true, // Bucket público para permitir acesso direto às imagens
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });
      
      if (error) {
        console.error(`❌ Erro ao criar bucket:`, error.message);
        console.log(`💡 Crie o bucket manualmente no Supabase Dashboard: Storage → New bucket → Nome: ${STORAGE_BUCKET} → Public: true`);
        return false;
      }
      
      console.log(`✅ Bucket ${STORAGE_BUCKET} criado com sucesso`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar/criar bucket:', error);
    return false;
  }
}

/**
 * Baixa uma imagem e salva no Supabase Storage
 * @param {string} imageUrl - URL da imagem
 * @param {string} eventId - ID do evento (para nomear o arquivo)
 * @returns {Promise<string|null>} URL pública da imagem no Supabase ou null se falhar
 */
export async function downloadAndStoreImage(imageUrl, eventId) {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return null;
  }

  try {
    // Garantir que o bucket existe
    const bucketReady = await ensureStorageBucket();
    if (!bucketReady) {
      console.warn('⚠️ Bucket não está disponível, pulando download da imagem');
      return null;
    }

    // Extrair extensão da URL
    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const ext = pathname.match(/\.(jpg|jpeg|png|webp|gif)/i)?.[0] || '.jpg';
    
    // Nome do arquivo baseado no ID do evento
    const filename = `${eventId}${ext}`;
    const filePath = `${eventId}/${filename}`;

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

    console.log(`📥 Baixando imagem para Supabase Storage: ${imageUrl.substring(0, 100)}...`);

    // Baixar imagem
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers,
      maxRedirects: 5,
    });

    // Detectar content-type
    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, response.data, {
        contentType: contentType,
        upsert: true, // Substitui se já existir
        cacheControl: '3600' // Cache por 1 hora
      });

    if (uploadError) {
      console.error(`❌ Erro ao fazer upload para Supabase Storage:`, uploadError.message);
      return null;
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error(`❌ Erro ao obter URL pública da imagem`);
      return null;
    }

    console.log(`✅ Imagem salva no Supabase Storage: ${filename}`);
    
    // Retornar URL pública
    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Erro ao baixar/armazenar imagem ${imageUrl.substring(0, 100)}...:`, error.message);
    return null;
  }
}

/**
 * Verifica se uma imagem já está no Supabase Storage
 * @param {string} eventId - ID do evento
 * @returns {Promise<string|null>} URL pública da imagem ou null se não existir
 */
export async function getCachedImageUrl(eventId) {
  try {
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(eventId);

    if (error || !files || files.length === 0) {
      return null;
    }

    // Encontra o primeiro arquivo de imagem
    const imageFile = files.find(file => 
      file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
    );

    if (imageFile) {
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${eventId}/${imageFile.name}`);
      
      return urlData?.publicUrl || null;
    }

    return null;
  } catch (error) {
    console.error('Erro ao verificar cache de imagem:', error);
    return null;
  }
}

/**
 * Renomeia uma imagem no Supabase Storage (move para novo caminho)
 * @param {string} oldEventId - ID antigo do evento
 * @param {string} newEventId - ID novo do evento
 * @returns {Promise<string|null>} Nova URL pública ou null se falhar
 */
export async function renameCachedImage(oldEventId, newEventId) {
  try {
    // Lista arquivos do evento antigo
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(oldEventId);

    if (listError || !files || files.length === 0) {
      return null;
    }

    // Encontra o arquivo de imagem
    const imageFile = files.find(file => 
      file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
    );

    if (!imageFile) {
      return null;
    }

    const oldPath = `${oldEventId}/${imageFile.name}`;
    const ext = imageFile.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || '.jpg';
    const newPath = `${newEventId}/${newEventId}${ext}`;

    // Baixa o arquivo antigo
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(oldPath);

    if (downloadError || !fileData) {
      return null;
    }

    // Faz upload no novo caminho
    const arrayBuffer = await fileData.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(newPath, arrayBuffer, {
        contentType: imageFile.metadata?.mimetype || 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Erro ao fazer upload da imagem renomeada:', uploadError);
      return null;
    }

    // Remove o arquivo antigo
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([oldPath]);

    // Obtém a nova URL pública
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(newPath);

    console.log(`🔄 Imagem renomeada no Supabase Storage: ${oldPath} → ${newPath}`);
    
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Erro ao renomear imagem no Supabase Storage:', error);
    return null;
  }
}

/**
 * Remove imagem do Supabase Storage
 * @param {string} eventId - ID do evento
 */
export async function removeCachedImage(eventId) {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(eventId);

    if (listError || !files || files.length === 0) {
      return;
    }

    // Remove todos os arquivos do evento
    const pathsToRemove = files.map(file => `${eventId}/${file.name}`);
    
    const { error: removeError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(pathsToRemove);

    if (removeError) {
      console.error('Erro ao remover imagem do Supabase Storage:', removeError);
    } else {
      console.log(`🗑️ Imagem removida do Supabase Storage: ${eventId}`);
    }
  } catch (error) {
    console.error('Erro ao remover imagem do Supabase Storage:', error);
  }
}

