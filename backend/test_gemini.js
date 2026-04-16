require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ Error: GEMINI_API_KEY is not defined in your .env file.');
      process.exit(1);
    }
    
    console.log("-----------------------------------------------------");
    console.log('🔄 Extracted API Key (first 5 chars):', apiKey.substring(0, 5) + '...');
    console.log('🔄 Attempting to initialize Gemini model...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('🔄 Sending test prompt: "Hello, reply with exactly: API Key is working!"');
    
    const result = await model.generateContent('Hello, reply with exactly: API Key is working!');
    const response = await result.response;
    const text = response.text().trim();
    
    console.log("-----------------------------------------------------");
    console.log('✅ Success! Gemini Responded:');
    console.log('   =>', text);
    console.log("-----------------------------------------------------");
    console.log('✅ Your Gemini API Key is ACTIVE and fully functional.');
  } catch (error) {
    console.log("-----------------------------------------------------");
    console.error('❌ FAILED to use Gemini API Key.');
    console.error('Reason:', error.message);
    if (error.message.includes('API key not valid') || error.message.includes('403')) {
        console.error('💡 Recommendation: Your API key might be expired, restricted, or completely invalid. Get a new one from Google AI Studio.');
    }
  }
}

testGemini();
