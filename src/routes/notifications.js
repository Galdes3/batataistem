import express from 'express';
import * as notificationService from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /notifications/vapid-public-key
 * Retorna a chave pública VAPID para o frontend
 */
router.get('/vapid-public-key', (req, res) => {
  try {
    const publicKey = notificationService.getVapidPublicKey();
    res.json({ publicKey });
  } catch (error) {
    console.error('Erro ao obter VAPID public key:', error);
    res.status(500).json({ error: 'Erro ao obter chave pública' });
  }
});

/**
 * POST /notifications/subscribe
 * Salva subscription de um usuário
 */
router.post('/subscribe', async (req, res, next) => {
  try {
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription inválida' });
    }

    const subscriptionId = await notificationService.saveSubscription(subscription);
    
    res.json({
      message: 'Subscription salva com sucesso',
      id: subscriptionId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /notifications/test
 * Envia notificação de teste para todos os usuários
 */
router.post('/test', async (req, res, next) => {
  try {
    const result = await notificationService.sendNotificationToAll({
      title: '🧪 Teste de Notificação',
      body: 'Esta é uma notificação de teste do Batataistem!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test',
      data: {
        url: '/'
      }
    });

    res.json({
      message: 'Notificação de teste enviada',
      result
    });
  } catch (error) {
    next(error);
  }
});

export default router;



