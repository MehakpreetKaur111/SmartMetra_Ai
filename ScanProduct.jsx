import { useState } from 'react';
import { UploadCloud, Sparkles, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, Badge } from '../components/ui';
import { StandardCard } from '../components/StandardCard';

export default function ScanProduct() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ocr, setOcr] = useState(null);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');

  async function onUpload(f) {
    setFile(f); setBusy(true); setError(''); setOcr(null); setMatch(null);
    try {
      const o = await api.uploadProductImage(f);
      setOcr(o);
      const m = await api.match({
        product_id: o.product_id,
        product_name: o.raw_text.split('\n')[0]?.slice(0, 120) || 'Product',
        description: o.raw_text,
        demo: true,
      });
      setMatch(m);
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-ocean-500" />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ocean-500">
            Don't know the IS number?
          </p>
        </div>
        <h1 className="mt-2 text-[26px] font-extrabold text-ink-950">Upload a product image</h1>
        <p className="mt-1 text-[13.5px] text-slate-500">
          PaddleOCR reads real label text, OpenCV preprocesses it, FAISS retrieves Indian Standards,
          and Gemini explains — never invents.
        </p>

        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas px-6 py-10 text-center transition hover:bg-white">
          <UploadCloud className="h-8 w-8 text-ocean-500" />
          <p className="mt-2 text-[13.5px] font-semibold text-ink-900">
            {file ? file.name : 'Click to upload a label / package image'}
          </p>
          <p className="mt-0.5 text-[12px] text-slate-500">JPG, PNG · clear, well-lit images work best</p>
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        </label>

        <div className="mt-4 flex items-center gap-3">
          <Button disabled={busy} icon={<Sparkles className="h-4 w-4" />}>
            {busy ? 'Extracting & matching…' : 'AI Standards Match'}
          </Button>
          <Badge tone="ai">Demo mode</Badge>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600" />
            <p className="text-[12.5px] text-orange-800">{error}</p>
          </div>
        )}
      </Card>

      {ocr && (
        <Card className="p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Extracted text · {ocr.engine} · quality {ocr.image_quality}
          </p>
          <pre className="mt-2 whitespace-pre-wrap text-[12.5px] text-ink-900">{ocr.raw_text.slice(0, 800)}</pre>
          {ocr.warning && <p className="mt-2 text-[12px] text-orange-700">{ocr.warning}</p>}
        </Card>
      )}

      {match && (
        <>
          <Card className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-700">AI Summary (interpretation)</p>
            <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-900">{match.ai_summary}</p>
            {match.missing_info?.length > 0 && (
              <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-orange-700">
                  SmartMetra needs more information
                </p>
                <ul className="mt-1 list-disc pl-4 text-[12.5px] text-orange-900">
                  {match.missing_info.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </div>
            )}
          </Card>

          <div className="space-y-5">
            {match.retrieved.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-[14px] font-semibold text-ink-950">No standards retrieved.</p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Please add the product name, material or intended use.
                </p>
              </Card>
            )}
            {match.retrieved.map((r) => (
              <StandardCard key={r.is_number} standard={{
                isNumber: r.is_number,
                title: r.title,
                category: r.category,
                relevance: r.relevance,
                why: r.why,
                source_url: r.source_url,
                verificationStatus: r.verification_status,
                score: r.score,
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}