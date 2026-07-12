import { useState } from 'react';
import { Search, Loader2, ExternalLink, Building2 } from 'lucide-react';
import { getKeys } from '@/lib/storage';
import { tavilySearch } from '@/lib/tavily';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Research() {
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    const apiKey = getKeys().tavily;
    if (!apiKey) {
      toast.error('Add a Tavily API key in Settings first');
      nav('/settings');
      return;
    }
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await tavilySearch({ apiKey, query: query.trim(), maxResults: 5, includeAnswer: true });
      setResult(data);
    } catch (e) {
      setError(e.message || 'Search failed');
      toast.error('Tavily search failed — check your key/quota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-10" data-testid="research-page">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-emerald-400" />
        <h1 className="text-3xl font-medium tracking-tight">Company Research</h1>
      </div>
      <p className="text-white/45 text-[13px] mb-8">
        Live web search (via Tavily) to pull up recent news, culture, and role context before an interview.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder="e.g. Stripe engineering culture, or 'Anthropic interview process'"
          data-testid="research-query-input"
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white/90 outline-none focus:border-emerald-500/40"
        />
        <button onClick={run} disabled={loading} data-testid="research-search-btn"
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-[13px] font-medium flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/25 bg-rose-500/[0.06] px-4 py-3 text-[12.5px] text-rose-300">
          {error}
        </div>
      )}

      {result?.answer && (
        <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] p-5">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono-ui mb-2">Quick Answer</div>
          <div className="text-[14px] text-white/90 leading-relaxed">{result.answer}</div>
        </div>
      )}

      {result?.results?.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui">Sources</div>
          {result.results.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noreferrer"
              className="card-hover block rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-emerald-500/30">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="text-[13.5px] font-medium text-white/90 flex-1">{r.title}</div>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
              </div>
              <div className="text-[12px] text-white/50 leading-relaxed line-clamp-3">{r.content}</div>
            </a>
          ))}
        </div>
      )}

      {!loading && !result && !error && (
        <div className="text-center py-16 text-white/30 text-[13px]">
          Search for a company, role, or interview topic to pull in live context.
        </div>
      )}
    </div>
  );
}
