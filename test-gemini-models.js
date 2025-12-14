/**
 * Script para testar e listar modelos disponíveis do Gemini
 * Execute: node test-gemini-models.js
 */

import dotenv from 'dotenv';
dotenv.config();

async function testGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY não configurado no .env');
    process.exit(1);
  }

  console.log('🔍 Listando modelos disponíveis do Gemini...\n');

  try {
    // Lista modelos usando a API REST
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!response.ok) {
      console.error(`❌ Erro ao listar modelos: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Resposta:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    const models = data.models || [];
    
    console.log(`✅ Total de modelos encontrados: ${models.length}\n`);
    
    // Filtra modelos que suportam generateContent
    const availableModels = models
      .filter(model => {
        const methods = model.supportedGenerationMethods || [];
        return methods.includes('generateContent');
      })
      .map(model => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName || 'N/A',
        description: model.description || 'N/A',
        methods: model.supportedGenerationMethods || []
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`📋 Modelos que suportam generateContent: ${availableModels.length}\n`);
    
    availableModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display: ${model.displayName}`);
      console.log(`   Descrição: ${model.description.substring(0, 80)}...`);
      console.log(`   Métodos: ${model.methods.join(', ')}`);
      console.log('');
    });

    // Testa alguns modelos preferidos
    console.log('\n🧪 Testando modelos preferidos...\n');
    
    const preferredModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash-001',
      'gemini-2.0-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite-001',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of preferredModels) {
      if (availableModels.some(m => m.name === modelName)) {
        try {
          console.log(`✅ Testando ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('Teste');
          const response = await result.response;
          const text = response.text();
          console.log(`   ✅ ${modelName} FUNCIONA! Resposta: "${text.substring(0, 50)}..."\n`);
        } catch (error) {
          console.log(`   ❌ ${modelName} FALHOU: ${error.message}\n`);
        }
      } else {
        console.log(`⚠️  ${modelName} não está disponível\n`);
      }
    }

    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao testar modelos:', error);
    process.exit(1);
  }
}

testGeminiModels();

