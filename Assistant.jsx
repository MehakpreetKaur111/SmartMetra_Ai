import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, Badge } from '../components/ui';

export default function Assistant() {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function ask() {
    if (!question.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      setResult(await api.ask(question, language));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean-500">Assistant</p>
      <h1 className="mt-2 text-[34px] font-extrabold text-ink-950">Ask SmartMetra</h1>
      <p className="mt-2 max-w-[620px] text-[14.5px] text-slate-500">
        Ask about Indian Standards and BIS services. Every factual answer is source-backed —
        if nothing is retrieved, SmartMetra says so honestly.
      </p>

      <Card className="mt-8 p-5">
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3}
          placeholder='e.g. "Which Indian Standards may apply to packaged drinking water?"'
          className="w-full resize-none rounded-xl border border-line bg-canvas px-3.5 py-3 text-[14px] outline-none focus:border-ocean-500/50 focus:bg-white" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="h-10 rounded-xl border border-line bg-white px-3 text-[13px] outline-none focus:border-ocean-500/50">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>
          <Button onClick={ask} disabled={loading} icon={<Send className="h-4 w-4" />}>
            {loading ? 'Thinking…' : 'Ask'}
          </Button>
          <Badge tone="ai" dot>Source-backed</Badge>
        </div>
        {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}
      </Card>

      {result && (
        <div className="mt-6 space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-700">
                AI interpretation
              </p>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-900">{result.answer}</p>
            {result.verification_required && (
              <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                <p className="text-[12.5px] text-orange-800">
                  VERIFICATION REQUIRED — no official source matched. Add more product details.
                </p>
              </div>
            )}
          </Card>

          {result.sources.length > 0 && (
            <Card className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Sources ({result.sources.length})
              </p>
              <ul className="mt-3 space-y-2">
                {result.sources.map((s) => (
                  <li key={s.is_number} className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-ink-950 px-2.5 py-1 text-[11.5px] font-extrabold text-brass-500">
                      {s.is_number}
                    </span>
                    <span className="text-[13px] text-ink-950">{s.title}</span>
                    <Badge tone={s.verification_status === 'VERIFIED' ? 'verified' : 'attention'}>
                      {s.verification_status.replace('_', ' ')}
                    </Badge>
                    {s.source_url && (
                      <a href={s.source_url} target="_blank" rel="noreferrer"
                        className="ml-auto text-[12px] font-semibold text-ocean-500 hover:underline">
                        Open
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}