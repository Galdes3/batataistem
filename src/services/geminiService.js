import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let cachedModelName = null; // Cache do nome do modelo que funciona

/**
 * Inicializa o cliente do Gemini
 */
function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurado no .env');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * Lista os modelos disponíveis na API do Gemini
 * @returns {Promise<Array<string>>} Lista de nomes de modelos disponíveis
 */
async function listAvailableModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return [];
    }

    // Importa axios como fallback se fetch não estiver disponível
    let fetchFn = globalThis.fetch;
    if (!fetchFn) {
      try {
        const axios = (await import('axios')).default;
        fetchFn = async (url) => {
          const response = await axios.get(url);
          return {
            ok: response.status >= 200 && response.status < 300,
            json: async () => response.data
          };
        };
      } catch (e) {
        console.warn('⚠️  fetch não disponível e axios não encontrado');
        return [];
      }
    }

    // Usa a API REST diretamente para listar modelos
    const response = await fetchFn(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!response.ok) {
      console.warn('⚠️  Não foi possível listar modelos disponíveis (status:', response.status, ')');
      return [];
    }

    const data = await response.json();
    const models = data.models || [];
    
    // Filtra apenas modelos que suportam generateContent
    const availableModels = models
      .filter(model => {
        const methods = model.supportedGenerationMethods || [];
        return methods.includes('generateContent');
      })
      .map(model => model.name.replace('models/', ''))
      .sort();

    return availableModels;
  } catch (error) {
    console.warn('⚠️  Erro ao listar modelos disponíveis:', error.message);
    return [];
  }
}

/**
 * Encontra o melhor modelo disponível
 * @returns {Promise<string|null>} Nome do modelo ou null se nenhum estiver disponível
 */
async function findAvailableModel() {
  // Se já temos um modelo em cache que funciona, usa ele
  if (cachedModelName) {
    return cachedModelName;
  }

  // Lista de modelos para tentar, em ordem de preferência
  // Baseado nos modelos disponíveis: 2.0 e 2.5
  const preferredModels = [
    'gemini-2.5-flash',        // Modelo estável mais recente
    'gemini-2.5-pro',          // Modelo pro mais recente
    'gemini-2.0-flash-001',    // Versão estável do 2.0
    'gemini-2.0-flash',        // Versão experimental do 2.0
    'gemini-2.5-flash-lite',   // Versão lite do 2.5
    'gemini-2.0-flash-lite-001', // Versão lite estável do 2.0
    'gemini-2.0-flash-lite',   // Versão lite experimental do 2.0
    // Fallback para modelos antigos (caso estejam disponíveis)
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  try {
    // Tenta listar modelos disponíveis
    const availableModels = await listAvailableModels();
    
    if (availableModels.length > 0) {
      console.log(`📋 Modelos disponíveis: ${availableModels.slice(0, 5).join(', ')}${availableModels.length > 5 ? '...' : ''}`);
      
      // Procura o primeiro modelo preferido que está disponível
      for (const preferred of preferredModels) {
        if (availableModels.includes(preferred)) {
          cachedModelName = preferred;
          console.log(`✅ Usando modelo: ${preferred}`);
          return preferred;
        }
      }
      
      // Se nenhum modelo preferido está disponível, usa o primeiro disponível
      cachedModelName = availableModels[0];
      console.log(`✅ Usando primeiro modelo disponível: ${availableModels[0]}`);
      return availableModels[0];
    }
  } catch (error) {
    console.warn('⚠️  Erro ao encontrar modelo disponível:', error.message);
  }

  // Fallback: tenta os modelos preferidos diretamente
  console.log('⚠️  Não foi possível listar modelos, tentando modelos padrão...');
  return preferredModels[0]; // Retorna o primeiro da lista como fallback
}

/**
 * Transforma uma legenda do Instagram em uma legenda formatada para eventos
 * @param {string} originalCaption - Legenda original do post
 * @param {string} profileUsername - Username do perfil do Instagram (opcional, usado para gerar título)
 * @param {string} imageText - Texto extraído da imagem via OCR (opcional)
 * @returns {Promise<Object>} Objeto com título, descrição, data e local extraídos
 */
export async function transformCaption(originalCaption, profileUsername = null, imageText = null) {
  try {
    if (!originalCaption || originalCaption.trim().length === 0) {
      return {
        title: 'Evento sem título',
        description: 'Descrição não disponível',
        date: null,
        location: null
      };
    }

    const genAI = initializeGemini();
    
    // Encontra o melhor modelo disponível
    const modelName = await findAvailableModel();
    
    if (!modelName) {
      throw new Error('Nenhum modelo do Gemini está disponível');
    }

    const model = genAI.getGenerativeModel({ model: modelName });

    // Gera contexto do perfil para melhorar o título
    const profileContext = profileUsername ? `\n\nPerfil do Instagram: @${profileUsername}` : '';
    
    // Adiciona texto extraído da imagem se disponível
    const imageTextContext = imageText && imageText.trim().length > 0 
        ? `\n\nTEXTO EXTRAÍDO DA IMAGEM (via OCR):\n${imageText}\n\nUse este texto da imagem para melhorar a detecção do nome do evento, data e local.`
        : '';
    
    // Obter ano atual para validação
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const prompt = `Você é um assistente especializado em formatar eventos de Batatais-SP. Transforme esta legenda do Instagram em um formato padronizado e profissional.

REGRAS DE FORMATAÇÃO:
1. TÍTULO: OBRIGATÓRIO - Máximo 60 caracteres. SEMPRE gere um título válido baseado na legenda E no nome do perfil do Instagram. Se o perfil for um estabelecimento (ex: @deck_sportbar), use o nome do estabelecimento no título quando relevante. Seja direto e chamativo. Use maiúsculas apenas para palavras-chave importantes. Se não conseguir identificar o tipo de evento, use o nome do perfil: "Evento em [Nome do Perfil]". NUNCA retorne título vazio ou null.
2. DESCRIÇÃO: Formate com emojis e quebras de linha. Use esta estrutura:
   - Primeira linha: Tipo de evento (ex: "🎉 FESTA", "🍻 HAPPY HOUR", "🎵 MÚSICA AO VIVO")
   - Segunda linha: Data e horário (se disponível)
   - Terceira linha: Local e endereço (se disponível)
   - Linhas seguintes: Descrição do evento, benefícios, preços, etc.
   - Última linha: Hashtags relevantes (máximo 5)
3. DATA: EXTRAÇÃO CRÍTICA - Detecte datas nos seguintes formatos:
   - "Quarta, 20/03" → 2025-03-20T20:00:00 (assumir horário padrão 20h se não especificado)
   - "Sábado agora, 12 de Dezembro" → 2025-12-12T20:00:00
   - "Dia 23, a partir das 22h" → 2025-12-23T22:00:00 (usar mês atual se não especificado)
   - "10/12/2025" → 2025-12-10T20:00:00
   - "Amanhã" → Calcular para o dia seguinte
   - "Hoje" → Data de hoje
   - Se a data detectada for no passado (antes de hoje), retorne null
   - Se a data for muito antiga (antes de 2024), retorne null
   - Formato de saída: ISO (YYYY-MM-DDTHH:mm:ss) ou null
4. LOCAL: Nome do estabelecimento ou endereço completo

VALIDAÇÃO DE DATA:
- Ano atual: ${currentYear}
- Mês atual: ${currentMonth}
- Se a data extraída for anterior a hoje, retorne null
- Se a data for anterior a 2024, retorne null (muito antiga)
- Se não conseguir detectar data clara, retorne null

EXEMPLO DE FORMATO:
{
  "title": "Happy Hour no Deck Sport Bar",
  "description": "🍻 HAPPY HOUR\n🗓️ Terça-feira, 10/12/2025 - 18h às 22h\n📍 Deck Sport Bar - Av. Prefeito Washington Luís, 987\n✅ Chopp Antarctica R$ 6,99 a noite toda\n📞 Reservas: (16) 99387-1594\n\n#HappyHour #DeckSportBar #Batatais",
  "date": "2025-12-10T18:00:00",
  "location": "Deck Sport Bar - Av. Prefeito Washington Luís, 987"
}

Legenda original:
${originalCaption}${profileContext}${imageTextContext}

IMPORTANTE:
- TÍTULO É OBRIGATÓRIO: Sempre retorne um título válido, mesmo que seja genérico como "Evento em [Nome do Perfil]"
- Use o nome do perfil do Instagram para enriquecer o título quando fizer sentido
- Mantenha informações importantes (preços, horários, contatos)
- Use emojis relevantes (🎉 🍻 🎵 ⛪ 📍 🗓️ ✅ 📞)
- Seja conciso mas informativo
- VALIDAÇÃO DE DATA É CRÍTICA: Se não tiver certeza da data ou se for no passado, retorne null
- Se não houver local detectado, use o nome do perfil do Instagram (ex: "@deck_sportbar") como local
- NUNCA retorne JSON com título vazio, null ou string vazia

Responda APENAS em formato JSON válido, sem texto adicional.`;

    let result, response, text;
    try {
      result = await model.generateContent(prompt);
      response = await result.response;
      text = response.text();
    } catch (modelError) {
      // Se o modelo falhar (404 ou outro erro), limpa o cache e tenta encontrar outro
      if (modelError.message && (modelError.message.includes('404') || modelError.message.includes('not found'))) {
        console.warn(`⚠️  Modelo ${modelName} não encontrado, procurando alternativas...`);
        cachedModelName = null; // Limpa o cache
        
        // Tenta encontrar outro modelo
        const altModelName = await findAvailableModel();
        if (altModelName && altModelName !== modelName) {
          try {
            const altModel = genAI.getGenerativeModel({ model: altModelName });
            result = await altModel.generateContent(prompt);
            response = await result.response;
            text = response.text();
            console.log(`✅ Modelo alternativo ${altModelName} funcionou!`);
          } catch (e2) {
            throw modelError; // Re-lança o erro original se o alternativo também falhar
          }
        } else {
          throw modelError; // Re-lança o erro se não encontrar alternativa
        }
      } else {
        throw modelError;
      }
    }

    // Tenta extrair JSON da resposta
    let jsonText = text.trim();
    
    // Remove markdown code blocks se existirem
    if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    // Tenta fazer parse do JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      // Se falhar, tenta extrair JSON do texto
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Não foi possível extrair JSON da resposta da IA');
      }
    }

    // Valida e formata a resposta
    let title = parsed.title || '';
    
    // Se o título estiver vazio ou muito curto, tenta gerar um título melhor
    if (!title || title.trim().length < 3) {
      // Tenta extrair um título da legenda original
      title = generateTitleFromCaption(originalCaption, profileUsername);
    }
    
    // Garante que sempre há um título válido
    if (!title || title.trim().length === 0) {
      title = profileUsername 
        ? `Evento em @${profileUsername}` 
        : 'Evento sem título';
    }

    const transformed = {
      title: title.trim(),
      description: parsed.description || originalCaption,
      date: parsed.date ? new Date(parsed.date) : null,
      location: parsed.location || null
    };

    return transformed;
  } catch (error) {
    console.error('Erro ao transformar legenda com Gemini:', error.message || error);
    
    // Se todos os modelos falharam, usa fallback
    console.warn('⚠️  Gemini não disponível, usando fallback para gerar título');
    
    // Tenta gerar um título da legenda original mesmo em caso de erro
    const fallbackTitle = generateTitleFromCaption(originalCaption, profileUsername);
    
    // Retorna valores padrão em caso de erro
    return {
      title: fallbackTitle || (profileUsername ? `Evento em @${profileUsername}` : 'Evento sem título'),
      description: originalCaption || 'Descrição não disponível',
      date: null,
      location: null
    };
  }
}

/**
 * Gera um título a partir da legenda original quando o Gemini não retorna título válido
 * @param {string} caption - Legenda original do post
 * @param {string} profileUsername - Username do perfil (opcional)
 * @returns {string} Título gerado
 */
function generateTitleFromCaption(caption, profileUsername = null) {
  if (!caption || caption.trim().length === 0) {
    return profileUsername ? `Evento em @${profileUsername}` : 'Evento sem título';
  }

  // Remove hashtags e menções no início
  let text = caption.trim();
  text = text.replace(/^[@#]\w+\s*/g, '');
  
  // Pega as primeiras palavras (até 60 caracteres)
  const words = text.split(/\s+/);
  let title = '';
  
  for (const word of words) {
    if ((title + ' ' + word).length <= 60) {
      title += (title ? ' ' : '') + word;
    } else {
      break;
    }
  }
  
  // Se o título ficou muito curto, tenta pegar mais palavras
  if (title.length < 10 && words.length > 0) {
    title = words.slice(0, 8).join(' ');
  }
  
  // Remove emojis excessivos e caracteres especiais no início
  title = title.replace(/^[🎉🎊🎈🎁🎂🎃🎄🎅🎆🎇🎪🎭🎨🎬🎤🎧🎼🎹🎸🎺🎷🎻🥁🎲🎯🎳🎮🎰🚀]+/g, '');
  title = title.trim();
  
  // Se ainda estiver vazio, usa o nome do perfil
  if (!title || title.length < 3) {
    if (profileUsername) {
      // Tenta criar um título baseado no username
      const usernameFormatted = profileUsername
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      return `Evento em ${usernameFormatted}`;
    }
    return 'Evento sem título';
  }
  
  // Capitaliza a primeira letra
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Limita a 60 caracteres
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  
  return title;
}

/**
 * Testa a conexão com a API do Gemini
 * @returns {Promise<boolean>}
 */
export async function testGeminiConnection() {
  try {
    const genAI = initializeGemini();
    const modelName = await findAvailableModel();
    
    if (!modelName) {
      console.error('❌ Nenhum modelo do Gemini está disponível');
      return false;
    }
    
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Teste');
    console.log(`✅ Conexão com Gemini OK usando modelo: ${modelName}`);
    return result !== null;
  } catch (error) {
    console.error('❌ Erro ao testar conexão com Gemini:', error.message);
    return false;
  }
}

