/**
 * Service Worker para PWA e Notificações Push
 * Versão: 1.0.0
 */

const CACHE_NAME = 'batataistem-v1';
const RUNTIME_CACHE = 'batataistem-runtime-v1';

// Arquivos para cache estático
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando arquivos estáticos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[Service Worker] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Estratégia: Network First, depois Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora requisições de API (sempre busca na rede)
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/events') ||
      event.request.url.includes('/profiles') ||
      event.request.url.includes('/instagram')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta é válida, cacheia e retorna
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, tenta buscar no cache
        return caches.match(event.request);
      })
  );
});

// Notificações Push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificação push recebida');
  
  let notificationData = {
    title: 'Novo Evento em Batatais-SP!',
    body: 'Confira os eventos mais recentes',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'new-event',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  // Se a notificação veio com dados customizados
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (e) {
      // Se não for JSON, usa como texto
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'Ver Evento'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    })
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada');
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    // Abre ou foca na janela do app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Se já tem uma janela aberta, foca nela
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          // Se não tem, abre nova janela
          if (clients.openWindow) {
            const url = event.notification.data?.url || '/';
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Sincronização em background (para quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-events') {
    event.waitUntil(
      // Aqui você pode adicionar lógica para sincronizar eventos
      // quando o dispositivo voltar online
      Promise.resolve()
    );
  }
});









