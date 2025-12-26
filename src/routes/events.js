import express from 'express';
import * as eventService from '../services/eventService.js';

const router = express.Router();

/**
 * POST /events/manual
 * Cria um evento manualmente
 */
router.post('/manual', async (req, res, next) => {
  try {
    const { title, description, date, location, media_url, source_url, original_caption } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: 'Campos obrigatórios: title, description'
      });
    }

    const event = await eventService.createManualEvent({
      title,
      description,
      date,
      location,
      media_url,
      source_url,
      original_caption
    });

    res.status(201).json({
      message: 'Evento criado manualmente com sucesso',
      event
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /events
 * Lista todos os eventos com paginação e filtros
 * Query params: page, limit, type, profileId
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, type, profileId, status } = req.query;

    const result = await eventService.listEvents({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      type,
      profileId,
      status: status || 'approved' // Por padrão, só eventos aprovados
    });

    res.json(result);
  } catch (error) {
    // Tratamento de erro de conexão/DNS com Supabase
    if (error.message && (
      error.message.includes('fetch failed') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('getaddrinfo') ||
      error.details?.includes('ENOTFOUND') ||
      error.details?.includes('getaddrinfo')
    )) {
      console.error('❌ Erro de conexão com Supabase (DNS):', error.message);
      return res.status(503).json({
        error: 'Serviço temporariamente indisponível',
        message: 'Não foi possível conectar ao banco de dados. Verifique se o projeto Supabase está ativo.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Se o erro for porque o campo status não existe, retorna todos os eventos
    if (error.message && (error.message.includes('column') || error.message.includes('status') || error.message.includes('does not exist'))) {
      console.warn('⚠️  Campo "status" não existe. Retornando todos os eventos.');
      try {
        const result = await eventService.listEvents({
          page: req.query.page ? parseInt(req.query.page) : 1,
          limit: req.query.limit ? parseInt(req.query.limit) : 20,
          type: req.query.type,
          profileId: req.query.profileId,
          status: 'all' // Força mostrar todos
        });
        return res.json(result);
      } catch (fallbackError) {
        return next(fallbackError);
      }
    }
    next(error);
  }
});

/**
 * GET /events/:id
 * Busca um evento específico
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Evita processar rotas especiais como "pending" como ID
    if (id === 'pending') {
      return next(); // Passa para a próxima rota
    }
    
    const event = await eventService.getEventById(id);
    res.json({ event });
  } catch (error) {
    // Se o evento não for encontrado, retorna 404 em vez de 500
    if (error.message && error.message.includes('não encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PUT /events/:id
 * Atualiza um evento
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    const event = await eventService.updateEvent(id, eventData);
    res.json({
      message: 'Evento atualizado com sucesso',
      event
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /events/:id
 * Deleta um evento
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);
    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /events/pending
 * Lista eventos pendentes de aprovação (admin)
 */
router.get('/pending', async (req, res, next) => {
  try {
    const events = await eventService.listPendingEvents();
    res.json({ events, count: events.length });
  } catch (error) {
    // Tratamento de erro de conexão/DNS com Supabase
    if (error.message && (
      error.message.includes('fetch failed') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('getaddrinfo') ||
      error.details?.includes('ENOTFOUND') ||
      error.details?.includes('getaddrinfo')
    )) {
      console.error('❌ Erro de conexão com Supabase (DNS):', error.message);
      return res.status(503).json({
        error: 'Serviço temporariamente indisponível',
        message: 'Não foi possível conectar ao banco de dados. Verifique se o projeto Supabase está ativo.',
        events: [],
        count: 0
      });
    }
    
    // Se o erro for porque o campo status não existe, retorna array vazio
    if (error.message && (error.message.includes('column') || error.message.includes('status') || error.message.includes('does not exist'))) {
      console.warn('⚠️  Campo "status" não existe. Retornando array vazio.');
      return res.json({ events: [], count: 0 });
    }
    next(error);
  }
});

/**
 * POST /events/:id/approve
 * Aprova um evento (admin)
 */
router.post('/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.approveEvent(id);
    res.json({ message: 'Evento aprovado com sucesso', event });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /events/:id/reject
 * Rejeita um evento (admin)
 */
router.post('/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.rejectEvent(id);
    res.json({ message: 'Evento rejeitado', event });
  } catch (error) {
    next(error);
  }
});

export default router;

