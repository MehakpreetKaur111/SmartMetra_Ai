import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Topbar({ onMenu }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-5 backdrop-blur-md lg:px-8">
      <button onClick={onMenu} className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-ink-700 lg:hidden">
        <Menu className="h-4 w-4" />
      </button>
      <div className="hidden text-[13px] text-slate-500 sm:block">
        Signed in as <span className="font-semibold text-ink-950">{user?.email ?? '—'}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white py-1.5 pl-1.5 pr-3">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-950 text-[11px] font-bold text-brass-500">
            {(user?.full_name ?? 'U').slice(0, 2).toUpperCase()}
          </span>
          <span className="hidden text-[13px] font-semibold text-ink-950 sm:block">{user?.full_name ?? 'User'}</span>
        </div>
      </div>
    </header>
  );
}