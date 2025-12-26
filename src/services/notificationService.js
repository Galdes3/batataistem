/**
 * Serviço de Notificações Push
 * Gerencia subscriptions e envia notificações para usuários
 */

import webpush from 'web-push';
import { supabase } from '../utils/supabaseClient.js';

let vapidKeys = null;

/**
 * Inicializa ou obtém VAPID keys
 */
function getVapidKeys() {
  if (vapidKeys) {
    return vapidKeys;
  }

  // Tenta obter do .env
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (publicKey && privateKey) {
    vapidKeys = {
      publicKey,
      privateKey
    };
    
    // Configura web-push com as keys
    webpush.setVapidDetails(
      'mailto:contato@batataistem.com.br',
      publicKey,
      privateKey
    );
    
    return vapidKeys;
  }

  // Se não tiver no .env, gera novas keys (apenas para desenvolvimento)
  console.warn('⚠️  VAPID keys não configuradas. Gerando keys temporárias...');
  console.warn('   Configure VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY no .env');
  
  vapidKeys = webpush.generateVAPIDKeys();
  
  webpush.setVapidDetails(
    'mailto:contato@batataistem.com.br',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  console.log('📋 VAPID Keys geradas (use estas no .env):');
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);

  return vapidKeys;
}

/**
 * Salva subscription de um usuário
 * @param {Object} subscription - Subscription do usuário
 * @returns {Promise<string>} ID da subscription salva
 */
export async function saveSubscription(subscription) {
  try {
    getVapidKeys(); // Garante que VAPID está configurado

    // Salva subscription no banco de dados
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({
        subscription: JSON.stringify(subscription),
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      // Se a tabela não existir, apenas loga o erro
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('⚠️  Tabela push_subscriptions não existe. Criando...');
        // Tenta criar a tabela (será criada manualmente via SQL)
        console.warn('   Execute o SQL em prisma/create_push_subscriptions_table.sql');
        return null;
      }
      throw error;
    }

    console.log('✅ Subscription salva:', data.id);
    return data.id;
  } catch (error) {
    console.error('Erro ao salvar subscription:', error);
    throw error;
  }
}

/**
 * Envia notificação para todos os usuários inscritos
 * @param {Object} notificationData - Dados da notificação
 * @returns {Promise<Object>} Resultado do envio
 */
export async function sendNotificationToAll(notificationData) {
  try {
    getVapidKeys();

    // Busca todas as subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, subscription');

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('⚠️  Tabela push_subscriptions não existe. Pulando notificação.');
        return { sent: 0, failed: 0 };
      }
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️  Nenhuma subscription encontrada');
      return { sent: 0, failed: 0 };
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Envia notificação para cada subscription
    const promises = subscriptions.map(async (sub) => {
      try {
        const subscription = JSON.parse(sub.subscription);
        
        await webpush.sendNotification(
          subscription,
          JSON.stringify(notificationData)
        );
        
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({ id: sub.id, error: error.message });
        
        // Se subscription inválida, remove do banco
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`🗑️  Removendo subscription inválida: ${sub.id}`);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
        }
      }
    });

    await Promise.all(promises);

    console.log(`📤 Notificações enviadas: ${results.sent} sucesso, ${results.failed} falhas`);
    return results;
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    throw error;
  }
}

/**
 * Obtém VAPID public key
 * @returns {string} VAPID public key
 */
export function getVapidPublicKey() {
  const keys = getVapidKeys();
  return keys.publicKey;
}

/**
 * Envia notificação de novo evento
 * @param {Object} event - Dados do evento
 * @returns {Promise<Object>} Resultado do envio
 */
export async function notifyNewEvent(event) {
  const notificationData = {
    title: '🎉 Novo Evento em Batatais-SP!',
    body: event.title || 'Confira o novo evento disponível',
    icon: event.media_url || '/icon-192.png',
    badge: '/icon-192.png',
    tag: `event-${event.id}`,
    data: {
      url: `/evento/${event.id}`,
      eventId: event.id
    },
    requireInteraction: false
  };

  return await sendNotificationToAll(notificationData);
}

/**
 * Envia notificação de evento próximo
 * @param {Object} event - Dados do evento
 * @param {number} hoursUntil - Horas até o evento
 * @returns {Promise<Object>} Resultado do envio
 */
export async function notifyUpcomingEvent(event, hoursUntil = 24) {
  const notificationData = {
    title: `⏰ Evento em ${hoursUntil}h: ${event.title || 'Evento'}`,
    body: event.location 
      ? `${event.location} - ${new Date(event.date).toLocaleDateString('pt-BR')}`
      : new Date(event.date).toLocaleDateString('pt-BR'),
    icon: event.media_url || '/icon-192.png',
    badge: '/icon-192.png',
    tag: `upcoming-${event.id}`,
    data: {
      url: `/evento/${event.id}`,
      eventId: event.id
    },
    requireInteraction: false
  };

  return await sendNotificationToAll(notificationData);
}









