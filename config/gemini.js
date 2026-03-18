const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
// Make sure you have created a .env file with GEMINI_API_KEY=your_key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;
