import { Card, IconChip } from './ui';

export function StatCard({ label, value, hint, icon, tone = 'ocean' }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-semibold text-ink-700">{label}</p>
        <IconChip tone={tone}>{icon}</IconChip>
      </div>
      <p className="mt-4 text-[40px] font-extrabold leading-none tracking-[-0.03em] text-ink-950">{value}</p>
      {hint && <p className="mt-2 text-[12.5px] text-slate-500">{hint}</p>}
    </Card>
  );
}