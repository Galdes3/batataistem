/**
 * ⚠️ AVISO: Web Scraping viola os Termos de Serviço do Instagram
 * Use apenas como fallback quando a API oficial não estiver disponível
 * Este código é fornecido apenas para fins educacionais
 */

import puppeteer from 'puppeteer';

// Rate limiting: máximo de requisições por minuto
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minuto
  requests: []
};

/**
 * Limpa requisições antigas do rate limit
 */
function cleanRateLimit() {
  const now = Date.now();
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
    time => now - time < RATE_LIMIT.windowMs
  );
}

/**
 * Verifica se pode fazer requisição (rate limiting)
 */
function canMakeRequest() {
  cleanRateLimit();
  return RATE_LIMIT.requests.length < RATE_LIMIT.maxRequests;
}

/**
 * Registra uma requisição
 */
function recordRequest() {
  RATE_LIMIT.requests.push(Date.now());
}

/**
 * Aguarda antes de fazer requisição (rate limiting)
 */
async function waitForRateLimit() {
  while (!canMakeRequest()) {
    const oldestRequest = Math.min(...RATE_LIMIT.requests);
    const waitTime = RATE_LIMIT.windowMs - (Date.now() - oldestRequest);
    if (waitTime > 0) {
      console.log(`⏳ Rate limit: aguardando ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    cleanRateLimit();
  }
  recordRequest();
}

/**
 * Busca posts de um perfil usando scraping (método 1: via página pública)
 * @param {string} username - Username do perfil (sem @)
 * @param {number} limit - Número máximo de posts
 * @returns {Promise<Array>} Array de posts
 */
export async function getProfilePostsViaScraping(username, limit = 25) {
  if (!puppeteer) {
    throw new Error('Puppeteer não está instalado. Instale com: npm install puppeteer');
  }
  console.warn('⚠️  Usando web scraping (não oficial) para buscar posts');
  console.warn('⚠️  Isso pode violar os Termos de Serviço do Instagram');
  
  await waitForRateLimit();

  let browser;
  try {
    // Remove @ se presente
    const cleanUsername = username.replace('@', '');
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

    console.log(`🔍 Acessando perfil via scraping: ${profileUrl}`);

    // Configurar Puppeteer
    browser = await puppeteer.launch({
      headless: 'new', // Usar novo modo headless
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    
    // Simular navegador real
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1920, height: 1080 });

    // Acessar perfil
    await page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Aguardar carregamento do conteúdo
    await page.waitForTimeout(5000);

    // Extrair dados da página - tentar múltiplos métodos
    const posts = await page.evaluate((maxPosts) => {
      const posts = [];
      
      // Método 1: Buscar JSON embutido nos scripts
      const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
      
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          
          // Tentar diferentes estruturas de dados
          let media = null;
          
          // Estrutura 1: entry_data.ProfilePage
          if (data.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media) {
            media = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media;
          }
          // Estrutura 2: graphql direto
          else if (data.graphql?.user?.edge_owner_to_timeline_media) {
            media = data.graphql.user.edge_owner_to_timeline_media;
          }
          // Estrutura 3: require
          else if (data.require?.[0]?.[3]?.graphql?.user?.edge_owner_to_timeline_media) {
            media = data.require[0][3].graphql.user.edge_owner_to_timeline_media;
          }
          
          if (media?.edges && media.edges.length > 0) {
            for (const edge of media.edges.slice(0, maxPosts)) {
              const node = edge.node;
              posts.push({
                id: node.id || node.shortcode || `scraped_${node.shortcode}`,
                caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                media_url: node.display_url || node.thumbnail_src || node.display_resources?.[0]?.src,
                permalink: `https://www.instagram.com/p/${node.shortcode}/`,
                timestamp: node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : new Date().toISOString(),
                media_type: node.is_video ? 'VIDEO' : 'IMAGE'
              });
            }
            break; // Se encontrou posts, para de procurar
          }
        } catch (e) {
          // Continuar tentando outros scripts
        }
      }
      
      // Método 2: Se não encontrou, tentar buscar em todos os scripts
      if (posts.length === 0) {
        const allScripts = Array.from(document.querySelectorAll('script'));
        for (const script of allScripts) {
          const text = script.textContent || '';
          if (text.includes('edge_owner_to_timeline_media') || text.includes('"graphql"')) {
            try {
              // Tentar extrair JSON completo
              const jsonMatch = text.match(/\{[\s\S]*"edge_owner_to_timeline_media"[\s\S]*\}/);
              if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                let media = data.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media ||
                           data.graphql?.user?.edge_owner_to_timeline_media;
                
                if (media?.edges) {
                  for (const edge of media.edges.slice(0, maxPosts)) {
                    const node = edge.node;
                    posts.push({
                      id: node.id || node.shortcode || `scraped_${node.shortcode}`,
                      caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                      media_url: node.display_url || node.thumbnail_src,
                      permalink: `https://www.instagram.com/p/${node.shortcode}/`,
                      timestamp: node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : new Date().toISOString(),
                      media_type: node.is_video ? 'VIDEO' : 'IMAGE'
                    });
                  }
                  break;
                }
              }
            } catch (e) {
              // Continuar tentando
            }
          }
        }
      }
      
      // Método 3: Tentar extrair de elementos HTML (último recurso)
      if (posts.length === 0) {
        const articleElements = document.querySelectorAll('article a[href*="/p/"]');
        if (articleElements.length > 0) {
          console.log('Encontrados elementos HTML, mas não foi possível extrair dados completos');
        }
      }
      
      return posts;
    }, limit);

    await browser.close();

    if (posts.length === 0) {
      // Tentar método alternativo: verificar se perfil é privado
      console.warn('⚠️  Nenhum post encontrado via scraping');
      console.warn('   Possíveis causas:');
      console.warn('   - Perfil privado');
      console.warn('   - Instagram mudou o formato da página');
      console.warn('   - Perfil não existe ou foi removido');
      throw new Error('Nenhum post encontrado. O perfil pode ser privado, não existir, ou o formato do Instagram mudou.');
    }

    console.log(`✅ Encontrados ${posts.length} post(s) via scraping`);
    
    // Formatar posts no mesmo formato da API
    return posts.map(post => ({
      id: post.id,
      caption: post.caption || '',
      media_type: post.media_type || 'IMAGE',
      media_url: post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      created_time: new Date(post.timestamp)
    }));

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Erro no scraping:', error.message);
    throw new Error(`Erro ao fazer scraping: ${error.message}`);
  }
}

/**
 * Busca informações básicas de um perfil via scraping
 * @param {string} username - Username do perfil
 * @returns {Promise<Object>} Informações do perfil
 */
export async function getProfileInfoViaScraping(username) {
  await waitForRateLimit();

  let browser;
  try {
    const cleanUsername = username.replace('@', '');
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    const profileInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      
      for (const script of scripts) {
        const text = script.textContent || '';
        if (text.includes('"graphql"') || text.includes('"ProfilePage"')) {
          try {
            const jsonMatch = text.match(/\{.*"graphql".*\}/s);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              const user = data.entry_data?.ProfilePage?.[0]?.graphql?.user || 
                          data.graphql?.user;
              
              if (user) {
                return {
                  id: user.id,
                  username: user.username
                };
              }
            }
          } catch (e) {
            // Continuar tentando
          }
        }
      }
      return null;
    });

    await browser.close();

    if (!profileInfo) {
      throw new Error('Não foi possível extrair informações do perfil');
    }

    return profileInfo;

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`Erro ao buscar perfil via scraping: ${error.message}`);
  }
}

