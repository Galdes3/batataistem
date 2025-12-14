import axios from 'axios';
import { getProfilePostsViaScraping, getProfileInfoViaScraping } from './instagramScraper.js';
import { getProfilePostsViaPrivateAPI, getProfileInfoViaPrivateAPI } from './instagramPrivateAPI.js';
import { getProfilePostsViaApify, getProfileInfoViaApify } from './apifyService.js';

const INSTAGRAM_API_BASE = 'https://graph.instagram.com';

// Configuração: qual método usar como fallback?
const FALLBACK_METHOD = process.env.INSTAGRAM_FALLBACK_METHOD || 'private_api'; // 'scraping', 'private_api', 'apify', ou 'manual'
const USE_SCRAPING_FALLBACK = process.env.USE_SCRAPING_FALLBACK === 'true';
const USE_PRIVATE_API_FALLBACK = process.env.USE_PRIVATE_API_FALLBACK !== 'false'; // true por padrão
const USE_APIFY_FALLBACK = process.env.USE_APIFY_FALLBACK === 'true';

// Log de configuração no início
console.log('📋 Configuração de Fallback:');
console.log(`   Método preferido: ${FALLBACK_METHOD}`);
console.log(`   Private API: ${USE_PRIVATE_API_FALLBACK ? '✅' : '❌'}`);
console.log(`   Scraping: ${USE_SCRAPING_FALLBACK ? '✅' : '❌'}`);
console.log(`   Apify: ${USE_APIFY_FALLBACK ? '✅' : '❌'}`);

/**
 * Busca os últimos posts de um perfil do Instagram
 * @param {string} instagramId - ID do perfil no Instagram
 * @param {number} limit - Número máximo de posts a retornar (padrão: 3)
 * @returns {Promise<Array>} Array de posts
 */
/**
 * Busca posts de um perfil, tentando API oficial primeiro e scraping como fallback
 * @param {string} instagramId - ID do perfil no Instagram (ou username se usar scraping)
 * @param {number} limit - Número máximo de posts (padrão: 3)
 * @param {string} username - Username do perfil (opcional, usado para scraping)
 * @returns {Promise<Array>} Array de posts
 */
export async function getProfilePosts(instagramId, limit = 3, username = null) {
  // Tentar API oficial primeiro
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('INSTAGRAM_ACCESS_TOKEN não configurado no .env');
    }

    if (!instagramId) {
      throw new Error('Instagram ID é obrigatório');
    }

    // Busca os media do perfil
    const mediaResponse = await axios.get(`${INSTAGRAM_API_BASE}/${instagramId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url',
        limit: limit,
        access_token: accessToken
      }
    });

    const mediaData = mediaResponse.data.data || [];

    // Para cada media, busca detalhes adicionais se necessário
    const posts = await Promise.all(
      mediaData.map(async (media) => {
        // Se for vídeo, usa thumbnail_url se disponível, senão media_url
        const imageUrl = media.media_type === 'VIDEO' 
          ? (media.thumbnail_url || media.media_url)
          : media.media_url;

        return {
          id: media.id,
          caption: media.caption || '',
          media_type: media.media_type,
          media_url: imageUrl,
          permalink: media.permalink,
          timestamp: media.timestamp,
          created_time: new Date(media.timestamp)
        };
      })
    );

    console.log(`✅ Posts obtidos via API oficial: ${posts.length}`);
    return posts;
  } catch (error) {
    const errorData = error.response?.data?.error;
    
    // Se for erro de token inválido ou acesso negado, tentar métodos alternativos
    if ((USE_SCRAPING_FALLBACK || USE_PRIVATE_API_FALLBACK || USE_APIFY_FALLBACK) && (
      errorData?.code === 190 || 
      errorData?.code === 2 ||
      errorData?.message?.includes('Invalid OAuth access token') ||
      errorData?.message?.includes('An unexpected error')
    )) {
      console.warn('⚠️  API oficial falhou, tentando métodos alternativos...');
      console.warn(`   Erro: ${errorData?.message || error.message}`);
      
      if (!username) {
        throw new Error(`API oficial falhou e username não fornecido para métodos alternativos. Erro: ${errorData?.message || error.message}`);
      }
      
      // Ordem de tentativas baseada em FALLBACK_METHOD
      const cleanUsername = username.replace(/^@+/, '');
      const fallbackMethods = [];
      
      // Adicionar métodos na ordem de prioridade baseada em FALLBACK_METHOD
      // Primeiro: método preferido
      if (FALLBACK_METHOD === 'apify' && USE_APIFY_FALLBACK) {
        fallbackMethods.push({ name: 'Apify', fn: () => getProfilePostsViaApify(cleanUsername, limit) });
      } else if (FALLBACK_METHOD === 'private_api' && USE_PRIVATE_API_FALLBACK) {
        fallbackMethods.push({ name: 'Private API', fn: () => getProfilePostsViaPrivateAPI(cleanUsername, limit) });
      } else if (FALLBACK_METHOD === 'scraping' && USE_SCRAPING_FALLBACK) {
        fallbackMethods.push({ name: 'Scraping', fn: () => getProfilePostsViaScraping(cleanUsername, limit) });
      }
      
      // Depois: outros métodos como fallback secundário (na ordem de preferência)
      // Private API é mais estável que scraping, então tenta primeiro
      if (FALLBACK_METHOD !== 'private_api' && USE_PRIVATE_API_FALLBACK) {
        fallbackMethods.push({ name: 'Private API', fn: () => getProfilePostsViaPrivateAPI(cleanUsername, limit) });
      }
      if (FALLBACK_METHOD !== 'apify' && USE_APIFY_FALLBACK) {
        fallbackMethods.push({ name: 'Apify', fn: () => getProfilePostsViaApify(cleanUsername, limit) });
      }
      if (FALLBACK_METHOD !== 'scraping' && USE_SCRAPING_FALLBACK) {
        fallbackMethods.push({ name: 'Scraping', fn: () => getProfilePostsViaScraping(cleanUsername, limit) });
      }
      
      // Tentar cada método em sequência
      const errors = [];
      for (const method of fallbackMethods) {
        try {
          console.log(`🔄 Tentando ${method.name}...`);
          return await method.fn();
        } catch (methodError) {
          console.warn(`⚠️  ${method.name} falhou:`, methodError.message);
          errors.push(`${method.name}: ${methodError.message}`);
        }
      }
      
      // Se todos falharam
      if (errors.length > 0) {
        throw new Error(`Todos os métodos falharam. API: ${errorData?.message || error.message}. ${errors.join('. ')}`);
      } else {
        throw new Error(`API oficial falhou e nenhum método alternativo configurado. Erro: ${errorData?.message || error.message}`);
      }
    }
    
    // Se não for erro que justifique fallback, lançar erro original
    if (errorData?.code === 190 || errorData?.message?.includes('Invalid OAuth access token')) {
      throw new Error('TOKEN_INVALIDO: Token do Instagram expirado ou inválido. Gere um novo token no Facebook Developers.');
    }
    
    console.error('Erro ao buscar posts do Instagram:', errorData || error.message);
    throw new Error(`Erro ao buscar posts: ${errorData?.message || error.message}`);
  }
}

/**
 * Busca informações básicas de um perfil do Instagram
 * @param {string} instagramId - ID do perfil no Instagram
 * @returns {Promise<Object>} Informações do perfil
 */
/**
 * Busca informações de um perfil, tentando API oficial primeiro e scraping como fallback
 * @param {string} instagramId - ID do perfil no Instagram (ou username se usar scraping)
 * @param {string} username - Username do perfil (opcional, usado para scraping)
 * @returns {Promise<Object>} Informações do perfil
 */
export async function getProfileInfo(instagramId, username = null) {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('INSTAGRAM_ACCESS_TOKEN não configurado no .env');
    }

    const response = await axios.get(`${INSTAGRAM_API_BASE}/${instagramId}`, {
      params: {
        fields: 'id,username',
        access_token: accessToken
      }
    });

    return response.data;
  } catch (error) {
    const errorData = error.response?.data?.error;
    
    // Se for erro de token inválido ou acesso negado, tentar fallback
    if ((USE_SCRAPING_FALLBACK || USE_PRIVATE_API_FALLBACK || USE_APIFY_FALLBACK) && (
      errorData?.code === 190 || 
      errorData?.code === 2 ||
      errorData?.message?.includes('Invalid OAuth access token') ||
      errorData?.message?.includes('An unexpected error')
    )) {
      console.warn('⚠️  API oficial falhou, tentando método alternativo...');
      
      if (!username) {
        throw new Error(`API oficial falhou e username não fornecido. Erro: ${errorData?.message || error.message}`);
      }
      
      // Tentar métodos alternativos em sequência
      const cleanUsername = username.replace(/^@+/, '');
      const errors = [];
      
      // Ordem baseada em configuração
      if (FALLBACK_METHOD === 'apify' && USE_APIFY_FALLBACK) {
        try {
          return await getProfileInfoViaApify(cleanUsername);
        } catch (e) {
          errors.push(`Apify: ${e.message}`);
        }
      }
      
      if (FALLBACK_METHOD === 'private_api' && USE_PRIVATE_API_FALLBACK) {
        try {
          return await getProfileInfoViaPrivateAPI(cleanUsername);
        } catch (e) {
          errors.push(`Private API: ${e.message}`);
        }
      }
      
      if (USE_SCRAPING_FALLBACK) {
        try {
          return await getProfileInfoViaScraping(cleanUsername);
        } catch (e) {
          errors.push(`Scraping: ${e.message}`);
        }
      }
      
      // Fallback secundário
      if (FALLBACK_METHOD !== 'apify' && USE_APIFY_FALLBACK) {
        try {
          return await getProfileInfoViaApify(cleanUsername);
        } catch (e) {
          errors.push(`Apify: ${e.message}`);
        }
      }
      
      if (FALLBACK_METHOD !== 'private_api' && USE_PRIVATE_API_FALLBACK) {
        try {
          return await getProfileInfoViaPrivateAPI(cleanUsername);
        } catch (e) {
          errors.push(`Private API: ${e.message}`);
        }
      }
      
      throw new Error(`Todos os métodos falharam. API: ${errorData?.message || error.message}. ${errors.join('. ')}`);
    }
    
    // Se não for erro que justifique fallback, lançar erro original
    if (errorData?.code === 190 || errorData?.message?.includes('Invalid OAuth access token')) {
      throw new Error('TOKEN_INVALIDO: Token do Instagram expirado ou inválido. Gere um novo token no Facebook Developers.');
    }
    
    console.error('Erro ao buscar informações do perfil:', errorData || error.message);
    throw new Error(`Erro ao buscar perfil: ${errorData?.message || error.message}`);
  }
}

/**
 * Troca um token de curta duração (1 hora) por um de longa duração (60 dias)
 * @param {string} shortLivedToken - Token de curta duração
 * @returns {Promise<Object>} Token de longa duração e informações
 */
export async function exchangeForLongLivedToken(shortLivedToken) {
  try {
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    
    if (!appSecret) {
      throw new Error('INSTAGRAM_APP_SECRET não configurado no .env');
    }

    const response = await axios.get(`${INSTAGRAM_API_BASE}/access_token`, {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: appSecret,
        access_token: shortLivedToken
      }
    });

    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in, // segundos até expirar (5184000 = 60 dias)
      expires_at: new Date(Date.now() + response.data.expires_in * 1000)
    };
  } catch (error) {
    const errorData = error.response?.data?.error;
    console.error('Erro ao trocar token:', errorData || error.message);
    throw new Error(`Erro ao trocar token: ${errorData?.message || error.message}`);
  }
}

/**
 * Valida se um token de acesso do Instagram é válido
 * @returns {Promise<{valid: boolean, error?: string, details?: any}>}
 */
export async function validateAccessToken() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      return { valid: false, error: 'Token não configurado no .env' };
    }

    // Tenta fazer uma requisição simples para validar o token
    const response = await axios.get(`${INSTAGRAM_API_BASE}/me`, {
      params: {
        fields: 'id,username',
        access_token: accessToken
      }
    });

    return { 
      valid: true, 
      details: response.data 
    };
  } catch (error) {
    const errorData = error.response?.data?.error;
    
    if (errorData?.code === 190 || errorData?.message?.includes('Invalid OAuth access token')) {
      return { 
        valid: false, 
        error: 'Token inválido ou expirado',
        details: errorData
      };
    }
    
    return { 
      valid: false, 
      error: errorData?.message || error.message,
      details: errorData
    };
  }
}

