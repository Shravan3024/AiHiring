const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testV3(modelName) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`🚀 Testing V3+: ${modelName}`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Give a 1-sentence expert recruitment tip.");
    const text = result.response.text();
    console.log(`✅ SUCCESS [${modelName}]: ${text}`);
  } catch (error) {
    console.error(`❌ FAILED [${modelName}]: ${error.message}`);
  }
}

async function run() {
    await testV3("gemini-3.1-flash-live-preview");
    // Also check for a 3.0 if it exists in the list (I'll check the list first)
}

run();
