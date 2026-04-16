const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function compareModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-2.5-flash", "gemini-3.1-flash-lite-preview"];

  for (const m of models) {
    console.log(`🚀 Testing: ${m}`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("List 2 key traits of a great leader.");
      const text = result.response.text();
      console.log(`✅ [${m}] Response: ${text.substring(0, 100)}...`);
    } catch (e) {
      console.error(`❌ [${m}] Error: ${e.message}`);
    }
  }
}

compareModels();
