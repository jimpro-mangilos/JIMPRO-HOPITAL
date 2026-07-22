import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebarStore';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  ClipboardList,
  Siren,
  Bed,
  Pill,
  FlaskConical,
  Scan,
  Receipt,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';

const mainLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/appointments', icon: CalendarDays, label: 'Rendez-vous' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/staff', icon: Stethoscope, label: 'Personnel' },
];

const clinicLinks = [
  { to: '/consultations', icon: ClipboardList, label: 'Consultations' },
  { to: '/emergency', icon: Siren, label: 'Urgences' },
  { to: '/hospitalization', icon: Bed, label: 'Hospitalisation' },
];

const auxiliaryLinks = [
  { to: '/pharmacy', icon: Pill, label: 'Pharmacie' },
  { to: '/laboratory', icon: FlaskConical, label: 'Laboratoire' },
  { to: '/imaging', icon: Scan, label: 'Imagerie' },
];

const financeLinks = [
  { to: '/billing', icon: Receipt, label: 'Facturation' },
  { to: '/reports', icon: BarChart3, label: 'Rapports' },
];

const systemLinks = [
  { to: '/users', icon: UserCog, label: 'Utilisateurs' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
];

function NavSection({ title, links, collapsed }: { title: string; links: typeof mainLinks; collapsed: boolean }) {
  const location = useLocation();
  return (
    <div className="px-3 py-2">
      {!collapsed && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h3>
      )}
      <nav className="space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to || 
            (link.to !== '/' && location.pathname.startsWith(link.to));
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-2 border-transparent'
              )}
              title={collapsed ? link.label : undefined}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600')} />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  const { isOpen, isMobile, toggle } = useSidebarStore();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'relative',
          isOpen ? 'w-64' : 'w-[72px]',
          !isMobile && 'flex'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b border-gray-200 px-4',
          isOpen ? 'justify-between' : 'justify-center'
        )}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">JIMPRO</span>
                <span className="text-xs text-gray-500 leading-tight">HOPITAL</span>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={toggle}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavSection title="Principal" links={mainLinks} collapsed={!isOpen} />
          <NavSection title="Clinique" links={clinicLinks} collapsed={!isOpen} />
          <NavSection title="Auxiliaire" links={auxiliaryLinks} collapsed={!isOpen} />
          <NavSection title="Finance" links={financeLinks} collapsed={!isOpen} />
          <NavSection title="Système" links={systemLinks} collapsed={!isOpen} />
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="border-t border-gray-200 p-4">
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              <p className="font-medium text-gray-700">JIMPRO-HOPITAL v1.0</p>
              <p className="mt-0.5">© 2024 Tous droits réservés</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
