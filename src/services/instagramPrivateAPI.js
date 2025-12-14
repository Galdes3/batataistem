/**
 * Alternativa usando instagram-private-api
 * Simula o app móvel do Instagram (mais estável que scraping)
 * 
 * ⚠️ AVISO: Ainda viola ToS, mas é mais estável que scraping
 */

import { IgApiClient } from 'instagram-private-api';

let igClient = null;
let isLoggedIn = false;

/**
 * Inicializa e faz login no Instagram
 */
async function initializeInstagram() {
  if (igClient && isLoggedIn) {
    return igClient;
  }

  const username = process.env.INSTAGRAM_USERNAME;
  const password = process.env.INSTAGRAM_PASSWORD;

  if (!username || !password) {
    throw new Error('INSTAGRAM_USERNAME e INSTAGRAM_PASSWORD devem estar configurados no .env');
  }

  igClient = new IgApiClient();
  
  // Simular dispositivo
  igClient.state.generateDevice(username);
  
  try {
    // Fazer login
    await igClient.account.login(username, password);
    isLoggedIn = true;
    console.log('✅ Login no Instagram realizado com sucesso');
    return igClient;
  } catch (error) {
    console.error('❌ Erro ao fazer login no Instagram:', error.message);
    throw new Error(`Erro ao fazer login: ${error.message}`);
  }
}

/**
 * Verifica se está seguindo um usuário e segue se necessário
 * @param {IgApiClient} client - Cliente do Instagram
 * @param {string} userId - ID do usuário
 * @param {string} username - Username do perfil
 */
async function ensureFollowing(client, userId, username) {
  try {
    // Verificar se está seguindo
    const friendshipStatus = await client.friendship.show(userId);
    
    if (!friendshipStatus.following) {
      console.log(`📌 Não está seguindo @${username}, seguindo agora...`);
      
      // Seguir o usuário
      await client.friendship.create(userId);
      console.log(`✅ Agora está seguindo @${username}`);
      
      // Aguardar um pouco após seguir (evitar detecção)
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`✅ Já está seguindo @${username}`);
    }
  } catch (error) {
    console.warn(`⚠️  Não foi possível verificar/seguir @${username}:`, error.message);
    // Continuar mesmo se falhar (pode ser perfil público)
  }
}

/**
 * Busca posts de um perfil usando Instagram Private API
 * @param {string} username - Username do perfil (sem @)
 * @param {number} limit - Número máximo de posts
 * @returns {Promise<Array>} Array de posts
 */
export async function getProfilePostsViaPrivateAPI(username, limit = 25) {
  console.log('📱 Usando Instagram Private API para buscar posts');
  
  try {
    const client = await initializeInstagram();
    
    // Remover @ se presente
    const cleanUsername = username.replace('@', '');
    
    // Buscar usuário
    const userId = await client.user.getIdByUsername(cleanUsername);
    
    // Verificar e seguir se necessário (para contas novas)
    const AUTO_FOLLOW = process.env.INSTAGRAM_AUTO_FOLLOW === 'true' || true;
    if (AUTO_FOLLOW) {
      await ensureFollowing(client, userId, cleanUsername);
    }
    
    // Buscar feed do usuário
    const userFeed = client.feed.user(userId);
    const items = await userFeed.items();
    
    // Limitar quantidade
    const limitedItems = items.slice(0, limit);
    
    // Formatar posts
    const posts = limitedItems.map(item => ({
      id: item.id || item.pk || `private_api_${item.id}`,
      caption: item.caption?.text || '',
      media_type: item.video_versions ? 'VIDEO' : 'IMAGE',
      media_url: item.image_versions2?.candidates?.[0]?.url || 
                 item.video_versions?.[0]?.url || 
                 item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url,
      permalink: `https://www.instagram.com/p/${item.code}/`,
      timestamp: item.taken_at ? new Date(item.taken_at * 1000).toISOString() : new Date().toISOString(),
      created_time: item.taken_at ? new Date(item.taken_at * 1000) : new Date()
    }));
    
    console.log(`✅ Encontrados ${posts.length} post(s) via Private API`);
    return posts;
    
  } catch (error) {
    console.error('Erro ao buscar posts via Private API:', error.message);
    
    // Mensagens de erro mais específicas
    if (error.message.includes('challenge_required') || error.message.includes('checkpoint')) {
      throw new Error('Instagram está pedindo verificação de segurança. Acesse o Instagram no navegador e complete a verificação.');
    }
    
    if (error.message.includes('rate_limit') || error.message.includes('429')) {
      throw new Error('Limite de requisições excedido. Aguarde alguns minutos e tente novamente.');
    }
    
    if (error.message.includes('user not found') || error.message.includes('not found')) {
      throw new Error('Perfil não encontrado. Verifique se o username está correto.');
    }
    
    if (error.message.includes('login') || error.message.includes('password')) {
      throw new Error('Erro de login. Verifique INSTAGRAM_USERNAME e INSTAGRAM_PASSWORD no .env');
    }
    
    // Log detalhado para debug
    if (error.response) {
      console.error('   Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw new Error(`Erro ao buscar posts via Private API: ${error.message}`);
  }
}

/**
 * Busca informações de um perfil
 * @param {string} username - Username do perfil
 * @returns {Promise<Object>} Informações do perfil
 */
export async function getProfileInfoViaPrivateAPI(username) {
  try {
    const client = await initializeInstagram();
    
    const cleanUsername = username.replace('@', '');
    const userId = await client.user.getIdByUsername(cleanUsername);
    const userInfo = await client.user.info(userId);
    
    return {
      id: userInfo.pk.toString(),
      username: userInfo.username
    };
    
  } catch (error) {
    throw new Error(`Erro ao buscar perfil via Private API: ${error.message}`);
  }
}

