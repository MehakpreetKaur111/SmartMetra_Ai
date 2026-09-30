import { useState } from 'react';
import { SearchCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card } from '../components/ui';
import { StandardCard } from '../components/StandardCard';

export default function StandardsMatch() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function matchProduct(event) {
    event.preventDefault();
    if (!productName.trim() && !description.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      setResult(await api.match({ product_name: productName, description, demo: true }));
    } catch (e) {
      setError(e.message || 'Standards matching failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean-500">Industry Workspace</p>
      <h1 className="mt-2 text-[34px] font-extrabold text-ink-950">Standards Match</h1>
      <p className="mt-2 max-w-[620px] text-[14.5px] text-slate-500">Describe a product to retrieve potentially applicable Indian Standards.</p>

      <Card className="mt-8 p-5">
        <form onSubmit={matchProduct} className="space-y-3">
          <label className="block text-[12px] font-semibold text-ink-700" htmlFor="product-name">Product name</label>
          <input id="product-name" value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="e.g. electric kettle" className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[14px] outline-none focus:border-ocean-500/50 focus:bg-white" />
          <label className="block text-[12px] font-semibold text-ink-700" htmlFor="product-description">Product details</label>
          <textarea id="product-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Materials, capacity, intended use, ratings..." className="w-full resize-y rounded-xl border border-line bg-canvas px-3.5 py-3 text-[14px] outline-none focus:border-ocean-500/50 focus:bg-white" />
          <Button type="submit" disabled={loading}>
            <SearchCheck className="h-4 w-4" />{loading ? 'Matching...' : 'Find relevant standards'}
          </Button>
        </form>
      </Card>

      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {result && (
        <div className="mt-6 space-y-4">
          <Card className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-700">Match summary</p>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-900">{result.ai_summary}</p>
            {result.missing_info?.length > 0 && <p className="mt-3 text-[12.5px] text-orange-700">Additional details: {result.missing_info.join(', ')}</p>}
          </Card>
          {result.retrieved.length ? result.retrieved.map((standard) => (
            <StandardCard key={standard.is_number} standard={{ ...standard, isNumber: standard.is_number, verificationStatus: standard.verification_status }} />
          )) : <Card className="p-5 text-[13px] text-slate-500">No standards matched this description in the current knowledge base.</Card>}
        </div>
      )}
    </>
  );
}
