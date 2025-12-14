/**
 * Rotas para receber posts manualmente
 * Permite que estabelecimentos enviem seus próprios posts
 */

import express from 'express';
import { createEventFromPost } from '../services/eventService.js';
import { supabase } from '../utils/supabaseClient.js';

const router = express.Router();

/**
 * POST /manual/submit-post
 * Permite que estabelecimentos enviem posts manualmente
 * Body: {
 *   profile_id: "uuid",
 *   caption: "texto",
 *   media_url: "url",
 *   permalink: "url",
 *   date: "ISO string"
 * }
 */
router.post('/submit-post', async (req, res, next) => {
  try {
    const { profile_id, caption, media_url, permalink, date } = req.body;

    if (!profile_id || !caption || !media_url) {
      return res.status(400).json({
        error: 'Campos obrigatórios: profile_id, caption, media_url'
      });
    }

    // Verificar se perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profile_id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Perfil não encontrado'
      });
    }

    // Criar post no formato esperado
    const post = {
      id: `manual_${Date.now()}`,
      caption: caption,
      media_type: media_url.includes('.mp4') || media_url.includes('video') ? 'VIDEO' : 'IMAGE',
      media_url: media_url,
      permalink: permalink || `https://www.instagram.com/p/manual_${Date.now()}/`,
      timestamp: date || new Date().toISOString(),
      created_time: new Date(date || Date.now())
    };

    // Criar evento
    await createEventFromPost(post, profile_id);

    res.json({
      message: 'Post enviado com sucesso',
      post: post
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /manual/profiles
 * Lista perfis disponíveis para envio manual
 */
router.get('/profiles', async (req, res, next) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, instagram_id')
      .order('username');

    if (error) {
      throw error;
    }

    res.json({
      profiles: profiles || []
    });
  } catch (error) {
    next(error);
  }
});

export default router;

