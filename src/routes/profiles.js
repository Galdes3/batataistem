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

