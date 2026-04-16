const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testGemini20() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY not found in .env");
    return;
  }

  console.log("Testing with API Key:", apiKey.substring(0, 5) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try gemini-2.0-flash
  const modelName = "gemini-2.0-flash";
  console.log(`🚀 Testing model: ${modelName}`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = "Explain in 3 words why AI is good for recruitment.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Success!");
    console.log("Response:", text);
    console.log(`\nModel ${modelName} is WORKING and ready for implementation.`);
  } catch (error) {
    console.error(`❌ Failed to test ${modelName}:`, error.message);
    
    console.log("\nAttempting fallback to gemini-1.5-flash...");
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await fallbackModel.generateContent("Test");
      console.log("✅ Fallback gemini-1.5-flash is WORKING.");
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError.message);
    }
  }
}

testGemini20();
