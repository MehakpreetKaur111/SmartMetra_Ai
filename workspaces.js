import {
  Activity,
  Archive,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  ClipboardCheck,
  FileBarChart,
  FileClock,
  FlaskConical,
  GitCompareArrows,
  LayoutDashboard,
  MessageSquare,
  ScanLine,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';

export const WORKSPACES = {
  CONSUMER: {
    label: 'Consumer',
    nav: [
      { to: '/', label: 'Consumer Dashboard', icon: LayoutDashboard, end: true },
      { to: '/scan', label: 'Scan Product', icon: ScanLine },
      { to: '/assistant', label: 'Ask SmartMetra', icon: MessageSquare },
      { to: '/standards', label: 'Find Standards', icon: Search },
      { to: '/saved-standards', label: 'Saved Standards', icon: Archive },
      { to: '/products', label: 'My Products', icon: Boxes },
    ],
  },
  INDUSTRY: {
    label: 'Industry',
    nav: [
      { to: '/', label: 'Industry Dashboard', icon: LayoutDashboard, end: true },
      { to: '/scan', label: 'Product Scanner', icon: ScanLine },
      { to: '/match', label: 'Standards Match', icon: BadgeCheck },
      { to: '/standards', label: 'Standards KB', icon: BookOpen },
      { to: '/certification', label: 'Certification Navigator', icon: ShieldCheck },
      { to: '/laboratories', label: 'Testing Laboratories', icon: FlaskConical },
      { to: '/comparison', label: 'Standards Comparison', icon: GitCompareArrows },
      { to: '/profile', label: 'Product Standards Profile', icon: UserRound },
      { to: '/reports', label: 'Reports / History', icon: FileBarChart },
    ],
  },
  GOVERNMENT: {
    label: 'Government / Authorized',
    nav: [
      { to: '/', label: 'Government Dashboard', icon: LayoutDashboard, end: true },
      { to: '/scan', label: 'Scan Product', icon: ScanLine },
      { to: '/assistant', label: 'Ask SmartMetra', icon: MessageSquare },
      { to: '/standards', label: 'Standards KB', icon: BookOpen },
      { to: '/verification', label: 'Verification Queue', icon: ClipboardCheck },
      { to: '/recommendations', label: 'Recommendations', icon: Activity },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/audit', label: 'Audit Logs', icon: FileClock },
    ],
  },
};

export function getWorkspaceRole(user) {
  const roles = new Set(user?.roles?.map((role) => role.name) ?? []);
  if (roles.has('GOVERNMENT') || roles.has('ADMIN')) return 'GOVERNMENT';
  if (roles.has('INDUSTRY')) return 'INDUSTRY';
  return 'CONSUMER';
}