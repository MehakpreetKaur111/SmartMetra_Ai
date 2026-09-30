import { cn } from '../lib/cn';

export function Card({ className, children, ...rest }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-white shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }) {
  const sizes = { sm: 'text-[13px] px-3 py-1.5', md: 'text-[14px] px-4 py-2.5' };
  const variants = {
    primary: 'bg-ocean-500 text-white hover:bg-ocean-600 active:scale-[0.98]',
    outline: 'border border-line bg-white text-ink-950 hover:border-ink-600/40 hover:bg-canvas',
    ghost: 'text-ink-700 hover:bg-ink-950/5',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 font-semibold transition-all duration-150 rounded-xl select-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size], variants[variant], className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

const badgeTones = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  potential: 'bg-amber-50 text-amber-700 border-amber-200',
  attention: 'bg-orange-50 text-orange-700 border-orange-200',
  ai: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-ink-950/5 text-ink-700 border-line',
};
const badgeDots = {
  verified: 'bg-emerald-500',
  potential: 'bg-amber-500',
  attention: 'bg-orange-500',
  ai: 'bg-sky-500',
  neutral: 'bg-ink-600',
};

export function Badge({ tone = 'neutral', children, dot = true, className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold tracking-wide uppercase',
      badgeTones[tone], className,
    )}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', badgeDots[tone])} />}
      {children}
    </span>
  );
}

export function IconChip({ tone = 'ocean', children }) {
  const tones = {
    ocean: 'bg-ocean-50 text-ocean-600',
    brass: 'bg-brass-500/15 text-brass-600',
    green: 'bg-emerald-50 text-emerald-600',
    ink: 'bg-ink-950/5 text-ink-700',
  };
  return <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tones[tone])}>{children}</span>;
}