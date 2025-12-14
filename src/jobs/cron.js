import cron from 'node-cron';
import { syncAllProfiles } from './syncProfiles.js';

/**
 * Inicia os jobs cron configurados
 */
export function startCronJobs() {
  // Obtém o schedule do .env ou usa padrão (a cada 6 horas)
  const schedule = process.env.CRON_SCHEDULE || '0 */6 * * *';

  console.log(`⏰ Configurando job cron com schedule: ${schedule}`);

  // Job para sincronizar perfis automaticamente
  cron.schedule(schedule, async () => {
    console.log('\n🔄 [CRON] Iniciando sincronização automática...');
    const startTime = Date.now();
    
    try {
      const result = await syncAllProfiles();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`✅ [CRON] Sincronização concluída em ${duration}s`);
      console.log(`   - Eventos criados: ${result.eventsCreated}`);
    } catch (error) {
      console.error('❌ [CRON] Erro na sincronização automática:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
  });

  console.log('✅ Jobs cron configurados e rodando');
}

