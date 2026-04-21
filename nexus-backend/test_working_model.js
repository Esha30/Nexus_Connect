import 'dotenv/config';

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    
    // Filter models that support generateContent
    const validModels = data.models.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
    ).map(m => m.name.replace('models/', ''));
    
    console.log('Valid models for generateContent:', validModels);
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    for (const modelName of validModels) {
      if (modelName.includes('veo') || modelName.includes('imagen') || modelName.includes('embedding') || modelName.includes('aqa') || modelName.includes('robotics') || modelName.includes('audio')) continue;
      
      try {
        console.log(`Trying ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Respond with 'OK'");
        console.log(`Success with ${modelName}:`, await result.response.text());
        return; // Stop on first success
      } catch (e) {
        console.error(`Failed ${modelName}:`, e.message);
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}
test();
