import { supabase } from '../utils/supabaseClient.js';
import { transformCaption } from './geminiService.js';

/**
 * Envia notificação push para novo evento (não bloqueia)
 */
async function sendNotificationForNewEvent(event) {
    try {
        const { notifyNewEvent } = await import('./notificationService.js');
        await notifyNewEvent(event);
    } catch (error) {
        // Não lança erro para não quebrar o fluxo de criação de evento
        console.warn('⚠️  Não foi possível enviar notificação push:', error.message);
    }
}

/**
 * Cria um evento automaticamente a partir de um post do Instagram
 * @param {Object} postData - Dados do post do Instagram
 * @param {string} profileId - ID do perfil que gerou o evento
 * @returns {Promise<Object>} Evento criado
 */
export async function createEventFromPost(postData, profileId) {
    try {
        // Verifica se o evento já existe (evita duplicatas)
        const { data: existingEvent } = await supabase
            .from('events')
            .select('id')
            .eq('source_url', postData.permalink)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (existingEvent) {
            console.log(`Evento já existe: ${postData.permalink}`);
            // Busca o evento completo
            const { data: event } = await supabase
                .from('events')
                .select('*, profile:profiles(*)')
                .eq('id', existingEvent.id)
                .single();
            return event;
        }

        // Verifica se este post foi excluído anteriormente
        if (postData.permalink) {
            const { data: deletedEvent } = await supabase
                .from('deleted_events')
                .select('id')
                .eq('source_url', postData.permalink)
                .eq('profile_id', profileId)
                .maybeSingle();

            if (deletedEvent) {
                console.log(`⚠️  Post excluído anteriormente, ignorando: ${postData.permalink}`);
                return null; // Não cria o evento
            }
        }

        // Busca o perfil para obter o username
        const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', profileId)
            .single();

        // Log para verificar se media_url está presente
        if (!postData.media_url) {
            console.warn(`   ⚠️  Post ${postData.id || 'sem-id'} não tem media_url`);
            console.warn(`   📋 Dados do post:`, {
                id: postData.id,
                hasMediaUrl: !!postData.media_url,
                mediaType: postData.media_type,
                permalink: postData.permalink,
                keys: Object.keys(postData)
            });
        } else {
            console.log(`   📸 Imagem encontrada: ${postData.media_url.substring(0, 80)}...`);
        }

        // Extrai texto da imagem usando OCR (se disponível)
        let imageText = '';
        if (postData.media_url) {
            try {
                const { extractTextFromImage } = await import('./ocrService.js');
                imageText = await extractTextFromImage(postData.media_url);
            } catch (ocrError) {
                console.warn('⚠️  Erro ao extrair texto da imagem (continuando sem OCR):', ocrError.message);
            }
        }

        // Transforma a legenda usando Gemini (com username do perfil e texto da imagem)
        const transformed = await transformCaption(
            postData.caption || '', 
            profile?.username || null,
            imageText || null
        );

        // Valida título - garante que sempre há um título válido
        if (!transformed.title || transformed.title.trim().length === 0) {
            console.warn(`⚠️  Título vazio recebido do Gemini, usando fallback`);
            transformed.title = profile?.username 
                ? `Evento em @${profile.username}` 
                : 'Evento sem título';
        }
        
        // Log do título gerado para debug
        console.log(`   📝 Título gerado: "${transformed.title}"`);

        // Determina a data do evento e valida
        let eventDate = null;
        let needsReview = false;
        
        if (transformed.date) {
            const parsedDate = new Date(transformed.date);
            const now = new Date();
            
            // Validação: data não pode ser no passado
            if (parsedDate < now) {
                console.log(`   ⚠️  Data extraída está no passado: ${parsedDate.toISOString()}`);
                needsReview = true;
            } else {
                eventDate = parsedDate.toISOString();
                console.log(`   📅 Data extraída pelo Gemini: ${eventDate}`);
            }
        } else {
            console.log(`   ⚠️  Nenhuma data detectada na legenda`);
            needsReview = true;
        }
        
        // Se não tem data válida, marca como pendente
        if (!eventDate) {
            needsReview = true;
        }

        // Determina status: se precisa revisão ou se data é válida
        const status = needsReview ? 'pending' : 'approved';

        // Validação final do título antes de inserir
        // Remove caracteres inválidos e sanitiza o título de forma mais agressiva
        let finalTitle = transformed.title || '';
        
        // Remove surrogate pairs incompletos (causa do erro \udea7)
        // Surrogate pairs válidos estão entre 0xD800-0xDFFF, mas isolados causam problemas
        finalTitle = finalTitle.replace(/[\uD800-\uDFFF]/g, ''); // Remove todos os surrogate pairs (válidos e inválidos)
        
        // Remove caracteres de substituição e inválidos
        finalTitle = finalTitle.replace(/[\uFFFD\uFFFE\uFFFF]/g, ''); // Remove caracteres de substituição Unicode
        finalTitle = finalTitle.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ''); // Remove caracteres de controle
        finalTitle = finalTitle.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces e BOM
        
        // Remove caracteres inválidos no início e fim
        finalTitle = finalTitle.trim();
        
        // Remove caracteres não-printáveis restantes
        finalTitle = finalTitle.split('').filter(char => {
            const code = char.charCodeAt(0);
            // Mantém apenas caracteres válidos: letras, números, espaços, pontuação e emojis válidos
            return (code >= 32 && code <= 126) || // ASCII printable
                   (code >= 160 && code <= 55295) || // Latin-1 e outros blocos Unicode válidos
                   (code >= 57344 && code <= 65533) || // Mais blocos Unicode válidos
                   (code >= 65536 && code <= 1114111); // Emojis e outros caracteres Unicode válidos (mas não surrogate pairs)
        }).join('');
        
        // Garante que o título não está vazio após sanitização
        if (!finalTitle || finalTitle.length === 0) {
            finalTitle = profile?.username 
                ? `Evento em @${profile.username}` 
                : 'Evento sem título';
        }
        
        // Limita o tamanho do título (máximo 200 caracteres para evitar problemas)
        if (finalTitle.length > 200) {
            finalTitle = finalTitle.substring(0, 197) + '...';
        }
        
        // Validação final: garante que o título é uma string válida e pode ser serializado em JSON
        if (typeof finalTitle !== 'string') {
            finalTitle = String(finalTitle || 'Evento sem título');
        }
        
        // Testa se o título pode ser serializado em JSON (validação final)
        try {
            JSON.stringify(finalTitle);
        } catch (jsonError) {
            console.warn('⚠️  Título não pode ser serializado em JSON, usando fallback');
            finalTitle = profile?.username 
                ? `Evento em @${profile.username}` 
                : 'Evento sem título';
        }

        // Extrai a data de publicação do Instagram (timestamp ou created_time)
        let publishedAt = null;
        if (postData.timestamp) {
            publishedAt = new Date(postData.timestamp).toISOString();
        } else if (postData.created_time) {
            publishedAt = postData.created_time instanceof Date 
                ? postData.created_time.toISOString() 
                : new Date(postData.created_time).toISOString();
        }

        // Função auxiliar para sanitizar strings
        const sanitizeString = (str) => {
            if (!str || typeof str !== 'string') return str;
            let sanitized = str;
            // Remove surrogate pairs incompletos primeiro (causa principal do erro)
            sanitized = sanitized.replace(/[\uD800-\uDFFF]/g, ''); // Remove todos os surrogate pairs
            sanitized = sanitized.replace(/[\uFFFD\uFFFE\uFFFF]/g, ''); // Remove caracteres de substituição Unicode
            sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ''); // Remove caracteres de controle
            sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces e BOM
            
            // Filtra apenas caracteres válidos
            sanitized = sanitized.split('').filter(char => {
                const code = char.charCodeAt(0);
                return (code >= 32 && code <= 126) || 
                       (code >= 160 && code <= 55295) || 
                       (code >= 57344 && code <= 65533) || 
                       (code >= 65536 && code <= 1114111);
            }).join('');
            
            return sanitized.trim();
        };
        
        // Sanitiza a descrição também
        let finalDescription = transformed.description || 'Descrição não disponível';
        finalDescription = sanitizeString(finalDescription) || 'Descrição não disponível';
        
        // Sanitiza o local
        let finalLocation = transformed.location || (profile?.username ? `@${profile.username}` : null);
        if (finalLocation) {
            finalLocation = sanitizeString(finalLocation);
        }
        
        // Sanitiza a legenda original
        let finalCaption = postData.caption || null;
        if (finalCaption) {
            finalCaption = sanitizeString(finalCaption);
        }

        // Validação final antes de inserir
        const eventData = {
            profile_id: profileId,
            title: finalTitle,
            description: finalDescription,
            original_caption: finalCaption,
            date: eventDate,
            published_at: publishedAt,
            location: finalLocation,
            media_url: postData.media_url || null,
            source_url: postData.permalink || null,
            type: 'auto',
            status: status
        };
        
        // Valida que todos os campos obrigatórios estão presentes e são válidos
        if (!eventData.title || typeof eventData.title !== 'string' || eventData.title.length === 0) {
            throw new Error('Título do evento é obrigatório e deve ser uma string não vazia');
        }
        if (!eventData.description || typeof eventData.description !== 'string' || eventData.description.length === 0) {
            eventData.description = 'Descrição não disponível';
        }
        
        // Log dos dados antes de inserir (para debug)
        console.log(`   📝 Tentando criar evento:`, {
            title: eventData.title.substring(0, 50),
            titleLength: eventData.title.length,
            descriptionLength: eventData.description.length,
            hasDate: !!eventData.date,
            hasLocation: !!eventData.location,
            hasMediaUrl: !!eventData.media_url,
            mediaUrl: eventData.media_url ? eventData.media_url.substring(0, 80) + '...' : 'N/A'
        });

        // Cria o evento
        const { data: event, error } = await supabase
            .from('events')
            .insert(eventData)
            .select('*, profile:profiles(*)')
            .single();

        if (error) {
            console.error('   ❌ Erro ao inserir evento no banco:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
                title: eventData.title.substring(0, 50)
            });
            throw error;
        }

        console.log(`✅ Evento criado automaticamente: ${event.title}`);
        
        // Envia notificação push para usuários inscritos (em background, não bloqueia)
        if (status === 'approved') {
            sendNotificationForNewEvent(event).catch(error => {
                console.error('Erro ao enviar notificação (não crítico):', error.message);
            });
        }
        
        return event;
    } catch (error) {
        console.error('Erro ao criar evento a partir do post:', error);
        throw error;
    }
}

/**
 * Cria um evento manualmente
 * @param {Object} eventData - Dados do evento
 * @returns {Promise<Object>} Evento criado
 */
export async function createManualEvent(eventData) {
    try {
        // Valida data se fornecida
        let eventDate = null;
        let status = 'approved'; // Eventos manuais são aprovados por padrão
        
        if (eventData.date) {
            const parsedDate = new Date(eventData.date);
            const now = new Date();
            
            if (parsedDate < now) {
                // Data no passado - marca como pendente
                status = 'pending';
                console.log('⚠️  Evento manual com data no passado, marcado como pendente');
            } else {
                eventDate = parsedDate.toISOString();
            }
        }
        
        const { data: event, error } = await supabase
            .from('events')
            .insert({
                title: eventData.title,
                description: eventData.description,
                original_caption: eventData.original_caption || null,
                date: eventDate,
                location: eventData.location || null,
                media_url: eventData.media_url || null,
                source_url: eventData.source_url || null,
                type: 'manual',
                status: status
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return event;
    } catch (error) {
        console.error('Erro ao criar evento manual:', error);
        throw error;
    }
}

/**
 * Lista todos os eventos com paginação
 * @param {Object} options - Opções de filtro e paginação
 * @returns {Promise<Object>} Lista de eventos e metadados
 */
export async function listEvents(options = {}) {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            profileId,
            status
        } = options;

        // Se status=all, aumenta o limite para buscar todos os eventos
        const effectiveLimit = (status === 'all' && limit < 1000) ? 1000 : limit;
        const skip = (page - 1) * effectiveLimit;

        // Constrói a query (sem ordenação ainda, vamos ordenar depois)
        let query = supabase
            .from('events')
            .select('*, profile:profiles(*)', { count: 'exact' });

        // Aplica filtros
        if (type) {
            query = query.eq('type', type);
        }
        if (profileId) {
            query = query.eq('profile_id', profileId);
        }
        
        // Por padrão, mostra apenas eventos aprovados (a menos que seja admin)
        // Admin pode ver todos via query param ?status=all
        const statusFilter = status || 'approved';
        if (statusFilter !== 'all') {
            // Tenta filtrar por status, mas se o campo não existir, mostra todos
            query = query.eq('status', statusFilter);
        }

        const { data: events, error, count } = await query;

        if (error) {
            // Se o erro for porque a coluna status não existe, retorna todos os eventos
            const errorMessage = error.message || '';
            if (errorMessage.includes('column') || errorMessage.includes('status') || errorMessage.includes('does not exist')) {
                console.warn('⚠️  Campo "status" não existe. Retornando todos os eventos sem filtro de status.');
                // Busca todos os eventos sem filtro de status
                let fallbackQuery = supabase
                    .from('events')
                    .select('*, profile:profiles(*)', { count: 'exact' });
                
                if (type) {
                    fallbackQuery = fallbackQuery.eq('type', type);
                }
                if (profileId) {
                    fallbackQuery = fallbackQuery.eq('profile_id', profileId);
                }
                
                const { data: allEvents, error: fallbackError, count: fallbackCount } = await fallbackQuery;
                
                if (fallbackError) {
                    throw fallbackError;
                }
                
                // Ordena por data de publicação do Instagram (published_at), senão por data do evento (date), senão por created_at
                const sortedEvents = (allEvents || []).sort((a, b) => {
                    const dateA = a.published_at ? new Date(a.published_at).getTime() : 
                                 (a.date ? new Date(a.date).getTime() : new Date(a.created_at).getTime());
                    const dateB = b.published_at ? new Date(b.published_at).getTime() : 
                                 (b.date ? new Date(b.date).getTime() : new Date(b.created_at).getTime());
                    return dateB - dateA; // Descending (mais recente primeiro)
                });
                
                // Se status=all e limite alto, retorna todos os eventos sem paginação
                const paginatedEvents = (status === 'all' && effectiveLimit >= 1000) 
                    ? sortedEvents 
                    : sortedEvents.slice(skip, skip + effectiveLimit);
                
                const totalEventsFallback = fallbackCount || sortedEvents.length;
                console.log(`📊 Backend (fallback): Retornando ${paginatedEvents.length} eventos de ${totalEventsFallback} total (campo status não existe)`);
                
                return {
                    events: paginatedEvents,
                    pagination: {
                        page,
                        limit: effectiveLimit,
                        total: totalEventsFallback,
                        totalPages: (status === 'all' && effectiveLimit >= 1000) ? 1 : Math.ceil(totalEventsFallback / effectiveLimit)
                    }
                };
            }
            throw error;
        }

        // Ordena por data de publicação do Instagram (published_at), senão por data do evento (date), senão por created_at
        // Mais recentes primeiro (descending)
        const sortedEvents = (events || []).sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at).getTime() : 
                         (a.date ? new Date(a.date).getTime() : new Date(a.created_at).getTime());
            const dateB = b.published_at ? new Date(b.published_at).getTime() : 
                         (b.date ? new Date(b.date).getTime() : new Date(b.created_at).getTime());
            return dateB - dateA; // Descending (mais recente primeiro)
        });

        // Aplica paginação após ordenação
        // Se status=all e limite alto, retorna todos os eventos sem paginação
        const paginatedEvents = (status === 'all' && effectiveLimit >= 1000) 
            ? sortedEvents 
            : sortedEvents.slice(skip, skip + effectiveLimit);

        const totalEvents = count || sortedEvents.length;
        console.log(`📊 Backend: Retornando ${paginatedEvents.length} eventos de ${totalEvents} total (status=${statusFilter}, limit=${effectiveLimit})`);
        
        return {
            events: paginatedEvents,
            pagination: {
                page,
                limit: effectiveLimit,
                total: totalEvents,
                totalPages: (status === 'all' && effectiveLimit >= 1000) ? 1 : Math.ceil(totalEvents / effectiveLimit)
            }
        };
    } catch (error) {
        console.error('Erro ao listar eventos:', error);
        throw error;
    }
}

/**
 * Busca um evento por ID
 * @param {string} eventId - ID do evento
 * @returns {Promise<Object>} Evento encontrado
 */
export async function getEventById(eventId) {
    try {
        const { data: event, error } = await supabase
            .from('events')
            .select('*, profile:profiles(*)')
            .eq('id', eventId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error('Evento não encontrado');
            }
            throw error;
        }

        return event;
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        throw error;
    }
}

/**
 * Atualiza um evento
 * @param {string} eventId - ID do evento
 * @param {Object} eventData - Dados para atualizar
 * @returns {Promise<Object>} Evento atualizado
 */
export async function updateEvent(eventId, eventData) {
    try {
        const updateData = {};

        if (eventData.title !== undefined) updateData.title = eventData.title;
        if (eventData.description !== undefined) updateData.description = eventData.description;
        if (eventData.date !== undefined) updateData.date = eventData.date ? new Date(eventData.date).toISOString() : null;
        if (eventData.location !== undefined) updateData.location = eventData.location;
        if (eventData.media_url !== undefined) updateData.media_url = eventData.media_url;
        if (eventData.source_url !== undefined) updateData.source_url = eventData.source_url;
        if (eventData.status !== undefined) updateData.status = eventData.status;
        if (eventData.featured !== undefined) updateData.featured = eventData.featured;

        const { data: event, error } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', eventId)
            .select('*, profile:profiles(*)')
            .single();

        if (error) {
            throw error;
        }

        return event;
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        throw error;
    }
}

/**
 * Deleta um evento
 * @param {string} eventId - ID do evento
 * @returns {Promise<void>}
 */
export async function deleteEvent(eventId) {
    try {
        // Primeiro, busca o evento para obter source_url e profile_id
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('source_url, profile_id')
            .eq('id', eventId)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // Se o evento tem source_url, salva na tabela de excluídos para evitar recriação
        if (event.source_url && event.profile_id) {
            const { error: insertError } = await supabase
                .from('deleted_events')
                .insert({
                    source_url: event.source_url,
                    profile_id: event.profile_id,
                    deleted_at: new Date().toISOString()
                });

            // Se der erro de duplicata, ignora (já está na lista de excluídos)
            if (insertError && !insertError.message.includes('duplicate') && !insertError.message.includes('unique')) {
                console.warn('⚠️  Erro ao salvar evento excluído (continuando exclusão):', insertError.message);
            }
        }

        // Deleta o evento
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        throw error;
    }
}

/**
 * Lista eventos pendentes de aprovação
 * @returns {Promise<Array>} Lista de eventos pendentes
 */
export async function listPendingEvents() {
    try {
        // Primeiro, verifica se o campo status existe tentando uma query simples
        // Se não existir, retorna array vazio
        try {
            const { data: events, error } = await supabase
                .from('events')
                .select('*, profile:profiles(*)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1); // Limita a 1 para testar se a coluna existe

            if (error) {
                // Se o erro for porque a coluna não existe
                if (error.code === '42703' || 
                    error.message?.includes('column') || 
                    error.message?.includes('status') ||
                    error.message?.includes('does not exist')) {
                    console.warn('⚠️  Campo "status" não existe na tabela. Execute a migração SQL primeiro.');
                    console.warn('   Execute o arquivo: adicionar-campo-status.sql');
                    return [];
                }
                throw error;
            }

            // Se passou, busca todos os eventos pendentes
            const { data: allEvents, error: allError } = await supabase
                .from('events')
                .select('*, profile:profiles(*)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (allError) {
                throw allError;
            }

            return allEvents || [];
        } catch (testError) {
            // Se falhar no teste, provavelmente a coluna não existe
            if (testError.code === '42703' || 
                testError.message?.includes('column') || 
                testError.message?.includes('status') ||
                testError.message?.includes('does not exist')) {
                console.warn('⚠️  Campo "status" não existe na tabela. Retornando array vazio.');
                return [];
            }
            throw testError;
        }
    } catch (error) {
        console.error('Erro ao listar eventos pendentes:', error);
        // Se for erro de coluna não encontrada, retorna array vazio
        if (error.code === '42703' || 
            error.message?.includes('column') || 
            error.message?.includes('status') ||
            error.message?.includes('does not exist')) {
            return [];
        }
        throw error;
    }
}

/**
 * Aprova um evento
 * @param {string} eventId - ID do evento
 * @returns {Promise<Object>} Evento aprovado
 */
export async function approveEvent(eventId) {
    try {
        // Verifica se o campo status existe antes de tentar atualizar
        const updateData = { status: 'approved' };
        
        const { data: event, error } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', eventId)
            .select('*, profile:profiles(*)')
            .single();

        if (error) {
            // Se o erro for porque a coluna não existe
            const errorMessage = error.message || '';
            if (errorMessage.includes('column') || errorMessage.includes('status') || errorMessage.includes('does not exist')) {
                throw new Error('Campo "status" não existe na tabela. Execute a migração SQL primeiro.');
            }
            throw error;
        }

        return event;
    } catch (error) {
        console.error('Erro ao aprovar evento:', error);
        throw error;
    }
}

/**
 * Rejeita um evento
 * @param {string} eventId - ID do evento
 * @returns {Promise<Object>} Evento rejeitado
 */
export async function rejectEvent(eventId) {
    try {
        const { data: event, error } = await supabase
            .from('events')
            .update({ status: 'rejected' })
            .eq('id', eventId)
            .select('*, profile:profiles(*)')
            .single();

        if (error) {
            // Se o erro for porque a coluna não existe
            const errorMessage = error.message || '';
            if (errorMessage.includes('column') || errorMessage.includes('status') || errorMessage.includes('does not exist')) {
                throw new Error('Campo "status" não existe na tabela. Execute a migração SQL primeiro.');
            }
            throw error;
        }

        return event;
    } catch (error) {
        console.error('Erro ao rejeitar evento:', error);
        throw error;
    }
}
