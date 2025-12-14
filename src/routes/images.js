/**
 * Rotas para proxy de imagens
 * Resolve problemas de CORS ao carregar imagens do Instagram
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * GET /images/proxy
 * Proxy para imagens externas (resolve CORS)
 * Query param: url (URL da imagem)
 */
router.get('/proxy', async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'Parâmetro "url" é obrigatório'
      });
    }

    // Valida que é uma URL válida
    let imageUrl;
    try {
      imageUrl = decodeURIComponent(url);
      new URL(imageUrl); // Valida que é uma URL válida
    } catch (e) {
      return res.status(400).json({
        error: 'URL inválida'
      });
    }

    // Valida que é uma URL do Instagram ou domínio permitido
    const allowedDomains = [
      'instagram.com',
      'fbcdn.net',
      'cdninstagram.com',
      'scontent-',
      'scontent.cdninstagram.com'
    ];

    const isAllowed = allowedDomains.some(domain => imageUrl.includes(domain));
    
    if (!isAllowed) {
      return res.status(403).json({
        error: 'Domínio não permitido'
      });
    }

    console.log(`📸 Proxying imagem: ${imageUrl.substring(0, 100)}...`);

    // Busca a imagem
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 10000, // 10 segundos
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });

    // Define headers apropriados
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Stream da imagem
    response.data.pipe(res);

  } catch (error) {
    console.error('❌ Erro ao fazer proxy da imagem:', error.message);
    
    if (error.response) {
      // Se a imagem retornou erro (404, 403, etc)
      return res.status(error.response.status).json({
        error: 'Erro ao buscar imagem',
        message: error.response.statusText
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Timeout ao buscar imagem'
      });
    }

    next(error);
  }
});

export default router;

