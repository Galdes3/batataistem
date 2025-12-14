/**
 * Serviço de Cache Inteligente
 * Reutiliza posts já salvos quando novas buscas falham
 */

import { supabase } from '../utils/supabaseClient.js';

/**
 * Busca posts do cache (eventos já salvos) para um perfil
 * @param {string} profileId - ID do perfil
 * @param {number} limit - Número máximo de posts
 * @param {number} maxAgeDays - Idade máxima dos posts em dias (padrão: 7)
 * @returns {Promise<Array>} Array de posts do cache
 */
export async function getCachedPosts(profileId, limit = 25, maxAgeDays = 7) {
  try {
    const maxAge = new Date();
    maxAge.setDate(maxAge.getDate() - maxAgeDays);

    // Buscar eventos recentes do perfil
    // Ordena por created_at primeiro (fallback seguro), depois ordena manualmente por published_at
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('profile_id', profileId)
      .gte('created_at', maxAge.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Busca mais para garantir que temos suficientes após ordenação
    
    if (error) {
      throw error;
    }
    
    // Ordena manualmente por published_at > date > created_at (ordem cronológica real)
    if (events && events.length > 0) {
      events.sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 
                     (a.date ? new Date(a.date).getTime() : new Date(a.created_at).getTime());
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 
                     (b.date ? new Date(b.date).getTime() : new Date(b.created_at).getTime());
        return dateB - dateA; // Descending (mais recente primeiro)
      });
      
      // Limita após ordenação
      events.splice(limit);
    }

    if (error) {
      throw error;
    }

    if (!events || events.length === 0) {
      return [];
    }

    // Converter eventos para formato de posts
    const posts = events.map(event => {
      // Usa published_at (data de publicação no Instagram) quando disponível
      const postDate = event.published_at || event.date || event.created_at;
      return {
        id: event.id,
        caption: event.original_caption || event.description,
        media_type: event.media_url?.includes('video') ? 'VIDEO' : 'IMAGE',
        media_url: event.media_url,
        permalink: event.source_url || `https://www.instagram.com/p/cached_${event.id}/`,
        timestamp: postDate ? new Date(postDate).toISOString() : new Date().toISOString(),
        created_time: postDate ? new Date(postDate) : new Date(),
        from_cache: true // Marca que veio do cache
      };
    });

    console.log(`📦 Encontrados ${posts.length} post(s) no cache`);
    return posts;

  } catch (error) {
    console.error('Erro ao buscar posts do cache:', error);
    return [];
  }
}

/**
 * Verifica se há posts novos comparando com o cache
 * @param {Array} newPosts - Posts novos buscados
 * @param {string} profileId - ID do perfil
 * @returns {Promise<Array>} Apenas posts novos (não estão no cache)
 */
export async function filterNewPosts(newPosts, profileId) {
  try {
    if (!newPosts || newPosts.length === 0) {
      return [];
    }

    // Buscar URLs dos posts já salvos
    const permalinks = newPosts.map(p => p.permalink).filter(Boolean);
    
    if (permalinks.length === 0) {
      return newPosts; // Se não tem permalinks, retorna todos
    }

    const { data: existingEvents } = await supabase
      .from('events')
      .select('source_url')
      .eq('profile_id', profileId)
      .in('source_url', permalinks);

    const existingUrls = new Set(
      (existingEvents || []).map(e => e.source_url)
    );

    // Filtrar apenas posts novos
    const newPostsOnly = newPosts.filter(post => 
      !post.permalink || !existingUrls.has(post.permalink)
    );

    return newPostsOnly;

  } catch (error) {
    console.error('Erro ao filtrar posts novos:', error);
    return newPosts; // Em caso de erro, retorna todos
  }
}

