import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, Badge } from '../components/ui';

export default function VerificationQueue() {
  const [pending, setPending] = useState([]);
  const [audit, setAudit] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      const [p, a] = await Promise.all([api.pendingVerifications(), api.audit()]);
      setPending(p); setAudit(a);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { refresh(); }, []);

  const decide = async (decision) => {
    if (!selected) return;
    try {
      await api.decide({
        recommendation_id: selected.id,
        decision,
        new_value: decision,
        comment: comment || null,
      });
      setComment('');
      await refresh();
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean-500">Government Workspace</p>
      <h1 className="mt-2 text-[34px] font-extrabold leading-tight text-ink-950">Verification Queue</h1>
      <p className="mt-2 max-w-[620px] text-[14.5px] text-slate-500">
        Every AI recommendation stays separate from the human-verified result and is fully auditable.
      </p>

      {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[16px] font-bold text-ink-950">Pending recommendations</h2>
            {pending.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-line bg-canvas/60 px-4 py-8 text-center text-[13px] text-slate-500">
                No recommendations yet. Run an AI Standards Match from the Scan page.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {pending.map((r) => (
                  <li key={r.id} onClick={() => setSelected(r)}
                    className={`flex cursor-pointer flex-wrap items-center gap-3 px-1 py-3 transition hover:bg-canvas/70 ${selected?.id === r.id ? 'bg-canvas/70' : ''}`}>
                    <span className="rounded-lg bg-ink-950 px-2.5 py-1 text-[11.5px] font-extrabold text-brass-500">
                      {r.standard_id.slice(0, 8)}
                    </span>
                    <span className="text-[13px] font-medium text-ink-950">{r.relevance.replace('_', ' ')}</span>
                    {r.is_demo && <Badge tone="ai">Demo</Badge>}
                    <span className="ml-auto text-[11.5px] text-slate-400">
                      conf {r.confidence?.toFixed(3)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {selected && (
            <Card className="p-5">
              <h2 className="text-[16px] font-bold text-ink-950">Human verification</h2>
              <p className="mt-1 text-[13px] text-slate-500">{selected.why}</p>

              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                placeholder="Add a comment or the additional information required…"
                className="mt-4 w-full resize-none rounded-xl border border-line bg-canvas px-3.5 py-3 text-[13.5px] outline-none focus:border-ocean-500/50 focus:bg-white" />

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => decide('CONFIRMED')}>Confirm</Button>
                <Button size="sm" variant="danger" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => decide('REJECTED')}>Reject</Button>
                <Button size="sm" variant="outline" icon={<HelpCircle className="h-3.5 w-3.5" />} onClick={() => decide('INFO_REQUESTED')}>Request info</Button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-sky-700">AI Result</p>
                  <p className="mt-1.5 text-[13.5px] font-bold text-ink-950">{selected.relevance.replace('_', ' ')}</p>
                </div>
                <div className="rounded-xl border border-line bg-canvas p-3.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-700">Human Verified Result</p>
                  <p className="mt-1.5 text-[13.5px] font-bold text-ink-950">
                    {audit[0]?.payload?.new ?? 'Awaiting decision'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-ocean-500" />
            <h2 className="text-[16px] font-bold text-ink-950">Audit trail</h2>
          </div>
          {audit.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-line bg-canvas/60 px-4 py-8 text-center text-[13px] text-slate-500">
              No decisions recorded yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {audit.map((a) => (
                <li key={a.id} className="rounded-xl border border-line bg-canvas p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={a.payload?.decision === 'CONFIRMED' ? 'verified' : 'attention'}>
                      {a.payload?.decision ?? a.action}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] text-slate-500">{a.payload?.comment ?? '—'}</p>
                  <p className="mt-1 text-[11.5px] text-slate-400">
                    {a.payload?.old ?? '—'} → {a.payload?.new ?? '—'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}