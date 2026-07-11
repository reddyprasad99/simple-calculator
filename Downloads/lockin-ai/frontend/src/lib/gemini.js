const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function geminiGenerate({ apiKey, model = 'gemini-2.5-flash-lite', prompt, system, json = false }) {
  if (!apiKey) throw new Error('Missing Gemini API key. Add it in Settings.');
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetch(`${GEMINI_URL}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} — ${err.slice(0, 240)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  return text;
}

export async function analyzeResume({ apiKey, model, text }) {
  const system = `You are an expert technical recruiter and interview coach. Return ONLY valid JSON.`;
  const prompt = `Analyze this resume and return JSON with this exact shape:
{
  "role": "most likely target role (short)",
  "years_experience": "estimated years like '3-5' or 'entry'",
  "skills": ["skill1", "skill2", ...max 12],
  "strengths": ["short bullet", ...max 4],
  "gaps": ["short bullet", ...max 3],
  "questions": [
    { "q": "behavioural or technical question", "type": "behavioural|technical|system-design|coding", "difficulty": "easy|medium|hard" },
    ...exactly 8 questions tailored to this resume
  ]
}

RESUME TEXT:
${text.slice(0, 12000)}`;
  const raw = await geminiGenerate({ apiKey, model, prompt, system, json: true });
  try { return JSON.parse(raw); }
  catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Gemini returned unparseable JSON');
  }
}

export async function whisperAnswer({ apiKey, model, question, prefs, resumeContext }) {
  const lenRule = prefs?.answerLength === 'auto'
    ? 'Choose the ideal length (1–5 lines) based on the question complexity.'
    : `Answer in EXACTLY ${prefs.answerLength} line(s).`;
  const system = `You are a real-time interview whisper assistant. Deliver the sharpest possible answer as if the candidate is speaking. Confident, structured, no filler. ${lenRule}`;
  const ctx = resumeContext ? `\n\nCANDIDATE CONTEXT:\n${resumeContext.slice(0, 1500)}` : '';
  const prompt = `Interview question: "${question}"${ctx}\n\nAnswer now.`;
  return await geminiGenerate({ apiKey, model, prompt, system });
}
