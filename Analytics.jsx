import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../lib/api';
import { Card } from '../components/ui';

export default function Analytics() {
  const [top, setTop] = useState([]);
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    api.analyticsTopStandards().then(setTop).catch(() => {});
    api.analyticsDecisions().then(setDecisions).catch(() => {});
  }, []);

  const colors = { CONFIRMED: '#1B6B3A', REJECTED: '#DC2626', VERIFICATION_REQUIRED: '#EA580C', INFO_REQUESTED: '#FFC72C' };

  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean-500">Government Workspace</p>
      <h1 className="mt-2 text-[34px] font-extrabold text-ink-950">Analytics</h1>
      <p className="mt-2 max-w-[620px] text-[14.5px] text-slate-500">
        Standards coverage, query volume, and human-verification outcomes.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-[13px] font-bold text-ink-950">Top recommended standards</p>
          <div className="mt-4 h-[260px]">
            {top.length === 0 ? (
              <p className="grid h-full place-items-center text-[13px] text-slate-400">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top} margin={{ left: -18, right: 8, top: 6, bottom: 0 }}>
                  <CartesianGrid stroke="#ECE8DF" vertical={false} />
                  <XAxis dataKey="is_number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ECE8DF', fontSize: 12 }} />
                  <Bar dataKey="hits" fill="#1B7A8F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-[13px] font-bold text-ink-950">Human verification outcomes</p>
          <div className="mt-4 h-[260px]">
            {decisions.length === 0 ? (
              <p className="grid h-full place-items-center text-[13px] text-slate-400">No decisions yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={decisions} dataKey="count" nameKey="decision" innerRadius={56} outerRadius={90} paddingAngle={3}>
                    {decisions.map((d) => <Cell key={d.decision} fill={colors[d.decision] ?? '#94a3b8'} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ECE8DF', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}