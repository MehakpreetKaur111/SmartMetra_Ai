import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('gov@smartmetra.dev');
  const [password, setPassword] = useState('secret123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <Card className="w-full max-w-[400px] p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brass-500">
            <ShieldCheck className="h-6 w-6 text-ink-950" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-[18px] font-extrabold text-ink-950">SmartMetra AI</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Indian Standards & BIS Assistant
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[14px] outline-none transition focus:border-ocean-500/50 focus:bg-white"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[14px] outline-none transition focus:border-ocean-500/50 focus:bg-white"
          />
          {err && <p className="text-[12.5px] text-red-600">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full justify-center">
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-5 rounded-xl border border-line bg-canvas p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Demo accounts</p>
          <p className="mt-1 text-[12px] text-slate-600">gov@smartmetra.dev · secret123 (Government)</p>
          <p className="text-[12px] text-slate-600">industry@smartmetra.dev · secret123 (Industry)</p>
          <p className="text-[12px] text-slate-600">consumer@smartmetra.dev · secret123 (Consumer)</p>
        </div>
      </Card>
    </main>
  );
}