const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function findModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.models) {
        console.error("No models found. Response:", data);
        return;
    }

    const versions = ["1.5", "2.0", "2.5", "3.1"];
    versions.forEach(v => {
        const found = data.models.filter(m => m.name.includes(v) && m.name.includes("flash"));
        console.log(`\n--- Version ${v} Flash Models ---`);
        found.forEach(m => console.log(m.name));
    });

  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

findModels();
