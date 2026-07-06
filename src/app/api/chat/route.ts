import { streamText } from 'ai';
import { createAzure } from '@ai-sdk/azure';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, mode = 'general', quizStyle = 'freeform' } = await req.json();

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

  if (!endpoint || !key || !deployment || !apiVersion) {
    return new Response(JSON.stringify({ error: 'Missing Azure OpenAI environment variables.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const resourceName = endpoint.replace(/^https:\/\//, '').replace(/\.openai\.azure\.com\/?$/, '');

  const azure = createAzure({
    resourceName,
    apiKey: key,
    apiVersion,
  });

  const result = streamText({
    model: azure(deployment),
    system: `You are Maya, a brilliant and encouraging GCSE Biology coach. You help with GCSE Biology only. Be warm, concise, and clear. If the user asks for a quiz, ask one question at a time and grade the next answer. If the user mentions options like A/B/C or yes/no, understand them as choices and evaluate them carefully. If quizStyle is options, offer multiple-choice answers and treat short answers like A, B, C, or D as option selections. Maintain context across turns and be highly useful like a premium AI tutor.`,
    messages,
    temperature: 0.8,
    maxTokens: 700,
    onFinish({ text }) {
      if (mode === 'quiz') {
        // optional hook for analytics or quiz state extension
      }
    },
  });

  return result.toDataStreamResponse();
}
