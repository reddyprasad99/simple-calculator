const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function geminiGenerate({ apiKey, model = 'gemini-flash-lite-latest', prompt, system, json = false }) {
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

export async function analyzeResume({ apiKey, model, text, notes }) {
  const system = `You are an expert technical recruiter and interview coach. Return ONLY valid JSON.`;
  const notesBlock = notes?.trim() ? `\n\nCANDIDATE'S OWN PROJECT NOTES (use these for extra depth — specific implementation details, decisions, metrics the candidate wants to be able to speak to):\n${notes.trim().slice(0, 6000)}` : '';
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
If project notes are provided below, weave in 2-3 questions that specifically probe the details in those notes (implementation choices, trade-offs, metrics).

RESUME TEXT:
${text.slice(0, 12000)}${notesBlock}`;
  const raw = await geminiGenerate({ apiKey, model, prompt, system, json: true });
  try { return JSON.parse(raw); }
  catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Gemini returned unparseable JSON');
  }
}

export async function whisperAnswer({ apiKey, model, question, prefs, resumeContext, notes }) {
  const lenRule = prefs?.answerLength === 'auto'
    ? 'Choose the ideal length (1–5 lines) based on the question complexity.'
    : `Answer in EXACTLY ${prefs.answerLength} line(s).`;
  const system = `You are a real-time interview whisper assistant. Deliver the sharpest possible answer as if the candidate is speaking. Confident, structured, no filler. ${lenRule}`;
  const ctx = resumeContext ? `\n\nCANDIDATE RESUME CONTEXT:\n${resumeContext.slice(0, 1500)}` : '';
  const notesCtx = notes?.trim() ? `\n\nCANDIDATE'S OWN PROJECT NOTES (prefer these specifics when relevant — real numbers, architecture decisions, things only the candidate would know):\n${notes.trim().slice(0, 3000)}` : '';
  const prompt = `Interview question: "${question}"${ctx}${notesCtx}\n\nAnswer now.`;
  return await geminiGenerate({ apiKey, model, prompt, system });
}

export async function codingAnswer({ apiKey, model, question, language }) {
  const system = `You are an expert coding interview coach. Explain clearly, teach the approach, don't just dump code.`;
  const langLine = language ? `Preferred language: ${language}.` : 'Pick the most idiomatic language for the problem (mention which you chose).';
  const prompt = `Coding interview question:\n"${question}"\n\n${langLine}\n\nRespond with:\n1. Approach — brief plan in plain English (2-4 sentences)\n2. Time & space complexity\n3. Full working solution in a code block\n4. One key edge case to mention out loud in a real interview`;
  return await geminiGenerate({ apiKey, model, prompt, system });
}
