import Groq from "groq-sdk";

let cachedGroqClient = null;
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }
  if (cachedGroqClient) return cachedGroqClient;
  cachedGroqClient = new Groq({ apiKey });
  return cachedGroqClient;
};

export const analyzeResumeText = async (text, hints = {}) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const systemPrompt = "You are a precise information extraction assistant. Extract from resume-like text the following fields as strict JSON: { full_name: string|null, college: string|null, most_recent_company: string|null, top_skills: string[] }. Prefer exact spans from the text. If not confidently present, use null or []. Return ONLY JSON.";

  const userPrompt = `Resume text (truncated):\n\n${text}\n\nCandidate hints (may be incomplete or wrong): ${JSON.stringify(hints)}\n\nRules:\n- Output ONLY valid JSON matching the schema.\n- If a hint is present, verify against the text; do not invent.`;

  const groqClient = getGroqClient();
  const response = await groqClient.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    temperature: 0,
    max_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices?.[0]?.message?.content?.trim() || "";
  try {
    const parsed = JSON.parse(content);
    return {
      full_name: parsed.full_name ?? null,
      college: parsed.college ?? null,
      most_recent_company: parsed.most_recent_company ?? null,
      top_skills: Array.isArray(parsed.top_skills) ? parsed.top_skills : [],
    };
  } catch (err) {
    return {
      full_name: null,
      college: null,
      most_recent_company: null,
      top_skills: [],
      raw: content,
      error: "Failed to parse JSON from model",
    };
  }
};

const aiService = { analyzeResumeText };

export default aiService;

