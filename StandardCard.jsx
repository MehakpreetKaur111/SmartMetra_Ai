import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, Badge, Button } from './ui';
import { isStandardSaved, toggleSavedStandard } from '../lib/savedStandards';

const statusTone = {
  RELEVANT: 'verified',
  POTENTIALLY_RELEVANT: 'potential',
  RELATED: 'neutral',
  VERIFICATION_REQUIRED: 'attention',
};

export function StandardCard({ standard }) {
  const s = standard;
  const isNumber = s.isNumber ?? s.is_number;
  const [saved, setSaved] = useState(() => isStandardSaved(isNumber));
  const tone = statusTone[s.relevance] ?? 'neutral';

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-ink-950 px-2.5 py-1 text-[12.5px] font-extrabold tracking-wide text-brass-500">
              {isNumber}
            </span>
            <Badge tone={tone}>{s.relevance?.replace('_', ' ')}</Badge>
          </div>
          <h3 className="mt-2 text-[16px] font-bold leading-snug text-ink-950">{s.title}</h3>
        </div>
        <Badge tone={s.verificationStatus === 'VERIFIED' ? 'verified' : 'attention'} dot>
          {s.verificationStatus === 'VERIFIED' ? 'Verified source' : 'Verification required'}
        </Badge>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-sky-700">Why SmartMetra recommended it</p>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-900">{s.why}</p>
        </div>
        {s.category && (
          <p className="text-[12.5px] text-slate-500">
            Category: <span className="font-semibold text-ink-950">{s.category}</span>
          </p>
        )}
        {typeof s.score === 'number' && (
          <p className="text-[11.5px] text-slate-400">Retrieval score: {s.score.toFixed(3)} (semantic similarity)</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3.5">
        {s.source_url && (
          <a href={s.source_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-ocean-500 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-ocean-600">
            <ExternalLink className="h-3.5 w-3.5" /> View Official Source
          </a>
        )}
        <Link to={`/standards/${encodeURIComponent(isNumber)}`} className="inline-flex items-center rounded-xl border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink-950 hover:bg-canvas">
          Explain Standard
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setSaved(toggleSavedStandard(s))}>
          {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </Card>
  );
}