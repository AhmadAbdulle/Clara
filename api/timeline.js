/* global process */
import Anthropic from '@anthropic-ai/sdk';

// TOKEN BUDGET NOTE: This endpoint executes Phase 2 (deep analysis).
// It has a strict max_tokens of 1500 to keep responses fast and minimize cost.
// By taking Phase 1 summary and finding titles as context, it avoids needing to
// perform initial log analysis from scratch, saving significant input tokens.
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

  const { log, summary, findingsTitles } = req.body;

  // Validation
  if (!log || typeof log !== 'string') {
    return res.status(400).json({ error: 'Log input must be a non-empty string.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    return res.status(500).json({ error: 'Anthropic API key is not configured on the server.' });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a threat analyst. Reconstruct the attack timeline and kill chain stages based on the log and Phase 1 context.
Phase 1 context summary: "${summary || ''}"
Phase 1 findings titles: ${JSON.stringify(findingsTitles || [])}

Return a JSON object with this exact shape:
{
  "timeline": [
    {
      "bucket": "string — time label e.g. 14:00",
      "count": number,
      "highestSeverity": "Critical|High|Medium|Low"
    }
  ],
  "attackTimeline": [
    {
      "stage": "Reconnaissance|Initial Access|Execution|Persistence|Privilege Escalation|Defence Evasion|Credential Access|Discovery|Lateral Movement|Collection|Exfiltration|Command and Control|Impact",
      "mitrePhase": "string — MITRE ATT&CK Phase ID e.g. TA0043",
      "description": "string — very brief description, max 15 words",
      "timestamp": "string — earliest timestamp from the log evidence at this stage, or null if unavailable",
      "severity": "Critical|High|Medium|Low",
      "evidenceLines": ["exact log line 1", "exact log line 2"],
      "techniques": ["T1595", "T1592"]
    }
  ]
}

Instructions:
- Only include stages that are actually evidenced in the log. Do not invent stages.
- Order stages and timeline buckets chronologically.
- Limit attackTimeline stages to at most 6 stages. Keep descriptions concise.
- Do not wrap in markdown or explanation. Return JSON only.`;

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

    let timelineResult;
    try {
      timelineResult = JSON.parse(cleanJsonText);
    } catch (parseErr) {
      console.error('Failed to parse Anthropic JSON response:', responseText, parseErr);
      return res.status(500).json({
        error: 'Failed to parse structured JSON from upstream AI model.',
        rawResponse: responseText,
      });
    }

    return res.status(200).json(timelineResult);
  } catch (err) {
    console.error('Error calling Anthropic API:', err);
    return res.status(500).json({ error: `Upstream failure: ${err.message}` });
  }
}
