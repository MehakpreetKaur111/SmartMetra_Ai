import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import Login from './pages/Login';
import Overview from './pages/Overview';
import ScanProduct from './pages/ScanProduct';
import VerificationQueue from './pages/VerificationQueue';
import Analytics from './pages/Analytics';
import Assistant from './pages/Assistant';
import StandardsKB from './pages/StandardsKB';
import StandardsMatch from './pages/StandardsMatch';
import {
  AuditLogs,
  CertificationNavigator,
  MyProducts,
  ProductDetail,
  ProductStandardsProfile,
  Recommendations,
  ReportsHistory,
  SavedStandards,
  StandardDetail,
  StandardsComparison,
  TestingLaboratories,
} from './pages/WorkspacePages';
import { getWorkspaceRole } from './lib/workspaces';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  if (loading) return <div className="grid min-h-screen place-items-center text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(getWorkspaceRole(user))) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-[264px]">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="mx-auto max-w-[1180px] px-5 py-7 lg:px-8 lg:py-9">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Overview /></Protected>} />
      <Route path="/scan" element={<Protected><ScanProduct /></Protected>} />
      <Route path="/assistant" element={<Protected roles={['CONSUMER', 'GOVERNMENT']}><Assistant /></Protected>} />
      <Route path="/standards" element={<Protected><StandardsKB /></Protected>} />
      <Route path="/standards/:isNumber" element={<Protected><StandardDetail /></Protected>} />
      <Route path="/products" element={<Protected roles={['CONSUMER']}><MyProducts /></Protected>} />
      <Route path="/products/:productId" element={<Protected><ProductDetail /></Protected>} />
      <Route path="/saved-standards" element={<Protected roles={['CONSUMER']}><SavedStandards /></Protected>} />
      <Route path="/match" element={<Protected roles={['INDUSTRY']}><StandardsMatch /></Protected>} />
      <Route path="/certification" element={<Protected roles={['INDUSTRY']}><CertificationNavigator /></Protected>} />
      <Route path="/laboratories" element={<Protected roles={['INDUSTRY']}><TestingLaboratories /></Protected>} />
      <Route path="/comparison" element={<Protected roles={['INDUSTRY']}><StandardsComparison /></Protected>} />
      <Route path="/profile" element={<Protected roles={['INDUSTRY']}><ProductStandardsProfile /></Protected>} />
      <Route path="/reports" element={<Protected roles={['INDUSTRY']}><ReportsHistory /></Protected>} />
      <Route path="/verification" element={<Protected roles={['GOVERNMENT']}><VerificationQueue /></Protected>} />
      <Route path="/analytics" element={<Protected roles={['GOVERNMENT']}><Analytics /></Protected>} />
      <Route path="/recommendations" element={<Protected roles={['GOVERNMENT']}><Recommendations /></Protected>} />
      <Route path="/audit" element={<Protected roles={['GOVERNMENT']}><AuditLogs /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
