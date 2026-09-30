import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Box, ShieldCheck, ArrowUpRight, BookOpen, MessageSquare, ClipboardCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Card, Button, Badge } from '../components/ui';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { getWorkspaceRole, WORKSPACES } from '../lib/workspaces';

export default function Overview() {
  const { user } = useAuth();
  const role = getWorkspaceRole(user);
  const workspace = WORKSPACES[role];
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = role === 'CONSUMER' ? api.myProducts() : api.analyticsOverview();
    load.then((data) => setStats(role === 'CONSUMER' ? { products: data.length } : data))
      .catch((e) => setError(e.message));
  }, [role]);

  const content = {
    CONSUMER: {
      kicker: 'Consumer Workspace',
      title: 'Understand the standards behind your products.',
      description: 'Scan a product, explore relevant Indian Standards, and keep useful standards close at hand.',
      primary: ['/scan', 'Scan Product', ScanLine],
      stats: [{ label: 'My products', value: stats?.products ?? '—', hint: 'Products scanned by you', icon: <Box className="h-4 w-4" />, tone: 'ocean' }],
      quick: [['Find Standards', '/standards', BookOpen], ['Ask SmartMetra', '/assistant', MessageSquare]],
    },
    INDUSTRY: {
      kicker: 'Industry Workspace',
      title: 'Move from product details to standards action.',
      description: 'Match products to standards, review certification information, and track your product history.',
      primary: ['/match', 'Match Standards', ShieldCheck],
      stats: [
        { label: 'Products', value: stats?.products ?? '—', hint: 'Products in the workspace', icon: <Box className="h-4 w-4" />, tone: 'ocean' },
        { label: 'Standards', value: stats?.standards ?? '—', hint: 'Available in the knowledge base', icon: <BookOpen className="h-4 w-4" />, tone: 'brass' },
      ],
      quick: [['Product Scanner', '/scan', ScanLine], ['Reports / History', '/reports', ArrowUpRight]],
    },
    GOVERNMENT: {
      kicker: 'Government / Authorized Workspace',
      title: 'Review recommendations. Verify with evidence.',
      description: 'Review AI-recommended Indian Standards, verify findings against official BIS evidence, and record decisions.',
      primary: ['/verification', 'Open verification queue', ClipboardCheck],
      stats: [
        { label: 'Standards in KB', value: stats?.standards ?? '—', hint: 'Live retrieval corpus', icon: <Box className="h-4 w-4" />, tone: 'ocean' },
        { label: 'Recommendations', value: stats?.recommendations ?? '—', hint: 'AI-generated recommendations', icon: <ScanLine className="h-4 w-4" />, tone: 'brass' },
        { label: 'Verifications', value: stats?.verifications ?? '—', hint: 'Human decisions recorded', icon: <ShieldCheck className="h-4 w-4" />, tone: 'green' },
      ],
      quick: [['Scan Product', '/scan', ScanLine], ['Ask SmartMetra', '/assistant', MessageSquare]],
    },
  }[role];
  const [primaryPath, primaryLabel, PrimaryIcon] = content.primary;

  return (
    <>
      <div className="mb-6 rounded-xl border border-emerald-200/70 bg-success-50 px-4 py-3">
        <p className="text-[13.5px] font-semibold text-success-600">Signed in.</p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean-500">
            {content.kicker}
          </p>
          <h1 className="mt-2 text-[38px] font-extrabold leading-[1.05] text-ink-950">
            {content.title}
          </h1>
          <p className="mt-2.5 max-w-[560px] text-[14.5px] leading-relaxed text-slate-500">
            {content.description}
          </p>
        </div>
        <Button onClick={() => (window.location.href = primaryPath)}><PrimaryIcon className="h-4 w-4" />{primaryLabel}</Button>
      </div>

      {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {content.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
              <h2 className="text-[17px] font-bold text-ink-950">Your workspace</h2>
            <p className="mt-1 text-[13.5px] text-slate-500">
              Jump back into the tools available for your account.
            </p>
          </div>
          <Badge tone="ai">{workspace.label}</Badge>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {content.quick.map(([label, to, Icon]) => (
            <Link key={to} to={to} className="group flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-4 transition hover:bg-white">
              <span className="flex items-center gap-3"><Icon className="h-4 w-4 text-ocean-500" /><span className="text-[14px] font-bold text-ink-950">{label}</span></span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-ocean-500" />
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}