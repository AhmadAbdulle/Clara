/* global process */
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history, logExcerpt, analysisSummary } = req.body;

  // Validation
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message input must be a non-empty string.' });
  }

  if (!Array.isArray(history)) {
    return res.status(400).json({ error: 'History must be an array of message objects.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    return res.status(500).json({ error: 'Anthropic API key is not configured on the server.' });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Format the system prompt with log excerpt and analysis summary
    const systemPrompt = `You are CLARA, an expert cyber security analyst assistant. You are helping a user investigate a log file. You have already performed an initial analysis. Answer questions clearly, reference specific evidence from the log when relevant, and be direct. If asked about something not in the log, say so.

Current log excerpt:
[LOG_EXCERPT]
${logExcerpt || 'No log provided.'}
[LOG_EXCERPT]

Initial analysis summary:
[ANALYSIS_SUMMARY]
${analysisSummary || 'No analysis summary available.'}
[ANALYSIS_SUMMARY]`;

    // Map roles to match Anthropic API (e.g. 'user' and 'assistant')
    const formattedMessages = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Append the new message
    formattedMessages.push({
      role: 'user',
      content: message
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const reply = response.content[0].text;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Error calling Anthropic API in chat:', err);
    return res.status(500).json({ error: `Upstream failure: ${err.message}` });
  }
}
