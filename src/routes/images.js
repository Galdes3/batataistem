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

    // Headers mais completos para parecer um navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.instagram.com/',
      'Origin': 'https://www.instagram.com',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };

    // Tentar buscar a imagem com retry
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await axios.get(imageUrl, {
          responseType: 'stream',
          timeout: 15000, // 15 segundos
          headers: attempt === 1 ? headers : {
            ...headers,
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${120 + attempt}.0.0.0 Safari/537.36`
          },
          maxRedirects: 5,
          validateStatus: (status) => status < 500 // Aceita 4xx mas não 5xx
        });
        break; // Sucesso, sai do loop
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.log(`⚠️ Tentativa ${attempt} falhou, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff exponencial
        }
      }
    }

    // Se todas as tentativas falharam
    if (!response) {
      throw lastError || new Error('Falha ao buscar imagem após múltiplas tentativas');
    }

    // Define headers apropriados
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Stream da imagem
    response.data.pipe(res);

  } catch (error) {
    console.error(`❌ Erro ao fazer proxy da imagem ${imageUrl?.substring(0, 100)}...:`, error.message);
    
    if (error.response) {
      const status = error.response.status;
      console.error(`   Status: ${status}, Headers:`, error.response.headers);
      
      // Para 403 (Forbidden), retornar um status específico que o frontend pode detectar
      if (status === 403) {
        // Retornar uma imagem placeholder SVG em vez de JSON
        const placeholderSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#f0f0f0"/>
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="16" fill="#999">
            Imagem não disponível
          </text>
        </svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-cache');
        return res.status(200).send(placeholderSvg);
      }
      
      // Para outros erros HTTP, retornar JSON
      return res.status(status).json({
        error: 'Erro ao buscar imagem',
        message: error.response.statusText,
        status: status
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Timeout ao buscar imagem'
      });
    }

    // Para outros erros, retornar placeholder
    const placeholderSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="16" fill="#999">
        Erro ao carregar imagem
      </text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(placeholderSvg);
  }
});

export default router;

