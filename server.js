// IMPORTANTE: Carregar .env ANTES de qualquer outra importação
import dotenv from 'dotenv';
dotenv.config();

// Verificar configuração do Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERRO: Configuração do Supabase incompleta');
    console.error('📝 Verifique se SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env');
    console.error('📝 Obtenha essas chaves em: Supabase Dashboard → Settings → API');
    process.exit(1);
}

// Inicializar cliente Supabase (será inicializado ao importar)
import './src/utils/supabaseClient.js';
import { supabase } from './src/utils/supabaseClient.js';

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { startCronJobs } from './src/jobs/cron.js';
import profileRoutes from './src/routes/profiles.js';
import eventRoutes from './src/routes/events.js';
import instagramRoutes from './src/routes/instagram.js';
import notificationRoutes from './src/routes/notifications.js';
import imageRoutes from './src/routes/images.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema de eventos Batatais-SP está funcionando' });
});

// Função auxiliar para escapar HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Rota raiz - serve a página principal
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Rota para página Sobre
app.get('/sobre', (req, res) => {
  const filePath = join(__dirname, 'public', 'sobre.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erro ao servir sobre.html:', err);
      res.status(404).json({ error: 'Página não encontrada' });
    }
  });
});

// Rota para compartilhamento social - retorna HTML com meta tags Open Graph e Schema.org
app.get('/evento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca o evento com o perfil
    const { data: event, error } = await supabase
      .from('events')
      .select('*, profile:profiles(*)')
      .eq('id', id)
      .single();
    
    if (error || !event) {
      // Se não encontrar, redireciona para a página principal
      return res.redirect('/');
    }
    
    // Prepara os dados para as meta tags
    const title = event.title || 'Evento em Batatais-SP';
    const description = event.description ? event.description.replace(/<[^>]*>/g, '').substring(0, 200) : 'Confira este evento em Batatais-SP';
    const image = event.media_url || `${req.protocol}://${req.get('host')}/og-image.jpg`;
    const url = `${req.protocol}://${req.get('host')}/evento/${id}`;
    const siteUrl = `${req.protocol}://${req.get('host')}`;
    const location = event.location || 'Batatais-SP';
    const date = event.date ? new Date(event.date).toISOString() : null;
    const dateFormatted = event.date ? new Date(event.date).toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
    
    // Schema.org JSON-LD para Event
    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": title,
      "description": description,
      "image": image,
      "url": url,
      "startDate": date || undefined,
      "location": {
        "@type": "Place",
        "name": location,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Batatais",
          "addressRegion": "SP",
          "addressCountry": "BR"
        }
      },
      "organizer": event.profile ? {
        "@type": "Organization",
        "name": `@${event.profile.username}`,
        "url": event.source_url || undefined
      } : undefined
    };
    
    // Remove propriedades undefined do schema
    Object.keys(schemaOrg).forEach(key => {
      if (schemaOrg[key] === undefined) delete schemaOrg[key];
    });
    if (schemaOrg.organizer && !schemaOrg.organizer.url) {
      delete schemaOrg.organizer.url;
    }
    
    // HTML com meta tags Open Graph e Schema.org
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO -->
    <title>${escapeHtml(title)} - Batataistem</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="evento Batatais, ${escapeHtml(location)}, festa Batatais-SP">
    <link rel="canonical" href="${url}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta property="og:site_name" content="Batataistem">
    <meta property="og:locale" content="pt_BR">
    ${date ? `<meta property="event:start_time" content="${date}">` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
    
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaOrg, null, 2)}
    </script>
    
    <!-- Redirect para a página principal com o evento -->
    <meta http-equiv="refresh" content="0;url=${siteUrl}?event=${id}">
    <script>
        window.location.href = '${siteUrl}?event=${id}';
    </script>
</head>
<body>
    <p>Carregando evento... <a href="${siteUrl}?event=${id}">Clique aqui se não redirecionar</a></p>
</body>
</html>`;
    
    res.send(html);
  } catch (error) {
    console.error('Erro ao gerar página de compartilhamento:', error);
    res.redirect('/');
  }
});

// Sitemap.xml - Gera dinamicamente
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Busca todos os eventos aprovados (ou todos se campo status não existir)
    let { data: events, error } = await supabase
      .from('events')
      .select('id, updated_at, date, created_at, status')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    // Filtra por status se o campo existir e tiver dados
    if (events && events.length > 0 && events[0].hasOwnProperty('status')) {
      events = events.filter(e => e.status === 'approved' || !e.status);
    }
    
    if (error) {
      console.error('Erro ao buscar eventos para sitemap:', error);
    }
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
    
    // Adiciona eventos ao sitemap
    if (events && events.length > 0) {
      events.forEach(event => {
        const lastmod = event.updated_at 
          ? new Date(event.updated_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        const priority = event.date && new Date(event.date) > new Date() ? '0.8' : '0.6';
        
        sitemap += `
  <url>
    <loc>${baseUrl}/evento/${event.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
      });
    }
    
    sitemap += `
</urlset>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    res.status(500).send('Erro ao gerar sitemap');
  }
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;
  
  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

// Routes
app.use('/profiles', profileRoutes);
app.use('/events', eventRoutes);
app.use('/instagram', instagramRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/images', imageRoutes);

// Importar rota manual dinamicamente
import manualRoutes from './src/routes/manual.js';
app.use('/manual', manualRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: Supabase Client ✅`);
  
  // Inicia os jobs cron
  startCronJobs();
  console.log('⏰ Jobs cron iniciados');
});

export default app;

