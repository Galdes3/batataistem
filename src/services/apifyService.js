/**
 * Integração com Apify Instagram Scraper
 * Serviço pago mas mais estável que scraping próprio
 * 
 * Documentação: https://apify.com/apify/instagram-scraper
 * Custo: $1.50 / 1.000 resultados
 */

import { ApifyClient } from 'apify-client';

let apifyClient = null;

/**
 * Inicializa cliente Apify
 */
function getApifyClient() {
  if (!apifyClient) {
    const apiToken = process.env.APIFY_API_TOKEN;
    
    if (!apiToken) {
      throw new Error('APIFY_API_TOKEN não configurado no .env');
    }
    
    apifyClient = new ApifyClient({
      token: apiToken
    });
  }
  
  return apifyClient;
}

/**
 * Busca posts de um perfil usando Apify
 * @param {string} username - Username do perfil (sem @)
 * @param {number} limit - Número máximo de posts
 * @returns {Promise<Array>} Array de posts
 */
export async function getProfilePostsViaApify(username, limit = 25) {
  console.log('🔷 Usando Apify Instagram Scraper para buscar posts');
  
  try {
    const client = getApifyClient();
    const cleanUsername = username.replace('@', '');
    
    // Configurar input para Apify Actor
    // Documentação: https://apify.com/apify/instagram-scraper
    const input = {
      directUrls: [`https://www.instagram.com/${cleanUsername}/`],
      resultsType: 'posts',
      resultsLimit: limit
    };
    
    console.log(`   📡 Enviando requisição para Apify...`);
    
    // Executar Actor (sem opções de espera - o Apify Client não aceita waitSecs diretamente)
    const run = await client.actor('apify/instagram-scraper').call(input);
    
    // Aguardar conclusão do run (polling manual com timeout de 5 minutos)
    console.log(`   ⏳ Aguardando conclusão do run ${run.id}...`);
    const maxWaitTime = 300000; // 5 minutos em milissegundos
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const runStatus = await client.run(run.id).get();
      if (runStatus.status === 'SUCCEEDED' || runStatus.status === 'FAILED') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos antes de verificar novamente
    }
    
    // Buscar resultados
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    if (!items || items.length === 0) {
      throw new Error('Nenhum post encontrado via Apify');
    }
    
    // Formatar posts no formato esperado
    const posts = items.slice(0, limit).map(item => {
      // Tentar vários campos de data possíveis do Apify
      let postDate = null;
      let postTimestamp = null;
      
      // Tentar diferentes formatos de data que o Apify pode retornar
      if (item.timestamp) {
        postTimestamp = item.timestamp;
        postDate = new Date(item.timestamp);
      } else if (item.uploadDate) {
        postTimestamp = typeof item.uploadDate === 'number' 
          ? new Date(item.uploadDate * 1000).toISOString()
          : item.uploadDate;
        postDate = typeof item.uploadDate === 'number' 
          ? new Date(item.uploadDate * 1000)
          : new Date(item.uploadDate);
      } else if (item.createdAt) {
        postTimestamp = typeof item.createdAt === 'number'
          ? new Date(item.createdAt * 1000).toISOString()
          : item.createdAt;
        postDate = typeof item.createdAt === 'number'
          ? new Date(item.createdAt * 1000)
          : new Date(item.createdAt);
      } else if (item.takenAt) {
        postTimestamp = typeof item.takenAt === 'number'
          ? new Date(item.takenAt * 1000).toISOString()
          : item.takenAt;
        postDate = typeof item.takenAt === 'number'
          ? new Date(item.takenAt * 1000)
          : new Date(item.takenAt);
      } else if (item.date) {
        postTimestamp = typeof item.date === 'number'
          ? new Date(item.date * 1000).toISOString()
          : item.date;
        postDate = typeof item.date === 'number'
          ? new Date(item.date * 1000)
          : new Date(item.date);
      } else if (item.timestampISO) {
        postTimestamp = item.timestampISO;
        postDate = new Date(item.timestampISO);
      }
      
      // Se não encontrou data, usar data atual (fallback)
      if (!postTimestamp) {
        console.warn(`⚠️  Post ${item.shortCode || item.id} não possui data de publicação. Usando data atual.`);
        postTimestamp = new Date().toISOString();
        postDate = new Date();
      }
      
      // Extrair media_url tentando vários campos possíveis do Apify
      let mediaUrl = null;
      
      // Ordem de prioridade para extrair a URL da imagem
      const possibleImageFields = [
        item.displayUrl,
        item.imageUrl,
        item.image,
        item.thumbnailUrl,
        item.thumbnail,
        item.images?.[0],
        item.images?.[item.images.length - 1], // Última imagem (geralmente maior resolução)
        item.displayResourceUrls?.[0],
        item.displayResourceUrls?.[item.displayResourceUrls?.length - 1],
        item.sidecarChildren?.[0]?.displayUrl, // Para posts com múltiplas imagens
        item.videoUrl, // Para vídeos
        item.videoThumbnailUrl // Thumbnail de vídeo
      ];
      
      // Encontra o primeiro campo válido
      for (const field of possibleImageFields) {
        if (field && typeof field === 'string' && field.startsWith('http')) {
          mediaUrl = field;
          break;
        }
      }
      
      // Log se não encontrou imagem
      if (!mediaUrl) {
        console.warn(`   ⚠️  Post ${item.shortCode || item.id} não tem media_url. Campos disponíveis:`, {
          hasDisplayUrl: !!item.displayUrl,
          hasImageUrl: !!item.imageUrl,
          hasImages: !!item.images,
          hasDisplayResourceUrls: !!item.displayResourceUrls,
          hasVideoUrl: !!item.videoUrl,
          allKeys: Object.keys(item).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('url') || k.toLowerCase().includes('media'))
        });
      } else {
        console.log(`   📸 Imagem extraída do Apify: ${mediaUrl.substring(0, 80)}...`);
      }
      
      return {
        id: item.shortCode || item.id || `apify_${item.shortCode}`,
        caption: item.caption || '',
        media_type: item.type === 'Video' ? 'VIDEO' : 'IMAGE',
        media_url: mediaUrl,
        permalink: item.url || `https://www.instagram.com/p/${item.shortCode}/`,
        timestamp: postTimestamp,
        created_time: postDate,
        from_apify: true // Marca que veio do Apify
      };
    });
    
    console.log(`✅ Encontrados ${posts.length} post(s) via Apify`);
    console.log(`   💰 Custo aproximado: $${(items.length * 0.0015).toFixed(4)}`);
    
    return posts;
    
  } catch (error) {
    console.error('Erro ao buscar posts via Apify:', error.message);
    
    // Mensagens de erro mais específicas
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      throw new Error('APIFY_API_TOKEN inválido. Verifique sua chave no .env');
    }
    
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      throw new Error('Limite de requisições do Apify excedido. Aguarde alguns minutos.');
    }
    
    throw new Error(`Erro ao buscar posts via Apify: ${error.message}`);
  }
}

/**
 * Busca informações de um perfil via Apify
 * @param {string} username - Username do perfil
 * @returns {Promise<Object>} Informações do perfil
 */
export async function getProfileInfoViaApify(username) {
  try {
    const client = getApifyClient();
    const cleanUsername = username.replace('@', '');
    
    const input = {
      directUrls: [`https://www.instagram.com/${cleanUsername}/`],
      resultsType: 'details', // Buscar apenas metadados do perfil
      searchType: 'user',
      searchLimit: 1
    };
    
    // Executar Actor
    const run = await client.actor('apify/instagram-scraper').call(input);
    
    // Aguardar conclusão do run (polling manual com timeout de 5 minutos)
    const maxWaitTime = 300000; // 5 minutos em milissegundos
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const runStatus = await client.run(run.id).get();
      if (runStatus.status === 'SUCCEEDED' || runStatus.status === 'FAILED') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos antes de verificar novamente
    }
    
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    if (!items || items.length === 0) {
      throw new Error('Perfil não encontrado via Apify');
    }
    
    const profile = items[0];
    
    return {
      id: profile.id || profile.ownerId || `apify_${cleanUsername}`,
      username: profile.username || profile.ownerUsername || cleanUsername
    };
    
  } catch (error) {
    throw new Error(`Erro ao buscar perfil via Apify: ${error.message}`);
  }
}

