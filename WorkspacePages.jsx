import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpRight, BookmarkX, FlaskConical, Search } from 'lucide-react';
import { api, apiFetch } from '../lib/api';
import { getSavedStandards, toggleSavedStandard } from '../lib/savedStandards';
import { Badge, Button, Card } from '../components/ui';
import { StandardCard } from '../components/StandardCard';

function Heading({ eyebrow, title, description }) {
  return (
    <header>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean-500">{eyebrow}</p>
      <h1 className="mt-2 text-[34px] font-extrabold text-ink-950">{title}</h1>
      {description && <p className="mt-2 max-w-[680px] text-[14px] leading-relaxed text-slate-500">{description}</p>}
    </header>
  );
}

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myProducts()
      .then(setProducts)
      .catch((e) => setError(e.message || 'Could not load products'))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}

function EmptyState({ children }) {
  return <Card className="mt-6 border-dashed p-8 text-center text-[13px] text-slate-500">{children}</Card>;
}

export function MyProducts() {
  const { products, loading, error } = useProducts();

  return (
    <>
      <Heading eyebrow="Consumer Workspace" title="My Products" description="Products you have scanned are collected here." />
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {loading ? <p className="mt-6 text-[13px] text-slate-500">Loading products...</p> : products.length ? (
        <div className="mt-6 divide-y divide-line border-y border-line">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="flex flex-wrap items-center gap-3 py-4 hover:bg-white">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-ink-950">{product.name}</span>
                <span className="mt-1 block text-[12px] text-slate-500">{product.category || 'Category not identified'} · {new Date(product.created_at).toLocaleDateString()}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      ) : <EmptyState>No scanned products yet. <Link to="/scan" className="font-semibold text-ocean-600">Scan a product</Link> to get started.</EmptyState>}
    </>
  );
}

export function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/products/${encodeURIComponent(productId)}`).then(setProduct).catch((e) => setError(e.message));
  }, [productId]);

  return (
    <>
      <Heading eyebrow="Product record" title={product?.name ?? 'Product details'} />
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {product && <Card className="mt-6 p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          {[['Category', product.category], ['Created', new Date(product.created_at).toLocaleString()], ['Description', product.description], ['Extracted label text', product.ocr_text]].map(([label, value]) => (
            <div key={label}><dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-[13px] text-ink-900">{value || 'Not available'}</dd></div>
          ))}
        </dl>
      </Card>}
    </>
  );
}

export function SavedStandards() {
  const [standards, setStandards] = useState(getSavedStandards);

  function remove(standard) {
    toggleSavedStandard(standard);
    setStandards(getSavedStandards());
  }

  return (
    <>
      <Heading eyebrow="Consumer Workspace" title="Saved Standards" description="Your saved standards stay in this browser." />
      {standards.length ? <div className="mt-6 space-y-3">{standards.map((standard) => (
        <Card key={standard.is_number} className="flex flex-wrap items-center gap-3 p-4">
          <Link to={`/standards/${encodeURIComponent(standard.is_number)}`} className="min-w-0 flex-1">
            <span className="text-[12px] font-extrabold text-ocean-700">{standard.is_number}</span>
            <span className="mt-1 block text-[14px] font-bold text-ink-950">{standard.title}</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => remove(standard)}><BookmarkX className="h-4 w-4" />Remove</Button>
        </Card>
      ))}</div> : <EmptyState>No saved standards yet. Find a standard and save it to see it here.</EmptyState>}
    </>
  );
}

export function StandardDetail() {
  const { isNumber } = useParams();
  const [standard, setStandard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/standards/${encodeURIComponent(isNumber)}`).then(setStandard).catch((e) => setError(e.message));
  }, [isNumber]);

  return (
    <>
      <Heading eyebrow="Indian Standards" title={standard?.is_number ?? isNumber} description={standard?.title} />
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {standard && <Card className="mt-6 p-5">
        <div className="flex flex-wrap gap-2"><Badge tone={standard.verification_status === 'VERIFIED' ? 'verified' : 'attention'}>{standard.verification_status.replaceAll('_', ' ')}</Badge>{standard.is_demo && <Badge tone="ai">Demo seed</Badge>}</div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ['Category', standard.category], ['Department', standard.department], ['Type', standard.standard_type],
            ['Status', standard.status], ['Scope', standard.scope], ['Certification', standard.certification],
          ].map(([label, value]) => <div key={label}><dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-900">{value || 'Not listed'}</dd></div>)}
        </dl>
        {standard.source_url && <a className="mt-5 inline-block text-[13px] font-semibold text-ocean-600 hover:underline" href={standard.source_url} target="_blank" rel="noreferrer">Open official source</a>}
      </Card>}
    </>
  );
}

export function CertificationNavigator() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search(event) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true); setError('');
    try { setRows(await apiFetch(`/standards/search?q=${encodeURIComponent(query.trim())}`)); }
    catch (e) { setError(e.message || 'Search failed'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Heading eyebrow="Industry Workspace" title="Certification Navigator" description="Explore certification information recorded with matching Indian Standards." />
      <Card className="mt-6 p-5">
        <form onSubmit={search} className="flex flex-wrap gap-3">
          <input aria-label="Search standards" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="IS number, product, or category" className="h-11 min-w-[220px] flex-1 rounded-xl border border-line bg-canvas px-3.5 text-[14px] outline-none focus:border-ocean-500/50 focus:bg-white" />
          <Button type="submit" disabled={loading}><Search className="h-4 w-4" />{loading ? 'Searching...' : 'Search'}</Button>
        </form>
      </Card>
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      <div className="mt-5 space-y-3">{rows.map((standard) => (
        <Card key={standard.id} className="p-5">
          <Link to={`/standards/${encodeURIComponent(standard.is_number)}`} className="text-[14px] font-bold text-ink-950 hover:text-ocean-600">{standard.is_number} · {standard.title}</Link>
          <p className="mt-2 text-[12px] font-bold uppercase tracking-wide text-slate-500">Certification information</p>
          <p className="mt-1 whitespace-pre-wrap text-[13px] text-ink-900">{standard.certification || 'No certification details are recorded for this standard.'}</p>
        </Card>
      ))}</div>
    </>
  );
}

export function TestingLaboratories() {
  return (
    <>
      <Heading eyebrow="Industry Workspace" title="Testing Laboratories" description="Browse recognized testing facilities associated with product certification." />
      <EmptyState>
        <FlaskConical className="mx-auto mb-3 h-7 w-7 text-slate-400" />
        <p className="font-semibold text-ink-900">No laboratory directory is connected.</p>
        <p className="mt-1">This workspace has no verified lab records yet; no facilities are shown until a source is configured.</p>
      </EmptyState>
    </>
  );
}

export function StandardsComparison() {
  const [numbers, setNumbers] = useState(['', '']);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function compare(event) {
    event.preventDefault();
    if (numbers.some((number) => !number.trim())) return;
    setLoading(true); setError('');
    try {
      setRows(await Promise.all(numbers.map((number) => apiFetch(`/standards/${encodeURIComponent(number.trim())}`))));
    } catch (e) { setRows([]); setError(e.message || 'Could not load both standards'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Heading eyebrow="Industry Workspace" title="Standards Comparison" description="Compare scope, category, status, and certification details side by side." />
      <Card className="mt-6 p-5">
        <form onSubmit={compare} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          {numbers.map((number, index) => <input key={index} value={number} onChange={(event) => setNumbers(numbers.map((value, item) => item === index ? event.target.value : value))} aria-label={`Standard number ${index + 1}`} placeholder={`IS number ${index + 1}`} className="h-11 min-w-0 rounded-xl border border-line bg-canvas px-3.5 text-[14px] outline-none focus:border-ocean-500/50 focus:bg-white" />)}
          <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Compare'}</Button>
        </form>
      </Card>
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {rows.length === 2 && <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-white"><table className="w-full min-w-[560px] text-left text-[13px]"><thead><tr className="border-b border-line bg-canvas"><th className="p-3">Field</th>{rows.map((standard) => <th key={standard.id} className="p-3">{standard.is_number}</th>)}</tr></thead><tbody>{[['Title', 'title'], ['Category', 'category'], ['Department', 'department'], ['Scope', 'scope'], ['Status', 'status'], ['Certification', 'certification'], ['Verification', 'verification_status']].map(([label, field]) => <tr key={field} className="border-b border-line last:border-0"><th className="p-3 font-semibold text-ink-700">{label}</th>{rows.map((standard) => <td key={standard.id} className="max-w-[360px] whitespace-pre-wrap p-3 text-ink-900">{standard[field] || 'Not listed'}</td>)}</tr>)}</tbody></table></div>}
    </>
  );
}

export function ProductStandardsProfile() {
  const { products, loading, error: productsError } = useProducts();
  const [productId, setProductId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function buildProfile(event) {
    event.preventDefault();
    if (!productId) return;
    setBusy(true); setError('');
    try { setResult(await api.match({ product_id: productId, demo: true })); }
    catch (e) { setError(e.message || 'Could not build profile'); }
    finally { setBusy(false); }
  }

  return (
    <>
      <Heading eyebrow="Industry Workspace" title="Product Standards Profile" description="Build a standards profile from a product saved in your workspace." />
      {(productsError || error) && <p role="alert" className="mt-4 text-[13px] text-red-700">{productsError || error}</p>}
      <Card className="mt-6 p-5"><form onSubmit={buildProfile} className="flex flex-wrap gap-3">
        <select aria-label="Choose a product" value={productId} onChange={(event) => setProductId(event.target.value)} disabled={loading} className="h-11 min-w-[220px] flex-1 rounded-xl border border-line bg-white px-3 text-[14px]">
          <option value="">{loading ? 'Loading products...' : 'Choose a product'}</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
        <Button type="submit" disabled={!productId || busy}>{busy ? 'Building...' : 'Build profile'}</Button>
      </form></Card>
      {result && <div className="mt-5 space-y-3"><Card className="p-5"><p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-900">{result.ai_summary}</p></Card>{result.retrieved.map((standard) => <StandardCard key={standard.is_number} standard={{ ...standard, isNumber: standard.is_number, verificationStatus: standard.verification_status }} />)}</div>}
    </>
  );
}

export function ReportsHistory() {
  const { products, loading, error } = useProducts();

  function downloadCsv() {
    const fields = ['name', 'category', 'description', 'created_at'];
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [fields.join(','), ...products.map((product) => fields.map((field) => escape(product[field])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'smartmetra-product-history.csv'; anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3"><Heading eyebrow="Industry Workspace" title="Reports / History" description="Review scanned products and export your current product history." />
        <Button variant="outline" onClick={downloadCsv} disabled={!products.length}><ArrowDownToLine className="h-4 w-4" />Export CSV</Button>
      </div>
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {loading ? <p className="mt-6 text-[13px] text-slate-500">Loading history...</p> : products.length ? <div className="mt-6 divide-y divide-line border-y border-line">{products.map((product) => <div key={product.id} className="flex flex-wrap items-center gap-3 py-4"><span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold text-ink-950">{product.name}</span><span className="mt-1 block text-[12px] text-slate-500">{product.category || 'Uncategorized'} · {new Date(product.created_at).toLocaleString()}</span></span><Badge tone={product.is_demo ? 'ai' : 'neutral'}>{product.is_demo ? 'Demo' : 'Scanned'}</Badge></div>)}</div> : <EmptyState>No product history is available yet.</EmptyState>}
    </>
  );
}

export function Recommendations() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { api.pendingVerifications().then(setRows).catch((e) => setError(e.message)); }, []);

  return (
    <>
      <Heading eyebrow="Government / Authorized" title="Recommendations" description="AI-generated standards matches awaiting or ready for human review." />
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {rows.length ? <div className="mt-6 space-y-3">{rows.map((row) => <Card key={row.id} className="flex flex-wrap items-center gap-3 p-4"><span className="min-w-0 flex-1"><span className="block text-[13px] font-bold text-ink-950">{row.standard_id}</span><span className="mt-1 block text-[12px] text-slate-500">{row.relevance.replaceAll('_', ' ')} · confidence {row.confidence?.toFixed(2) ?? 'n/a'}</span></span>{row.is_demo && <Badge tone="ai">Demo</Badge>}<Link to="/verification" className="text-[12px] font-semibold text-ocean-600">Review</Link></Card>)}</div> : !error && <EmptyState>No recommendations are recorded yet.</EmptyState>}
    </>
  );
}

export function AuditLogs() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { api.audit().then(setRows).catch((e) => setError(e.message)); }, []);

  return (
    <>
      <Heading eyebrow="Government / Authorized" title="Audit Logs" description="Chronological record of verification decisions and other audited actions." />
      {error && <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p>}
      {rows.length ? <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white"><table className="w-full min-w-[620px] text-left text-[13px]"><thead className="bg-canvas text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3">Time</th><th className="p-3">Action</th><th className="p-3">Entity</th><th className="p-3">Decision</th><th className="p-3">Comment</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-line"><td className="whitespace-nowrap p-3">{new Date(row.created_at).toLocaleString()}</td><td className="p-3">{row.action}</td><td className="p-3">{row.entity}</td><td className="p-3">{row.payload?.decision || '—'}</td><td className="max-w-[260px] p-3">{row.payload?.comment || '—'}</td></tr>)}</tbody></table></div> : !error && <EmptyState>No audit events recorded yet.</EmptyState>}
    </>
  );
}