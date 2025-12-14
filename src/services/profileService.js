import { supabase } from '../utils/supabaseClient.js';
import { getProfileInfo } from './instagramService.js';

/**
 * Cria um novo perfil para monitoramento
 * @param {Object} profileData - Dados do perfil
 * @returns {Promise<Object>} Perfil criado
 */
export async function createProfile(profileData) {
    try {
        const { username, instagram_id, url } = profileData;

        // Valida campos obrigatórios
        if (!username || !instagram_id || !url) {
            throw new Error('Campos obrigatórios: username, instagram_id, url');
        }

        // Verifica se já existe (username ou instagram_id)
        const { data: existingByUsername } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .limit(1)
            .maybeSingle();

        const { data: existingById } = await supabase
            .from('profiles')
            .select('id')
            .eq('instagram_id', instagram_id)
            .limit(1)
            .maybeSingle();

        if (existingByUsername || existingById) {
            throw new Error('Perfil já cadastrado');
        }

        // Valida o perfil no Instagram (opcional, pode falhar se token inválido)
        // Passa username para permitir fallback de scraping (remove @ se presente)
        try {
            const cleanUsername = username ? username.replace(/^@+/, '') : null;
            await getProfileInfo(instagram_id, cleanUsername);
        } catch (error) {
            console.warn('Aviso: Não foi possível validar o perfil no Instagram:', error.message);
        }

        // Cria o perfil
        const { data: profile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                username,
                instagram_id,
                url
            })
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        return profile;
    } catch (error) {
        console.error('Erro ao criar perfil:', error);
        throw error;
    }
}

/**
 * Lista todos os perfis cadastrados
 * @returns {Promise<Array>} Lista de perfis
 */
export async function listProfiles() {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Busca contagem de eventos para cada perfil
        const profilesWithCount = await Promise.all(
            profiles.map(async (profile) => {
                const { count } = await supabase
                    .from('events')
                    .select('*', { count: 'exact', head: true })
                    .eq('profile_id', profile.id);

                return {
                    ...profile,
                    _count: {
                        events: count || 0
                    }
                };
            })
        );

        return profilesWithCount;
    } catch (error) {
        console.error('Erro ao listar perfis:', error);
        throw error;
    }
}

/**
 * Busca um perfil por ID
 * @param {string} profileId - ID do perfil
 * @returns {Promise<Object>} Perfil encontrado
 */
export async function getProfileById(profileId) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                *,
                events (
                    id,
                    title,
                    description,
                    date,
                    location,
                    media_url,
                    source_url,
                    type,
                    created_at
                )
            `)
            .eq('id', profileId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error('Perfil não encontrado');
            }
            throw error;
        }

        // Ordena eventos por created_at desc
        if (profile.events) {
            profile.events = profile.events
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 10);
        }

        return profile;
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
    }
}

/**
 * Deleta um perfil
 * @param {string} profileId - ID do perfil
 * @returns {Promise<void>}
 */
export async function deleteProfile(profileId) {
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profileId);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Erro ao deletar perfil:', error);
        throw error;
    }
}
