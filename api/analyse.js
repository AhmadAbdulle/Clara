/* global process */
import Anthropic from '@anthropic-ai/sdk';

// TOKEN BUDGET NOTE: This endpoint executes Phase 1 (fast analysis).
// It has a strict max_tokens of 1500 to keep responses fast (5-10 seconds)
// and minimize cost. Only core findings and metadata are returned.
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

  const { log } = req.body;

  // Validation
  if (!log || typeof log !== 'string') {
    return res.status(400).json({ error: 'Log input must be a non-empty string.' });
  }

  if (log.length > 50000) {
    return res.status(400).json({ error: 'Log input exceeds the maximum length of 50,000 characters.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    return res.status(500).json({ error: 'Anthropic API key is not configured on the server.' });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a threat analyst. Analyze the log and return a JSON object only. Do not wrap in explanation.
JSON shape:
{
  "summary": "2-3 sentence summary",
  "riskScore": number 0-100,
  "stats": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number,
    "totalEvents": number,
    "suspiciousIPs": ["ip1"]
  },
  "findings": [
    {
      "id": "unique string",
      "severity": "Critical|High|Medium|Low",
      "confidence": "High|Medium|Low",
      "mitreTactic": "string",
      "mitreTechniqueId": "string e.g. T1190",
      "attackType": "string",
      "title": "string",
      "description": "very brief description, max 15 words",
      "evidenceLine": "exact log line",
      "remediation": "very brief action, max 15 words"
    }
  ]
}
Return at most 6 findings. Prioritize the most critical/high severity findings. Keep all text descriptions short and concise.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000, // Larger token budget to prevent response truncation and JSON parsing errors
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Log to analyse:\n[LOG]\n${log}\n[LOG]`,
        },
      ],
    });

    const responseText = response.content[0].text.trim();

    // Clean markdown code blocks if the model wrapped the JSON in it
    let cleanJsonText = responseText;
    if (cleanJsonText.startsWith('```')) {
      const jsonStart = cleanJsonText.indexOf('{');
      const jsonEnd = cleanJsonText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanJsonText = cleanJsonText.substring(jsonStart, jsonEnd + 1);
      }
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanJsonText);
    } catch (parseErr) {
      console.error('Failed to parse Anthropic JSON response:', responseText, parseErr);
      return res.status(500).json({
        error: 'Failed to parse structured JSON from upstream AI model.',
        rawResponse: responseText,
      });
    }

    return res.status(200).json(analysisResult);
  } catch (err) {
    console.error('Error calling Anthropic API:', err);
    return res.status(500).json({ error: `Upstream failure: ${err.message}` });
  }
}
