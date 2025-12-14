/**
 * Script para atualizar eventos existentes com a data do post original
 * Executa uma vez para corrigir eventos já criados
 */

import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './src/utils/supabaseClient.js';

async function atualizarDatasEventos() {
  console.log('🔄 Iniciando atualização de datas dos eventos...\n');

  try {
    // Buscar todos os eventos sem data
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('id, source_url, created_at')
      .is('date', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    if (!events || events.length === 0) {
      console.log('✅ Todos os eventos já têm data configurada!');
      return;
    }

    console.log(`📊 Encontrados ${events.length} evento(s) sem data\n`);

    // Para eventos sem data, usar created_at como fallback
    // (já que não temos como recuperar o timestamp original do Instagram)
    let atualizados = 0;
    for (const event of events) {
      // Usa created_at como data do evento (melhor que null)
      const { error: updateError } = await supabase
        .from('events')
        .update({ date: event.created_at })
        .eq('id', event.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar evento ${event.id}:`, updateError.message);
      } else {
        atualizados++;
        console.log(`✅ Evento ${event.id} atualizado com data: ${event.created_at}`);
      }
    }

    console.log(`\n✅ Atualização concluída: ${atualizados} de ${events.length} evento(s) atualizado(s)`);
    console.log('\n💡 Para eventos futuros, a data será preenchida automaticamente com o timestamp do post original.');

  } catch (error) {
    console.error('❌ Erro ao atualizar datas:', error);
    process.exit(1);
  }
}

atualizarDatasEventos();

