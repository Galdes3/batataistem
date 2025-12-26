import express from 'express';
import * as profileService from '../services/profileService.js';

const router = express.Router();

/**
 * POST /profiles
 * Cadastra um novo perfil do Instagram para monitoramento
 */
router.post('/', async (req, res, next) => {
  try {
    const { username, instagram_id, url } = req.body;

    if (!username || !instagram_id || !url) {
      return res.status(400).json({
        error: 'Campos obrigatórios: username, instagram_id, url'
      });
    }

    const profile = await profileService.createProfile({
      username,
      instagram_id,
      url
    });

    res.status(201).json({
      message: 'Perfil cadastrado com sucesso',
      profile
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /profiles
 * Lista todos os perfis cadastrados
 */
router.get('/', async (req, res, next) => {
  try {
    const profiles = await profileService.listProfiles();
    res.json({ profiles });
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
        profiles: []
      });
    }
    next(error);
  }
});

/**
 * GET /profiles/:id
 * Busca um perfil específico
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await profileService.getProfileById(id);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /profiles/:id
 * Deleta um perfil
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await profileService.deleteProfile(id);
    res.json({ message: 'Perfil deletado com sucesso' });
  } catch (error) {
    next(error);
  }
});

export default router;

