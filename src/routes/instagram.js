import express from 'express';
import { syncAllProfiles } from '../jobs/syncProfiles.js';

const router = express.Router();

/**
 * POST /instagram/sync
 * Força sincronização manual de todos os perfis cadastrados
 */
router.post('/sync', async (req, res, next) => {
  try {
    console.log('🔄 Iniciando sincronização manual...');
    
    const result = await syncAllProfiles();
    
    res.json({
      message: 'Sincronização concluída',
      result: {
        profilesProcessed: result.profilesProcessed,
        eventsCreated: result.eventsCreated,
        errors: result.errors
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /instagram/test
 * Testa a conexão com a API do Instagram
 */
router.get('/test', async (req, res, next) => {
  try {
    const { validateAccessToken } = await import('../services/instagramService.js');
    const validation = await validateAccessToken();
    
    if (!validation.valid) {
      return res.status(400).json({
        connected: false,
        message: validation.error || 'Token do Instagram inválido',
        details: validation.details,
        solution: 'Gere um novo token em: https://developers.facebook.com/tools/explorer/',
        steps: [
          '1. Acesse Graph API Explorer',
          '2. Selecione seu app',
          '3. Use "Generate Instagram Access Token"',
          '4. Selecione permissões: instagram_basic, pages_read_engagement',
          '5. Copie o token e atualize no .env',
          '6. Reinicie o servidor'
        ]
      });
    }
    
    res.json({
      connected: true,
      message: 'Conexão com Instagram API OK',
      account: validation.details
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message,
      solution: 'Verifique INSTAGRAM_ACCESS_TOKEN no .env e gere um novo token se necessário'
    });
  }
});

/**
 * POST /instagram/exchange-token
 * Troca um token de curta duração por um de longa duração (60 dias)
 * Body: { shortLivedToken: "token_aqui" }
 */
router.post('/exchange-token', async (req, res, next) => {
  try {
    const { exchangeForLongLivedToken } = await import('../services/instagramService.js');
    const { shortLivedToken } = req.body;
    
    if (!shortLivedToken) {
      return res.status(400).json({
        error: 'shortLivedToken é obrigatório no body'
      });
    }
    
    const result = await exchangeForLongLivedToken(shortLivedToken);
    
    res.json({
      message: 'Token trocado com sucesso! Válido por 60 dias.',
      longLivedToken: result.access_token,
      expiresIn: result.expires_in,
      expiresAt: result.expires_at,
      instruction: 'Atualize INSTAGRAM_ACCESS_TOKEN no .env com o novo token'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      solution: 'Certifique-se de que INSTAGRAM_APP_SECRET está configurado no .env'
    });
  }
});

export default router;

