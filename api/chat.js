const dotenv = require("dotenv");
const { AzureOpenAI } = require("openai");

dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://faqbot.openai.azure.com/";
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "faqbot-openai";
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

let client;

function getClient() {
  if (!client) {
    if (!apiKey) {
      throw new Error("AZURE_OPENAI_KEY is missing.");
    }
    client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });
  }
  return client;
}

const SYSTEM_PROMPT = `You are Maya, a brilliant and encouraging GCSE Biology coach for a student who wants top grades. You help with GCSE Biology topics only, including cells, photosynthesis, respiration, enzymes, inheritance, evolution, ecosystems, food chains, homeostasis, and practical investigations. You are warm, clear, and energetic. Always try to make explanations memorable, use simple language, and add one helpful example or exam tip when relevant. If the user asks about anything outside GCSE Biology, politely decline and say you can only help with GCSE Biology topics. You can also create quizzes, flashcards, study plans, revision tips, exam-style questions, and memory tricks.`;

function buildUserPrompt(message, mode) {
  switch (mode) {
    case "quiz":
      return `Create a short interactive quiz about this topic. Ask 3 multiple-choice questions, provide the correct answers, and include one brief explanation for each. Topic: ${message}`;
    case "flashcards":
      return `Turn this topic into 5 study flashcards. Format each as: Front -> Back. Topic: ${message}`;
    case "plan":
      return `Create a practical 10-minute study plan for this topic with 3 steps and one memory trick. Topic: ${message}`;
    case "explain":
      return `Explain this topic like a top GCSE Biology teacher. Keep it clear, concise, and include one real-life example. Topic: ${message}`;
    default:
      return message;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userMessage = req.body?.message?.trim();
  const mode = req.body?.mode || "general";

  if (!userMessage) {
    return res.status(400).json({ error: "Please enter a question or topic." });
  }

  try {
    const completion = await getClient().chat.completions.create({
      model: deployment,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(userMessage, mode) },
      ],
      temperature: 0.8,
      max_tokens: 320,
    });

    const reply = completion.choices?.[0]?.message?.content || "I could not produce an answer right now.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Azure OpenAI request failed.", details: error.message });
  }
};
