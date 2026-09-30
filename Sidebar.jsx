import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/cn';
import { getWorkspaceRole, WORKSPACES } from '../lib/workspaces';

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const workspaceRole = getWorkspaceRole(user);
  const workspace = WORKSPACES[workspaceRole];

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden" />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col bg-ink-950 transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brass-500 shadow-[0_4px_14px_-2px_rgba(255,199,44,0.5)]">
            <ShieldCheck className="h-6 w-6 text-ink-950" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <p className="text-[17px] font-extrabold leading-tight text-white">SmartMetra</p>
            <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
              AI Standards Assistant
            </p>
          </div>
        </div>

        {/* Signed-in as */}
        <div className="px-4">
          <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Signed in as</p>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-900 px-3 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brass-500">
              <ShieldCheck className="h-4 w-4 text-ink-950" strokeWidth={2.5} />
            </span>
            <span className="text-[14px] font-bold text-white">{workspace.label}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="scroll-thin mt-5 flex-1 overflow-y-auto px-4 pb-4">
          <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{workspace.label} workspace</p>
          <ul className="space-y-1">
            {workspace.nav.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} onClick={onClose}
                  className={({ isActive }) => cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors',
                    isActive ? 'bg-ink-800 text-white' : 'text-slate-400 hover:bg-ink-850 hover:text-slate-100',
                  )}>
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-brass-500" />}
                      <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-brass-500' : 'text-slate-500 group-hover:text-slate-300')} strokeWidth={2.1} />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="border-t border-white/[0.06] p-4">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-slate-300 transition hover:bg-ink-850 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}