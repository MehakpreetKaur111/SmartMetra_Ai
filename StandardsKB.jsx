import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Card, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getWorkspaceRole } from '../lib/workspaces';
import { isStandardSaved, toggleSavedStandard } from '../lib/savedStandards';

export default function StandardsKB() {
  const { user } = useAuth();
  const isConsumer = getWorkspaceRole(user) === 'CONSUMER';
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setSavedRevision] = useState(0);

  async function search() {
    if (q.length < 2) return;
    setLoading(true); setError('');
    try {
      const data = await apiFetch(`/standards/search?q=${encodeURIComponent(q)}`);
      setRows(data);
    } catch (e) {
      setError(e.message || 'Standards search failed');
    } finally { setLoading(false); }
  }

  function save(standard) {
    toggleSavedStandard(standard);
    setSavedRevision((revision) => revision + 1);
  }

  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean-500">{isConsumer ? 'Consumer Workspace' : 'Knowledge Base'}</p>
      <h1 className="mt-2 text-[34px] font-extrabold text-ink-950">{isConsumer ? 'Find Standards' : 'Indian Standards'}</h1>
      <p className="mt-2 max-w-[620px] text-[14.5px] text-slate-500">
        Keyword search across the ingested standards corpus. Entries marked VERIFICATION REQUIRED
        are demo seeds and must be replaced with verified BIS metadata.
      </p>

      <Card className="mt-8 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="IS number, keyword or category"
            className="h-11 w-full rounded-xl border border-line bg-canvas pl-10 pr-4 text-[14px] outline-none focus:border-ocean-500/50 focus:bg-white" />
        </div>
        <button onClick={search} className="mt-3 rounded-xl bg-ocean-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-ocean-600">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </Card>
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}

      <div className="mt-6 space-y-3">
        {rows.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-ink-950 px-2.5 py-1 text-[12.5px] font-extrabold text-brass-500">
                {s.is_number}
              </span>
              <Badge tone={s.verification_status === 'VERIFIED' ? 'verified' : 'attention'}>
                {s.verification_status.replace('_', ' ')}
              </Badge>
              {s.is_demo && <Badge tone="ai">Demo seed</Badge>}
            </div>
            <Link to={`/standards/${encodeURIComponent(s.is_number)}`} className="mt-2 block text-[15px] font-bold text-ink-950 hover:text-ocean-600">{s.title}</Link>
            {s.category && <p className="mt-1 text-[12.5px] text-slate-500">Category: {s.category}</p>}
            <button onClick={() => save(s)} className="mt-3 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-700 hover:bg-canvas">
              {isStandardSaved(s.is_number) ? 'Remove saved standard' : 'Save standard'}
            </button>
            {s.source_url && (
              <a href={s.source_url} target="_blank" rel="noreferrer"
                className="mt-2 inline-block text-[12.5px] font-semibold text-ocean-500 hover:underline">
                Open official source
              </a>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
