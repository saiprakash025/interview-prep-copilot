
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt({ companyName, jdText, counts }) {
  const { aptitude = 5, technical = 7, hr = 3 } = counts || {};

  return `You are helping a final-year Indian CS student prepare for a placement interview.

Company: ${companyName}
Job description:
"""
${jdText}
"""

Generate exactly ${aptitude} aptitude questions, ${technical} technical questions, and ${hr} HR/behavioural questions tailored to this specific role and company — infer likely focus areas from the JD (e.g. specific tech stack, domain, seniority level) rather than generic questions.

Each question needs a difficulty rating (easy, medium, hard) reflecting what's realistic for this role level.

Respond with ONLY raw JSON, no markdown code fences, no explanation text before or after. Exact schema:
{
  "questions": [
    { "text": "...", "category": "aptitude" | "technical" | "hr", "difficulty": "easy" | "medium" | "hard" }
  ]
}`;
}

async function generateQuestions({ companyName, jdText, counts }) {
  const prompt = buildPrompt({ companyName, jdText, counts });

  const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json' 
      }
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini returned no text content');
  }

  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('LLM returned malformed JSON: ' + err.message);
  }

  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('LLM response missing questions array');
  }

  return parsed.questions;
}

module.exports = { generateQuestions, buildPrompt };
