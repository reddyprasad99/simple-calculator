const TAVILY_URL = 'https://api.tavily.com/search';

export async function tavilySearch({ apiKey, query, maxResults = 5, topic = 'general', includeAnswer = true }) {
  if (!apiKey) throw new Error('Missing Tavily API key. Add it in Settings.');
  const res = await fetch(TAVILY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: 'basic',
      topic,
      max_results: maxResults,
      include_answer: includeAnswer,
      include_raw_content: false,
      include_images: false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tavily error: ${res.status} — ${err.slice(0, 240)}`);
  }
  return await res.json(); // { answer, results: [{ title, url, content, score }, ...] }
}
