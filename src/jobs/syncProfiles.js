import { supabase } from '../utils/supabaseClient.js';
import { getProfilePosts } from '../services/instagramService.js';
import { createEventFromPost } from '../services/eventService.js';
import { getCachedPosts } from '../services/cacheService.js';

/**
 * Sincroniza todos os perfis cadastrados
 * Busca novos posts e cria eventos automaticamente
 * @returns {Promise<Object>} Resultado da sincronização
 */
export async function syncAllProfiles() {
    const result = {
        profilesProcessed: 0,
        eventsCreated: 0,
        errors: []
    };

    try {
        // Busca todos os perfis cadastrados
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) {
            throw profilesError;
        }

        if (!profiles || profiles.length === 0) {
            console.log('ℹ️  Nenhum perfil cadastrado para sincronizar');
            return result;
        }

        console.log(`📊 Sincronizando ${profiles.length} perfil(is)...`);

        // Verifica token antes de sincronizar
        const { validateAccessToken } = await import('../services/instagramService.js');
        const tokenValidation = await validateAccessToken();
        
        if (!tokenValidation.valid) {
            const errorMsg = tokenValidation.error || 'Token do Instagram inválido ou expirado. Gere um novo token no Facebook Developers.';
            console.error(`\n❌ ${errorMsg}`);
            if (tokenValidation.details) {
                console.error('   Detalhes:', JSON.stringify(tokenValidation.details, null, 2));
            }
            result.errors.push({
                error: errorMsg,
                type: 'TOKEN_INVALIDO',
                details: tokenValidation.details
            });
            return result;
        }
        
        console.log('✅ Token do Instagram válido');

        // Processa cada perfil
        for (const profile of profiles) {
            try {
                console.log(`\n🔍 Processando perfil: @${profile.username} (${profile.instagram_id})`);

                let posts = [];
                let usedCache = false;

                // Tenta buscar posts novos
                try {
                    posts = await getProfilePosts(profile.instagram_id, 3, profile.username);
                    console.log(`   📸 Encontrados ${posts.length} post(s) via API/Scraping`);
                    
                    // Ordena posts por timestamp (mais recentes primeiro)
                    posts = posts.sort((a, b) => {
                        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 
                                     (a.created_time ? new Date(a.created_time).getTime() : 0);
                        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 
                                     (b.created_time ? new Date(b.created_time).getTime() : 0);
                        return timeB - timeA; // Descending (mais recente primeiro)
                    });
                    console.log(`   📅 Posts ordenados por data (mais recentes primeiro)`);
                } catch (error) {
                    console.warn(`   ⚠️  Falha ao buscar posts novos: ${error.message}`);
                    console.log(`   📦 Tentando usar cache como fallback...`);
                    
                    // Se falhar, usa cache
                    posts = await getCachedPosts(profile.id, 3, 7); // Últimos 7 dias
                    usedCache = true;
                    
                    if (posts.length > 0) {
                        console.log(`   ✅ Usando ${posts.length} post(s) do cache`);
                    } else {
                        throw new Error('Nenhum post encontrado (nem novos nem no cache)');
                    }
                }

                // Se não usou cache, processa posts novos
                if (!usedCache && posts.length > 0) {
                    // Processa cada post
                    for (const post of posts) {
                        try {
                            await createEventFromPost(post, profile.id);
                            result.eventsCreated++;
                        } catch (error) {
                            // Se for erro de token, para a sincronização
                            if (error.message && error.message.includes('TOKEN_INVALIDO')) {
                                throw error;
                            }
                            console.error(`   ❌ Erro ao processar post ${post.id || 'sem-id'}:`, error.message || error);
                            result.errors.push({
                                profile: profile.username,
                                postId: post.id || 'sem-id',
                                error: error.message || String(error)
                            });
                            // Continua processando outros posts mesmo se um falhar
                        }
                    }
                } else if (usedCache) {
                    console.log(`   ℹ️  Usando posts do cache (não foram criados novos eventos)`);
                }

                result.profilesProcessed++;
                console.log(`   ✅ Perfil @${profile.username} processado com sucesso`);
            } catch (error) {
                // Se for erro de token, para tudo
                if (error.message && error.message.includes('TOKEN_INVALIDO')) {
                    console.error(`\n❌ ${error.message}`);
                    result.errors.push({
                        error: error.message,
                        type: 'TOKEN_INVALIDO'
                    });
                    break; // Para de processar outros perfis
                }
                console.error(`❌ Erro ao processar perfil ${profile.username}:`, error.message || error);
                result.errors.push({
                    profile: profile.username,
                    error: error.message || String(error)
                });
                // Continua processando outros perfis mesmo se um falhar
                result.profilesProcessed++; // Conta mesmo com erro para não perder o progresso
            }
        }

        console.log(`\n✅ Sincronização concluída:`);
        console.log(`   - Perfis processados: ${result.profilesProcessed}`);
        console.log(`   - Eventos criados: ${result.eventsCreated}`);
        console.log(`   - Erros: ${result.errors.length}`);

        return result;
    } catch (error) {
        console.error('Erro crítico na sincronização:', error);
        result.errors.push({
            error: error.message
        });
        return result;
    }
}
