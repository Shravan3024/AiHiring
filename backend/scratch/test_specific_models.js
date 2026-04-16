const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testModel(modelName) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`🚀 Testing: ${modelName}`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'System Operational'");
    const text = result.response.text();
    console.log(`✅ SUCCESS: ${text}`);
  } catch (error) {
    console.error(`❌ FAILED: ${error.message}`);
  }
}

async function run() {
    await testModel("gemini-2.5-flash");
    await testModel("gemini-2.0-flash");
}

run();
